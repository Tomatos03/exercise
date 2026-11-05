import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchTasks } from '../api/tasks'

function mockFetch(impl: () => Promise<unknown>) {
  const fetchMock = vi.fn(impl)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function makeResponse(init: {
  ok?: boolean
  status?: number
  body?: unknown
  total?: string | null
}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    headers: { get: () => init.total ?? null },
    json: async () => init.body,
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api/tasks', () => {
  it('默认请求第一页、每页 5 条', async () => {
    const fetchMock = mockFetch(async () => makeResponse({ body: [] }))

    await fetchTasks()

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/todos?_page=1&_limit=5`)
  })

  it('指定的页码与每页条数会拼进地址', async () => {
    const fetchMock = mockFetch(async () => makeResponse({ body: [] }))

    await fetchTasks(3, 10)

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/todos?_page=3&_limit=10`)
  })

  it('转换字段，并从 X-Total-Count 读取总数', async () => {
    mockFetch(async () =>
      makeResponse({
        body: [
          { id: 1, title: 'A', completed: false, userId: 99 },
          { id: 2, title: 'B', completed: true, userId: 99 },
        ],
        total: '37',
      }),
    )

    const result = await fetchTasks(2, 5)

    expect(result.items).toEqual([
      { id: 1, title: 'A', done: false },
      { id: 2, title: 'B', done: true },
    ])
    expect(result.total).toBe(37)
    expect(result.page).toBe(2)
    expect(result.pageSize).toBe(5)
  })

  it('缺少 X-Total-Count 时总数退化为当前页条数', async () => {
    mockFetch(async () =>
      makeResponse({
        body: [
          { id: 1, title: 'A', completed: false },
          { id: 2, title: 'B', completed: false },
        ],
      }),
    )

    const result = await fetchTasks()

    expect(result.total).toBe(2)
  })

  it('响应非 2xx 时抛出带状态码的错误', async () => {
    mockFetch(async () => makeResponse({ ok: false, status: 500 }))

    await expect(fetchTasks()).rejects.toThrow('请求失败：500')
  })

  it('JSON 解析失败时把错误抛给调用方', async () => {
    mockFetch(async () => ({
      ok: true,
      status: 200,
      headers: { get: () => null },
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
