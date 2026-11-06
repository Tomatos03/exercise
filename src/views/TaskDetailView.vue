<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { useTaskStore } from '../stores/tasks'
import { confirmKey } from '../composables/useConfirm'

const route = useRoute()
const store = useTaskStore()
const confirm = inject(confirmKey)

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

onBeforeRouteLeave(async () => {
  if (!isDirty.value) return true
  if (!confirm) return true
  return await confirm('标题还没保存，确定离开吗？', '离开')
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

    <el-card v-if="task" class="detail__body" shadow="never">
      <h2 class="detail__title">{{ task.title }}</h2>
      <p class="detail__status">
        状态：
        <el-tag :type="task.done ? 'success' : 'info'">
          {{ task.done ? '已完成' : '未完成' }}
        </el-tag>
      </p>

      <form class="detail__form" @submit.prevent="save">
        <el-input v-model="draft" class="detail__input" placeholder="输入新标题" />
        <el-button type="primary" native-type="submit" :disabled="draft.trim() === ''">
          保存
        </el-button>
      </form>
    </el-card>
    <el-empty v-else description="找不到这个任务" />
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

.detail__input {
  flex: 1;
}
</style>
