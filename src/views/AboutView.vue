<script setup lang="ts">
const stack = ['Vue 3 + TypeScript', 'Vue Router 多页面', 'Pinia 共享状态', 'Element Plus 组件库']
</script>

<template>
  <section class="about">
    <el-card shadow="never">
      <template #header>
        <h1>关于</h1>
      </template>

      <p>这是我学习 Vue 的第一个多页面应用，从一张卡片开始，慢慢长成了现在的样子。</p>

      <el-space wrap>
        <el-tag v-for="item in stack" :key="item" type="info">{{ item }}</el-tag>
      </el-space>
    </el-card>
  </section>
</template>

<style scoped>
.about h1 {
  margin: 0;
  font-size: 1.5rem;
}

.about p {
  margin: 0 0 var(--space-4);
  color: var(--color-muted);
}
</style>
