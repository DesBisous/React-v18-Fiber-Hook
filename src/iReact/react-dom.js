import createFiber from './createFiber';
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop';

function createRoot(container) {
  const root = { containerInfo: container };
  
  return new ReactDOMRoot(root);
}

function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot;
}

ReactDOMRoot.prototype.render = function (children) {
  const root = this._internalRoot;
  updateContainer(children, root);
}

function updateContainer(element, root) {
  const { containerInfo } = root;
  const fiber = createFiber(element, {
    type: containerInfo.nodeName.toLocaleLowerCase(),
    stateNode: containerInfo,
  });

  console.log('fiber', fiber, element);

  // 更新 fiber
  scheduleUpdateOnFiber(fiber);
}

const ReactDOM = {
  createRoot
}

export default ReactDOM;