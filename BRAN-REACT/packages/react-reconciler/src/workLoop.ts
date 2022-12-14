import { beginWork } from "./beginWork";
import { completeWork } from "./completeWork";
import { FiberNode } from "./fiber";
let workInProress: FiberNode | null = null;

function prepareRefreshStack(fiber: FiberNode) {
  workInProress = fiber;
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
