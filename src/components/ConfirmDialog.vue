<script setup lang="ts">
const open = defineModel<boolean>({ required: true })

defineProps<{
  message: string
  confirmText?: string
}>()

const emit = defineEmits<{ confirm: []; cancel: [] }>()

function cancel() {
  open.value = false
  emit('cancel')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="mask" @click.self="cancel">
        <div class="dialog" role="dialog" aria-modal="true">
          <p class="dialog__message">{{ message }}</p>
          <div class="dialog__actions">
            <el-button @click="cancel">取消</el-button>
            <el-button class="dialog__confirm" type="primary" @click="emit('confirm')">
              {{ confirmText ?? '确定' }}
            </el-button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(0 0 0 / 40%);
}

.dialog {
  width: min(360px, calc(100vw - 32px));
  padding: var(--space-4);
  background-color: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: 0 8px 24px rgb(0 0 0 / 20%);
}

.dialog__message {
  margin: 0 0 var(--space-4);
}

.dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.dialog__actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
