# Mat — Next.js + PostgreSQL

Mat 是一个基于 Next.js + PostgreSQL 的在线题库系统。

## 技术栈
- **Next.js 14** — App Router + Server Components
- **Node.js 20** — 运行时
- **PostgreSQL 14+** — 数据库
- **PM2** — 进程守护
- **Nginx** — 反向代理

## 项目结构
```
mat/
├── app/
│   ├── api/                ← API 接口
│   ├── page.tsx            ← 首页
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
