import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import type { Task } from '../types'
import { useFilteredTasks } from '../composables/useFilteredTasks'

function makeCards(): Task[] {
  return [
    { id: 1, title: '买牛奶', done: false },
    { id: 2, title: '写代码', done: true },
    { id: 3, title: '买面包', done: false },
  ]
}

describe('useFilteredTasks', () => {
  it('默认返回全部', () => {
    const cards = ref(makeCards())
    const { visibleCards } = useFilteredTasks(() => cards.value)

    expect(visibleCards.value).toHaveLength(3)
  })

  it('筛选未完成 / 已完成', () => {
    const cards = ref(makeCards())
    const { filter, visibleCards } = useFilteredTasks(() => cards.value)

    filter.value = 'active'
    expect(visibleCards.value.map((card) => card.id)).toEqual([1, 3])

    filter.value = 'done'
    expect(visibleCards.value.map((card) => card.id)).toEqual([2])
  })

  it('按关键词搜索，并自动去掉首尾空格', () => {
    const cards = ref(makeCards())
    const { keyword, visibleCards } = useFilteredTasks(() => cards.value)

    keyword.value = '买'
    expect(visibleCards.value.map((card) => card.id)).toEqual([1, 3])

    keyword.value = '  写  '
    expect(visibleCards.value.map((card) => card.id)).toEqual([2])
  })

  it('筛选和搜索可以叠加', () => {
    const cards = ref(makeCards())
    const { filter, keyword, visibleCards } = useFilteredTasks(() => cards.value)

    filter.value = 'active'
    keyword.value = '买'

    expect(visibleCards.value.map((card) => card.id)).toEqual([1, 3])
  })

  it('整体替换数组后，仍能取到最新数据', () => {
    const cards = ref(makeCards())
    const { visibleCards } = useFilteredTasks(() => cards.value)

    expect(visibleCards.value).toHaveLength(3)

    cards.value = []

    expect(visibleCards.value).toHaveLength(0)
  })
})
