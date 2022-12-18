import { Dispatcher, Dispatch } from "react/src/currentDispatcher";
import internals from "shared/internals";
import { FiberNode } from "./fiber";
import {
  createUpdateQueue,
  enqueueUpdate,
  UpdateQueue,
  createUpdate,
} from "./updateQueue";
import { Action } from "shared/ReactTypes";
import { scheduleUpdateOnFiber } from "./workLoop";

let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null;

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
  } else {
    //mount
    currentDispatcher.current = HooksDispatcherOnMount;
  }

  const Component = wip.type;
  const props = wip.pendingProps;
  const children = Component(props);

  //重置操作
  currentlyRenderingFiber = null;
  return children;
}

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
};

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
