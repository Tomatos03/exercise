import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from '../components/ConfirmDialog.vue'

function mountDialog(props: Partial<{ modelValue: boolean; message: string; confirmText: string }> = {}) {
  return mount(ConfirmDialog, {
    props: { modelValue: true, message: '要清空吗？', ...props },
    global: { stubs: { teleport: true } },
  })
}

describe('ConfirmDialog', () => {
  it('modelValue 为 false 时不渲染遮罩', () => {
    const wrapper = mountDialog({ modelValue: false })

    expect(wrapper.find('.mask').exists()).toBe(false)
  })

  it('显示消息和默认的确认文案', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('要清空吗？')
    expect(wrapper.get('.dialog__confirm').text()).toBe('确定')
  })

  it('支持自定义确认文案', () => {
    const wrapper = mountDialog({ confirmText: '清空' })

    expect(wrapper.get('.dialog__confirm').text()).toBe('清空')
  })

  it('点「确定」发出 confirm 事件，自身不关闭', async () => {
    const wrapper = mountDialog()

    await wrapper.get('.dialog__confirm').trigger('click')

    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('点「取消」发出 cancel 并请求关闭', async () => {
    const wrapper = mountDialog()

    await wrapper.get('.dialog__actions button').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('点对话框内部不关闭，点遮罩才关闭', async () => {
    const wrapper = mountDialog()

    await wrapper.get('.dialog__message').trigger('click')
    expect(wrapper.emitted('cancel')).toBeUndefined()

    await wrapper.get('.mask').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('真实 Teleport 会把遮罩挂到 body 下', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, message: '真的传送到 body' },
    })

    expect(document.body.querySelector('.mask')).not.toBeNull()
    expect(document.body.textContent).toContain('真的传送到 body')

    wrapper.unmount()
    expect(document.body.querySelector('.mask')).toBeNull()
  })
})
