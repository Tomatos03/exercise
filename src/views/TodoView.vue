<script setup lang="ts">
import { inject, onUnmounted, ref, watch } from 'vue'
import { vFocus } from '@/directives/focus'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '../stores/tasks'
import TaskCard from '../components/TaskCard.vue'
import TaskForm from '@/components/TaskForm.vue'
import { useFilteredTasks } from '@/composables/useFilteredTasks'
import { confirmKey } from '@/composables/useConfirm'
import { buildListQuery, readListQuery } from '@/composables/useListQuery'

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

// 规范化地址栏, 防止用户手动输入不规范的查询参数
// 注意：page 用 initialQuery.page，不能用 store.page（守卫还在异步加载目标页）
const normalizedQuery = buildListQuery(
  {
    keyword: initialQuery.keyword,
    filter: initialQuery.filter,
    page: initialQuery.page,
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

// 过滤条件 / 关键字 / 页码变化时同步 URL 查询参数
watch([filter, keyword, () => store.page], () => {
  const next = buildListQuery(
    { keyword: keyword.value.trim(), filter: filter.value, page: store.page },
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

    // 值没变就直接返回 —— 防止和我们自己的写回形成来回导航
    if (next.filter === filter.value && next.keyword === keyword.value) return

    filter.value = next.filter
    keyword.value = next.keyword
    searchInput.value = next.keyword
  },
)

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
    </div>
    <button @click="autoFocus = !autoFocus">autoFocus toggle</button>

    <p v-if="visibleCards.length === 0" class="todo__empty">没有符合条件的卡片</p>

    <TransitionGroup name="list" tag="div" class="todo__list">
      <TaskCard
        v-for="(item, index) in visibleCards"
        :key="item.id"
        :id="item.id"
        :title="item.title"
        :index="(store.page - 1) * store.pageSize + index"
        :done="item.done"
        @remove="store.removeCard(item.id)"
        @toggle="store.toggleCard(item.id)"
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
