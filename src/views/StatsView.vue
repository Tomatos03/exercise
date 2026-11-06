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

const metrics = computed(() => {
  const current = stats.value
  if (!current) return []

  return [
    { label: '全部', value: String(current.total) },
    { label: '已完成', value: String(current.finished) },
    { label: '未完成', value: String(pending.value) },
    { label: '完成率', value: `${rate.value}%` },
  ]
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

    <!-- 加载中：Element Plus 骨架屏 -->
    <el-row v-if="loading" :gutter="12">
      <el-col v-for="n in 4" :key="n" :xs="12" :sm="6">
        <el-card class="stats__card" shadow="never">
          <el-skeleton :rows="2" animated />
        </el-card>
      </el-col>
    </el-row>

    <!-- 加载失败：错误提示 + 重试 -->
    <div v-else-if="error" class="stats__error">
      <el-alert :title="`加载失败：${error}`" type="error" :closable="false" show-icon />
      <el-button type="primary" @click="loadStats">重试</el-button>
    </div>

    <!-- 加载完：服务端返回的真实数字 -->
    <el-row v-else-if="stats" :gutter="12">
      <el-col v-for="item in metrics" :key="item.label" :xs="12" :sm="6">
        <el-card class="stats__card" shadow="never">
          <div class="stats__label">{{ item.label }}</div>
          <div class="stats__value">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>
  </section>
</template>

<style scoped>
.stats h1 {
  margin: 0 0 var(--space-4);
}

.stats__card {
  height: 100%;
}

.stats__label {
  margin-bottom: var(--space-1);
  color: var(--color-muted);
  font-size: 0.875rem;
}

.stats__value {
  color: var(--color-primary);
  font-size: 1.75rem;
  line-height: 1.2;
}

.stats__error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
}
</style>
