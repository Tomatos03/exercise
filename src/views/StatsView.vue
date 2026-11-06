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

    <!-- 加载中：灰色占位条 -->
    <div v-if="store.loading" class="stats__grid">
      <div v-for="n in 4" :key="n" class="stats__card">
        <span class="stats__label">加载中…</span>
        <span class="stats__skeleton"></span>
      </div>
    </div>

    <!-- 加载完：真实数字 -->
    <div v-else class="stats__grid">
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

/* 骨架屏占位条：呼吸式闪烁 */
.stats__skeleton {
  display: block;
  width: 60px;
  height: 1.75rem;
  border-radius: 4px;
  background-color: var(--color-border);
  animation: stats-pulse 1s ease-in-out infinite;
}

@keyframes stats-pulse {
  50% {
    opacity: 0.35;
  }
}
</style>
