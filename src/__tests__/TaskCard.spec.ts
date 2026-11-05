import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import TaskCard from '../components/TaskCard.vue'

async function mountCard(
  props: Partial<{ id: number; title: string; index: number; done: boolean }> = {},
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/tasks/:id', component: { template: '<div />' } }],
  })

  router.push('/tasks/1')
  await router.isReady()

  return mount(TaskCard, {
    props: { id: 1, title: '买牛奶', index: 0, done: false, ...props },
    global: { plugins: [router] },
  })
}

describe('TaskCard', () => {
  it('渲染序号、标题和状态', async () => {
    const wrapper = await mountCard()

    expect(wrapper.text()).toContain('1: 买牛奶')
    expect(wrapper.text()).toContain('未完成')
  })

  it('标题链接指向任务详情页', async () => {
    const wrapper = await mountCard({ id: 7 })

    expect(wrapper.get('a').attributes('href')).toBe('/tasks/7')
  })

  it('done 为 true 时标题加上 done 类', async () => {
    const wrapper = await mountCard({ done: true })

    expect(wrapper.get('h2').classes()).toContain('done')
    expect(wrapper.text()).toContain('已完成')
  })

  it('点击删除按钮发出 remove 事件', async () => {
    const wrapper = await mountCard()

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('remove')).toHaveLength(1)
  })

  it('勾选复选框发出 toggle 事件', async () => {
    const wrapper = await mountCard()

    await wrapper.get('input[type="checkbox"]').trigger('change')

    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })
})
