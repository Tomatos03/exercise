import { createRouter, createWebHistory } from 'vue-router'
import TodoView from '../views/TodoView.vue'
import { useTaskStore } from '../stores/tasks'
import { readListQuery } from '../composables/useListQuery'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'todo', component: TodoView },
    { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
    { path: '/stats', name: 'stats', component: () => import('../views/StatsView.vue') },
    {
      path: '/tasks/:id',
      name: 'task-detail',
      component: () => import('../views/TaskDetailView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

// 首次导航时确保数据已加载：所有页面共享同一份列表
router.beforeEach((to) => {
  const store = useTaskStore()
  const target = readListQuery(to.query).page

  // 正在加载就不要重复请求
  if (store.loading) return true
  // 已加载且就在目标页，也不用再请求
  if (store.loaded && store.page === target) return true

  // 故意不 await：导航不阻塞，数据回来后页面会自动更新
  store.loadTasks(target)
  return true
})

export default router
