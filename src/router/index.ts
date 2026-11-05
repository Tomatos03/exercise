import { createRouter, createWebHistory } from 'vue-router'
import TodoView from '../views/TodoView.vue'

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
export default router
