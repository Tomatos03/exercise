import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { fetchTasks } from '../api/tasks'
import type { Task } from '../types'

export const useTaskStore = defineStore('tasks', () => {
  const cards = ref<Task[]>(loadCards())
  const loading = ref(false)
  const error = ref('')

  const total = computed(() => cards.value.length)
  const finished = computed(() => cards.value.filter((card) => card.done).length)

  function nextId() {
    return cards.value.reduce((max, card) => Math.max(max, card.id), 0) + 1
  }

  function addCard(title: string) {
    cards.value.push({ id: nextId(), title, done: false })
  }

  function removeCard(id: number) {
    cards.value = cards.value.filter((card) => card.id !== id)
  }

  function toggleCard(id: number) {
    const card = cards.value.find((card) => card.id === id)
    if (!card) return
    card.done = !card.done
  }

  function renameCard(id: number, title: string) {
    const card = cards.value.find((card) => card.id === id)
    if (!card) return
    card.title = title
  }

  function clearAll() {
    cards.value = []
  }

  async function loadTasks() {
    loading.value = true
    error.value = ''
    try {
      cards.value = await fetchTasks()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误'
    } finally {
      loading.value = false
    }
  }

  watch(cards, (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)), { deep: true })

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
  }
})

const STORAGE_KEY = 'tasks'

function loadCards(): Task[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      return JSON.parse(raw) as Task[]
    } catch {
      return []
    }
  }
  return [
    { id: 1, title: 'A', done: false },
    { id: 2, title: 'B', done: false },
    { id: 3, title: 'C', done: false },
  ]
}
