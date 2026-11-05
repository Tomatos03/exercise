# AGENTS.md

本文件给在本仓库工作的编码代理（AI agent）提供上下文与约定。人类读者也可参考。

## 项目是什么

一个用 Vue 3 + TypeScript 学习前端的学习型项目，正在从一个待办 demo 逐步长成「任务管理系统」。
代码会持续扩展，**可读性和教学价值优先于完成度**。

- 学习进度记录在：`.roadmap/progress.md`（每完成一个新步骤就更新它）
- 用户是 Vue 初学者：改动要小步、单一主题，并且解释"为什么这么做"

## 常用命令

```sh
pnpm dev          # 开发服务器，默认 http://localhost:5173
pnpm build        # 类型检查 + 生产构建
pnpm type-check   # vue-tsc 类型检查
pnpm test:unit    # Vitest（jsdom 环境，监听模式）
pnpm lint         # oxlint + eslint（带 --fix）
pnpm format       # Prettier 格式化 src/
```

- 包管理器：**pnpm**（存在 `pnpm-lock.yaml`），不要换成 npm/yarn。
- Node 版本要求：`^22.18.0 || >=24.12.0`。

## 技术栈

| 依赖 | 版本 | 用途 |
| --- | --- | --- |
| vue | ^3.5 | 框架，一律使用 `<script setup lang="ts">` |
| vue-router | ^5.3 | 多页面路由 |
| pinia | ^4.0 | 共享状态（setup store 写法） |
| vite | ^8.2 | 构建与开发服务器 |
| vitest + @vue/test-utils | ^4.1 / ^2.5 | 单元测试 |

## 目录与职责

```
src/
├── App.vue                # 外壳：导航栏 + <RouterView />
├── main.ts                # createApp + Pinia + Router
├── router/index.ts        # 路由表，页面组件一律懒加载
├── api/                   # 网络请求（一个领域一个文件，不依赖 store）
├── composables/           # 可复用逻辑（useXxx.ts）
├── types.ts               # 跨层共享的领域类型（如 Task）
├── views/                 # 页面级组件，一个路由一个文件（*View.vue）
├── components/            # 可复用组件（PascalCase.vue）
├── stores/                # Pinia store，一个领域一个文件（setup store）
└── __tests__/             # 与被测文件同名的 *.spec.ts
```

- 新增页面：`src/views/XxxView.vue` + `router/index.ts` 加一条 `component: () => import(...)`。
- 新增可复用 UI：`src/components/Xxx.vue`，通过 props 接收数据、通过 emits 通知父级。
- 新增跨页面数据：放进 `src/stores/`，不要在页面之间互相 import。
- 新增接口请求：写进 `src/api/`，返回业务类型；store 只调用，不写 `fetch` 细节。
- `src/stores/counter.ts` 是脚手架遗留，当前未使用。

## 代码风格

- Prettier 配置：**无分号**、**单引号**、`printWidth: 100`，缩进 2 空格。
- Vue 文件顺序：`<script setup lang="ts">` → `<template>` → `<style scoped>`。
- 组件文件用 PascalCase；变量/函数用 camelCase。
- 类型：props 用 `interface` 声明；避免 `any`；导入用 `import type` 仅在纯类型场景。
- 导入路径：同目录用相对路径；跨层级可用 `@/` 别名（已配置在 `vite.config.ts` 与 `tsconfig.app.json`）。
- 提交前跑 `pnpm lint` 和 `pnpm type-check`。

## 本项目的硬性约定

1. **props 只读**：子组件想改状态，必须 `emit` 事件，由持有数据的父组件或 store 修改。
2. **Pinia 不解构**：组件里写 `store.cards`；确实要解构时用 `storeToRefs(store)`，否则丢响应性。
3. **数组可变性**：`push` / `splice` 原地修改；`filter` / `map` 返回新数组，必须 `cards.value = ...` 赋值。
4. **`ref` 使用**：脚本里读写用 `.value`，模板里自动解包，不写 `.value`。
5. **页面状态 vs 系统数据**：筛选条件、输入框内容等留在 `views/`；任务数据等跨页面共享的放 `stores/`。
6. **类型索引安全**：`tsconfig.app.json` 开了 `noUncheckedIndexedAccess`，`arr[i]` 类型是 `T | undefined`，
   先用 `const item = arr[i]` 取出再 `if (!item) return`，或用 `find` / `filter`。
7. **定位数据用 `id`**，不要用数组下标（列表会增删，下标会错位）。
8. **路由页面懒加载**：`component: () => import('../views/XxxView.vue')`。

## 面向代理的工作方式

- 一次只做一个小改动，解释原因，等用户确认后再继续。
- 不要顺手重构无关代码、不要改动用户未提及的文件。
- 报错时先读相关文件、跑 `diagnostics` 定位根因，再给方案；不要用 `any` 或 `@ts-ignore` 掩盖类型错误。
- 修改功能后，用 `pnpm type-check`（必要时 `pnpm test:unit --run`）验证，并如实说明是否验证过。
- 完成一个有教学意义的新步骤后，更新 `.roadmap/progress.md` 的「已完成」与「下一步」。
