# Vue 学习路线与进度

> 更新时间：2026-11-04
> 项目：`/home/tomato0v0/Projects/VueProjects/exercise`
> 技术栈：Vue 3.5 + TypeScript + Vite + Vue Router + Pinia（pnpm 管理）
> 启动命令：`pnpm dev`（默认 http://localhost:5173）

## 学习方式约定

- **一次只推进一个小步骤**，用户明确表示"继续 / 明白"后才进入下一步。
- 每个小步骤包含：目的 → 具体改动 → 一个验证问题。
- 用户是前端新手：先看现象、再看概念，避免一次抛出多个新概念。
- 出现报错时，先读文件 / 看诊断定位原因，讲清"为什么会发生"，再给修改方案。

## 总目标

从简单 demo 逐步长成一个复杂的 Vue 项目。默认方向：**任务管理系统**（待办页 → 统计页 → 详情页 → 搜索 → 持久化 → 异步数据）。

## 已完成

### 第 1 步 · 单文件组件基础

- 一个 `.vue` 文件 = `script`（逻辑）+ `template`（结构）+ `style`（样式）
- `App.vue` 是根组件；`index.html` → `main.ts` → `App.vue`
- 插值 `{{ }}`：把表达式**算出的结果**当文字显示
- `ref` 让数据变化时页面自动更新；**脚本里写 `.value`，模板里自动解包（读写都不用写）**
- 普通变量不会触发重新渲染（做过"点了没反应"的实验）
- `@click` 事件绑定；内联逻辑 vs 抽成函数

### 第 2 步 · 组件化与 props

- 拆分出 `src/components/HelloCard.vue`，组件可复用
- `defineProps<Interface>()` 声明外部参数；`title="字面量"` vs `:title="表达式"`
- `v-for` 渲染列表，`(item, index)` 取下标，`:key` 必须唯一
- `v-model` 双向绑定（变量 ↔ 输入框）
- 数组 `push` 新增；`cards.value = []` 整体替换也会触发更新
- `v-if` 条件渲染

### 第 3 步 · 子组件向父组件通信

- `const emit = defineEmits<{ remove: [] }>()`（返回值必须接住）
- 子组件只"喊一声"，父组件决定改什么数据
- `splice(index, 1)` 删除；`@remove="removeCard(index)"`
- `:disabled="表达式"` 控制按钮能否点击
- 教训：`defineProps` 只在需要脚本内访问时才接返回值

### 第 4 步 · 对象数据与状态

- 数据结构升级为 `{ id, title, done }`，`:key` 改用 `item.id`（标题可能重复）
- 三元表达式 `done ? '已完成' : '未完成'`
- `:class="{ done }"` 对象语法 + `scoped` 样式
- 子组件不能直接改 props，只能 `emit('toggle')` 通知父组件
- 遇到 `noUncheckedIndexedAccess: true` 导致的 `Object is possibly 'undefined'`：
  先取出 `const card = arr[i]`，再 `if (!card) return`（越界访问只返回 `undefined`，不会抛错）

### 第 5 步 · 计算属性与筛选

- `computed` 派生数据：源数据变 → 自动重算（`total` / `finished` / `visibleCards`）
- **`push` / `splice` 原地修改；`filter` / `map` 返回新数组，必须自己赋值**
- 按 `id` 定位代替 `index` 定位（`find` / `filter`），避免列表变化后删错
- `type Filter = 'all' | 'active' | 'done'` 限定取值范围
- 原始数据 vs 派生数据：筛选不修改原始数据，只影响显示

### 第 6 步 · 路由与多页面

- `App.vue` 变成外壳，页面放进 `src/views/`
- `router/index.ts` 配置 `path` / `name` / `component`
- `<RouterView />` 是占位口，`<RouterLink>` 切换不整页刷新
- `component: () => import(...)` 懒加载，按需下载页面代码

### 第 7 步 · Pinia 共享状态

- 已创建 `src/stores/tasks.ts`（setup store 写法：`defineStore('tasks', () => { ... return {...} })`）
- store 全应用只有一份，任何页面读到的都是同一份 `cards`
- `TodoView.vue` 已改为使用 `store.cards` / `store.addCard` 等，页面功能与之前一致
- `StatsView.vue` 直接读 `store.total` / `store.finished`，与待办页数字始终一致（已验证）
- **故意留在页面里的**：`filter`、`visibleCards`（属于"页面怎么显示"，不是"系统里的数据"）

### 第 8 步 · 动态路由与详情页

- `path: '/tasks/:id'` 定义带参数的地址，`:id` 是变量名
- `useRoute()` 在页面里读 `route.params.id`，**参数永远是字符串**
- 用 `Number()` 转换后再和数字 id 比较（`'1' === 1` 不成立）
- 卡片标题用 `<RouterLink :to="'/tasks/' + id">` 跳转，`HelloCard` 因此新增 `id` prop
- 详情页用 `computed` 从 store 里 `find` 对应任务：组件在 `/tasks/1 → /tasks/2` 时会被复用，普通变量不会更新
- `v-if="task"` / `v-else` 处理"找不到任务"的情况

### 第 9 步 · 搜索

- `keyword` 配合 `v-model`，在 `computed` 里"一层层筛"：先按筛选条件，再按关键词
- 原始数据不动，只影响 `visibleCards`

### 第 10 步 · 本地持久化

- `localStorage` 只能存字符串，用 `JSON.stringify` / `JSON.parse` 存取
- `watch(cards, ..., { deep: true })`：`push` / `item.done = x` 属于内部修改，不开 deep 监听不到
- 判断标准：**整体替换**不用 deep；**原地修改**必须 deep
- `deep` 有遍历成本，能用整体替换就不深层修改

### 第 11 步 · 异步数据

- `async` 函数返回 Promise；`await` 只能写在 `async` 函数里（`<script setup>` 顶层除外）
- `Promise` 执行器：构造时同步执行，必须调用 `resolve` / `reject` 之一，只认第一次
- `fetch` 返回 `Promise<Response>`，`response.json()` 也是异步的；`response.ok` 要自己判断
- `loading` / `error` 状态 + `try` / `catch` / `finally`（`finally` 负责收尾 loading）
- `e` 是 `unknown`，用 `e instanceof Error` 收窄后才能读 `.message`
- `map` 做字段转换（服务器 `completed` → 自己的 `done`）
- `(item) => ({ ... })` 的圆括号：不加的话 `{` 会被当成函数体

### 第 12 步 · 编辑任务

- store 新增 `renameCard(id, title)`；详情页用本地 `draft` 做草稿，不直接改 store
- `watch(task, cb, { immediate: true })`：建立监听时先执行一次，用于"进入页面就把当前值填进草稿"
- `??` 空值合并 + `?.` 可选链

### 第 13 步 · 布局组件与插槽

- `<slot />`：组件内部留的"坑位"，使用方写在标签中间的内容会填进去
- `AppShell` 负责外壳（导航 + 内容区），`App.vue` 只负责把 `<RouterView>` 塞进坑里
- `RouterView` / `RouterLink` 由 vue-router 全局注册，**不需要 import**
- 命名约定：PascalCase、至少两个单词、领域前缀（`App*` / `Base*` / `The*`）、子组件用父组件名做前缀
- 按命名约定把 `HelloCard.vue` 改名为 `TaskCard.vue`

### 第 14 步 · 样式组织与 UI 整理

- 样式分三层：**全局基础**（`src/assets/main.css`，reset + CSS 变量）→ **布局**（`AppShell`）→ **组件**（各自 `scoped`）
- `scoped` 原理：编译时给元素加唯一属性（`data-v-xxx`）并改写选择器
  - 父组件的 `scoped` 能影响子组件**根元素**，进不到内部
  - **插槽内容属于使用方的作用域**，不是组件自己的
- CSS 变量当"设计令牌"：`--color-primary`、`--space-3`、`--radius`，换主题只改一处
- 命名：BEM 风格 `.task-card__title`，语义化，不写深选择器
- `.router-link-active` 由 vue-router 自动加到当前路由的链接上
- `@submit.prevent`：回车提交 + 阻止表单默认刷新
- 判断"要不要提到全局"：这段样式会被两个以上不相关组件用到吗

### 第 15 步 · 表单提交与事件修饰符

- `@submit.prevent` = 监听 `submit` + 自动调用 `event.preventDefault()`
- 表单默认行为是刷新/跳转页面，用 JS 接管逻辑前必须先拦下
- 用 `<form>` 的理由：输入框回车自动触发 submit、`type="submit"` 按钮也能触发、少写 `@click`
- 常见修饰符：`.prevent` / `.stop` / `.self` / `.once` / `.passive`、按键修饰符 `.enter`

### 第 16 步 · 组件的 `v-model` 与表单组件

- 组件上的 `v-model` 本质：`:model-value` + `@update:model-value`
- 从 `TaskForm` 抽出了表单，`TodoView` 用 `<TaskForm v-model="content" @submit="addCard" />`
- `defineModel<string>({ required: true })` 展开后 = `defineProps` + `defineEmits` + 一个可读可写的 `computed`
- 变量名随便取；固定的是 prop 名（默认 `modelValue`，事件 `update:modelValue`）
- 自定义名字：`defineModel<string>('title')` → 父组件写 `v-model:title="x"`
- **一个 `defineModel` 只对应一个 `v-model`**，多个双向绑定就写多个
- `required: true` 让"父组件忘了传"提前暴露；可选时用 `default`

### 第 17 步 · 单元测试

- 三件套：**Vitest**（框架）+ **@vue/test-utils**（`mount`）+ **jsdom**（模拟浏览器 DOM）
- `pnpm test:unit --run`：只跑一次；不加 `--run` 会进入监听模式
- `mount` **不会执行 `main.ts`**，所以要用 `global.plugins: [createPinia(), router]` 手动装插件
- 测试用 `createMemoryHistory` + 假路由组件；假路由表要写齐，否则 `RouterLink` 生成 href 时会告警
- store 测试：`beforeEach` 里 `localStorage.clear()` + `setActivePinia(createPinia())`，保证用例互不干扰
- **测试抓到真实 bug**：`id: Date.now()` 同毫秒会重复 → 改为"当前最大 id + 1"
- 断言技巧：`toHaveLength`、`toBe`、`new Set(ids).size === ids.length` 判重
- `arr[i]` 后写 `if (!item) throw new Error(...)`，不用 `!` 硬断言

### 第 18 步 · 抽取 composable

- composable = 普通函数，内部用 `ref` / `computed`，**每调用一次就得到一套独立状态**
- 新建 `src/composables/useFilteredTasks.ts`：收 `filter` / `keyword` / `visibleCards`
- 参数用 **getter `() => Card[]`**，不用数组：
  - `cards.value = 新数组` 是"换了指向"，不是"改旧数组"；传数组会变成旧快照
  - 函数是"现取"，数组是"快照"
- `const { filter, keyword, visibleCards } = useFilteredTasks(() => store.cards)`
- 澄清：从 **reactive 对象**解构会丢响应性；从 **ref** 解构不会

### 第 19 步 · composable 的单测

- 新建 `src/__tests__/useFilteredTasks.spec.ts`，5 个用例
- 断言 API：`toHaveLength`、`toEqual`（深比较，数组/对象用）、`toBe`（严格相等）
- `makeCards()` 工厂：每个用例拿一份全新数据，避免用例间共享状态
- 用例里读 `ref` / `computed` 必须写 `.value`
- 最后一个用例专门验证 getter 设计：`cards.value = []` 后 `visibleCards` 立即变空

### 第 20 步 · 组件测试

- 新建 `src/__tests__/TaskCard.spec.ts`，5 个用例：渲染、链接 href、`done` 类、两个 emit
- `mount(Comp, { props, global: { plugins: [router] } })`：`RouterLink` 需要 router
- 挂载前 `router.push(...)` + `await router.isReady()`，否则报 `No match found for location with path ""`
- `wrapper.text()` / `get(sel)` / `classes()` / `attributes('href')`
- `await trigger('click')`：必须 await，Vue 更新是异步的
- `wrapper.emitted('remove')` 断言事件被触发
- `get` 找不到会抛错（适合断言"必须存在"），`find` 返回空 wrapper

### 第 21 步 · 构建与预览

- `pnpm build` = `run-p` **并行**跑 `vue-tsc --build`（只做类型检查）与 `vite build`（打包）
- 产物在 `dist/`：`index.html` + `assets/`（带内容哈希）+ `public/` 里的文件原样复制到根目录
- 懒加载页面各自生成独立 chunk；首页 `TodoView` 是静态导入，所以进了主包
- 看体积看 **gzip** 那一列（104 kB → 41 kB）
- `dev` vs `preview`：源码按需转译 vs 静态产物；HMR vs 重新 build；`import.meta.env.DEV/PROD` 不同；生产构建剔除 Vue 警告并压缩
- **本项目两者体验一致**，因为没有环境敏感代码；但类型检查只在 `build` 跑
- `dist` 在 `.gitignore`；history 模式部署需要服务器回退到 `index.html`

### 第 22 步 · 命名统一与清理

- `Card` 类型改名为 `Task`，与 `TaskCard` / `tasks` store 对齐
- 顺手删掉遗留的 `console.log(responseJson)`

### 第 23 步 · 数据层分层

- 三件事分开：网络请求（`api/`）、状态与业务（`stores/`）、显示（组件）
- 新建 `src/types.ts`：领域类型 `Task`，让 `api` 不必反过来依赖 `store`
- 新建 `src/api/tasks.ts`：`fetchTasks()` 负责 URL、`response.ok`、字段映射（`completed` → `done`）
- `stores/tasks.ts` 的 `loadTasks` 只剩 `loading` / `error` / `cards.value = await fetchTasks()`
- 边界：`api` 只负责"拿到数据或抛错"；`loading` / `error` 属于界面状态，留在 store
- 分层的收益是"把易变部分集中"，不是消灭调用

### 第 24 步 · 路由守卫

- 守卫返回值：`true`/不返回 = 放行；`false` = 取消导航；路由地址 = 重定向
- 详情页用 `onBeforeRouteLeave` 做"未保存离开确认"：
  `if (!isDirty) return true`，否则 `return window.confirm(...)`
- `isDirty = computed(() => draft.value !== (task.value?.title ?? ''))`，保存后自然相等
- `window.confirm()` 同步阻塞，确定返 `true`、取消/Esc 返 `false`；样式不可定制
- 守卫分类：全局 `beforeEach` / 路由 `beforeEnter` / 组件 `onBeforeRouteLeave` / `onBeforeRouteUpdate`
- 坑：`onBeforeRouteLeave` 在同路由参数变化时不触发
- 坑：测预览时看到旧行为 → 4173 端口是旧 `dist`，必须重新 build 或用 5173 dev

### 第 25 步 · 404 兜底路由

- `{ path: '/:pathMatch(.*)*', name: 'not-found' }`
- `:param(regex)` 的括号是"该参数的正则约束"，里面写正则源码（不写 `/.../`）
- 末尾 `*` 是**路由的重复修饰符**：0 段或多段；`+` 至少一段；`?` 可有可无
- `(.*)` 管"每段里能写什么"，`*` 管"有几段"；带修饰符的参数值是**数组**
- 字符串里写正则要双反斜杠：`'/tasks/:id(\\d+)'`
- 路由匹配是"整段锚定"，比普通 `regex.test` 严格
- "路由不存在"（404 页）与"路由存在但数据不存在"（页面空状态）是两回事

### 第 26 步 · 自定义弹窗（Teleport + Transition）

- `<Teleport to="body">`：把 DOM 搬到 `body` 下，绕开父级 `overflow` / `transform` / `z-index` 限制；**scoped 样式仍生效**（`data-v` 属性没变）
- `<Transition name="fade">`：靠 `v-if` 切换触发；只包一个元素（多个用 `TransitionGroup`）；`name` 只决定 class 前缀，**没有内置动画**，CSS 要自己写
- 类名规律：`*-enter-from` 是看不见的起点，`*-enter-active` 放 `transition` 属性
- 嵌套顺序：**Teleport 在外、Transition 在内**更稳；`v-if` 必须放在 Transition 的直接子元素上
- `@click.self`：只有点遮罩本身才触发，点对话框内部不冒泡触发
- `ConfirmDialog`：`defineModel` 控制显隐 + `confirm` / `cancel` 两个事件
- 异步守卫：`onBeforeRouteLeave` 可返回 Promise；用 `new Promise` 把"未来的点击"变成可 await 的值
  - 忘了调用 `resolve` → 导航永远挂起（所以遮罩关闭也要 resolve(false)）
  - 回调不是 `async` 时不能 `await`，直接 `return askLeave()` 即可
- 坑：忘了 `import ConfirmDialog` 时，`vue-tsc` 不报错（没开 `strictTemplates`），只在运行时警告 `Failed to resolve component`

### 第 27 步 · 环境变量

- `.env` 里写 `VITE_API_BASE_URL`，`api/tasks.ts` 用 `import.meta.env.VITE_API_BASE_URL` 拼地址
- **只有 `VITE_` 前缀才会暴露给前端代码**；构建时**静态替换**，改完必须重启 dev / 重新 build
- 前端环境变量永远不是秘密（会进 `dist/assets/*.js`），密钥必须放后端
- `.env` 入库；`.env.local` 被 `.gitignore` 的 `*.local` 排除；优先级 `.env` < `.env.local` < `.env.[mode]` < `.env.[mode].local`
- `env.d.ts` 补 `interface ImportMetaEnv`；`.d.ts` = 只声明、不产出 JS
- 坑：`.d.ts` 里一旦出现 `import`/`export` 就变成模块，全局声明失效（需 `declare global`）

### 第 28 步 · 列表动画 `TransitionGroup`

- `<Transition>` 只能包一个元素；列表用 `<TransitionGroup tag="div" name="list">`
- `:key` 是硬性要求：靠它判断"新增 / 移除 / 移动"
- 比 Transition 多一个 `*-move` 类名，专门做"重排滑动"
- 常用三件套：
  - `enter` / `leave` 用 `opacity` + `transform`
  - `.list-leave-active { position: absolute; width: 100% }` 让离场卡片脱流，剩余卡片才平滑移动（容器需 `position: relative`）
- `scoped` 样式能命中子组件的**根元素**（父组件的 scope id 会加到子组件根节点）

### 第 29 步 · 开启 `strictTemplates`

- `tsconfig.app.json` **顶层**（不在 `compilerOptions` 里）加 `"vueCompilerOptions": { "strictTemplates": true }`
- 效果：模板里的组件名拼错、忘 `import`、props / 事件类型不对，`pnpm type-check` 直接报错
- 开启后本项目无新增错误，验证了现有模板写法是干净的

### 第 30 步 · 清理死代码

- `TodoView.vue` 删掉 `.todo__form` / `.todo__form input`（表单已抽到 `TaskForm`）
- `AGENTS.md` 删掉已不存在的 `stores/counter.ts` 说明，并更新 `App.vue` / `main.ts` 的职责描述
- 检查结论：`main.css` 的 CSS 变量均在被使用；其余组件 `scoped` 样式都有对应元素

### 第 31 步 · 抽离存储层

- 新建 `src/storage/tasks.ts`：`loadTasksFromStorage()` / `saveTasksToStorage()`
- 默认种子数据用**函数** `createDefaultTasks()` 返回，不能用共享常量（否则 `push` 会污染默认值）
- `stores/tasks.ts` 里不再出现 `localStorage` / `STORAGE_KEY` / `JSON`
- 三层职责：storage（存哪）→ store（怎么变）→ 组件（怎么显示）
- 以后换 IndexedDB 或后端同步，只改 `storage/tasks.ts`

### 第 32 步 · 存储层测试

- 新建 `src/__tests__/storage.spec.ts`，4 个用例：默认值、写入后读回、数据损坏回退、每次返回独立数组
- `beforeEach` 里 `localStorage.clear()`，用例之间不串数据
- 用 `toEqual` 比较对象数组；取下标后写 `?.`
- 最后一条用例反过来证明"默认值用函数而不是常量"是必要的

### 第 33 步 · 用 provide/inject 抽离确认服务

- 新建 `src/composables/useConfirm.ts`：`export const confirmKey: InjectionKey<ConfirmFn> = Symbol('confirm')`
- **没有注册表**，靠 key 的引用相等匹配；所以 key 必须定义在一处、双方都 import
- `App.vue` 持有 `dialogOpen` / `message` / `resolver`，`provide(confirmKey, confirmFn)`，并只渲染一次 `<ConfirmDialog>`
- **插槽内容属于父组件作用域**：provide 必须放在真正的共同祖先（`App.vue`），放 `AppShell` 里拿不到
- 使用方：`const confirm = inject(confirmKey)`，类型是 `ConfirmFn | undefined`，要判空
- `TodoView` 的 `handleClear` 与 `TaskDetailView` 的离开守卫都改成 `await confirm(...)`
- 已知缺陷：`resolver` 只有一个，并发调用会覆盖（第一个 await 永不结束）

## 当前项目结构

```
src/
├── App.vue                  # 只负责用 <AppShell> 包住 <RouterView />
├── main.ts                  # createApp + Pinia + Router + 全局样式
├── assets/main.css          # 全局基础层：reset + CSS 变量 + 基础排版
├── router/index.ts          # /、/about、/stats、/tasks/:id
├── api/tasks.ts             # fetchTasks：URL + HTTP 判断 + 字段映射
├── storage/tasks.ts         # localStorage 读写 + 默认种子数据
├── types.ts                 # 领域类型 Task
├── composables/
│   ├── useFilteredTasks.ts  # 筛选 + 搜索逻辑（getCards 用 getter 传入）
│   └── useConfirm.ts        # 确认服务：InjectionKey + ConfirmFn 类型
├── stores/
│   ├── counter.ts           # 脚手架自带，未使用
│   └── tasks.ts             # 任务数据仓库（cards / total / finished / 增删改）
├── views/
│   ├── TodoView.vue         # 待办页（列表 + 添加 + 筛选）
│   ├── AboutView.vue        # 关于页（占位）
│   ├── StatsView.vue        # 统计页
│   ├── TaskDetailView.vue   # 任务详情页（按 id 从 store 找任务 + 离开守卫）
│   └── NotFoundView.vue     # 404 兜底页
├── components/
│   ├── AppShell.vue         # 应用外壳：导航 + <slot />
│   ├── TaskCard.vue         # 单张任务卡片（props: id / title / index / done；emits: remove / toggle）
│   └── TaskForm.vue         # 添加任务表单（defineModel 双向绑定 + submit 事件）
└── __tests__/
    ├── App.spec.ts              # App 外壳渲染（需手动注入 pinia + router）
    ├── tasks.spec.ts            # store 增删改查与派生数据
    ├── useFilteredTasks.spec.ts # composable 筛选/搜索逻辑
    ├── storage.spec.ts          # localStorage 读写与容错
    └── TaskCard.spec.ts         # 组件渲染 + emit 契约
```

## 下一步

1. 更多 Vue 能力：`provide`/`inject`、`Suspense`、自定义指令
2. 进阶工程化：打包体积分析、CI、ESLint 规则收紧
3. 真实数据持久化：把 localStorage 抽成独立存储层（或换 IndexedDB）

## 踩过的坑（备忘）

- `cards.value.filter(...)` 不赋值 = 什么都没做
- trigger：`content.value.title = ''` 是错的，应为 `content.value = ''`
- `ref()` 不写初始值会变成 `any`，类型保护失效，建议 `ref('')`
- 不要解构 store（`const { cards } = store` 会丢响应性），要写 `store.cards`
- 模板里 `:title="x"` 传表达式，`title="x"` 传字面字符串
- 路由参数 `route.params.id` 是字符串，和数字 id 比较前要 `Number()`
- 同一个组件被复用时（如 `/tasks/1` → `/tasks/2`），普通变量不会更新，要用 `computed`
- 项目风格：prettier 无分号、单引号
