import { computed, ref } from 'vue'
import type { Task } from '../types'

export type Filter = 'all' | 'active' | 'done'

export function useFilteredTasks(getCards: () => Task[]) {
  const filter = ref<Filter>('all')
  const keyword = ref('')

  const visibleCards = computed(() => {
    let list = getCards()

    if (filter.value === 'active') list = list.filter((card) => !card.done)
    if (filter.value === 'done') list = list.filter((card) => card.done)

    const kw = keyword.value.trim()
    if (kw !== '') list = list.filter((card) => card.title.includes(kw))

    return list
  })

  return { filter, keyword, visibleCards }
}
