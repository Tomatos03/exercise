<script setup lang="ts">
interface TaskCardProps {
  id: number
  title: string
  index: number
  done: boolean
}

interface TaskCardEmits {
  remove: []
  toggle: []
}

defineProps<TaskCardProps>()
const emit = defineEmits<TaskCardEmits>()

function handleRemove() {
  emit('remove')
}

function handleToggle() {
  emit('toggle')
}
</script>

<template>
  <div class="task-card">
    <div class="task-card__head">
      <input type="checkbox" :checked="done" @change="handleToggle" />
      <h2 class="task-card__title" :class="{ done }">
        <RouterLink :to="'/tasks/' + id">{{ index + 1 }}: {{ title }}</RouterLink>
      </h2>
    </div>
    <div class="task-card__foot">
      <span class="task-card__status">{{ done ? '已完成' : '未完成' }}</span>
      <button class="task-card__remove" @click="handleRemove">删除</button>
    </div>
  </div>
</template>

<style scoped>
.task-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

.task-card__head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.task-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  word-break: break-word;
}

.task-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-card__status {
  color: var(--color-muted);
  font-size: 0.875rem;
}

.task-card__remove {
  padding: var(--space-1) var(--space-2);
  color: var(--color-danger);
  border-color: transparent;
  background-color: transparent;
}

.task-card__remove:hover:not(:disabled) {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.done {
  color: var(--color-muted);
  text-decoration: line-through;
}
</style>
