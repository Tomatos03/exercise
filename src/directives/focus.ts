import type { Directive } from 'vue'

export const vFocus: Directive<HTMLElement, boolean | undefined> = {
  mounted(el, binding) {
    if (binding.value === false) return
    el.focus()
  },
  updated(el, binding) {
    if (binding.value === true && binding.oldValue === false) {
      el.focus()
    }
    if (binding.value === false) {
      el.blur()
    }
  }
}
