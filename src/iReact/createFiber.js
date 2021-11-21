import { Placement } from './utils';

export default function createFiber(vnode, returnFiber) {
  const newFiber = {
    // 原生标签 string
    type: vnode.type,
    key: vnode.key,
    props: vnode.props,
    // 第一个子 fiber
    child: null,
    // 下一个兄弟 fiber
    sibling: null,
    // 父 fiber
    return: returnFiber,
    // 如果是原生标签 dom 节点
    // 类组件 类实例
    stateNode: null,
    // 标记当前 fiber 提交的是什么操作，比如：插入、更新、删除
    flags: Placement,
    // 存放上一个 Fiber
    alternate: null
  };
  return newFiber;
}