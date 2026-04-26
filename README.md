# Hello World — Next.js + PostgreSQL

类似  技术栈的 Hello World 起点项目。

## 技术栈
- **Next.js 14** — App Router + Server Components
- **Node.js 20** — 运行时
- **PostgreSQL 14+** — 数据库
- **PM2** — 进程守护
- **Nginx** — 反向代理

## 项目结构
```
helloworld/
├── app/
│   ├── api/hello/route.ts   ← API 接口，查询数据库
│   ├── page.tsx             ← 首页
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   └── db.ts               ← PostgreSQL 连接池
├── .env.example            ← 环境变量模板
├── ecosystem.config.js     ← PM2 配置
└── DEPLOY.sh               ← 完整部署脚本
```

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local

# 3. 本地开发
npm run dev

# 4. 访问
open http://localhost:3000
```

## 部署到 VPS
详见 DEPLOY.sh
