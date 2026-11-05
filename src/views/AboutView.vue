<template>
  <section class="about">
    <h1>关于</h1>
    <p>这是我学习 Vue 的第一个多页面应用，从一张卡片开始，慢慢长成了现在的样子。</p>
    <ul class="about__list">
      <li>Vue 3 + TypeScript</li>
      <li>Vue Router 多页面</li>
      <li>Pinia 共享状态</li>
      <li>localStorage 持久化</li>
    </ul>
  </section>
</template>

<style scoped>
.about h1 {
  margin: 0 0 var(--space-4);
}

.about p {
  color: var(--color-muted);
}

.about__list {
  margin: 0;
  padding-left: var(--space-6);
  color: var(--color-text);
}

.about__list li {
  margin-bottom: var(--space-1);
}
</style>
