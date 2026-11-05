<script setup lang="ts">
import { provide } from 'vue'
import AppShell from './components/AppShell.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { confirmKey } from '@/composables/useConfirm'
import { useConfirmService } from '@/composables/useConfirmService'

const { dialogOpen, current, confirm, answer } = useConfirmService()

provide(confirmKey, confirm)
</script>

<template>
  <AppShell>
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </AppShell>

  <ConfirmDialog
    v-model="dialogOpen"
    :message="current?.message ?? ''"
    :confirm-text="current?.confirmText"
    @confirm="answer(true)"
    @cancel="answer(false)"
  />
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
