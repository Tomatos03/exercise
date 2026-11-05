import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTaskStore } from '../stores/tasks'
import { createTask, deleteTask, fetchTasks, updateTask } from '../api/tasks'

vi.mock('../api/tasks', () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}))

const firstPage = {
  items: [
    { id: 1, title: 'A', done: false },
    { id: 2, title: 'B', done: true },
  ],
  total: 12,
  page: 1,
  pageSize: 5,
}

describe('task store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loadTasks 拉取第一页并填充状态', async () => {
    vi.mocked(fetchTasks).mockResolvedValue(firstPage)

    const store = useTaskStore()
    await store.loadTasks()

    expect(fetchTasks).toHaveBeenCalledWith(1, 5)
    expect(store.cards).toEqual(firstPage.items)
    expect(store.serverTotal).toBe(12)
    expect(store.totalPages).toBe(3)
  })

  it('翻页时把目标页码传给接口', async () => {
    vi.mocked(fetchTasks).mockResolvedValue({ ...firstPage, page: 2 })

    const store = useTaskStore()
    await store.loadTasks(2)

    expect(fetchTasks).toHaveBeenCalledWith(2, 5)
    expect(store.page).toBe(2)
  })

  it('addCard 调创建接口并追加到列表', async () => {
    vi.mocked(createTask).mockResolvedValue({ id: 9, title: '买牛奶', done: false })

    const store = useTaskStore()
    await store.addCard('买牛奶')

    expect(createTask).toHaveBeenCalledWith('买牛奶')
    expect(store.cards).toEqual([{ id: 9, title: '买牛奶', done: false }])
    expect(store.serverTotal).toBe(1)
  })

  it('removeCard 调删除接口并移除卡片', async () => {
    vi.mocked(fetchTasks).mockResolvedValue(firstPage)
    vi.mocked(deleteTask).mockResolvedValue(undefined)

    const store = useTaskStore()
    await store.loadTasks()
    await store.removeCard(1)

    expect(deleteTask).toHaveBeenCalledWith(1)
    expect(store.cards.map((card) => card.id)).toEqual([2])
    expect(store.serverTotal).toBe(11)
  })

  it('toggleCard 调更新接口并同步完成状态', async () => {
    vi.mocked(fetchTasks).mockResolvedValue(firstPage)
    vi.mocked(updateTask).mockResolvedValue({ id: 1, title: 'A', done: true })

    const store = useTaskStore()
    await store.loadTasks()
    await store.toggleCard(1)

    expect(updateTask).toHaveBeenCalledWith(1, { done: true })
    expect(store.cards[0]?.done).toBe(true)
  })

  it('renameCard 调更新接口并同步标题', async () => {
    vi.mocked(fetchTasks).mockResolvedValue(firstPage)
    vi.mocked(updateTask).mockResolvedValue({ id: 1, title: '新标题', done: false })

    const store = useTaskStore()
    await store.loadTasks()
    await store.renameCard(1, '新标题')

    expect(updateTask).toHaveBeenCalledWith(1, { title: '新标题' })
    expect(store.cards[0]?.title).toBe('新标题')
  })

  it('请求失败时记录错误且不改动列表', async () => {
    vi.mocked(createTask).mockRejectedValue(new Error('请求失败：500'))

    const store = useTaskStore()
    await store.addCard('买牛奶')

    expect(store.error).toBe('请求失败：500')
    expect(store.cards).toHaveLength(0)
  })
})
