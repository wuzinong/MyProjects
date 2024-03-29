import { beginWork } from "./beginWork";
import { completeWork } from "./completeWork";
import { commitMutationEffects } from "./commitWork";
import { createWorkInProgress, FiberNode, FiberRootNode } from "./fiber";
import { MutationMask, NoFlags } from "./fiberFlags";
import { HostRoot } from "./workTags";
let workInProress: FiberNode | null = null;

function prepareRefreshStack(root: FiberRootNode) {
  workInProress = createWorkInProgress(root.current, {});
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
  //TODO 调度功能
  const root = markUpdateFromFiberToRoot(fiber);
  renderRoot(root);
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
  let node = fiber;
  let parent = node.return;
  while (parent !== null) {
    node = parent;
    parent = node.return;
  }

  if (node.tag === HostRoot) {
    return node.stateNode;
  }
  return null;
}

function renderRoot(root: FiberRootNode) {
  //初始化
  prepareRefreshStack(root);

  do {
    try {
      workLoop();
      break;
    } catch (e) {
      if (__DEV__) {
        console.warn("发生错误");
      }
      workInProress = null;
    }
  } while (true);

  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  //wip fiberNode树已经书中的flags执行具体的dom操作
  commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
  const finishedWork = root.finishedWork;
  if (finishedWork === null) {
    return;
  }
  if (__DEV__) {
    console.warn("commit阶段开始", finishedWork);
  }
  //重置
  root.finishedWork = null;

  //判断是否存在3个子阶段需要执行的操作4
  //root flags & root subtreeFlags
  const subtreeHasEffect =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
  if (subtreeHasEffect || rootHasEffect) {
    //beforemutation
    //mutation    Placement
    commitMutationEffects(finishedWork);
    root.current = finishedWork; //切换
    //layout
  } else {
    root.current = finishedWork; //切换
  }
}
function workLoop() {
  while (workInProress !== null) {
    performUnitOfWork(workInProress);
  }
}

function performUnitOfWork(fiber: FiberNode) {
  const next = beginWork(fiber);
  fiber.memorizedProps = fiber.pendingProps;
  if (next === null) {
    completeUnitOfWork(fiber);
  } else {
    workInProress = next;
  }
}

function completeUnitOfWork(fiber: FiberNode) {
  let node: FiberNode | null = fiber;

  do {
    completeWork(node);
    const sibling = node.sibling;
    if (sibling !== null) {
      workInProress = sibling;
      return;
    }
    node = node.return;
    workInProress = node;
  } while (node !== null);
}
