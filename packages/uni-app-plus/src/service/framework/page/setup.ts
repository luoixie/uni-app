import { initPageVm, invokeHook } from '@dcloudio/uni-core'
import {
  EventChannel,
  formatLog,
  ON_READY,
  ON_UNLOAD,
} from '@dcloudio/uni-shared'
import {
  nextTick,
  ComponentPublicInstance,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
} from 'vue'
import type { VuePageComponent } from './define'
import { addCurrentPage } from './getCurrentPages'

export function setupPage(component: VuePageComponent) {
  const oldSetup = component.setup
  component.inheritAttrs = false // 禁止继承 __pageId 等属性，避免告警
  component.setup = (_, ctx) => {
    const {
      attrs: { __pageId, __pagePath, __pageQuery, __pageInstance },
    } = ctx
    if (__DEV__) {
      console.log(formatLog(__pagePath as string, 'setup'))
    }
    const instance = getCurrentInstance()!
    const pageVm = instance.proxy!
    initPageVm(pageVm, __pageInstance as Page.PageInstance['$page'])
    addCurrentPage(
      initScope(
        __pageId as number,
        pageVm,
        __pageInstance as Page.PageInstance['$page']
      )
    )
    onMounted(() => {
      nextTick(() => {
        // onShow被延迟，故onReady也同时延迟
        invokeHook(pageVm, ON_READY)
      })
      // TODO preloadSubPackages
    })
    onBeforeUnmount(() => {
      invokeHook(pageVm, ON_UNLOAD)
    })
    if (oldSetup) {
      return oldSetup(__pageQuery as any, ctx)
    }
  }
  return component
}

function initScope(
  pageId: number,
  vm: ComponentPublicInstance,
  pageInstance: Page.PageInstance['$page']
) {
  const $getAppWebview = () => {
    return plus.webview.getWebviewById(pageId + '')
  }
  vm.$getAppWebview = $getAppWebview
  ;(vm.$ as any).ctx!.$scope = {
    $getAppWebview,
  }
  vm.getOpenerEventChannel = () => {
    if (!pageInstance.eventChannel) {
      pageInstance.eventChannel = new EventChannel(pageId)
    }
    return pageInstance.eventChannel as EventChannel
  }
  return vm
}
