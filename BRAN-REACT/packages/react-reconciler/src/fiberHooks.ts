import { Dispatcher, Dispatch } from "react/src/currentDispatcher";
import internals from "shared/internals";
import { FiberNode } from "./fiber";
import {
  createUpdateQueue,
  enqueueUpdate,
  UpdateQueue,
  createUpdate,
  Update,
  processUpdateQueue,
} from "./updateQueue";
import { Action } from "shared/ReactTypes";
import { scheduleUpdateOnFiber } from "./workLoop";

let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null;
let currentHook: Hook | null = null;

const { currentDispatcher } = internals;
interface Hook {
  memorizedState: any;
  updateQueue: unknown;
  next: Hook | null;
}
export function renderWithHooks(wip: FiberNode) {
  //赋值操作
  currentlyRenderingFiber = wip;
  //重置
  wip.memorizedState = null;
  const current = wip.alternate;
  if (current !== null) {
    //update
    currentDispatcher.current = HooksDispatcherOnUpdate;
  } else {
    //mount
    currentDispatcher.current = HooksDispatcherOnMount;
  }

  const Component = wip.type;
  const props = wip.pendingProps;
  const children = Component(props);

  //重置操作
  currentlyRenderingFiber = null;
  workInProgressHook = null;
  currentHook = null;
  return children;
}

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
};

const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState,
};
function updateState<State>(): [State, Dispatch<State>] {
  //找到当前useState对应的hook数据
  const hook = updateWorkInProgressHook();

  //计算新的state的逻辑
  const queue = hook.updateQueue as UpdateQueue<State>;
  const pending = queue.shared.pending;

  if (pending !== null) {
    const { memorizedState } = processUpdateQueue(hook.memorizedState, pending);
    hook.memorizedState = memorizedState;
  }
  return [hook.memorizedState, queue.dispatch as Dispatch<State>];
}

function updateWorkInProgressHook(): Hook {
  //TODO render极端触发的更新
  let nextCurrentHook: Hook | null;
  if (currentHook === null) {
    //这是这个FC update时的第一个hook
    const current = currentlyRenderingFiber?.alternate;
    if (current !== null) {
      nextCurrentHook = current?.memorizedState;
    } else {
      //mount
      nextCurrentHook = null;
    }
  } else {
    //这个FC update时 后续的Hook
    nextCurrentHook = currentHook.next;
  }

  if (nextCurrentHook === null) {
    //上次 mount/update  useState1 useState2 useState3
    //本次 update 有四个 u1 u2 u3 u4
    //比如在if 语句中调用useState，那么比如上一次到u3，u3.next就会是Null
    throw new Error(
      `组件 ${currentlyRenderingFiber?.type} 本次执行时比上次执行时多`
    );
  }

  currentHook = nextCurrentHook as Hook;
  const newHook: Hook = {
    memorizedState: currentHook.memorizedState,
    updateQueue: currentHook.updateQueue,
    next: null,
  };

  if (workInProgressHook === null) {
    //mount时 第一个hook
    if (currentlyRenderingFiber === null) {
      //表示没有再函数组件内调用hook
      throw new Error("请在函数组件内调用hook");
    } else {
      workInProgressHook = newHook;
      currentlyRenderingFiber.memorizedState = workInProgressHook;
    }
  } else {
    //mount时 后续的hook
    workInProgressHook.next = newHook;
    workInProgressHook = newHook;
  }
  return workInProgressHook;
}

function mountState<State>(
  initialState: (() => State) | State
): [State, Dispatch<State>] {
  //找到当前useState对应的hook数据
  const hook = mountWorkInProgressHook();
  let memorizedState;
  if (initialState instanceof Function) {
    memorizedState = initialState();
  } else {
    memorizedState = initialState;
  }
  const queue = createUpdateQueue<State>();
  hook.updateQueue = queue;

  //@ts-ignore
  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
  queue.dispatch = dispatch;
  return [memorizedState, dispatch];
}

function dispatchSetState<State>(
  fiber: FiberNode,
  updateQueue: UpdateQueue<State>,
  action: Action<State>
) {
  const update = createUpdate(action);
  enqueueUpdate(updateQueue, update);
  scheduleUpdateOnFiber(fiber);
}

function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memorizedState: null,
    updateQueue: null,
    next: null,
  };
  if (workInProgressHook === null) {
    //mount时 第一个hook
    if (currentlyRenderingFiber === null) {
      //表示没有再函数组件内调用hook
      throw new Error("请在函数组件内调用hook");
    } else {
      workInProgressHook = hook;
      currentlyRenderingFiber.memorizedState = workInProgressHook;
    }
  } else {
    //mount时 后续的hook
    workInProgressHook.next = hook;
    workInProgressHook = hook;
  }
  return workInProgressHook;
}
