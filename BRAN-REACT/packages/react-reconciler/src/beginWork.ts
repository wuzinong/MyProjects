import { ReactElementType } from "shared/ReactTypes";
import { FiberNode } from "./fiber";
import { processUpdateQueue, UpdateQueue } from "./updateQueue";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./workTags";
import { reconcileChildFibers, mountChildFibers } from "./childFibers";
import { renderWithHooks } from "./fiberHooks";

//递归中的递阶段
export const beginWork = (wip: FiberNode) => {
  //比较，返回子fiberNode
  switch (wip.tag) {
    case HostRoot:
      return updateHostRoot(wip);
    case HostComponent:
      return updateHostComponent(wip);
    case HostText:
      return null;
    case FunctionComponent:
      return updateFunctionComponent(wip);
    default:
      if (__DEV__) {
        console.warn("beginWork 未实现的类型");
      }
      break;
  }
  return null;
};

function updateFunctionComponent(wip: FiberNode) {
  const nextProps = wip.pendingProps;
  const nextChildren = renderWithHooks(wip);

  reconcileChildren(wip, nextChildren);
  return wip.child;
}

function updateHostRoot(wip: FiberNode) {
  const baseState = wip.memorizedState;
  const updateQueue = wip.updateQueue as UpdateQueue<Element>;
  const pending = updateQueue.shared.pending;
  updateQueue.shared.pending = null;
  const { memorizedState } = processUpdateQueue(baseState, pending);
  wip.memorizedState = memorizedState;

  const nextChildren = wip.memorizedState;
  reconcileChildren(wip, nextChildren);
  return wip.child;
}

function updateHostComponent(wip: FiberNode) {
  const nextProps = wip.pendingProps;
  const nextChildren = nextProps.children;
  reconcileChildren(wip, nextChildren);
  return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
  const current = wip.alternate;
  if (current !== null) {
    //update 流程
    wip.child = reconcileChildFibers(wip, current?.child, children);
  } else {
    //mount 流程
    wip.child = mountChildFibers(wip, null, children);
  }
}
