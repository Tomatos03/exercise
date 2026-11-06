<script setup lang="ts">
interface TaskCardProps {
  id: number
  title: string
  index: number
  done: boolean
  /** 是否被批量选中（可选，保持旧调用方向后兼容） */
  selected?: boolean
}

interface TaskCardEmits {
  remove: []
  toggle: []
  toggleSelect: []
}

defineProps<TaskCardProps>()
const emit = defineEmits<TaskCardEmits>()

function handleRemove() {
  emit('remove')
}

function handleToggle() {
  emit('toggle')
}

function handleSelect() {
  emit('toggleSelect')
}
</script>

<template>
  <div class="task-card" :class="{ selected, 'is-done': done }">
    <span
      class="task-card__select"
      :class="{ 'is-checked': selected }"
      role="checkbox"
      :aria-checked="selected === true"
      aria-label="选择任务"
      tabindex="0"
      @click="handleSelect"
      @keydown.space.prevent="handleSelect"
      @keydown.enter.prevent="handleSelect"
    />

    <div class="task-card__body">
      <h2 class="task-card__title" :class="{ done }">
        <RouterLink :to="'/tasks/' + id">{{ index + 1 }}: {{ title }}</RouterLink>
      </h2>
    </div>

    <div class="task-card__actions">
      <el-checkbox class="task-card__toggle" :model-value="done" @change="handleToggle">
        <span class="task-card__status">{{ done ? '已完成' : '未完成' }}</span>
      </el-checkbox>

      <el-button class="task-card__remove" type="danger" link @click="handleRemove">
        删除
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.task-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

/* 选中：主色描边 + 左侧色条 */
.task-card.selected {
  border-color: var(--color-primary);
  box-shadow:
    inset 3px 0 0 var(--color-primary),
    0 0 0 1px var(--color-primary);
}

/* 选择框（用 ARIA 模拟，不能用 input，见测试约束） */
.task-card__select {
  flex: none;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 1.5px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-surface);
  /* 勾号用背景色：亮色下是近白，暗色下是近黑色，两种主题都清晰 */
  color: var(--color-bg);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.task-card__select:hover {
  border-color: var(--color-primary);
}

.task-card__select:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.task-card__select.is-checked {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
}

.task-card__select.is-checked::after {
  content: '✓';
  font-weight: 700;
}

.task-card__body {
  flex: 1;
  min-width: 0; /* 让超长标题能换行，而不是把右侧操作区挤出去 */
}

.task-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4;
  word-break: break-word;
}

/* 右侧操作区：完成开关 + 删除，和左侧的批量选择框隔开 */
.task-card__actions {
  flex: none;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* 完成开关：Element Plus checkbox + 文字，点文字也能切换 */
.task-card__toggle {
  margin-right: 0;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: 999px;
}

.task-card__toggle:hover {
  border-color: var(--color-primary);
}

.task-card__toggle :deep(.el-checkbox__label) {
  padding-left: var(--space-1);
}

.task-card__status {
  color: var(--color-muted);
  font-size: 0.8125rem;
  white-space: nowrap;
}

/* 已完成：状态文字变主色，标题 line-through（.done 只加在 h2 上） */
.task-card.is-done .task-card__status {
  color: var(--color-primary);
}

.task-card__remove {
  flex: none;
  font-size: 0.8125rem;
}

.done {
  color: var(--color-muted);
  text-decoration: line-through;
}
</style>
