<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { useTaskStore } from '../stores/tasks'

const route = useRoute()
const store = useTaskStore()

const id = computed(() => Number(route.params.id))
const task = computed(() => store.cards.find((card) => card.id === id.value))

const draft = ref('')
const isDirty = computed(() => draft.value !== (task.value?.title ?? ''))

watch(
  task,
  (value) => {
    draft.value = value?.title ?? ''
  },
  { immediate: true },
)

onBeforeRouteLeave(() => {
  if (!isDirty.value) return true
  return window.confirm('标题还没保存，确定离开吗？')
})

function save() {
  if (!task.value) return
  store.renameCard(task.value.id, draft.value)
}
</script>

<template>
  <section class="detail">
    <RouterLink class="detail__back" to="/">← 返回列表</RouterLink>
    <h1>任务详情</h1>

    <div v-if="task" class="detail__body">
      <h2 class="detail__title">{{ task.title }}</h2>
      <p class="detail__status">状态：{{ task.done ? '已完成' : '未完成' }}</p>

      <form class="detail__form" @submit.prevent="save">
        <input v-model="draft" placeholder="输入新标题" />
        <button type="submit" :disabled="draft.trim() === ''">保存</button>
      </form>
    </div>
    <p v-else class="detail__empty">找不到这个任务</p>
  </section>
</template>

<style scoped>
.detail__back {
  display: inline-block;
  margin-bottom: var(--space-3);
  font-size: 0.875rem;
}

.detail h1 {
  margin: 0 0 var(--space-4);
}

.detail__body {
  padding: var(--space-4);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

.detail__title {
  margin: 0 0 var(--space-2);
}

.detail__status {
  color: var(--color-muted);
  font-size: 0.875rem;
}

.detail__form {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.detail__form input {
  flex: 1;
}

.detail__empty {
  color: var(--color-muted);
}
</style>
