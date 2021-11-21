import { isFn, isStr, Placement, Update, updateNode } from "./utils";
import { updateHostComponent,updateFunctionComponent,updateClassComponent } from './ReactFiberReconciler';


//  wip work in progress 当前正在工作中的
let wipRoot = null;
let wip = null;

// 直接使用游览器提供的调度器进行创建更新 fiber
requestIdleCallback(workLoop);

export function scheduleUpdateOnFiber(fiber) {
  // 这里的 fiber 一般为根 Fiber，比如 Root、Func Finber、Class Fiber
  fiber.alternate = { ...fiber }; // 在当前 Fiber 上保存当前的 Fiber，因为后面 Fiber 将会更新内容
  wipRoot = fiber;
  wip = fiber;
}

function workLoop(IdleDeadline) {
  // 源码中，这里会根据 fiber 类型来计算剩余时间可执行，这里直接判断 0
  while (wip && IdleDeadline.timeRemaining() > 0) {
    // 处理各级 fiber 的关系，并创建 dom
    performUnitOfWork();
  }

  // 重新安排调度器
  requestIdleCallback(workLoop);

  if (!wip && wipRoot) {
    // 所有 fiber 完成任务创建 Dom ，调和完成子节点后，进入提交阶段
    commitRoot(wipRoot);
  }
}

function performUnitOfWork() {
  // 1. 处理当前的任务
  const { type } = wip;
  // 完成当前 fiber 节点的 dom 构建和子 fiber 的调和(深度优先遍历)，开始走下一个 fiber
  if (isStr(type)) {
    updateHostComponent(wip);
  } else if (isFn(type)) {
    type.prototype.isReactComponent
      ? updateClassComponent(wip)
      : updateFunctionComponent(wip);
  }
  
  // 2. 处理下一个任务，深度优先遍历
  if (wip.child) {
    // 从链表结构中查找子 fiber，准备下一个 fiber 任务
    wip = wip.child;
    return;
  }

  while (wip) {
    if (wip.sibling) {
      // 兄弟节点有 child 代表是更新阶段了，但是没有 alternate 老 Fiber 那代表不需要更新
      if (wip.sibling.child && !wip.sibling.alternate) break;
      // 查找兄弟节点 fiber，作为下一个 fiber 任务
      else wip = wip.sibling;
      return;
    }
    wip = wip.return;  
  }
  // 3. 结束任务
  wip = null; // 找不到下一个待处理 fiber 节点时，将 wip 清除
}

function commitRoot() {
  commitWorker(wipRoot);
  wipRoot = null;
}

function commitWorker(wip) {
  if (!wip) {
    return;
  }
  // 1. commit 自己
  const { flags, stateNode } = wip;

  // 父 dom 节点
  let parentNode = getParentNode(wip.return);
  if (flags & Placement && stateNode) {
    parentNode.appendChild(stateNode);
  }

  if (flags & Update && stateNode) {
    updateNode(wip.stateNode, wip.alternate.props, wip.props);
  }

  // 2. commit child
  commitWorker(wip.child);

  // 3. commit sibling
  commitWorker(wip.sibling);
}

function getParentNode(wip) {
  let _wip = wip;
  while (_wip) {
    if (_wip.stateNode) {
      return _wip.stateNode;
    }
    _wip = _wip.return;
  }
}