# Vue 学习路线与进度

> 更新时间：2026-11-06
> 项目：`/home/tomato0v0/Projects/VueProjects/exercise`
> 技术栈：Vue 3.5 + TypeScript + Vite 8 + Vue Router 5 + Pinia 4 + Element Plus（pnpm）
> 启动：`pnpm dev`（http://localhost:5173）+ `pnpm mock`（http://localhost:3001）

## 学习方式

- **一次只推进一个小步骤**，用户明确表示“继续 / 明白”后才进入下一步。
- 每个小步骤：目的 → 具体改动 → 一个验证问题。
- 用户是前端新手：先看现象、再看概念，避免一次抛出多个新概念。
- 报错时先读文件 / 看诊断定位根因，再给方案；不用 `any` / `@ts-ignore` 掩盖。
- **阶段约定（2026-11-05 起）**：不再新增或修改 `src/__tests__/`；功能改动用 `pnpm type-check` + 浏览器手动验证。
- **数据以后端为准**：列表与增删改都走 `src/api/` 的真实 HTTP，开发期用 json-server。

## 总目标

从简单 demo 逐步长成复杂的 Vue 项目，方向是**任务管理系统**：待办 → 统计 → 详情 → 搜索 → 异步数据 → 工程化。

## 已完成（速查）

> 第 1-49 步压缩成“一步一条”，保留关键结论；第 50-52 步保留细节。完整过程见 git 历史。

### 基础（1-5）

- **1 单文件组件**：`.vue` = script + template + style；`ref` 脚本里 `.value`，模板自动解包；`@click`。
- **2 props 与列表**：`defineProps`；`v-for` + 唯一 `:key`；`v-model`；`v-if`；`push` 新增。
- **3 子传父**：`defineEmits`；子组件只 emit，父组件决定改什么；`splice` 删除；`:disabled`。
- **4 对象状态**：`Task { id, title, done }`；`:key` 用 `id`；props 只读；`noUncheckedIndexedAccess` 下先取 `item` 再判空。
- **5 计算属性**：`computed` 派生；`push/splice` 原地改，`filter/map` 必须重新赋值；按 `id` 而非下标定位。

### 路由、状态、搜索、持久化（6-10）

- **6 路由**：页面放 `views/`；`RouterView` / `RouterLink`；`component: () => import(...)` 懒加载。
- **7 Pinia**：setup store 单例；`TodoView` 改用 `store`；`filter/visibleCards` 留在页面（页面状态 vs 系统数据）。
- **8 动态路由**：`/tasks/:id`；`route.params.id` 是字符串；`computed` + `find`，组件复用时会更新。
- **9 搜索**：`keyword` + `computed` 逐层筛选，不改原始数据。
- **10 持久化**：`localStorage` + `JSON`；整体替换不用 deep，原地修改必须 `deep: true`。

### 异步、表单、测试（11-21）

- **11 异步数据**：`fetch` / `await`；判断 `response.ok`；`loading/error/finally`；`e` 是 `unknown`；字段映射。
- **12 编辑任务**：`renameCard`；本地 `draft`；`watch(..., { immediate: true })`；`??` / `?.`。
- **13 布局与插槽**：`<slot />`；`AppShell`；`RouterView/Link` 全局注册；PascalCase 命名。
- **14 样式组织**：全局基础 → 布局 → 组件 scoped；CSS 变量设计令牌；BEM；`@submit.prevent`。
- **15 表单提交**：用 `<form>` 获得回车提交；`.prevent/.stop/.self/.once/.passive/.enter`。
- **16 组件 v-model**：本质 `:model-value` + `@update:model-value`；`defineModel`；多个 model 分开写。
- **17 单元测试**：Vitest + test-utils + jsdom；`mount` 不跑 `main.ts`，手动装 Pinia/Router；测试抓到“同毫秒 id 重复”的真 bug。
- **18 composable**：函数内 `ref/computed`，每次调用独立状态；参数传 getter 而非数组快照。
- **19 composable 测试**：工厂造数据；读 `ref/computed` 写 `.value`；验证 getter 设计。
- **20 组件测试**：先 `router.push` + `await isReady()`；`trigger` 要 await；`emitted` 断言事件。
- **21 构建预览**：`pnpm build` 并行跑类型检查和打包；产物带 hash；看 gzip；dev vs preview；history 模式要服务器回退。

### 分层、守卫与交互（22-30）

- **22 命名清理**：`Card` → `Task`；删除遗留 `console.log`。
- **23 数据分层**：`api/`（请求）→ `stores/`（状态/业务）→ `views/`（显示）；`types.ts` 放跨层类型。
- **24 路由守卫**：`beforeEach` / `onBeforeRouteLeave`；`isDirty`；`window.confirm`；预览旧 `dist` 会看到旧行为。
- **25 404**：`/:pathMatch(.*)*`；参数正则 `:id(\\d+)`；`*`/`+`/`?` 修饰段数；路由不存在 ≠ 数据不存在。
- **26 弹窗**：`Teleport` + `Transition`；`@click.self`；`defineModel`；异步守卫返回 Promise，忘了 `resolve` 会永久挂起。
- **27 环境变量**：只暴露 `VITE_` 前缀；构建时静态替换，改完重启；前端变量不是秘密；`env.d.ts` 补类型。
- **28 列表动画**：`TransitionGroup`；`:key` 必需；`*-move`；离场元素 `position: absolute` 才能平滑重排。
- **29 strictTemplates**：`vueCompilerOptions` 顶层开启；模板组件名、props、事件错误会在 type-check 暴露。
- **30 清理死代码**：删无用样式；同步 AGENTS 描述。

### 服务层、守卫、URL、体验（31-42）

- **31 存储层**：`storage/tasks.ts`；默认数据用工厂函数；storage / store / 组件三层职责。
- **32 存储层测试**：默认值、读写回、损坏回退、每次独立数组。
- **33 确认服务**：`InjectionKey` + `provide/inject`；key 引用必须唯一；provide 放在真正共同祖先。
- **34 并发队列**：单槽 `resolver` 会被覆盖；FIFO `queue` + `current`；Promise executor 同步执行；测试覆盖排队。
- **35 useConfirmService**：key/类型、状态/队列、App 接线三层；只暴露 4 样；解构 composable 的 ref 安全。
- **36 简化确认测试**：直接测 composable，不再挂 App；更快，但少覆盖 UI 连线。
- **37 组件与 api 测试**：Teleport 可 stub；单独用例验证真实挂载；`vi.stubGlobal('fetch')` + `unstubAllGlobals`。
- **38 搜索防抖与 URL**：输入值与生效值分开；300ms 防抖；解析白名单；`buildListQuery` 合并参数；`route.query` 双向同步防回环。
- **39 真实后端**：json-server + `_page/_limit` + `X-Total-Count`；api 增删改查；删除 storage；store 全异步；测试 mock api。
- **40 守卫加载**：`loaded` 仅成功后置 true；守卫不 await；用守卫而非 App onMounted（测试、query、新页面都受益）。
- **41 页码 URL**：`parsePage` 容错；默认值不写 URL；挂载规范化用 `initialQuery.page`；watch Pinia 值要包 getter。
- **42 页面过渡**：`RouterView v-slot="{ Component }"` + `<component :is>`；`mode="out-in"`；CSS 类前缀来自 `name`。

### 列表交互与主题（43-49）

- **43 v-focus**：指令钩子成对；`<script setup>` 里 `vXxx` 可直接用；只在 `false → true` 聚焦；只 focus 不 blur。
- **44 骨架屏**：`0` 是合法值，表达不了“未知”；三态；骨架尺寸对齐真实内容，避免布局跳动。
- **45 错误态**：四态顺序 `loading → error → data`；`@click="fn()"` 括号不能省；骨架“看不到”常是请求与懒加载赛跑。
- **46 亮暗主题**：`data-theme` + CSS 变量；`color-scheme`；JS 只改字符串；`null` 表示用户没选过；系统偏好变化仅在未手动选择时跟随。
- **47 服务端排序**：`toTask`（读）与 `toRemoteSort`（写）成对；排序变化回第 1 页；守卫比较 page + sort + order；中文按 UTF-16 排序。
- **48 批量操作**：选择控件用 ARIA `role="checkbox"`（测试冻结）；选中只存 id；全选基于当前页；`min-width: 0` 防长标题撑破；`Promise.all` 批量请求无事务。
- **49 快捷键**：`keydown` 监听成对增删；`isEditable` 查 INPUT/TEXTAREA/contentEditable；`/` 要 preventDefault；组件 ref 是实例，`InstanceType` 拿 `focus()`；`defineExpose` 只暴露行为。

### 第 50 步 · Stats 服务端统计

- 旧实现用 `store.total/finished`，它们来自当前页 `cards`，统计页“全部”只有 5，不是全库。
- 统计是聚合查询，交给服务端；真实后端用 `COUNT`，不拉全表。
- json-server 0.17 用 `--middlewares` 挂 `mock/stats.cjs`；项目是 ESM，所以中间件用 `.cjs`（CLI 用 `require()`）。
- `req.app.db` 是 lowdb 实例；`next()` 放行给后面的 router；`GET /stats` 返回 `{ total, completed }`。
- `api/tasks.ts` 映射成 `{ total, finished }`；`StatsView` 自己管理 `stats/loading/error`，`pending/rate` 用 `computed`。
- 路由守卫对 `stats` 直接放行，避免白拉 `/todos`。
- 验证：`/stats` 返回 10/2；页面 10/2/8/20%；翻页不影响；改完任务回来数字会变。

### 第 51 步 · Element Plus 试点

- 不动已测的 `TaskCard`/`ConfirmDialog`，新增 `/table` 试点。
- 按需引入：`unplugin-vue-components` + `unplugin-auto-import` + `ElementPlusResolver`；组件、样式、`v-loading` 指令自动注入。
- `main.ts` 不再 `app.use(ElementPlus)`、不再引全量 CSS；只保留 `theme-chalk/dark/css-vars.css`。
- 暗色同时设置 `data-theme` 与 `html.dark`；EP 暗色认 `html.dark`。
- `/table` 用 `el-table` + `el-tag` + `el-button` + `el-alert` + `el-pagination` + `v-loading`，数据复用 task store。
- 表格插槽 `row` 是 EP 的 `DefaultRow`，不是 `Task`；取 `Number(row.id)` 调 `toggleCard`。
- 生成 `components.d.ts`（含 `GlobalDirectives.vLoading`）/ `auto-imports.d.ts`，加入 `tsconfig.app.json` include。
- 体积：首屏主包约 64 kB / gzip 25 kB；表格路由 270 kB / gzip 91 kB + CSS 95 kB / gzip 13 kB（只在进 `/table` 时加载）。

### 第 52 步 · 统一到 Element Plus 主题

- 取舍：不把 EP 改成项目绿，而是让项目令牌映射 EP 主题，全站统一用 EP 默认蓝色。
- `src/assets/main.css`：`--color-primary/text/muted/border/bg/surface/danger`、`--radius`、`--shadow-sm` 全部改引用对应 `--el-*`，并带 fallback。
- 暗色不再自定义色值，交给 EP 的 `html.dark`；`[data-theme='dark']` 只保留 `color-scheme: dark`。
- 结果：EP 组件与自定义组件的颜色、4px 圆角、阴影一致；暗色自动跟随。
- 以后换品牌色：改 EP 的 `--el-color-primary` 或 SCSS 主题，不要再写两套 `--color-*`。

### 第 53 步 · Element Plus 中文 locale

- 新建入口 `AppRoot.vue`：`<el-config-provider :locale="zhCn">` 包住 `App`；`main.ts` 改为挂 `AppRoot`。
- 为什么不在 `App.vue` 里包：`App.spec` 会 `mount(App)`，auto-import 会把 Element Plus 的 CSS 带进 Vitest，报 `Unknown file extension ".css"`；把 provider 放入口，`App` 保持 provider-free，测试不受影响。
- `zhCn` 来自 `element-plus/es/locale/lang/zh-cn`；`ElConfigProvider` 通过 provide/inject 把 locale 传给所有后代，不需要 `app.use(ElementPlus)`。
- 分页加上 `layout="total, prev, pager, next"`，EP 中文 locale 显示“共 10 条”，顺便验证 locale 生效。
- 体积代价：入口挂 ConfigProvider + 中文语言包后，主包约 88 kB / gzip 35 kB（此前约 64/25）；换来了全站 EP 文案中文化。
- 验证：36 个测试通过、`pnpm type-check` / `pnpm build-only` 通过；DOM 确认“共 10 条”。

## 当前项目结构

```
src/
├── AppRoot.vue              # 入口 provider：ElConfigProvider + zhCn
├── App.vue                  # 外壳 + 确认服务接线 + 路由过渡
├── main.ts                  # createApp(AppRoot) + Pinia + Router + 全局样式 + EP 暗色变量
├── assets/main.css          # reset + 设计令牌（映射 EP 主题） + 基础排版
├── router/index.ts          # /、/table、/about、/stats、/tasks/:id（stats 跳过列表守卫）
├── api/tasks.ts             # 分页/排序 + fetchStats + 增删改
├── types.ts                 # Task / TaskSort / SortOrder
├── directives/focus.ts      # v-focus
├── composables/
│   ├── useFilteredTasks.ts  # 筛选 + 搜索
│   ├── useConfirm.ts        # 确认服务 key + 类型
│   ├── useConfirmService.ts # 队列 + 弹窗状态
│   ├── useListQuery.ts      # URL ↔ 列表状态
│   └── useTheme.ts          # data-theme + html.dark + localStorage
├── stores/tasks.ts          # cards / 分页 / 排序 / 增删改
├── views/
│   ├── TodoView.vue         # 待办
│   ├── StatsView.vue        # 服务端统计 + 骨架屏
│   ├── TaskTableView.vue    # Element Plus 表格试点
│   ├── TaskDetailView.vue   # 详情 + 离开守卫
│   ├── AboutView.vue
│   └── NotFoundView.vue
├── components/
│   ├── AppShell.vue         # 导航 + <slot />
│   ├── ConfirmDialog.vue    # Teleport + Transition
│   ├── TaskCard.vue         # 卡片
│   └── TaskForm.vue         # defineModel 表单
└── __tests__/               # 9 个 spec / 36 个用例（冻结，不随功能改）
```

根目录：`mock/stats.cjs`（/stats 中间件）、`vite.config.ts`（EP 按需引入）、`components.d.ts`、`auto-imports.d.ts`、`db.json`、`.env`。

## 下一步

1. 决定是否迁移 TodoView / TaskForm 到 Element Plus（迁移前先处理冻结测试）。
2. 可选：Todo 页底部“已完成”改为全库口径（复用 `/stats`）。
3. 工程化：打包体积分析 / CI / ESLint 规则收紧（暂时跳过）。

## 暂缓事项

### 暗色首屏防闪（FOUC）—— 暂时不做

- 现象：暗色用户刷新先看到一帧亮色；浏览器先画第一帧，Vue 启动后才贴主题。
- 方案：`index.html` 的 `<head>` 里、`<meta charset>` 之后放**内联脚本**（不能外部文件，不能 `type="module"`，要 `try/catch`）。
- 现在 EP 暗色还依赖 `html.dark`，脚本里要同时加 `classList.add('dark')`。
- 决定时间：2026-11-06。

### 打包体积分析与 CI —— 暂时跳过

- 打包分析：`rollup-plugin-visualizer` + `--mode analyze` 独立 outDir。
- CI：`.github/workflows/ci.yml`；当前 `pnpm lint` 仍因冻结测试里 5 个 `vitest/require-mock-type-parameters` 失败。
- 处理方式（待做）：只对 `src/__tests__/**` 关掉该规则，或解冻测试后补类型参数。

## 踩过的坑（备忘）

- `cards.value.filter(...)` 不赋值 = 什么都没做。
- `ref()` 不写初始值会变成 `any`，建议 `ref('')`。
- 不要解构 Pinia store；要写 `store.cards`，或用 `storeToRefs`。
- 模板里 `:title="x"` 是表达式，`title="x"` 是字面字符串。
- 路由参数是字符串，和数字比较前先 `Number()`。
- 组件被复用（`/tasks/1 → /tasks/2`）时普通变量不更新，要用 `computed`。
- `preview` 只读 `dist/`，改了源码先 `pnpm build`。
- HTML 注释里不能出现 `--`；注释整段脚本时 `</script>` 也要包进去。
- `cards` 只有当前页，`cards.length` 是 5 不是 10；全库统计走 `/stats`。
- json-server 中间件在 ESM 项目里用 `.cjs`；CLI 用 `require()` 加载。
- 页面自己的 `loading/error` 不要复用列表 store 的状态。
- `v-loading` 的类型在 `components.d.ts` 的 `GlobalDirectives` 里，文件要进 tsconfig include。
- `el-table` 插槽的 `row` 是 `DefaultRow`，直接当 `Task` 传会 TS2345。
- Element Plus 暗色认 `html.dark`，只设 `data-theme` 不够。
- `App.spec` 的 mock router 没有 `/table`，导航栏新增链接会有 `No match found` 警告；测试仍通过。
- 按需引入的 CSS 跟着路由 chunk 走，进 `/table` 才加载表格 CSS。
- 主题只留一个源头：`--color-*` 映射 `--el-*`；不要在 `main.css` 再覆盖一套 `--el-*`。
- `var(--el-xxx, fallback)` 的 fallback 很重要：按需 CSS 没加载时颜色不会失效。
- `ElConfigProvider` 直接放进 `App.vue` 会让 `App.spec` 通过 auto-import 引入 EP CSS，Vitest 报 `Unknown file extension ".css"`；provider 放到入口 `AppRoot.vue`，`App` 保持可测。
- `ElConfigProvider` 不产生额外 DOM；中文 locale 下分页 total 显示“共 N 条”。
- 项目风格：Prettier 无分号、单引号。
