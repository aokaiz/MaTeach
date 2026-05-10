'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ApiData {
  message?: string
  db_time?: string
  db_version?: string
  status?: string
  error?: string
}

export default function Home() {
  const [data, setData] = useState<ApiData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/status')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setData({ error: e.message }); setLoading(false) })
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0f1a 100%)',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(0,200,150,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,150,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(0,200,150,0.08)',
            border: '1px solid rgba(0,200,150,0.2)',
            borderRadius: 4,
            padding: '4px 14px',
            fontSize: 11,
            letterSpacing: 3,
            color: '#00c896',
            marginBottom: '1rem',
            textTransform: 'uppercase',
          }}>
            AI Q&A SYSTEM
          </div>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
            fontWeight: 900,
            letterSpacing: -1,
            lineHeight: 1.2,
            color: '#fff',
            marginBottom: '0.5rem',
          }}>
            材料科学
            <span style={{ color: '#00c896' }}> AI答题系统</span>
          </h1>
          <p style={{ color: '#555', fontSize: 13, letterSpacing: 1 }}>
            Materials Science AI Q&A System
          </p>
        </div>

        {/* Feature highlights - top section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '1.5rem 0' }}>
          {[
            { name: 'AI 智能答题', ver: 'GPT-4', desc: '智能答疑' },
            { name: '材料科学题库', ver: '1000+', desc: '持续更新' },
            { name: '学习分析', ver: 'AI', desc: '个性化辅导' },
          ].map(s => (
            <div key={s.name} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 10,
              padding: '0.8rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{s.name}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#00c896', lineHeight: 1, marginBottom: 4 }}>{s.ver}</div>
              <div style={{ fontSize: 10, color: '#444', letterSpacing: 1 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Main CTA - Center and Big */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem 0'
        }}>
          <Link 
            href="/quiz"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '28px 80px',
              background: 'linear-gradient(135deg, rgba(0,200,150,0.2) 0%, rgba(0,180,130,0.15) 100%)',
              border: '2px solid rgba(0,200,150,0.4)',
              borderRadius: 16,
              color: '#00c896',
              fontSize: 22,
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: 3,
              transition: 'all 0.3s ease',
              boxShadow: '0 0 40px rgba(0,200,150,0.15), inset 0 0 20px rgba(0,200,150,0.05)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,200,150,0.3) 0%, rgba(0,180,130,0.25) 100%)'
              e.currentTarget.style.borderColor = 'rgba(0,200,150,0.6)'
              e.currentTarget.style.boxShadow = '0 0 60px rgba(0,200,150,0.25), inset 0 0 30px rgba(0,200,150,0.1)'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,200,150,0.2) 0%, rgba(0,180,130,0.15) 100%)'
              e.currentTarget.style.borderColor = 'rgba(0,200,150,0.4)'
              e.currentTarget.style.boxShadow = '0 0 40px rgba(0,200,150,0.15), inset 0 0 20px rgba(0,200,150,0.05)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            开始答题
          </Link>
        </div>

        {/* Footer - System Status + Admin Login */}
        <div style={{ display: 'flex', gap: 16, marginBottom: '1.5rem' }}>
          {/* System Status Card */}
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => (
                <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              ))}
              <span style={{ marginLeft: 8, fontSize: 11, color: '#444', letterSpacing: 1 }}>
                系统状态
              </span>
            </div>
            <div style={{ padding: '1rem 1.25rem' }}>
              {loading ? (
                <div style={{ color: '#444', fontSize: 12 }}>
                  {'> '}<span style={{ color: '#00c896' }}>loading...</span>
                </div>
              ) : data?.error ? (
                <div style={{ color: '#ff5f57', fontSize: 12 }}>❌ 连接失败</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Row label="status"  value={data?.status}  color="#00c896" />
                  <Row label="db_time" value={data?.db_time ? new Date(data.db_time).toLocaleString('zh-CN') : ''} />
                </div>
              )}
            </div>
          </div>

          {/* Admin Login Button */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Link 
              href="/admin/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 28px',
                background: 'rgba(255,200,0,0.08)',
                border: '1px solid rgba(255,200,0,0.2)',
                borderRadius: 10,
                color: '#ffc800',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                letterSpacing: 2,
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,200,0,0.15)'
                e.currentTarget.style.borderColor = 'rgba(255,200,0,0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,200,0,0.08)'
                e.currentTarget.style.borderColor = 'rgba(255,200,0,0.2)'
              }}
            >
              管理员登录
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: 11, color: '#333', letterSpacing: 1 }}>
          MATERIALS SCIENCE · AI POWERED
        </div>
      </div>
    </main>
  )
}

function Row({ label, value, color }: { label: string; value?: string; color?: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, fontSize: 12, fontFamily: 'monospace' }}>
      <span style={{ color: '#444', minWidth: 70 }}>{label}:</span>
      <span style={{ color: color || '#e8e8f0', wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}
