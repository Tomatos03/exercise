import { describe, expect, it } from 'vitest'
import { defineComponent, h, inject, nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '../App.vue'
import { confirmKey, type ConfirmFn } from '../composables/useConfirm'

const EmptyView = defineComponent({ render: () => h('div') })

let confirm: ConfirmFn | undefined

// 探针组件：挂在路由里，用来从 App 的 provide 中取出 confirm 服务
const ProbeView = defineComponent({
  setup() {
    confirm = inject(confirmKey)
    return () => h('div', 'probe')
  },
})

function getConfirm(): ConfirmFn {
  if (!confirm) throw new Error('confirm 服务未注入')
  return confirm
}

function dialogButtons(): HTMLButtonElement[] {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.dialog__actions button'))
}

async function clickConfirm() {
  const buttons = dialogButtons()
  expect(buttons).toHaveLength(2)
  buttons[1]?.click()
  await nextTick()
}

async function clickCancel() {
  const buttons = dialogButtons()
  expect(buttons).toHaveLength(2)
  buttons[0]?.click()
  await nextTick()
}

async function mountApp(): Promise<VueWrapper> {
  confirm = undefined

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: ProbeView },
      { path: '/about', component: EmptyView },
      { path: '/stats', component: EmptyView },
    ],
  })
  router.push('/')
  await router.isReady()

  const wrapper = mount(App, {
    global: { plugins: [createPinia(), router] },
  })

  await nextTick()
  return wrapper
}

describe('confirm 服务', () => {
  it('点「确定」时 Promise 解析为 true', async () => {
    const wrapper = await mountApp()
    const result = getConfirm()('要清空吗？')

    await nextTick()
    expect(document.body.textContent).toContain('要清空吗？')

    await clickConfirm()
    await expect(result).resolves.toBe(true)

    wrapper.unmount()
  })

  it('点「取消」时 Promise 解析为 false', async () => {
    const wrapper = await mountApp()
    const result = getConfirm()('要清空吗？')

    await nextTick()
    await clickCancel()
    await expect(result).resolves.toBe(false)

    wrapper.unmount()
  })

  it('并发调用时排队依次处理，各自的 Promise 都拿到结果', async () => {
    const wrapper = await mountApp()
    const confirmFn = getConfirm()

    const first = confirmFn('第一次')
    const second = confirmFn('第二次')

    await nextTick()
    expect(document.body.textContent).toContain('第一次')
    expect(document.body.textContent).not.toContain('第二次')

    await clickConfirm()
    await expect(first).resolves.toBe(true)

    expect(document.body.textContent).toContain('第二次')

    await clickCancel()
    await expect(second).resolves.toBe(false)

    wrapper.unmount()
  })
})
