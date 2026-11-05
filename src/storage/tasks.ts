import type { Task } from '../types'

const STORAGE_KEY = 'tasks'

function createDefaultTasks(): Task[] {
  return [
    { id: 1, title: 'A', done: false },
    { id: 2, title: 'B', done: false },
    { id: 3, title: 'C', done: false },
  ]
}

export function loadTasksFromStorage(): Task[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return createDefaultTasks()

  try {
    return JSON.parse(raw) as Task[]
  } catch {
    return createDefaultTasks()
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}
