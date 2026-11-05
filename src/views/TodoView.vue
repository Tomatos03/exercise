<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '../stores/tasks'
import TaskCard from '../components/TaskCard.vue'
import TaskForm from '@/components/TaskForm.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useFilteredTasks } from '@/composables/useFilteredTasks'

const store = useTaskStore()
const content = ref('')
const confirmOpen = ref(false)

const { filter, keyword, visibleCards } = useFilteredTasks(() => store.cards)

function addCard() {
  store.addCard(content.value)
  content.value = ''
}

function clearAll() {
  store.clearAll()
  confirmOpen.value = false
}
</script>

<template>
  <section class="todo">
    <h1>待办</h1>

    <div class="todo__toolbar">
      <input v-model="keyword" placeholder="搜索任务" />
      <div class="todo__filters">
        <button :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</button>
        <button :class="{ active: filter === 'active' }" @click="filter = 'active'">未完成</button>
        <button :class="{ active: filter === 'done' }" @click="filter = 'done'">已完成</button>
      </div>
    </div>

    <p v-if="visibleCards.length === 0" class="todo__empty">没有符合条件的卡片</p>

    <TaskCard
      v-for="(item, index) in visibleCards"
      :key="item.id"
      :id="item.id"
      :title="item.title"
      :index="index"
      :done="item.done"
      @remove="store.removeCard(item.id)"
      @toggle="store.toggleCard(item.id)"
    />

    <TaskForm v-model="content" @submit="addCard" />

    <div class="todo__actions">
      <button @click="store.loadTasks">从服务器加载</button>
      <button @click="confirmOpen = true">清空全部</button>
    </div>

    <p v-if="store.loading" class="todo__hint">加载中…</p>
    <p v-if="store.error" class="todo__error">{{ store.error }}</p>
    <p class="todo__summary">共 {{ store.total }} 张，已完成 {{ store.finished }} 张</p>

    <ConfirmDialog
      v-model="confirmOpen"
      message="确定清空全部任务吗？这个操作不可撤销。"
      confirm-text="清空"
      @confirm="clearAll"
    />
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

.todo__form {
  display: flex;
  gap: var(--space-2);
}

.todo__form input {
  flex: 1;
}

.todo__actions {
  display: flex;
  gap: var(--space-2);
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
</style>
