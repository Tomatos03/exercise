<script setup lang="ts">
import { provide, ref } from 'vue'
import AppShell from './components/AppShell.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { confirmKey } from '@/composables/useConfirm'

const dialogOpen = ref(false)
const message = ref('')
const confirmText = ref('确定')

let resolver: ((ok: boolean) => void) | null = null

function confirmFn(text: string, okText = '确定'): Promise<boolean> {
  message.value = text
  confirmText.value = okText
  dialogOpen.value = true

  return new Promise<boolean>((resolve) => {
    resolver = resolve
  })
}

function answer(ok: boolean) {
  dialogOpen.value = false
  resolver?.(ok)
  resolver = null
}

provide(confirmKey, confirmFn)
</script>

<template>
  <AppShell>
    <RouterView />
  </AppShell>

  <ConfirmDialog
    v-model="dialogOpen"
    :message="message"
    :confirm-text="confirmText"
    @confirm="answer(true)"
    @cancel="answer(false)"
  />
</template>
