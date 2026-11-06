<script setup lang="ts">
import { computed, inject, onUnmounted, ref, watch } from 'vue'
import { vFocus } from '@/directives/focus'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '../stores/tasks'
import TaskCard from '../components/TaskCard.vue'
import TaskForm from '@/components/TaskForm.vue'
import { useFilteredTasks } from '@/composables/useFilteredTasks'
import { confirmKey } from '@/composables/useConfirm'
import { buildListQuery, readListQuery } from '@/composables/useListQuery'
import type { SortOrder, TaskSort } from '@/types'

// 外部依赖
const store = useTaskStore()
const route = useRoute()
const router = useRouter()
const confirm = inject(confirmKey)

// 页面状态（先用 URL 初始化）
const { filter, keyword, visibleCards } = useFilteredTasks(() => store.cards)

const initialQuery = readListQuery(route.query)
filter.value = initialQuery.filter
keyword.value = initialQuery.keyword
const searchInput = ref(initialQuery.keyword)
const content = ref('')
let searchTimer: ReturnType<typeof setTimeout> | undefined
const autoFocus = ref(true)

// 排序：初始值来自 URL，控件变化时写回 store
const sortField = ref<TaskSort | ''>(initialQuery.sort)
const sortOrder = ref<SortOrder>(initialQuery.order)

function handleSortChange() {
  // 没有排序字段时，升降序没有意义，重置成默认值
  if (sortField.value === '') sortOrder.value = 'asc'
  store.setSort(sortField.value, sortOrder.value)
}

function toggleOrder() {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  handleSortChange()
}

// 规范化地址栏, 防止用户手动输入不规范的查询参数
// 注意：page 用 initialQuery.page，不能用 store.page（守卫还在异步加载目标页）
const normalizedQuery = buildListQuery(
  {
    keyword: initialQuery.keyword,
    filter: initialQuery.filter,
    page: initialQuery.page,
    sort: initialQuery.sort,
    order: initialQuery.order,
  },
  route.query,
)
if (router.resolve({ query: normalizedQuery }).fullPath !== route.fullPath) {
  router.replace({ query: normalizedQuery })
}

// 副作用：搜索输入内容防抖
watch(searchInput, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    keyword.value = value
  }, 300)
})

// 过滤条件 / 关键字 / 页码 / 排序变化时同步 URL 查询参数
watch([filter, keyword, () => store.page, () => store.sort, () => store.order], () => {
  const next = buildListQuery(
    {
      keyword: keyword.value.trim(),
      filter: filter.value,
      page: store.page,
      sort: store.sort,
      order: store.order,
    },
    route.query,
  )

  // 地址已经一致就不跳，避免多余导航
  if (router.resolve({ query: next }).fullPath === route.fullPath) return

  router.replace({ query: next })
})

// 处理非url地址回车的跳转情况
watch(
  () => route.query,
  (query) => {
    const next = readListQuery(query)

    const same =
      next.filter === filter.value &&
      next.keyword === keyword.value &&
      next.sort === sortField.value &&
      next.order === sortOrder.value

    // 值没变就直接返回 —— 防止和我们自己的写回形成来回导航
    if (same) return

    filter.value = next.filter
    keyword.value = next.keyword
    searchInput.value = next.keyword
    sortField.value = next.sort
    sortOrder.value = next.order
  },
)

// 批量选择：只存 id，避免和卡片数据不同步
const selectedIds = ref<number[]>([])

const allSelected = computed(
  () =>
    visibleCards.value.length > 0 &&
    visibleCards.value.every((card) => selectedIds.value.includes(card.id)),
)

function toggleSelect(id: number) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((item) => item !== id)
    : [...selectedIds.value, id]
}

function toggleSelectAll() {
  const pageIds = visibleCards.value.map((card) => card.id)

  if (allSelected.value) {
    selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id))
  } else {
    selectedIds.value = [...new Set([...selectedIds.value, ...pageIds])]
  }
}

// 事件处理
function addCard() {
  store.addCard(content.value)
  content.value = ''
}

// 分页只对服务端数据生效（serverTotal > 0 时）
function prevPage() {
  store.loadTasks(store.page - 1)
}

function nextPage() {
  store.loadTasks(store.page + 1)
}

async function handleClear() {
  if (!confirm) return
  const ok = await confirm('确定清空全部任务吗？这个操作不可撤销。', '清空')
  if (ok) store.clearAll()
}

async function handleBatchDone(done: boolean) {
  if (selectedIds.value.length === 0) return
  // 保留选中状态，方便接着执行其他批量操作
  await store.setDoneMany(selectedIds.value, done)
}

async function handleBatchDelete() {
  const count = selectedIds.value.length
  if (count === 0 || !confirm) return

  const ok = await confirm(`确定删除选中的 ${count} 个任务吗？这个操作不可撤销。`, '删除')
  if (!ok) return

  await store.removeCards(selectedIds.value)
  selectedIds.value = []

  // 当前页被删空且不是第 1 页时，退回上一页
  if (store.cards.length === 0 && store.page > 1) {
    store.loadTasks(store.page - 1)
  }
}

// 清理
onUnmounted(() => {
  clearTimeout(searchTimer)
})
</script>

<template>
  <RouterLink :to="{ query: { filter: 'done' } }">[测试] 切到已完成</RouterLink>
  <section class="todo">
    <h1>待办</h1>

    <div class="todo__toolbar">
      <input v-focus="autoFocus" v-model="searchInput" placeholder="搜索任务" />
      <div class="todo__filters">
        <button :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</button>
        <button :class="{ active: filter === 'active' }" @click="filter = 'active'">未完成</button>
        <button :class="{ active: filter === 'done' }" @click="filter = 'done'">已完成</button>
      </div>
      <div class="todo__sort">
        <select v-model="sortField" @change="handleSortChange">
          <option value="">默认顺序</option>
          <option value="title">按标题</option>
          <option value="done">按状态</option>
        </select>
        <button :disabled="sortField === ''" @click="toggleOrder">
          {{ sortOrder === 'asc' ? '↑ 升序' : '↓ 降序' }}
        </button>
      </div>
    </div>
    <button @click="autoFocus = !autoFocus">autoFocus toggle</button>

    <div class="todo__select-bar">
      <label>
        <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" />
        全选本页
      </label>
      <template v-if="selectedIds.length > 0">
        <span>已选 {{ selectedIds.length }} 项</span>
        <button class="todo__batch-done" @click="handleBatchDone(true)">标记完成</button>
        <button class="todo__batch-done" @click="handleBatchDone(false)">标记未完成</button>
        <button class="todo__batch-delete" @click="handleBatchDelete">删除选中</button>
      </template>
    </div>

    <p v-if="visibleCards.length === 0" class="todo__empty">没有符合条件的卡片</p>

    <TransitionGroup name="list" tag="div" class="todo__list">
      <TaskCard
        v-for="(item, index) in visibleCards"
        :key="item.id"
        :id="item.id"
        :title="item.title"
        :index="(store.page - 1) * store.pageSize + index"
        :done="item.done"
        :selected="selectedIds.includes(item.id)"
        @remove="store.removeCard(item.id)"
        @toggle="store.toggleCard(item.id)"
        @toggle-select="toggleSelect(item.id)"
      />
    </TransitionGroup>

    <div v-if="store.totalPages > 1" class="todo__pager">
      <button :disabled="store.page === 1" @click="prevPage">上一页</button>
      <span>{{ store.page }} / {{ store.totalPages }}</span>
      <button :disabled="store.page === store.totalPages" @click="nextPage">下一页</button>
    </div>

    <TaskForm v-model="content" @submit="addCard" />

    <div class="todo__actions">
      <button @click="store.loadTasks()">从服务器加载</button>
      <button @click="handleClear">清空全部</button>
    </div>

    <p v-if="store.loading" class="todo__hint">加载中…</p>
    <p v-if="store.error" class="todo__error">{{ store.error }}</p>
    <p class="todo__summary">
      共 {{ store.serverTotal || store.total }} 张，已完成 {{ store.finished }} 张
    </p>
  </section>
</template>

<style scoped>
.todo {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.todo h1 {
  margin: 0;
}

.todo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.todo__toolbar input {
  flex: 1;
  min-width: 180px;
}

.todo__filters {
  display: flex;
  gap: var(--space-1);
}

.todo__filters .active {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.todo__sort {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.todo__sort select {
  padding: var(--space-1) var(--space-2);
  color: inherit;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.todo__actions {
  display: flex;
  gap: var(--space-2);
}

.todo__pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--color-muted);
  font-size: 0.875rem;
}

.todo__empty,
.todo__hint,
.todo__summary {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.todo__select-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: 0.875rem;
  color: var(--color-muted);
}

.todo__batch-delete {
  padding: var(--space-1) var(--space-2);
  color: var(--color-danger);
  border-color: var(--color-danger);
  background-color: transparent;
  font-size: 0.8125rem;
}

.todo__batch-done {
  padding: var(--space-1) var(--space-2);
  color: var(--color-primary);
  border-color: var(--color-primary);
  background-color: transparent;
  font-size: 0.8125rem;
}

.todo__batch-delete:hover:not(:disabled) {
  color: var(--color-surface);
  background-color: var(--color-danger);
}

.todo__error {
  margin: 0;
  color: var(--color-danger);
  font-size: 0.875rem;
}

.todo__list {
  position: relative; /* 给离场卡片的绝对定位做参照 */
}

.list-enter-active,
.list-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 关键技巧：离场期间脱离文档流，剩下的卡片才会平滑移动 */
.list-leave-active {
  position: absolute;
  left: 0;
  width: 100%;
}

/* 位置变化时自动应用 */
.list-move {
  transition: transform 0.2s ease;
}
</style>
