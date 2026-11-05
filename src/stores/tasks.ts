import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { createTask, deleteTask, fetchTasks, updateTask } from '../api/tasks'
import type { Task } from '../types'

export const useTaskStore = defineStore('tasks', () => {
  const cards = ref<Task[]>([])
  const loading = ref(false)
  const error = ref('')
  const loaded = ref(false)

  // 服务端分页状态：cards 只代表「当前页」的数据
  const page = ref(1)
  const pageSize = ref(5)
  const serverTotal = ref(0)

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

  async function loadTasks(targetPage = page.value) {
    loading.value = true
    await run(async () => {
      const result = await fetchTasks(targetPage, pageSize.value)
      cards.value = result.items
      page.value = result.page
      serverTotal.value = result.total
      loaded.value = true
    })
    loading.value = false
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

  function toggleCard(id: number) {
    const card = cards.value.find((item) => item.id === id)
    if (!card) return Promise.resolve()

    return run(async () => {
      const updated = await updateTask(id, { done: !card.done })
      card.done = updated.done
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
    toggleCard,
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
  }
})
