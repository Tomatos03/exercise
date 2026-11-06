<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchStats } from '../api/tasks'
import type { TaskStats } from '../api/tasks'

const stats = ref<TaskStats | null>(null)
const loading = ref(true)
const error = ref('')

const pending = computed(() => {
  const current = stats.value
  return current ? current.total - current.finished : 0
})

const rate = computed(() => {
  const current = stats.value
  if (!current || current.total === 0) return 0
  return Math.round((current.finished / current.total) * 100)
})

async function loadStats() {
  loading.value = true
  error.value = ''
  try {
    stats.value = await fetchStats()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '未知错误'
  } finally {
    loading.value = false
  }
}

onMounted(loadStats)
</script>

<template>
  <section class="stats">
    <h1>统计</h1>

    <!-- 加载中：灰色占位条 -->
    <div v-if="loading" class="stats__grid">
      <div v-for="n in 4" :key="n" class="stats__card">
        <span class="stats__label">加载中…</span>
        <span class="stats__skeleton"></span>
      </div>
    </div>

    <!-- 加载失败：错误提示 + 重试 -->
    <div v-else-if="error" class="stats__error">
      <p>加载失败：{{ error }}</p>
      <button @click="loadStats">重试</button>
    </div>

    <!-- 加载完：服务端返回的真实数字 -->
    <div v-else-if="stats" class="stats__grid">
      <div class="stats__card">
        <span class="stats__label">全部</span>
        <strong class="stats__value">{{ stats.total }}</strong>
      </div>
      <div class="stats__card">
        <span class="stats__label">已完成</span>
        <strong class="stats__value">{{ stats.finished }}</strong>
      </div>
      <div class="stats__card">
        <span class="stats__label">未完成</span>
        <strong class="stats__value">{{ pending }}</strong>
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

.stats__error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  color: var(--color-danger);
}

.stats__error p {
  margin: 0;
}
</style>
