<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { vFocus } from '@/directives/focus'
import { useRoute, useRouter } from 'vue-router'
import type { InputInstance } from 'element-plus'
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

function handleFilterChange(value: string | number | boolean | undefined) {
  if (value === 'all' || value === 'active' || value === 'done') {
    filter.value = value
  }
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
function handlePageChange(page: number) {
  store.loadTasks(page)
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

// 搜索框：Element Plus 实例，用于快捷键主动聚焦
const searchEl = ref<InputInstance | null>(null)
const formRef = ref<InstanceType<typeof TaskForm> | null>(null)

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
}

function handleHotkey(event: KeyboardEvent) {
  // 正在输入框里打字，不抢按键
  if (isEditable(event.target)) return

  if (event.key === '/') {
    event.preventDefault()
    searchEl.value?.focus()
    return
  }
  if (event.key === 'n') {
    event.preventDefault()
    formRef.value?.focus()
    return
  }
}

function handleSearchEscape() {
  searchInput.value = ''
  // 立即生效，不等 300ms 防抖
  keyword.value = ''
  searchEl.value?.blur()
}

// 清理
onMounted(() => {
  window.addEventListener('keydown', handleHotkey)
})

onUnmounted(() => {
  clearTimeout(searchTimer)
  window.removeEventListener('keydown', handleHotkey)
})
</script>

<template>
  <RouterLink :to="{ query: { filter: 'done' } }">[测试] 切到已完成</RouterLink>
  <section class="todo">
    <h1>待办</h1>

    <div class="todo__toolbar">
      <el-input
        ref="searchEl"
        v-focus="autoFocus"
        v-model="searchInput"
        class="todo__search"
        placeholder="搜索任务（按 / 聚焦）"
        clearable
        @keydown.esc="handleSearchEscape"
      />
      <el-radio-group
        :model-value="filter"
        class="todo__filters"
        @update:model-value="handleFilterChange"
      >
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="active">未完成</el-radio-button>
        <el-radio-button value="done">已完成</el-radio-button>
      </el-radio-group>
      <div class="todo__sort">
        <el-select
          v-model="sortField"
          class="todo__sort-select"
          placeholder="默认顺序"
          @change="handleSortChange"
        >
          <el-option label="默认顺序" value="" />
          <el-option label="按标题" value="title" />
          <el-option label="按状态" value="done" />
        </el-select>
        <el-button :disabled="sortField === ''" @click="toggleOrder">
          {{ sortOrder === 'asc' ? '↑ 升序' : '↓ 降序' }}
        </el-button>
      </div>
    </div>
    <el-button size="small" class="todo__debug" @click="autoFocus = !autoFocus">
      autoFocus toggle
    </el-button>

    <div class="todo__select-bar">
      <el-checkbox :model-value="allSelected" @change="toggleSelectAll"> 全选本页 </el-checkbox>
      <template v-if="selectedIds.length > 0">
        <span>已选 {{ selectedIds.length }} 项</span>
        <el-button size="small" @click="handleBatchDone(true)">标记完成</el-button>
        <el-button size="small" @click="handleBatchDone(false)">标记未完成</el-button>
        <el-button size="small" type="danger" plain @click="handleBatchDelete">删除选中</el-button>
      </template>
    </div>

    <el-empty v-if="visibleCards.length === 0" description="没有符合条件的卡片" :image-size="80" />

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

    <el-pagination
      v-if="store.totalPages > 1"
      class="todo__pager"
      background
      layout="prev, pager, next"
      :total="store.serverTotal"
      :page-size="store.pageSize"
      :current-page="store.page"
      @current-change="handlePageChange"
    />

    <TaskForm ref="formRef" v-model="content" @submit="addCard" />

    <div class="todo__actions">
      <el-button @click="store.loadTasks()">从服务器加载</el-button>
      <el-button type="danger" plain @click="handleClear">清空全部</el-button>
    </div>

    <p v-if="store.loading" class="todo__hint">加载中…</p>
    <el-alert v-if="store.error" :title="store.error" type="error" :closable="false" show-icon />
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

.todo__search {
  flex: 1;
  min-width: 180px;
}

.todo__filters {
  flex: none;
}

.todo__sort {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.todo__sort-select {
  width: 130px;
}

.todo__debug {
  align-self: flex-start;
}

.todo__actions {
  display: flex;
  gap: var(--space-2);
}

.todo__pager {
  display: flex;
  justify-content: center;
}

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

.todo__select-bar :deep(.el-checkbox) {
  margin-right: 0;
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
