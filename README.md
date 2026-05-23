# myMusicPlayer

现代化音乐播放器 SPA 工程骨架（Vue 3 + Vite + TypeScript）。

## 技术栈

- Vue 3（Composition API / `<script setup>`）
- Vite
- TypeScript
- Vue Router
- Pinia
- Tailwind CSS v4

## 开发

```bash
npm install
npm run dev
```

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | ESLint 检查 |
| `npm run format` | Prettier 格式化 |

## 目录结构

```
src/
├── api/           # API 请求
├── assets/        # 静态资源
├── components/    # 通用组件（含 layout）
├── hooks/         # 组合式 hooks
├── layouts/       # 布局
├── router/        # 路由（modules 分模块）
├── stores/        # Pinia
├── styles/        # 全局样式
├── types/         # 类型定义
├── utils/         # 工具函数
└── views/         # 页面视图
```

## 路由

| 路径 | 说明 |
|------|------|
| `/` | 重定向至 `/discover` |
| `/discover` | 发现 |
| `/playlist/:id` | 歌单 |
| `/search` | 搜索 |
| `/user` | 用户 |
| `/mv` | MV |

## 环境变量

复制 `.env.example` 为 `.env` 并按需配置 `VITE_API_BASE_URL`。
