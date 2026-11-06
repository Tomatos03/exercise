<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <el-result icon="warning" title="404" sub-title="这个页面不存在，可能是链接写错了。">
    <template #extra>
      <el-button type="primary" @click="router.push('/')">回到待办页</el-button>
    </template>
  </el-result>
</template>
