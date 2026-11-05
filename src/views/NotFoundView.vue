<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="not-found">
    <h1>404</h1>
    <p class="not-found__hint">这个页面不存在，可能是链接写错了。</p>
    <RouterLink to="/">← 回到待办页</RouterLink>
  </section>
</template>

<style scoped>
.not-found h1 {
  font-size: 3rem;
  margin: 0 0 var(--space-2);
  color: var(--color-primary);
}

.not-found__hint {
  color: var(--color-muted);
  margin-bottom: var(--space-4);
}
</style>
