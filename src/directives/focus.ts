import type { Directive } from 'vue'

/** Element Plus 的 el-input 根节点是 div，真正能聚焦的是内部 input */
function focusTarget(el: HTMLElement): HTMLElement | null {
  if (el.matches('input, textarea')) return el
  return el.querySelector<HTMLElement>('input, textarea')
}

export const vFocus: Directive<HTMLElement, boolean | undefined> = {
  mounted(el, binding) {
    if (binding.value === false) return
    focusTarget(el)?.focus()
  },
  updated(el, binding) {
    if (binding.value === true && binding.oldValue === false) {
      focusTarget(el)?.focus()
    }
    if (binding.value === false) {
      focusTarget(el)?.blur()
    }
  },
}
