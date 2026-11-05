import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTaskStore } from '../stores/tasks'

describe('task store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('新增任务', () => {
    const store = useTaskStore()
    store.clearAll()

    store.addCard('买牛奶')

    expect(store.cards).toHaveLength(1)
    expect(store.cards[0]?.title).toBe('买牛奶')
    expect(store.cards[0]?.done).toBe(false)
  })

  it('清空后再新增，id 不重复', () => {
    const store = useTaskStore()
    store.clearAll()

    store.addCard('A')
    store.addCard('B')

    const ids = store.cards.map((card) => card.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('切换完成状态', () => {
    const store = useTaskStore()
    store.clearAll()
    store.addCard('写代码')

    const card = store.cards[0]
    if (!card) throw new Error('卡片不存在')

    store.toggleCard(card.id)

    expect(card.done).toBe(true)
  })

  it('删除指定 id 的任务', () => {
    const store = useTaskStore()
    store.clearAll()
    store.addCard('要删的')
    store.addCard('要留的')

    const target = store.cards[0]
    if (!target) throw new Error('卡片不存在')

    store.removeCard(target.id)

    expect(store.cards).toHaveLength(1)
    expect(store.cards[0]?.title).toBe('要留的')
  })

  it('重命名任务', () => {
    const store = useTaskStore()
    store.clearAll()
    store.addCard('旧标题')

    const card = store.cards[0]
    if (!card) throw new Error('卡片不存在')

    store.renameCard(card.id, '新标题')

    expect(store.cards[0]?.title).toBe('新标题')
  })

  it('total / finished 随数据自动更新', () => {
    const store = useTaskStore()
    store.clearAll()
    store.addCard('A')
    store.addCard('B')

    expect(store.total).toBe(2)
    expect(store.finished).toBe(0)

    const second = store.cards[1]
    if (!second) throw new Error('卡片不存在')
    store.toggleCard(second.id)

    expect(store.finished).toBe(1)
  })
})
