import type { App } from 'vue'
type CreateVueAppHook = (app: App) => void

let vueApp: App
const createVueAppHooks: CreateVueAppHook[] = []
/**
 * 提供 createApp 的回调事件，方便三方插件接收 App 对象，处理挂靠全局 mixin 之类的逻辑
 */
export function onCreateVueApp(hook: CreateVueAppHook) {
  // TODO 每个 nvue 页面都会触发
  if (vueApp) {
    return hook(vueApp)
  }
  createVueAppHooks.push(hook)
}

export function invokeCreateVueAppHook(app: App) {
  vueApp = app
  createVueAppHooks.forEach((hook) => hook(app))
}
