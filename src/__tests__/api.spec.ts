import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchTasks } from '../api/tasks'

function mockFetch(impl: () => Promise<unknown>) {
  const fetchMock = vi.fn(impl)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api/tasks', () => {
  it('请求正确的地址', async () => {
    const fetchMock = mockFetch(async () => ({ ok: true, json: async () => [] }))

    await fetchTasks()

    expect(fetchMock).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_BASE_URL}/todos?_limit=5`,
    )
  })

  it('把服务器字段转换成 Task（completed → done）', async () => {
    mockFetch(async () => ({
      ok: true,
      json: async () => [
        { id: 1, title: 'A', completed: false, userId: 99 },
        { id: 2, title: 'B', completed: true, userId: 99 },
      ],
    }))

    const tasks = await fetchTasks()

    expect(tasks).toEqual([
      { id: 1, title: 'A', done: false },
      { id: 2, title: 'B', done: true },
    ])
  })

  it('响应非 2xx 时抛出带状态码的错误', async () => {
    mockFetch(async () => ({ ok: false, status: 500 }))

    await expect(fetchTasks()).rejects.toThrow('请求失败：500')
  })

  it('JSON 解析失败时把错误抛给调用方', async () => {
    mockFetch(async () => ({
      ok: true,
      json: async () => {
        throw new SyntaxError('bad json')
      },
    }))

    await expect(fetchTasks()).rejects.toThrow('bad json')
  })

  it('网络失败时把错误抛给调用方', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch')
    })

    await expect(fetchTasks()).rejects.toThrow('Failed to fetch')
  })
})
