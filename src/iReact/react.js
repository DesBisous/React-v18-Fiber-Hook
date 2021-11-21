import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";

let currentlyRendingFiber = null;
let workInProressHook = null;

export function renderWithHooks(wip) {
  currentlyRendingFiber = wip;
  currentlyRendingFiber.memeorizedState = null;
  workInProressHook = null;
}

// fiber.memeorizedState(hook0) -> next(hook1) -> next(hook2) -> next(hook3) -> next(hook4)
// workInProressHook 指向的是最后一个 hook
function updateWorkInProgressHook() {
  let hook;
  // alternate 存放着老的 fiber
  let current = currentlyRendingFiber.alternate;
  if (current) {
    // 更新阶段
    currentlyRendingFiber.memeorizedState = current.memeorizedState;
    if (workInProressHook) {
      // 不是第一个了
      workInProressHook = hook =  workInProressHook.next;
    } else {
      // 更新的是第一个
      workInProressHook = hook = currentlyRendingFiber.memeorizedState;
    }
  } else {
    // 初始渲染
    hook = {
      memeorizedState: null, // 状态值
      next: null, // 指向下一个 hook
    }
    if (workInProressHook) {
      // 已存在有 hook 了，将新的 hook 拼接到最后一个，并且将 workInProressHook 指向最后一个
      workInProressHook = workInProressHook.next = hook;
    } else {
      workInProressHook = currentlyRendingFiber.memeorizedState = hook;
    }
  }
  return hook;
}

export function useReducer(reducer, initalState) {
  const hook = updateWorkInProgressHook();
  // 将 Hook 的寄主函数 Fiber 绑定到 Hook 身上，方便能在 dispatch 找到自己的寄主 Fiber，从而触发更新
  hook.funcFiber = currentlyRendingFiber;

  if (!currentlyRendingFiber.alternate) {
    hook.memeorizedState = initalState;
  }

  const dispatch = () => {
    hook.memeorizedState = reducer(hook.memeorizedState);
    scheduleUpdateOnFiber(hook.funcFiber);
  }

  return [hook.memeorizedState, dispatch]
}