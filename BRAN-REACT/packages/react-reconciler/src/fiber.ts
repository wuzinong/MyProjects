import { Props, Key, Ref } from "shared/ReactTypes";
import { WorkTag } from "./workTags";
import { Flags, NoFlags } from "./fiberFlags";
export class FiberNode {
  type: any;
  tag: WorkTag;
  pendingProps: Props;
  key: Key;
  stateNode: any;
  ref: Ref;

  return: FiberNode | null;
  sibling: FiberNode | null;
  child: FiberNode | null;
  index: number;

  memorizedProps: Props | null;
  alternate: FiberNode | null;
  flags: Flags;

  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    //实例
    this.tag = tag;
    this.key = key;
    //DOM  比如对于HostComponent来说<div> 即div对应的DOM
    this.stateNode = null;
    //比如对于FunctionCompnent来说就是function本身 ()=>{}
    this.type = null;
    //构成树状结构
    this.return = null; //指向父fiberNode
    this.sibling = null;
    this.child = null;
    //比如ul下面三个li，表示第几个
    this.index = 0;
    this.ref = null;

    //作为工作单元
    this.pendingProps = pendingProps; //准备工作时的props
    this.memorizedProps = null; //工作完之后的Props，即确定完的时候

    this.alternate = null;
    //副作用
    this.flags = NoFlags;
  }
}
