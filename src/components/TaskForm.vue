<script setup lang="ts">
import { ref } from 'vue'
import type { InputInstance } from 'element-plus'

const value = defineModel<string>({ required: true })
const emit = defineEmits<{ submit: [] }>()
const inputRef = ref<InputInstance | null>(null)

function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <form class="task-form" @submit.prevent="emit('submit')">
    <el-input
      ref="inputRef"
      v-model="value"
      class="task-form__input"
      placeholder="输入任务内容（按 n 聚焦）"
      clearable
    />
    <el-button type="primary" native-type="submit" :disabled="value.trim() === ''">
      添加
    </el-button>
  </form>
</template>

<style scoped>
.task-form {
  display: flex;
  gap: var(--space-2);
}

.task-form__input {
  flex: 1;
}
</style>
