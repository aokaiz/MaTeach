'use client'
import { useEffect, useState } from 'react'

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
    fetch('/api/hello')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setData({ error: e.message }); setLoading(false) })
  }, [])

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
      {/* Grid background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(0,200,150,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,150,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(0,200,150,0.08)',
            border: '1px solid rgba(0,200,150,0.2)',
            borderRadius: 4,
            padding: '4px 14px',
            fontSize: 11,
            letterSpacing: 3,
            color: '#00c896',
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
          }}>
            SYSTEM ONLINE
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 900,
            letterSpacing: -2,
            lineHeight: 1,
            color: '#fff',
            marginBottom: '0.75rem',
          }}>
            Hello<span style={{ color: '#00c896' }}>_</span>World
          </h1>
          <p style={{ color: '#666', fontSize: 14, letterSpacing: 1 }}>
            Next.js · Node.js · PostgreSQL
          </p>
        </div>

        {/* API Card */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: '1.5rem',
        }}>
          {/* Card header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            {['#ff5f57','#febc2e','#28c840'].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
            <span style={{ marginLeft: 8, fontSize: 12, color: '#444', letterSpacing: 1 }}>
              GET /api/hello
            </span>
          </div>

          {/* Card body */}
          <div style={{ padding: '1.5rem 2rem' }}>
            {loading ? (
              <div style={{ color: '#444', fontSize: 14 }}>
                {'> '}<span style={{ color: '#00c896' }}>fetching...</span>
              </div>
            ) : data?.error ? (
              <div>
                <div style={{ color: '#ff5f57', fontSize: 13, marginBottom: 8 }}>❌ Error</div>
                <div style={{ color: '#666', fontSize: 13, fontFamily: 'monospace' }}>{data.error}</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Row label="message" value={data?.message} color="#00c896" />
                <Row label="status"  value={data?.status}  color="#00c896" />
                <Row label="db_time" value={data?.db_time ? new Date(data.db_time).toLocaleString('zh-CN') : ''} />
                <Row label="db_version" value={data?.db_version?.split(' ').slice(0,2).join(' ')} />
              </div>
            )}
          </div>
        </div>

        {/* Stack info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { name: 'Next.js', ver: '14', desc: 'App Router' },
            { name: 'Node.js', ver: '20', desc: 'Runtime' },
            { name: 'PostgreSQL', ver: '14+', desc: 'Database' },
          ].map(s => (
            <div key={s.name} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 10,
              padding: '1rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, color: '#fff', marginBottom: 4 }}>{s.name}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#00c896', lineHeight: 1, marginBottom: 4 }}>{s.ver}</div>
              <div style={{ fontSize: 11, color: '#444', letterSpacing: 1 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: 12, color: '#333', letterSpacing: 1 }}>
          DEPLOYED ON VPS · PM2 · NGINX
        </div>
      </div>
    </main>
  )
}

function Row({ label, value, color }: { label: string; value?: string; color?: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, fontSize: 13, fontFamily: 'monospace' }}>
      <span style={{ color: '#444', minWidth: 110 }}>{label}:</span>
      <span style={{ color: color || '#e8e8f0', wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}
