<script setup lang="ts">
const value = defineModel<string>({ required: true })

const emit = defineEmits<{ submit: [] }>()
</script>

 <template>
   <form class="task-form" @submit.prevent="emit('submit')">
  <!-- <form class="task-form"> -->
    <input v-model="value" placeholder="输入任务内容" />
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
