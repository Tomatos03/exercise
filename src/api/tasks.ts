import type { Task } from '../types'

interface RemoteTask {
  id: number
  title: string
  completed: boolean
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const TASKS_URL = `${BASE_URL}/todos?_limit=5`

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(TASKS_URL)
  if (!response.ok) throw new Error(`请求失败：${response.status}`)

  const data = (await response.json()) as RemoteTask[]

  return data.map((item) => ({ id: item.id, title: item.title, done: item.completed }))
}
