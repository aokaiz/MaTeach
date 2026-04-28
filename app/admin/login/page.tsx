'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Row 组件已内联，无需导入

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (res.ok) {
        // 保存登录信息到 localStorage
        localStorage.setItem('admin_user', JSON.stringify(data.admin))
        // 保存密码用于后续 API 验证（仅临时存储）
        localStorage.setItem('admin_password', password)
        // 登录成功，跳转
        router.push('/admin/dashboard')
      } else {
        setError(data.error || '登录失败')
      }
    } catch (err) {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0f1a 100%)',
    }}>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,200,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,200,0,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 400,
        padding: '2.5rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,200,0,0.15)',
        borderRadius: 16,
      }}>
        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,200,0,0.1)',
            border: '1px solid rgba(255,200,0,0.2)',
            borderRadius: 4,
            padding: '4px 14px',
            fontSize: 11,
            letterSpacing: 3,
            color: '#ffc800',
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
          }}>
            ADMIN ACCESS
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#fff',
            marginBottom: '0.5rem',
          }}>
            管理员登录
          </h1>
          <p style={{ color: '#666', fontSize: 13 }}>
            材料科学AI答题系统后台管理
          </p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: '0.5rem' }}>
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(255,200,0,0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: '0.5rem' }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(255,200,0,0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
              background: 'rgba(255,80,80,0.1)',
              border: '1px solid rgba(255,80,80,0.3)',
              borderRadius: 8,
              color: '#ff5f57',
              fontSize: 13,
              marginBottom: '1rem',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'rgba(255,200,0,0.3)' : 'rgba(255,200,0,0.15)',
              border: '1px solid rgba(255,200,0,0.3)',
              borderRadius: 8,
              color: '#ffc800',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: 2,
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        {/* 返回链接 */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a
            href="/"
            style={{
              color: '#666',
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            ← 返回首页
          </a>
        </div>
      </div>
    </main>
  )
}