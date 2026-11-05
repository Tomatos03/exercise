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
    <RouterView />
  </AppShell>

  <ConfirmDialog
    v-model="dialogOpen"
    :message="current?.message ?? ''"
    :confirm-text="current?.confirmText"
    @confirm="answer(true)"
    @cancel="answer(false)"
  />
</template>
