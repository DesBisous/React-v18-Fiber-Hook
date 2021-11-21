import createFiber from './createFiber';
import { renderWithHooks } from './react';
import { isArray, isStr, Update, updateNode } from './utils';

export function updateHostComponent(wip) {
  if (!wip.stateNode) {
    // 创建 Dom
    wip.stateNode = document.createElement(wip.type);
    // 对真实节点挂载属性
    updateNode(wip.stateNode, {}, wip.props);
  }

  // 调和子节点,将 wip 下的虚拟节点 children 都进行构建 fiber 结构
  reconcileChildren(wip, wip.props.children);
}

export function updateFunctionComponent(wip) {
  // 执行函数更新时，初始化当前工作 fiber，用于给 type() 函数组件执行时，hook 能够找到当前的 fiber 是谁
  renderWithHooks(wip);
  const { type, props } = wip;
  const children = type(props); // 获取函数组件的子组件 Virtual Dom
  reconcileChildren(wip, children);
}

export function updateClassComponent(wip) {
  const { type, props } = wip;
  const children = (new type(props)).render();
  reconcileChildren(wip, children);
}

function reconcileChildren(parentFiber, children) {
  // 存文本子节点就不构建 fiber
  if (isStr(children)) {
    return;
  }
  
  const newChildren = isArray(children) ? children : [children];

  // 记录上一个 fiber 节点
  let previousNewFiber = null;
  // 获取当前虚拟节点的老 fiber 节点, 这里获取的是 children 中链表的第一个 child
  let oldFiber = parentFiber.alternate && parentFiber.alternate.child;

  for (let i = 0; i < newChildren.length; i +=1) {
    const newChild = newChildren[i];
    const newFiber = createFiber(newChild, parentFiber);
    const same = sameNode(newFiber, oldFiber);

    if (same) {
      /**
       * 如果当前的虚拟节点所对应的新老 Fiber 是同一个 Fiber，
       * 其实也就是虚拟节点没什么变化，可能也就节点属性变化了，节点内容变更了或者节点位置变化了，当然位置变化了这情况就先不管了
       */
      Object.assign(newFiber, {
        alternate: oldFiber, // 这里对 alternate 进行了更新赋值，一开始新 Fiber 的 alternate 为 null
        stateNode: oldFiber.stateNode, // 复用 Dom 节点
        flags: Update // 代表 Fiber 需要更新
      })
    }

    // 如果存在老 Fiber，遍历后，按照 Fiber 链表遍历规则，接下来要找当前 Fiber 的兄弟节点
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (i === 0) {
      parentFiber.child = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
  }
}

/**
 * 对比当前的 fiber 是否为上一次的 fiber，通过 key
 * 并且通过 type 判断当前的 fiber 是否发生了元素节点变化，比如 spam 变成了 p
 */

function sameNode(a, b) {
  return a && b && a.key === b.key && a.type === b.type;
}