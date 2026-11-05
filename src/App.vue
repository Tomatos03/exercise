<script setup lang="ts">
import { provide, ref } from 'vue'
import AppShell from './components/AppShell.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { confirmKey } from '@/composables/useConfirm'

interface ConfirmRequest {
  message: string
  confirmText: string
  resolve: (ok: boolean) => void
}

const current = ref<ConfirmRequest | null>(null)
const queue: ConfirmRequest[] = []
const dialogOpen = ref(false)

function showNext() {
  if (dialogOpen.value) return

  const next = queue.shift()
  if (!next) return

  current.value = next
  dialogOpen.value = true
}

function confirmFn(text: string, okText = '确定'): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    queue.push({ message: text, confirmText: okText, resolve })
    showNext()
  })
}

function answer(ok: boolean) {
  const req = current.value
  current.value = null
  dialogOpen.value = false

  req?.resolve(ok)
  showNext()
}

provide(confirmKey, confirmFn)
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
