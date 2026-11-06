import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { createTask, deleteTask, fetchTasks, updateTask } from '../api/tasks'
import type { SortOrder, Task, TaskSort } from '../types'

export const useTaskStore = defineStore('tasks', () => {
  const cards = ref<Task[]>([])
  const loading = ref(false)
  const error = ref('')
  const loaded = ref(false)

  // 服务端分页状态：cards 只代表「当前页」的数据
  const page = ref(1)
  const pageSize = ref(5)
  const serverTotal = ref(0)

  // 排序状态：'' 表示不排序，保持服务端默认顺序
  const sort = ref<TaskSort | ''>('')
  const order = ref<SortOrder>('asc')

  const total = computed(() => cards.value.length)
  const finished = computed(() => cards.value.filter((card) => card.done).length)
  const totalPages = computed(() => Math.max(1, Math.ceil(serverTotal.value / pageSize.value)))

  /** 统一收口请求错误，避免每个操作都写一遍 try/catch */
  async function run(action: () => Promise<void>) {
    error.value = ''
    try {
      await action()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误'
    }
  }

  async function loadTasks(
    targetPage = page.value,
    targetSort = sort.value,
    targetOrder = order.value,
  ) {
    // 先记下状态，后续 watch / 守卫读到的才是真实生效的值
    sort.value = targetSort
    order.value = targetOrder

    loading.value = true
    await run(async () => {
      // 不排序时保持最简调用，与既有接口契约一致
      const result =
        targetSort === ''
          ? await fetchTasks(targetPage, pageSize.value)
          : await fetchTasks(targetPage, pageSize.value, targetSort, targetOrder)
      cards.value = result.items
      page.value = result.page
      serverTotal.value = result.total
      loaded.value = true
    })
    loading.value = false
  }

  /** 排序变化后必须回到第 1 页：页码的含义已经变了 */
  function setSort(nextSort: TaskSort | '', nextOrder: SortOrder = 'asc') {
    return loadTasks(1, nextSort, nextOrder)
  }

  function addCard(title: string) {
    return run(async () => {
      const created = await createTask(title)
      cards.value.push(created)
      serverTotal.value += 1
    })
  }

  function removeCard(id: number) {
    return run(async () => {
      await deleteTask(id)
      cards.value = cards.value.filter((card) => card.id !== id)
      serverTotal.value = Math.max(0, serverTotal.value - 1)
    })
  }

  /** 批量删除：并发请求，全部成功后一次性从当前页移除 */
  function removeCards(ids: number[]) {
    if (ids.length === 0) return Promise.resolve()

    return run(async () => {
      await Promise.all(ids.map((id) => deleteTask(id)))
      cards.value = cards.value.filter((card) => !ids.includes(card.id))
      serverTotal.value = Math.max(0, serverTotal.value - ids.length)
    })
  }

  function toggleCard(id: number) {
    const card = cards.value.find((item) => item.id === id)
    if (!card) return Promise.resolve()

    return run(async () => {
      const updated = await updateTask(id, { done: !card.done })
      card.done = updated.done
    })
  }

  /** 批量设置完成状态：只对状态不一致的任务发请求 */
  function setDoneMany(ids: number[], done: boolean) {
    const targets = cards.value.filter((card) => ids.includes(card.id) && card.done !== done)
    if (targets.length === 0) return Promise.resolve()

    return run(async () => {
      await Promise.all(targets.map((card) => updateTask(card.id, { done })))
      targets.forEach((card) => {
        card.done = done
      })
    })
  }

  function renameCard(id: number, title: string) {
    return run(async () => {
      const updated = await updateTask(id, { title })
      const card = cards.value.find((item) => item.id === id)
      if (card) card.title = updated.title
    })
  }

  function clearAll() {
    return run(async () => {
      const ids = cards.value.map((card) => card.id)
      await Promise.all(ids.map((id) => deleteTask(id)))
      cards.value = []
      serverTotal.value = Math.max(0, serverTotal.value - ids.length)
    })
  }

  return {
    cards,
    total,
    finished,
    addCard,
    removeCard,
    removeCards,
    toggleCard,
    setDoneMany,
    clearAll,
    loading,
    loadTasks,
    error,
    renameCard,
    page,
    pageSize,
    serverTotal,
    totalPages,
    loaded,
    sort,
    order,
    setSort,
  }
})
