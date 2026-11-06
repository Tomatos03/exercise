import { createApp } from 'vue'
import { createPinia } from 'pinia'

import AppRoot from './AppRoot.vue'
import router from './router'
// Element Plus 组件由 unplugin-vue-components 按需引入；
// 这里只补暗色模式的全局变量。
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/main.css'

const app = createApp(AppRoot)

app.use(createPinia())
app.use(router)

app.mount('#app')
