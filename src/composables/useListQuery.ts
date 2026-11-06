import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import type { SortOrder, TaskSort } from '../types'
import type { Filter } from './useFilteredTasks'

export interface ListQuery {
  keyword: string
  filter: Filter
  page: number
  sort: TaskSort | ''
  order: SortOrder
}

export function readQueryString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function parseFilter(value: string): Filter {
  return value === 'active' || value === 'done' ? value : 'all'
}

export function parsePage(value: string): number {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export function parseSort(value: string): TaskSort | '' {
  return value === 'id' || value === 'title' || value === 'done' ? value : ''
}

export function parseOrder(value: string): SortOrder {
  return value === 'desc' ? 'desc' : 'asc'
}

export function readListQuery(query: LocationQuery): ListQuery {
  return {
    keyword: readQueryString(query.q).trim(),
    filter: parseFilter(readQueryString(query.filter).trim()),
    page: parsePage(readQueryString(query.page).trim()),
    sort: parseSort(readQueryString(query.sort).trim()),
    order: parseOrder(readQueryString(query.order).trim()),
  }
}

export function buildListQuery(state: ListQuery, base: LocationQuery = {}): LocationQueryRaw {
  return {
    ...base,
    q: state.keyword === '' ? undefined : state.keyword,
    filter: state.filter === 'all' ? undefined : state.filter,
    page: state.page,
    sort: state.sort === '' ? undefined : state.sort,
    order: state.sort === '' || state.order === 'asc' ? undefined : state.order,
  }
}
