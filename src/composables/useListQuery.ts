import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import type { Filter } from './useFilteredTasks'

export interface ListQuery {
  keyword: string
  filter: Filter
  page: number
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

export function readListQuery(query: LocationQuery): ListQuery {
  return {
    keyword: readQueryString(query.q).trim(),
    filter: parseFilter(readQueryString(query.filter).trim()),
    page: parsePage(readQueryString(query.page).trim()),
  }
}

export function buildListQuery(state: ListQuery, base: LocationQuery = {}): LocationQueryRaw {
  return {
    ...base,
    q: state.keyword === '' ? undefined : state.keyword,
    filter: state.filter === 'all' ? undefined : state.filter,
    page: state.page,
  }
}
