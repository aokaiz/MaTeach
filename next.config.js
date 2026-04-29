/** @type {import('next').NextConfig} */
const nextConfig = {
  // 支持静态文件上传目录
  async rewrites() {
    return []
  },
}

module.exports = nextConfig
