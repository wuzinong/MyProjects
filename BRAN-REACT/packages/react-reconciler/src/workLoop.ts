import { beginWork } from "./beginWork";
import { completeWork } from "./completeWork";
import { createWorkInProgress, FiberNode, FiberRootNode } from "./fiber";
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

function renderRoot(root: FiberNode) {
  //初始化
  prepareRefreshStack(root);

  do {
    try {
      workLoop();
      break;
    } catch (e) {
      console.warn("发生错误");
      workInProress = null;
    }
  } while (true);
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
