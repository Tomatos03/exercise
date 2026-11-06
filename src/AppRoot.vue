<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
</script>

<template>
  <!-- i18n 国际化：Element Plus 内置文案统一走这里 -->
  <el-config-provider :locale="zhCn">
    <App />
  </el-config-provider>
</template>
