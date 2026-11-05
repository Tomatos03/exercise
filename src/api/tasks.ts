import type { Task } from '../types'

interface RemoteTask {
  id: number
  title: string
  completed: boolean
}

const TASKS_URL = 'https://jsonplaceholder.typicode.com/todos?_limit=5'

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(TASKS_URL)
  if (!response.ok) throw new Error(`请求失败：${response.status}`)

  const data = (await response.json()) as RemoteTask[]

  return data.map((item) => ({ id: item.id, title: item.title, done: item.completed }))
}
