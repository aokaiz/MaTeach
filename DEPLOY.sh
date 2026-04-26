# Hello World 完整部署流程
# Next.js + Node.js + PostgreSQL on VPS

# ============================================================
# 第一步：VPS 环境准备
# ============================================================

# 更新系统
apt update && apt upgrade -y

# 安装必要工具
apt install -y git curl nginx postgresql postgresql-contrib

# 安装 Node.js 20（通过 nvm）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v   # 确认版本

# 安装 PM2
npm install -g pm2

# ============================================================
# 第二步：配置 PostgreSQL
# ============================================================

# 启动 PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# 创建数据库和用户
sudo -u postgres psql <<EOF
CREATE USER hellouser WITH PASSWORD 'hellopass';
CREATE DATABASE hellodb OWNER hellouser;
GRANT ALL PRIVILEGES ON DATABASE hellodb TO hellouser;
\q
EOF

# 验证连接
psql -U hellouser -d hellodb -h localhost -c "SELECT version();"

# ============================================================
# 第三步：上传项目到 VPS
# ============================================================

# 创建项目目录
mkdir -p /var/www/helloworld

# 方式A：从本地用 scp 上传
# scp -r ./helloworld/* root@你的VPS_IP:/var/www/helloworld/

# 方式B：用 Git（推荐）
# 先在 GitHub 建仓库，push 代码，然后：
# cd /var/www && git clone https://github.com/你的用户名/helloworld.git

# ============================================================
# 第四步：安装依赖 & 配置环境变量
# ============================================================

cd /var/www/helloworld

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑填入真实的数据库密码
nano .env.local

# 内容：
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=hellouser
# DB_PASSWORD=hellopass   ← 改成你的密码
# DB_NAME=hellodb
# NODE_ENV=production

# ============================================================
# 第五步：构建项目
# ============================================================

npm run build
# 看到 ✓ Compiled successfully 就成功了

# ============================================================
# 第六步：PM2 启动服务
# ============================================================

# 用 ecosystem.config.js 启动
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save

# 常用 PM2 命令
pm2 status           # 查看状态
pm2 logs helloworld  # 查看日志
pm2 restart helloworld
pm2 stop helloworld

# 验证服务在跑
curl http://localhost:3000
curl http://localhost:3000/api/hello

# ============================================================
# 第七步：配置 Nginx 反向代理
# ============================================================

# 创建 nginx 配置
cat > /etc/nginx/sites-available/helloworld <<'NGINX'
server {
    listen 80;
    server_name 你的VPS_IP;   # 或者你的域名

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

# 启用配置
ln -s /etc/nginx/sites-available/helloworld /etc/nginx/sites-enabled/
nginx -t          # 检查语法
systemctl restart nginx

# ============================================================
# 第八步：开放防火墙端口
# ============================================================

# 如果用 ufw
ufw allow 80
ufw allow 443
ufw allow 22
ufw enable

# 如果用 iptables
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# ============================================================
# 验证：浏览器访问
# ============================================================
# http://你的VPS_IP
# 应该看到 Hello World 页面，显示数据库连接成功

# ============================================================
# 可选：后续更新代码流程
# ============================================================

cd /var/www/helloworld
git pull                  # 拉最新代码
npm install               # 如有新依赖
npm run build             # 重新构建
pm2 restart helloworld    # 重启服务
