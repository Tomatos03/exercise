import type { SortOrder, Task, TaskSort } from '../types'

interface RemoteTask {
  id: number
  title: string
  completed: boolean
}

export interface TaskPage {
  items: Task[]
  /** 服务器返回的总条数（来自 X-Total-Count 响应头） */
  total: number
  page: number
  pageSize: number
}

interface RemoteStats {
  total: number
  completed: number
}

export interface TaskStats {
  total: number
  finished: number
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL

function toTask(item: RemoteTask): Task {
  return { id: item.id, title: item.title, done: item.completed }
}

/** 前端领域字段 → 服务端字段（与 toTask 的反方向映射配对） */
function toRemoteSort(field: TaskSort): string {
  return field === 'done' ? 'completed' : field
}

function ensureOk(response: Response) {
  if (!response.ok) throw new Error(`请求失败：${response.status}`)
}

export async function fetchTasks(
  page = 1,
  pageSize = 5,
  sort: TaskSort | '' = '',
  order: SortOrder = 'asc',
): Promise<TaskPage> {
  // await new Promise((resolve) => setTimeout(resolve, 1500)) // 添加延迟, 验证骨架屏效果
  const params = new URLSearchParams({
    _page: String(page),
    _limit: String(pageSize),
  })

  // 不传 sort 就保持服务端默认顺序
  if (sort !== '') {
    params.set('_sort', toRemoteSort(sort))
    params.set('_order', order)
  }

  const response = await fetch(`${BASE_URL}/todos?${params.toString()}`)
  ensureOk(response)

  const data = (await response.json()) as RemoteTask[]

  // 分页接口把总数放在响应头里；接口没给时退化为"当前页条数"
  const totalHeader = response.headers.get('X-Total-Count')
  const parsedTotal = totalHeader === null ? Number.NaN : Number(totalHeader)
  const total = Number.isNaN(parsedTotal) ? data.length : parsedTotal

  return { items: data.map(toTask), total, page, pageSize }
}

export async function fetchStats(): Promise<TaskStats> {
  const response = await fetch(`${BASE_URL}/stats`)
  ensureOk(response)

  const data = (await response.json()) as RemoteStats
  return { total: data.total, finished: data.completed }
}

export async function createTask(title: string): Promise<Task> {
  const response = await fetch(`${BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, completed: false }),
  })
  ensureOk(response)

  return toTask((await response.json()) as RemoteTask)
}

export async function updateTask(
  id: number,
  patch: { title?: string; done?: boolean },
): Promise<Task> {
  const body: Record<string, unknown> = {}
  if (patch.title !== undefined) body.title = patch.title
  if (patch.done !== undefined) body.completed = patch.done

  const response = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  ensureOk(response)

  return toTask((await response.json()) as RemoteTask)
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/todos/${id}`, { method: 'DELETE' })
  ensureOk(response)
}
