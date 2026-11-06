# Vue 学习路线与进度

> 更新时间：2026-11-05
> 项目：`/home/tomato0v0/Projects/VueProjects/exercise`
> 技术栈：Vue 3.5 + TypeScript + Vite + Vue Router + Pinia（pnpm 管理）
> 启动命令：`pnpm dev`（默认 http://localhost:5173）

## 学习方式约定

- **一次只推进一个小步骤**，用户明确表示"继续 / 明白"后才进入下一步。
- 每个小步骤包含：目的 → 具体改动 → 一个验证问题。
- 用户是前端新手：先看现象、再看概念，避免一次抛出多个新概念。
- 出现报错时，先读文件 / 看诊断定位原因，讲清"为什么会发生"，再给修改方案。
- **阶段约定（2026-11-05 起）**：不再新增或修改测试相关代码；功能改动只要求 `pnpm type-check` 通过 + 浏览器手动验证。

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

### 第 34 步 · 修复并发缺陷（队列）

- 缺陷：单槽位 `resolver` 被第二次调用覆盖 → 第一个 `await` 永久 pending，弹窗文字也被覆盖
- 修复：`queue` 先进先出 + `current` 表示正在显示的请求，`showNext()` 只在空闲时取队首
- `new Promise` 的 executor 是**同步立即执行**：登记 resolve + 入队 + `showNext()`；真正结算发生在用户点击时
- `dialogOpen` 只由 `showNext()` / `answer()` 控制，**不要在 `confirmFn` 里手动设 true**
- `queue.shift()` 返回 `T | undefined`，必须判空
- 测试 `src/__tests__/confirm.spec.ts`：用"探针组件 inject"取出服务，再点真实按钮；覆盖 确定/取消/并发排队 三个场景
- 用过变异验证：把队列改回"直接覆盖 current"，并发用例立即失败（弹窗显示“第二次”）

### 第 35 步 · 抽离 `useConfirmService`

- 三层职责：`useConfirm.ts`（key + `ConfirmFn` 类型）→ `useConfirmService.ts`（状态与队列实现）→ `App.vue`（接线）
- composable 只 return 使用方需要的 4 样：`dialogOpen` / `current` / `confirm` / `answer`；`queue`、`showNext` 属于内部实现
- 解构 composable 返回的 ref 是**安全**的（解出来仍是 ref 对象）；与 Pinia store 解构丢响应性不同
- `provide(confirmKey, confirm)` 能否通过取决于签名匹配 `ConfirmFn`，由 `InjectionKey<T>` 把关
- `App.vue` 从 ~58 行降到 ~22 行；现有 `confirm.spec.ts` 不用修改（测的是行为）

### 第 36 步 · 简化确认服务测试

- 重写 `confirm.spec.ts`：直接 `useConfirmService()`，不再挂载 App / 不再用探针组件
- 用例：确认、取消、默认文案、并发排队（各断言 `dialogOpen` / `current` / Promise 结果）
- 耗时从 ~64ms 降到 ~5ms；测试代码减半
- 代价：不再覆盖 `ConfirmDialog` 的 UI 与 `provide` 连线（另开组件测试可补）

### 第 37 步 · 组件测试与 api 层测试

- `ConfirmDialog.spec.ts`（7 个用例）：
  - 多数用例用 `global: { stubs: { teleport: true } }` 把 Teleport 变成本地渲染，`wrapper.find` 才能找到元素
  - 单独一条用例**不 stub**，断言 `document.body.querySelector('.mask')`，验证真的挂到 body，unmount 后消失
  - `@click.self` 的行为：点内部标题不触发、点遮罩触发
  - 组件自身不关闭：点「确定」只 emit `confirm`，不 emit `update:modelValue`
- `api.spec.ts`（5 个用例）：
  - `vi.stubGlobal('fetch', vi.fn(...))` 替换全局 fetch，`afterEach` 里 `vi.unstubAllGlobals()` 恢复
  - 覆盖：请求地址、字段映射（`completed` → `done`、忽略多余字段）、非 2xx 报错、JSON 异常、网络异常
  - `await expect(promise).rejects.toThrow('...')` 测抛错

### 第 38 步 · 搜索防抖与 URL 状态同步

- 防抖：`searchInput`（输入值）与 `keyword`（生效值）分开，`watch` + `setTimeout(300)`，每次先 `clearTimeout`；`onUnmounted` 里清理
- URL 读（三个工具函数）：
  - `readQueryString`：`route.query.q` 可能是 `null` / 数组，非字符串一律当 `''`
  - `parseFilter`：白名单校验，非法值兑底为 `'all'`
  - `readListQuery`：统一入口，返回完整合法的 `ListQuery`
- URL 写：`buildListQuery(state, base)` 合并现有参数（`...base`），默认值写 `undefined`（等于删除该参数）
- 规范化（B4）：用 `router.resolve({ query }).fullPath` 与 `route.fullPath` 比较，**只在地址不干净时** `replace`
- 双向同步（B5）：`watch(() => route.query, ...)` 读回状态；开头的“值相同就 return”用来防回环
- 类型方向：`LocationQuery`（读，`string \| null` 或数组）→ `LocationQueryRaw`（写，允许 `number` / `undefined`）
- 关键认知：**地址栏回车 = 整页重载**（setup 重跑）；页面内改 query 不重载，所以需要 B5
- 防抖放在页面而非 composable：否则 `useFilteredTasks` 的 5 个用例都要引入假定时器

### 第 39 步 · 接入真实（本地）后端

- `pnpm add -D json-server@0.17.4` + `db.json`（7 条 todos）+ `pnpm mock` 脚本；`.env` 指向 `http://localhost:3001`
- json-server 支持 `_page` / `_limit`，并在响应头返回 `X-Total-Count`（已验证），与现有分页代码对得上
- `api/tasks.ts`：抽出 `toTask` / `ensureOk`，新增 `createTask` / `updateTask` / `deleteTask`
- `stores/tasks.ts`：所有操作改为异步调接口；`cards` 初始为空，只代表当前页；错误用 `run()` 统一收口
- `TodoView.vue`：`onMounted` 自动拉取第一页
- **删除 `src/storage/`**（含测试）：localStorage 不再作为数据源
- `tasks.spec.ts` 改为 `vi.mock('../api/tasks')` + `await`，测"store 怎么调接口、怎么更新状态"
- 遗留：直接访问 `/stats` 时 `cards` 为空（数据在待办页才加载）→ 下一步把加载提到 `App.vue` 或路由守卫
- 开发时必须开两个终端：`pnpm mock` + `pnpm dev`

### 第 40 步 · 用路由守卫保证数据已加载

- `stores/tasks.ts` 增加 `loaded`：**仅加载成功后**置 `true`（失败时下次导航可重试）
- `router/index.ts` 增加 `beforeEach`：`loaded || loading` 则直接放行，否则触发 `store.loadTasks()`
- **不 `await`**：导航不阻塞，数据回来后页面自动更新（代价：Stats 可能先显示 0）
- 移除 `TodoView` 的 `onMounted` 加载，避免职责重叠
- 为什么用守卫而非 `App.vue` 的 `onMounted`：
  - 测试不受影响（`App.spec` 用自建 router）
  - 守卫拿得到 `to.query`，为下一步 `?page=` 同步做准备
  - 新增页面自动覆盖
- 为什么用 `loaded` 而不是 `cards.length > 0`：任务被清空后 `cards` 合法为空，否则每次导航都会重复请求

### 第 41 步 · 页码同步到 URL

- 新建 `src/composables/useListQuery.ts`：`readListQuery` / `buildListQuery` / `parsePage` 共享，`TodoView` 与路由守卫共用一套规则
- `parsePage`：`?page=abc` / `0` / 负数 / 小数一律落到 1
- `buildListQuery` 中 `page <= 1` 不写进 URL（默认值不污染地址栏）
- 挂载规范化必须用 `initialQuery.page`，不能用 `store.page`（守卫还在异步加载目标页，否则会抹掉 `?page=3`）
- 写回 watch 监听 `[filter, keyword, () => store.page]`（Pinia 的值不是 ref，要包成 getter），并用 `resolve().fullPath` 比较，避免多余导航
- 守卫改成按 `to.query.page` 加载：`loading` 放行；`loaded` 且同页放行；否则 `loadTasks(target)`
- 翻页按钮不改，仍调 `store.loadTasks`，URL 由 watch 跟随

### 第 42 步 · 页面切换过渡

- `<Transition>` 只能作用于**一个直接子元素**，直接包 `<RouterView />` 无效：换页发生在壳**内部**，壳本身没变，`Transition` 抓不到
- 用作用域插槽把真正的页面组件取出来：`<RouterView v-slot="{ Component }">`
  - `v-slot="{ Component }"` = `v-slot="slotProps"` + ES6 对象解构，插槽对象里还有 `route` 字段
  - 名字 `Component` 是 vue-router 定的；要换名用 `v-slot="{ Component: Page }"`
- `<component :is="Component" />` 动态组件：`is` 决定渲染谁
- `mode="out-in"`：旧页面先离场、新页面再进场；不写则两页交叉重叠淡入淡出
- 动画本身靠 CSS：`fade-enter-active` / `fade-leave-active` / `fade-enter-from` / `fade-leave-to`，前缀来自 `name="fade"`
- `scoped` 能命中页面组件根元素，因为父组件 scoped 样式会作用到子组件根节点

### 第 43 步 · 自定义指令 `v-focus`

- 指令 = 给 DOM 元素"挂行为"的可复用方式；`focus()`、滚动定位、第三方库初始化这类**命令式**操作，用数据表达不出来
- 指令对象共 7 个钩子：`created` / `beforeMount` / `mounted` / `beforeUpdate` / `updated` / `beforeUnmount` / `unmounted`
  - `mounted` 做初始化，`updated` 做同步，`unmounted` 做清理（**成对出现**）
- `<script setup>` 里变量名以 `v` 开头即可直接用：`vFocus` → 模板 `v-focus`，**不需要 `app.directive()` 全局注册**
- `Directive<El, Value, Modifiers, Arg>` 四个泛型，**写在指令对象上、所有钩子共享一份**
  - 钩子参数固定 4 个 `(el, binding, vnode, prevVNode)`，和泛型**不是按位置一一对应**
  - `prevVNode` 类型随钩子变（`mounted` 里是 `null`），不归你声明
- 函数简写 `Directive = (el, binding) => {}` 等价于同时写 `mounted` + `updated`
- 条件聚焦：`binding.value === false` 才跳过，**不要写 `!binding.value`**（`v-focus` 无值时是 `undefined`，也要默认聚焦）
- `binding.oldValue`：上一次变更前的值，`mounted` 里是 `undefined`
- `updated` 每次组件更新都跑，所以只在 `false → true` 跃迁时 `focus()`，否则打字/点筛选都会抢焦点
- 指令只负责 `focus()`，**从不 `blur()`**："关掉开关"不会自己失焦，"打开开关"才补聚焦
- 验证聚焦必须**先失焦**（点标题），因为已聚焦元素再 `focus()` 是空动作；本项目 `input:focus` 边框变主色是最好的肉眼看点

### 第 44 步 · 加载状态（骨架屏）

- 现象：直接打开 `/stats` 先闪一下 `0%`，因为守卫不 `await`，页面先渲染了一次"没数据"的样子
- 根源：`0` 是合法数字，`number` 类型表达不出"还不知道"——**空状态 ≠ 加载状态**
- 三态：`store.loading` → 骨架；否则 → 真实数字（真的 0 才放心显示）
- `v-if` / `v-else` 分两套 DOM（结构与内容本来就不同），而不是 `v-show`（两套都真实创建）
- `v-for="n in 4"` 是数字循环，等价于生成 1~4，适合"复制 n 个同样盒子"
- 骨架尺寸 `width: 60px` + `height: 1.75rem` 对齐真实数字，避免数据回来时布局跳动（CLS）
- `span` 设了 `display: block` 才能生效 `width` / `height`
- `@keyframes` 只写 `50%`，`0%` / `100%` 自动补成原值，形成 1 → 0.35 → 1 的呼吸
- 验证必须限速（DevTools → Slow 3G），本地 mock 太快时骨架一闪而过是正常的

### 第 45 步 · 加载失败状态与骨架屏的时机

- 三态变四态：`loading` → 骨架；`error` → 红字 + 重试；否则 → 数字
- `v-if` / `v-else-if` / `v-else` 是从上到下**命中即停**，`loading` 放最前
- `store.error` 是 `ref('')`，空串是 falsy，直接 `v-else-if="store.error"`
- **`@click="store.loadTasks()"` 括号不能省**：不写就把 `MouseEvent` 当成 `targetPage` 传进去
- 验证错误态必须**刷新页面**：`loaded` 为 true 且同页时守卫直接放行，不会重新请求
- **骨架屏"看不到"的真正原因**：路由组件懒加载与数据请求**并行赛跑**
  - 守卫一调用 `loadTasks` 就发请求，同时浏览器还在下载 `StatsView.vue`
  - 组件渲染出来时数据已经回来，`loading` 已变 `false`，骨架的生命期被吃掉了
- 想胉眼确认：临时在 `fetchTasks` 里 `await new Promise(r => setTimeout(r, 1500))`（验证完删），或 Slow 3G + 第二次刷新（模块已缓存）
- 代码本身不用改：本地 mock + 组件已在缓存时骨架自然更快，这是环境问题而不是 bug

### 第 46 步 · 亮暗主题与系统偏好

- CSS 变量层：`:root[data-theme='dark']` 覆盖同名变量，**组件一行不用改**
- 选择器 `:root[data-theme='dark']`：伪类 + 属性选择器**连写无空格** = 同一元素同时满足；有空格就变成后代选择器
- 优先级 `(0,2,0)` > `(0,1,0)`，**与书写顺序无关**
- CSS 变量会**继承**，所以定义在 `<html>`（`:root`）上就能全站生效
- `color-scheme: dark` 让滚动条、输入框、下拉等**浏览器原生控件**一起变暗
- `document.documentElement.dataset.theme = 'dark'`：`document`（文档）→ `.documentElement`（`<html>`）→ `.dataset`（`data-*` 集合）→ `.theme`；等价于 `setAttribute('data-theme','dark')`
  - 驼峰 ↔ 连字符：`dataset.userId` ↔ `data-user-id`；`<html>` 不是 `document.body`
- **JS 全程不碰颜色**，只改一个字符串；颜色归属 CSS
- `ref` 必须定义在 `useTheme` **函数外**，全应用一份（同 Pinia 单例的道理）
- 用 `null` 表示"用户没选过"：`Theme \| null` 是 `'light' \| 'dark'` 表达不出的第三态
- **`localStorage` 的写入时机 = 用户表过态**：写在 `watch` 里会在首屏偷偷写，从此永远"已选择"；写在 `toggle` 里才对
- `matchMedia('(prefers-color-scheme: dark)')` 返回 `MediaQueryList`：`.matches` + `.addEventListener('change')`
  - 这是**浏览器/系统**推给你的事件，和 `watch` 监听变量完全不同
- 系统偏好变化时先判断 `readSavedTheme() !== null`，**用户选过就不跟随**（人的选择优先于环境）
- 媒体查询 vs JS：媒体查询由渲染引擎在布局阶段处理、不占主线程、首屏即正确；JS 方案要多绕一圈且会闪
- 已验证：/手动切换、刷新记住、首次读系统、系统变化实时跟随、手动选择后不再跟随

### 第 47 步 · 列表排序（服务端排序 + URL 同步）

- 链路：`api`（拼 `_sort`/`_order`）→ `store`（`sort`/`order` + `setSort`）→ 控件 → URL
- **后端字段名与领域模型不一致**：`toTask` 做读方向（`completed → done`），`toRemoteSort` 做写方向（`done → completed`），**两个方向必须成对**
  - 第一版只做了读方向，导致“按状态排序无效果”（服务端根本没有 `done` 字段）
- 拼参数用 `URLSearchParams`：自动处理 `?` / `&` / 编码，不用手拼字符串
- **排序变化必须回第 1 页**：页码的含义变了，还停在第 3 页会莫名其妙
- `loadTasks(page, sort, order)` 成为统一入口，守卫 / `setSort` / 翻页 / 重试全走它
- **类型搬到 `types.ts`**：凡是跨两个以上层使用的类型，就不该留在 `api/` 里（否则 composable 要反向依赖 api）
- 守卫必须同时比较 `page + sort + order`，否则同页码只改排序时会被误判为“已加载”而不再请求
- `useListQuery`：`parseSort` / `parseOrder` 用白名单；默认值不写进 URL（`sort === ''` 时 `order` 也不写）
- 双向同步：控件 → `store.setSort` → `watch` 写 URL；`route.query` 变化 → 同步回控件（用 `same` 判断防止来回导航）
- 两个边界：无排序字段时禁用升降序按钮；切回“默认顺序”时把 `order` 重置为 `asc`
- 中文按标题排序是 **UTF-16 码点**顺序，不是拼音（需要 `localeCompare` 或后端拼音字段）
- 已有遗留：`pnpm lint` 在 `__tests__` 里有 5 个 `vi.fn()` 缺类型参数的错误（既有问题，按约定不修）

## 当前项目结构

```
src/
├── App.vue                  # 外壳 + 确认服务接线 + 路由过渡（<Transition mode="out-in">）
├── main.ts                  # createApp + Pinia + Router + 全局样式
├── assets/main.css          # 全局基础层：reset + CSS 变量（亮/暗两套） + 基础排版
├── router/index.ts          # /、/about、/stats、/tasks/:id
├── api/tasks.ts             # fetchTasks(分页 + 排序) + createTask / updateTask / deleteTask
├── types.ts                 # 领域类型 Task
├── directives/
│   └── focus.ts             # v-focus：mounted 默认聚焦，updated 仅在 false → true 时补聚焦
├── composables/
│   ├── useFilteredTasks.ts  # 筛选 + 搜索逻辑（getCards 用 getter 传入）
│   ├── useConfirm.ts        # 确认服务：InjectionKey + ConfirmFn 类型
│   ├── useConfirmService.ts # 确认服务的实现：队列 + 弹窗状态
│   ├── useListQuery.ts      # URL ↔ 列表状态（q / filter / page / sort / order）互转
│   └── useTheme.ts          # 亮暗主题：null 表示未选择，跟随系统 + localStorage
├── stores/
│   ├── counter.ts           # 脚手架自带，未使用
│   └── tasks.ts             # 任务数据仓库（cards / 分页 / 排序 / 增删改）
├── views/
│   ├── TodoView.vue         # 待办页（列表 + 添加 + 筛选）
│   ├── AboutView.vue        # 关于页（占位）
│   ├── StatsView.vue        # 统计页（加载中骨架屏 + 四张指标卡）
│   ├── TaskDetailView.vue   # 任务详情页（按 id 从 store 找任务 + 离开守卫）
│   └── NotFoundView.vue     # 404 兜底页
├── components/
│   ├── AppShell.vue         # 应用外壳：导航 + <slot />
│   ├── ConfirmDialog.vue    # 确认弹窗（Teleport + Transition + defineModel）
│   ├── TaskCard.vue         # 单张任务卡片（props: id / title / index / done；emits: remove / toggle）
│   └── TaskForm.vue         # 添加任务表单（defineModel 双向绑定 + submit 事件）
└── __tests__/
    ├── App.spec.ts              # App 外壳渲染（需手动注入 pinia + router）
    ├── tasks.spec.ts            # store 增删改查与派生数据
    ├── useFilteredTasks.spec.ts # composable 筛选/搜索逻辑
    ├── storage.spec.ts          # localStorage 读写与容错
    ├── confirm.spec.ts          # 确认服务：确定/取消/并发排队
    ├── ConfirmDialog.spec.ts    # 弹窗组件：渲染、事件、Teleport
    ├── api.spec.ts              # api 层：mock fetch / 分页 / 映射 / 错误路径
    ├── tasks.spec.ts            # store：mock api 模块，验证调接口与状态更新
    └── TaskCard.spec.ts         # 组件渲染 + emit 契约
```

## 下一步

1. B：批量操作（复选框多选 + 批量完成 / 删除）
2. C：键盘快捷键（`/` 聚焦搜索、`n` 新建、`Esc` 取消）
3. 工程化：打包体积分析 / CI / ESLint 规则收紧

## 暂缓事项

### 暗色主题首屏防闪（FOUC）—— 用户决定暂时不做

- 现象：暗色用户刷新页面会先看到一帧亮色（网络越慢越明显）
- 原因：浏览器先画第一帧，Vue 启动后才贴 `data-theme`
- 方案：在 `index.html` 的 `<head>` 里、`<meta charset>` 之后插入**内联脚本**
  - 不能抽成外部文件（多一次网络请求，抢不到时间）
  - 不能用 `type="module"`（默认 defer，等 HTML 解析完才执行）
  - 必须 `try/catch`（隐私模式下 `localStorage` 会抛错）
- 代码：

  ```html
  <script>
    try {
      const saved = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (saved === 'dark' || (saved === null && prefersDark)) {
        document.documentElement.dataset.theme = 'dark'
      }
    } catch {}
  </script>
  ```

- 注意：key 必须与 `useTheme.ts` 的 `STORAGE_KEY` 一致；`</script>` 不要被落在注释之外
- 决定时间：2026-11-06

## 踩过的坑（备忘）

- `cards.value.filter(...)` 不赋值 = 什么都没做
- trigger：`content.value.title = ''` 是错的，应为 `content.value = ''`
- `ref()` 不写初始值会变成 `any`，类型保护失效，建议 `ref('')`
- 不要解构 store（`const { cards } = store` 会丢响应性），要写 `store.cards`
- 模板里 `:title="x"` 传表达式，`title="x"` 传字面字符串
- 路由参数 `route.params.id` 是字符串，和数字 id 比较前要 `Number()`
- 同一个组件被复用时（如 `/tasks/1` → `/tasks/2`），普通变量不会更新，要用 `computed`
- `preview` 只读 `dist/`，改了源码必须先 `pnpm build`，否则看到的还是旧产物
- HTML 注释里不能出现 `--`，否则会提前终止注释；注释整段脚本时 `</script>` 也要包进去
- 项目风格：prettier 无分号、单引号
