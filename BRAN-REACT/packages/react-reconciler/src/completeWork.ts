import {
  createInstance,
  createTextInstance,
  appendInitialChild,
} from "hostConfig";
import { FiberNode } from "./fiber";
import { NoFlags, Update } from "./fiberFlags";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./workTags";
import { Container } from "hostConfig";
import { updateFiberProps } from "react-dom/src/SyntheticEvent";

function markUpdate(fiber: FiberNode) {
  fiber.flags |= Update;
}

export const completeWork = (wip: FiberNode) => {
  //递归中的归
  const newProps = wip.pendingProps;
  const current = wip.alternate;
  switch (wip.tag) {
    case HostComponent:
      if (current !== null && wip.stateNode) {
        //update
        //1. props是否变化
        //2. 变了就打update flag
        updateFiberProps(wip.stateNode, newProps);
        //其他属性是否变化比如 className， style etc.
      } else {
        //mount
        //1.构建DOM
        //const instance = createInstance(wip.type, newProps)
        const instance = createInstance(wip.type, newProps); //模拟创建DOM
        //2.将DOM插入DOM树中
        appendAllChildren(instance, wip);
        wip.stateNode = instance;
      }
      bubbleProperties(wip);
      return null;
    case HostText:
      if (current !== null && wip.stateNode) {
        //update
        const oldText = current.memorizedProps.content;
        const newText = newProps.content;
        if (oldText !== newText) {
          markUpdate(wip);
        }
      } else {
        //1.构建DOM
        const instance = createTextInstance(newProps.content); //模拟创建DOM
        wip.stateNode = instance;
      }
      bubbleProperties(wip);
      return null;
    case HostRoot:
      bubbleProperties(wip);
      return null;
    case FunctionComponent:
      bubbleProperties(wip);
      return null;
    default:
      if (__DEV__) {
        console.warn("未处理的completeWork情况", wip);
      }
      break;
  }
};

function appendAllChildren(parent: Container, wip: FiberNode) {
  let node = wip.child;

  while (node !== null) {
    if (node?.tag === HostComponent || node?.tag === HostText) {
      appendInitialChild(parent, node?.stateNode);
    } else if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }

    if (node === wip) {
      return;
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === wip) {
        return;
      }
      node = node?.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}

function bubbleProperties(wip: FiberNode) {
  let subtreeFlags = NoFlags;
  let child = wip.child;
  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;
    child.return = wip;
    child = child.sibling;
  }
  wip.subtreeFlags |= subtreeFlags;
}
