'use client'

import { useEffect, useState } from 'react'

interface Config {
  ai_base_url: string
  ai_api_key: string
  ai_model: string
  ai_enabled: string
}

export default function SettingsPage() {
  const [config, setConfig] = useState<Config>({
    ai_base_url: '',
    ai_api_key: '',
    ai_model: 'gpt-4o-mini',
    ai_enabled: 'false'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState<{ id: number; username: string; role: string } | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  const isSuperAdmin = currentAdmin?.role === 'super_admin'

  useEffect(() => {
    const stored = localStorage.getItem('admin_user')
    if (stored) {
      setCurrentAdmin(JSON.parse(stored))
    }
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await res.json()
      if (data.success) {
        setConfig({
          ai_base_url: data.config.ai_base_url || '',
          ai_api_key: data.config.ai_api_key || '',
          ai_model: data.config.ai_model || 'gpt-4o-mini',
          ai_enabled: data.config.ai_enabled || 'false'
        })
      }
    } catch (err) {
      console.error('Failed to fetch config:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!isSuperAdmin) return
    
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // 获取存储的密码用于验证
      const storedPassword = localStorage.getItem('admin_password') || ''
      const credentials = btoa(`${currentAdmin?.username}:${storedPassword}`)

      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify(config)
      })

      const data = await res.json()

      if (data.success) {
        setSuccess('设置保存成功')
      } else {
        setError(data.error || '保存失败')
      }
    } catch (err) {
      setError('网络错误')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main style={{
        minHeight: '100vh',
        padding: '2rem',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0f1a 100%)',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
          <p style={{ color: '#666' }}>加载中...</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0f1a 100%)',
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '1rem 1.5rem',
          background: 'rgba(255,200,0,0.05)',
          border: '1px solid rgba(255,200,0,0.15)',
          borderRadius: 12,
        }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.25rem' }}>
              系统设置
            </h1>
            <p style={{ color: '#666', fontSize: 13 }}>
              配置 AI 大模型参数和系统功能
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <a
              href="/admin/dashboard"
              style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#888',
                fontSize: 13,
                textDecoration: 'none',
              }}
            >
              返回仪表盘
            </a>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            background: 'rgba(255,82,82,0.1)',
            border: '1px solid rgba(255,82,82,0.3)',
            borderRadius: 8,
            color: '#ff5252',
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            background: 'rgba(0,200,150,0.1)',
            border: '1px solid rgba(0,200,150,0.3)',
            borderRadius: 8,
            color: '#00c896',
          }}>
            {success}
          </div>
        )}

        {/* AI Settings Card */}
        <div style={{
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          marginBottom: '1.5rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(0,200,150,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}>
              🤖
            </div>
            <div>
              <h2 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: 4 }}>AI 大模型配置</h2>
              <p style={{ color: '#666', fontSize: 12 }}>
                设置用于学生答题评价的大模型服务
                {!isSuperAdmin && <span style={{ color: '#ff5252', marginLeft: 8 }}>（仅超级管理员可修改）</span>}
              </p>
            </div>
          </div>

          {/* AI Enable Toggle */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: isSuperAdmin ? 'pointer' : 'not-allowed',
              opacity: isSuperAdmin ? 1 : 0.5,
            }}>
              <div
                onClick={() => isSuperAdmin && setConfig({ ...config, ai_enabled: config.ai_enabled === 'true' ? 'false' : 'true' })}
                style={{
                  width: 48,
                  height: 26,
                  borderRadius: 13,
                  background: config.ai_enabled === 'true' ? '#00c896' : '#333',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  cursor: isSuperAdmin ? 'pointer' : 'not-allowed',
                }}
              >
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 2,
                  left: config.ai_enabled === 'true' ? 24 : 2,
                  transition: 'all 0.3s ease',
                }} />
              </div>
              <div>
                <span style={{ color: '#fff', fontSize: 14 }}>启用 AI 评价功能</span>
                <p style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                  学生答题后自动获得 AI 个性化评价
                </p>
              </div>
            </label>
          </div>

          {/* BASE URL */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: 13 }}>
              API Base URL
            </label>
            <input
              type="text"
              value={config.ai_base_url}
              onChange={(e) => isSuperAdmin && setConfig({ ...config, ai_base_url: e.target.value })}
              disabled={!isSuperAdmin}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: isSuperAdmin ? '#fff' : '#666',
                fontSize: 14,
                boxSizing: 'border-box',
                cursor: isSuperAdmin ? 'text' : 'not-allowed',
              }}
              placeholder="https://api.openai.com/v1 或自定义代理地址"
            />
            <p style={{ color: '#555', fontSize: 11, marginTop: 6 }}>
              支持 OpenAI、Claude、国产大模型（如硅基流动等）。留空使用默认 OpenAI 地址。
            </p>
          </div>

          {/* API Key */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: 13 }}>
              API Key
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={config.ai_api_key}
                onChange={(e) => isSuperAdmin && setConfig({ ...config, ai_api_key: e.target.value })}
                disabled={!isSuperAdmin}
                style={{
                  width: '100%',
                  padding: '10px 50px 10px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: isSuperAdmin ? '#fff' : '#666',
                  fontSize: 14,
                  boxSizing: 'border-box',
                  cursor: isSuperAdmin ? 'text' : 'not-allowed',
                }}
                placeholder="sk-..."
              />
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                >
                  {showApiKey ? '👁️' : '👁️‍🗨️'}
                </button>
              )}
            </div>
            <p style={{ color: '#555', fontSize: 11, marginTop: 6 }}>
              建议使用环境变量 AI_API_KEY 配置生产环境密钥
            </p>
          </div>

          {/* Model */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: 13 }}>
              模型名称
            </label>
            <input
              type="text"
              value={config.ai_model}
              onChange={(e) => isSuperAdmin && setConfig({ ...config, ai_model: e.target.value })}
              disabled={!isSuperAdmin}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: isSuperAdmin ? '#fff' : '#666',
                fontSize: 14,
                boxSizing: 'border-box',
                cursor: isSuperAdmin ? 'text' : 'not-allowed',
              }}
              placeholder="gpt-4o-mini"
            />
            <p style={{ color: '#555', fontSize: 11, marginTop: 6 }}>
              推荐使用轻量级模型以降低成本和延迟，如 gpt-4o-mini、claude-3-haiku
            </p>
          </div>
        </div>

        {/* Save Button - Only Super Admin */}
        {isSuperAdmin ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '12px 32px',
                background: saving ? 'rgba(0,200,150,0.1)' : 'rgba(0,200,150,0.15)',
                border: '1px solid rgba(0,200,150,0.3)',
                borderRadius: 8,
                color: saving ? '#666' : '#00c896',
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {saving ? '保存中...' : '保存设置'}
            </button>
          </div>
        ) : (
          <div style={{
            padding: '1rem',
            background: 'rgba(255,82,82,0.05)',
            border: '1px solid rgba(255,82,82,0.15)',
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <p style={{ color: '#888', fontSize: 13, margin: 0 }}>
              ⚠️ 只有超级管理员才能修改 AI 配置
            </p>
          </div>
        )}

        {/* Info */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(0,200,150,0.05)',
          border: '1px solid rgba(0,200,150,0.1)',
          borderRadius: 8,
        }}>
          <p style={{ color: '#888', fontSize: 12, lineHeight: 1.6 }}>
            <strong style={{ color: '#00c896' }}>💡 提示：</strong>
            <br />
            1. 建议使用支持 OpenAI-compatible API 的大模型服务
            <br />
            2. 生产环境可在 .env 文件中配置 AI_API_KEY，数据库配置将覆盖环境变量
            <br />
            3. AI 评价会在学生提交答案后自动生成，不影响正常答题流程
          </p>
        </div>
      </div>
    </main>
  )
}
