import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

function readSavedTheme(): Theme | null {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'dark' || saved === 'light' ? saved : null
}

function getSystemTheme(): Theme {
  // jsdom / SSR 等环境没有 matchMedia，降级到亮色
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const theme = ref<Theme>(readSavedTheme() ?? getSystemTheme())

watch(
  theme,
  (value) => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.theme = value
    document.documentElement.classList.toggle('dark', value === 'dark')
  },
  { immediate: true },
)

export function useTheme() {
  function toggle() {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
    theme.value = next
    localStorage.setItem(STORAGE_KEY, next)
  }
  return { theme, toggle }
}

// 系统主题变了，只有"用户没手动选过"才跟随
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', (event) => {
    if (readSavedTheme() !== null) return
    theme.value = event.matches ? 'dark' : 'light'
  })
}
