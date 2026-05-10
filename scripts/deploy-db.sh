#!/bin/bash
# Mat 数据库部署脚本
# 支持幂等运行：重复执行不会报错
# 从 .env.local 读取配置（不存在时使用默认值）

set -e

# ============================================================
# 加载 .env.local 配置
# ============================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env.local"

if [ -f "$ENV_FILE" ]; then
    echo "从 $ENV_FILE 加载配置..."
    # 处理 Windows 行尾 (CRLF -> LF)
    sed -i 's/\r$//' "$ENV_FILE"
    set -a  # 自动导出
    source "$ENV_FILE"
    set +a
else
    echo "警告: $ENV_FILE 不存在，使用默认配置"
fi

# ============================================================
# 配置（环境变量优先，否则使用默认值）
# ============================================================
DB_USER="${DB_USER:-matuser}"
DB_PASSWORD="${DB_PASSWORD:-matpass}"
DB_NAME="${DB_NAME:-matdb}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# ============================================================
# 检查 PostgreSQL 是否运行
# ============================================================
echo "检查 PostgreSQL 服务状态..."
if ! systemctl is-active --quiet postgresql; then
    echo "启动 PostgreSQL..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# ============================================================
# 创建数据库用户（幂等）
# ============================================================
echo "创建数据库用户 $DB_USER..."
sudo -u postgres psql <<EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    ELSE
        RAISE NOTICE 'User $DB_USER already exists, skipping...';
    END IF;
END
\$\$;
EOF

# ============================================================
# 创建数据库（幂等）
# ============================================================
echo "创建数据库 $DB_NAME..."
sudo -u postgres psql <<EOF
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

# ============================================================
# 创建数据表（幂等）
# ============================================================
echo "创建数据表..."
sudo -u postgres psql -d $DB_NAME <<'EOF'

-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 动态添加 admins 表新字段（幂等操作）
DO $$
BEGIN
    -- 示例：添加 email 字段，如需添加其他字段按同样模式添加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'admins' AND column_name = 'email') THEN
        ALTER TABLE admins ADD COLUMN email VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'admins' AND column_name = 'is_active') THEN
        ALTER TABLE admins ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 创建题目表
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_answer VARCHAR(1) NOT NULL,
    difficulty INT DEFAULT 1,
    subject VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 动态添加 questions 表新字段（幂等操作）
DO $$
BEGIN
    -- 添加选择题选项列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'questions' AND column_name = 'option_a') THEN
        ALTER TABLE questions ADD COLUMN option_a VARCHAR(500) NOT NULL DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'questions' AND column_name = 'option_b') THEN
        ALTER TABLE questions ADD COLUMN option_b VARCHAR(500) NOT NULL DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'questions' AND column_name = 'option_c') THEN
        ALTER TABLE questions ADD COLUMN option_c VARCHAR(500) NOT NULL DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'questions' AND column_name = 'option_d') THEN
        ALTER TABLE questions ADD COLUMN option_d VARCHAR(500) NOT NULL DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'questions' AND column_name = 'correct_answer') THEN
        ALTER TABLE questions ADD COLUMN correct_answer VARCHAR(1) NOT NULL DEFAULT 'A';
    END IF;
    -- 添加图片字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'questions' AND column_name = 'image_url') THEN
        ALTER TABLE questions ADD COLUMN image_url TEXT;
    END IF;
    -- 添加题目解析
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'questions' AND column_name = 'explanation') THEN
        ALTER TABLE questions ADD COLUMN explanation TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'questions' AND column_name = 'category') THEN
        ALTER TABLE questions ADD COLUMN category VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'questions' AND column_name = 'tags') THEN
        ALTER TABLE questions ADD COLUMN tags TEXT[];
    END IF;
END $$;

-- 创建学生表
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 动态添加 students 表新字段（幂等操作）
DO $$
BEGIN
    -- 示例：添加 email 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'email') THEN
        ALTER TABLE students ADD COLUMN email VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'class_name') THEN
        ALTER TABLE students ADD COLUMN class_name VARCHAR(100);
    END IF;
END $$;

-- 创建提交记录表
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id),
    question_id INT REFERENCES questions(id),
    answer TEXT NOT NULL,
    score DECIMAL(5,2),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 动态添加 submissions 表新字段（幂等操作）
DO $$
BEGIN
    -- 示例：添加 graded_at 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'submissions' AND column_name = 'graded_at') THEN
        ALTER TABLE submissions ADD COLUMN graded_at TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'submissions' AND column_name = 'time_spent') THEN
        ALTER TABLE submissions ADD COLUMN time_spent INT;
    END IF;
END $$;

-- 创建系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 初始化默认配置（如果不存在）
INSERT INTO system_config (config_key, config_value, description) VALUES
    ('ai_base_url', '', 'AI 大模型 BASE URL（留空则使用环境变量）'),
    ('ai_api_key', '', 'AI 大模型 API KEY（留空则使用环境变量）'),
    ('ai_model', 'gpt-4o-mini', 'AI 大模型名称'),
    ('ai_enabled', 'false', '是否启用 AI 评价功能')
ON CONFLICT (config_key) DO NOTHING;

EOF

# 授予表和序列的操作权限（幂等）
echo "授予表权限..."
sudo -u postgres psql -d $DB_NAME <<EOF
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON SCHEMA public TO $DB_USER;
EOF

# ============================================================
# 初始化管理员账号
# ============================================================
echo "初始化管理员账号..."
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"

if [ -z "$ADMIN_PASSWORD" ]; then
    echo "警告: 未设置 ADMIN_PASSWORD，跳过管理员初始化"
    echo "请在 .env.local 中设置 ADMIN_PASSWORD 后手动执行:"
    echo "curl -X POST http://localhost:3000/api/admin/init"
else
    # 等待应用启动（最多等待 30 秒）
    echo "等待应用启动..."
    for i in {1..30}; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/admin/init | grep -q "200\|400\|401"; then
            break
        fi
        sleep 1
    done

    # 调用初始化接口
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/admin/init)
    echo "初始化响应: $RESPONSE"
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo "管理员账号创建成功!"
        echo "用户名: $ADMIN_USERNAME"
    elif echo "$RESPONSE" | grep -q "已存在"; then
        echo "管理员账号已存在，跳过创建"
    else
        echo "管理员初始化可能失败，请检查应用日志"
    fi
fi

echo "=============================================="
echo "数据库部署完成！"
echo "数据库: $DB_NAME"
echo "用户: $DB_USER"
echo "主机: $DB_HOST:$DB_PORT"
echo "=============================================="
