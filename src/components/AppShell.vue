<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { theme, toggle } = useTheme()
</script>

<template>
  <div class="shell">
    <nav class="nav">
      <RouterLink to="/">待办</RouterLink>
      <RouterLink to="/table">表格</RouterLink>
      <RouterLink to="/about">关于</RouterLink>
      <RouterLink to="/stats">统计</RouterLink>
      <button class="nav__theme" @click="toggle">
        {{ theme === 'dark' ? '☀️' : '🌙' }}
      </button>
    </nav>
    <main class="main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.nav {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-6);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.nav a {
  color: var(--color-text);
  font-weight: 500;
}

.nav a:hover {
  color: var(--color-primary);
  text-decoration: none;
}

.nav a.router-link-active {
  color: var(--color-primary);
}

.main {
  flex: 1;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.nav__theme {
  margin-left: auto;
  border: none;
  background: transparent;
  font-size: 1.1rem;
}
</style>
