import { ref } from 'vue'

interface ConfirmRequest {
  message: string
  confirmText: string
  resolve: (ok: boolean) => void
}

export function useConfirmService() {
  const dialogOpen = ref(false)
  const current = ref<ConfirmRequest | null>(null)
  const queue: ConfirmRequest[] = []

  function showNext() {
    if (dialogOpen.value) return

    const next = queue.shift()
    if (!next) return

    current.value = next
    dialogOpen.value = true
  }

  function confirm(text: string, okText = '确定'): Promise<boolean> {
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

  return { dialogOpen, current, confirm, answer }
}
