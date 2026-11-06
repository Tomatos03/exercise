<script setup lang="ts">
import { ref } from 'vue';

const value = defineModel<string>({ required: true })
const emit = defineEmits<{ submit: [] }>()
const inputRef = ref<HTMLInputElement | null>(null)

function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

 <template>
   <form class="task-form" @submit.prevent="emit('submit')">
    <input ref="inputRef" v-model="value" placeholder="输入任务内容（按 n 聚焦）" />
    <button type="submit" :disabled="value.trim() === ''">添加</button>
  </form>
</template>

<style scoped>
.task-form {
  display: flex;
  gap: var(--space-2);
}

.task-form input {
  flex: 1;
}
</style>
