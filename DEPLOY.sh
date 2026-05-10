# Mat 完整部署流程
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
# 第二步：配置 PostgreSQL（使用独立脚本）
# ============================================================
# 数据库部署已移至 scripts/deploy-db.sh
# 首次部署时运行: bash scripts/deploy-db.sh
# 或设置环境变量: DB_USER=xxx DB_PASS=xxx DB_NAME=xxx bash scripts/deploy-db.sh

# ============================================================
# 第三步：上传项目到 VPS
# ============================================================

# 创建项目目录
mkdir -p /var/www/mat

# 方式A：从本地用 scp 上传
# scp -r ./mat/* root@你的VPS_IP:/var/www/mat/

# 方式B：用 Git（推荐）
# 先在 GitHub 建仓库，push 代码，然后：
# cd /var/www && git clone https://github.com/你的用户名/mat.git

# ============================================================
# 第四步：安装依赖 & 配置环境变量
# ============================================================

cd /var/www/mat

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑填入真实的数据库密码
nano .env.local

# 内容：
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=matuser
# DB_PASSWORD=matpass   ← 改成你的密码
# DB_NAME=matdb
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
pm2 logs mat     # 查看日志
pm2 restart mat
pm2 stop mat

# 验证服务在跑
curl http://localhost:3000
curl http://localhost:3000/api/questions

# ============================================================
# 第七步：配置 Nginx 反向代理（支持 HTTPS）
# ============================================================

# 创建 nginx 配置
cat > /etc/nginx/sites-available/mat <<'NGINX'
server {
    listen 80;
    server_name 你的域名 www.你的域名;
    
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name 你的域名 www.你的域名;

    # SSL 证书路径（请提前申请并修改为实际路径）
    ssl_certificate       /root/cert/你的域名/fullchain.pem;
    ssl_certificate_key   /root/cert/你的域名/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
      proxy_pass http://127.0.0.1:3001;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "connection_upgrade";

      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;

      # 支持大文件上传（10MB）
      client_max_body_size 10M;
    }

    # 上传图片目录单独配置
    location /uploads/ {
      alias /var/www/mat/public/uploads/;
      
      # 支持大文件上传
      client_max_body_size 10M;
      
      # 禁止访问隐藏文件
      if ($request_filename ~* /\.) {
        return 403;
      }
    }
}
NGINX

# 启用配置（放入 conf.d 目录）
cp /etc/nginx/sites-available/mat /etc/nginx/conf.d/mat.conf
rm -f /etc/nginx/sites-available/mat  # 清理
nginx -t          # 检查语法
systemctl restart nginx

# ============================================================
# 第七步半：申请 SSL 证书（使用 acme.sh）
# ============================================================
# 申请证书后，修改上面的 ssl_certificate 路径

# 安装 acme.sh
curl https://get.acme.sh | sh -s email=你的邮箱@域名.com

# 申请证书（需要域名已解析到当前服务器）
~/.acme.sh/acme.sh --issue -d 你的域名 -d www.你的域名 --webroot /var/www/mat

# 安装证书到指定目录
mkdir -p /root/cert/你的域名
~/.acme.sh/acme.sh --install-cert -d 你的域名 \
  --key-file /root/cert/你的域名/privkey.pem \
  --fullchain-file /root/cert/你的域名/fullchain.pem

# 修改 nginx 配置中的证书路径后重载
nginx -t && systemctl reload nginx

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
# 应该看到 Mat 首页

# ============================================================
# 可选：后续更新代码流程
# ============================================================

cd /var/www/mat
git pull                  # 拉最新代码
npm install               # 如有新依赖
npm run build             # 重新构建
pm2 restart mat    # 重启服务
