<script setup lang="ts">
import { useTaskStore } from '../stores/tasks'

const store = useTaskStore()

function handlePageChange(page: number) {
  store.loadTasks(page)
}

function toggleDone(id: number) {
  store.toggleCard(id)
}
</script>

<template>
  <section class="table-view">
    <div class="table-view__header">
      <div>
        <h1>表格视图</h1>
        <p class="table-view__hint">Element Plus 试点：table + pagination + tag + button</p>
      </div>
      <el-button :loading="store.loading" @click="store.loadTasks()">刷新</el-button>
    </div>

    <el-alert v-if="store.error" :title="store.error" type="error" :closable="false" show-icon />

    <el-table
      v-loading="store.loading"
      :data="store.cards"
      row-key="id"
      stripe
      empty-text="暂无任务"
    >
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="任务" min-width="180" />
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="row.done ? 'success' : 'info'">
            {{ row.done ? '已完成' : '未完成' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="130">
        <template #default="{ row }">
          <el-button
            size="small"
            :type="row.done ? 'warning' : 'primary'"
            link
            @click="toggleDone(Number(row.id))"
          >
            {{ row.done ? '取消完成' : '标记完成' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-view__footer">
      <el-pagination
        v-if="store.serverTotal > 0"
        background
        layout="total, prev, pager, next"
        :total="store.serverTotal"
        :page-size="store.pageSize"
        :current-page="store.page"
        @current-change="handlePageChange"
      />
    </div>
  </section>
</template>

<style scoped>
.table-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.table-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.table-view__header h1 {
  margin: 0;
}

.table-view__hint {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.table-view__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  color: var(--color-muted);
  font-size: 0.875rem;
}
</style>
