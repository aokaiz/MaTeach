export default function AdminDashboard() {
  return (
    <main style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0f1a 100%)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
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
              管理后台
            </h1>
            <p style={{ color: '#666', fontSize: 13 }}>
              材料科学AI答题系统 - 控制面板
            </p>
          </div>
          <a
            href="/"
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
            返回首页
          </a>
        </div>

        {/* Dashboard Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { name: '题目总数', value: '0', color: '#00c896' },
            { name: '学生总数', value: '0', color: '#00c896' },
            { name: '提交记录', value: '0', color: '#ffc800' },
            { name: '系统状态', value: '在线', color: '#28c840' },
          ].map((stat) => (
            <div key={stat.name} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
              padding: '1.5rem',
              textAlign: 'center',
            }}>
              <div style={{ color: '#888', fontSize: 13, marginBottom: '0.5rem' }}>{stat.name}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
        }}>
          <h2 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '1rem' }}>
            快捷操作
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { name: '题库管理', href: '/admin/dashboard/questions' },
              { name: '查看学生', href: '/admin/dashboard/students' },
              { name: '密码管理', href: '/admin/dashboard/admins' },
              { name: '系统设置', href: '/admin/dashboard/settings' },
              { name: '导出数据', href: '/admin/dashboard/export' },
            ].map((action) => (
              <a
                key={action.name}
                href={action.href}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(0,200,150,0.08)',
                  border: '1px solid rgba(0,200,150,0.2)',
                  borderRadius: 8,
                  color: '#00c896',
                  fontSize: 13,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                {action.name}
              </a>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
        }}>
          <h2 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '1rem' }}>
            最近活动
          </h2>
          <p style={{ color: '#666', fontSize: 14 }}>
            暂无活动记录
          </p>
        </div>
      </div>
    </main>
  )
}