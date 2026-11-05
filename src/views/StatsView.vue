<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '../stores/tasks'

const store = useTaskStore()

const rate = computed(() =>
  store.total === 0 ? 0 : Math.round((store.finished / store.total) * 100),
)
</script>

<template>
  <section class="stats">
    <h1>统计</h1>

    <div class="stats__grid">
      <div class="stats__card">
        <span class="stats__label">全部</span>
        <strong class="stats__value">{{ store.total }}</strong>
      </div>
      <div class="stats__card">
        <span class="stats__label">已完成</span>
        <strong class="stats__value">{{ store.finished }}</strong>
      </div>
      <div class="stats__card">
        <span class="stats__label">未完成</span>
        <strong class="stats__value">{{ store.total - store.finished }}</strong>
      </div>
      <div class="stats__card">
        <span class="stats__label">完成率</span>
        <strong class="stats__value">{{ rate }}%</strong>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats h1 {
  margin: 0 0 var(--space-4);
}

.stats__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-3);
}

.stats__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

.stats__label {
  color: var(--color-muted);
  font-size: 0.875rem;
}

.stats__value {
  font-size: 1.75rem;
  color: var(--color-primary);
}
</style>
