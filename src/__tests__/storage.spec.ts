import { beforeEach, describe, expect, it } from 'vitest'
import { loadTasksFromStorage, saveTasksToStorage } from '../storage/tasks'

describe('storage/tasks', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('没有数据时返回默认任务', () => {
    const tasks = loadTasksFromStorage()

    expect(tasks).toHaveLength(3)
    expect(tasks[0]?.title).toBe('A')
  })

  it('保存后能读回相同数据', () => {
    saveTasksToStorage([{ id: 9, title: '写测试', done: true }])

    const tasks = loadTasksFromStorage()

    expect(tasks).toEqual([{ id: 9, title: '写测试', done: true }])
  })

  it('数据损坏时回退到默认任务', () => {
    localStorage.setItem('tasks', '{ 这不是合法的 JSON')

    const tasks = loadTasksFromStorage()

    expect(tasks).toHaveLength(3)
    expect(tasks[0]?.title).toBe('A')
  })

  it('每次读取返回独立数组，互不影响', () => {
    const first = loadTasksFromStorage()
    first.push({ id: 100, title: '临时任务', done: false })

    const second = loadTasksFromStorage()

    expect(second).toHaveLength(3)
  })
})
