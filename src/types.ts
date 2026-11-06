export interface Task {
  id: number
  title: string
  done: boolean
}

/** 可排序的字段 */
export type TaskSort = 'id' | 'title' | 'done'
/** 排序方向 */
export type SortOrder = 'asc' | 'desc'
