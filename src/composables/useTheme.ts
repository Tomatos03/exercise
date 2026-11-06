import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

function readSavedTheme(): Theme | null {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'dark' || saved === 'light' ? saved : null
}

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const theme = ref<Theme>(readSavedTheme() ?? getSystemTheme())

watch(
  theme,
  (value) => {
    document.documentElement.dataset.theme = value
    localStorage.setItem(STORAGE_KEY, value)
  },
  { immediate: true },
)

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggle }
}
