'use client'

import { useEffect, useState } from 'react'

interface Admin {
  id: number
  username: string
  password_hash?: string
  role: string
  created_at: string
  updated_at: string
}

interface CurrentAdmin {
  id: number
  username: string
  role: string
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdmin | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState<Admin | null>(null)
  const [addForm, setAddForm] = useState({ username: '', password: '', role: 'admin' })
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`/api/admin/list?currentRole=${currentAdmin?.role || ''}`)
      const data = await res.json()
      if (data.success) {
        setAdmins(data.admins)
        setIsSuperAdmin(data.isSuperAdmin)
      }
    } catch (err) {
      console.error('Failed to fetch admins:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem('admin_user')
    if (stored) {
      setCurrentAdmin(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    if (currentAdmin) {
      fetchAdmins()
    }
  }, [currentAdmin])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      })

      const data = await res.json()

      if (data.success) {
        setSuccess('管理员创建成功')
        setShowAddModal(false)
        setAddForm({ username: '', password: '', role: 'admin' })
        fetchAdmins()
      } else {
        setError(data.error || '创建失败')
      }
    } catch (err) {
      setError('网络错误')
    }
  }

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`确定要删除管理员 "${username}" 吗？`)) return

    try {
      const res = await fetch(`/api/admin/delete?id=${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.success) {
        setSuccess('管理员删除成功')
        fetchAdmins()
      } else {
        setError(data.error || '删除失败')
      }
    } catch (err) {
      setError('网络错误')
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showPasswordModal) return

    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: showPasswordModal.id,
          newPassword: newPassword
        })
      })

      const data = await res.json()

      if (data.success) {
        setSuccess('密码修改成功')
        setShowPasswordModal(null)
        setNewPassword('')
      } else {
        setError(data.error || '修改失败')
      }
    } catch (err) {
      setError('网络错误')
    }
  }

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
              {isSuperAdmin ? '管理员管理' : '密码管理'}
            </h1>
            <p style={{ color: '#666', fontSize: 13 }}>
              {isSuperAdmin ? '添加、删除和管理系统管理员账号' : '查看和管理您的管理员账号密码'}
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
            {isSuperAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(0,200,150,0.15)',
                  border: '1px solid rgba(0,200,150,0.3)',
                  borderRadius: 8,
                  color: '#00c896',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                + 添加管理员
              </button>
            )}
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

        {/* Admins Table */}
        <div style={{
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
        }}>
          {loading ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>加载中...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontWeight: 500 }}>用户名</th>
                  {isSuperAdmin && (
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontWeight: 500 }}>密码哈希</th>
                  )}
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontWeight: 500 }}>角色</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontWeight: 500 }}>创建时间</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#888', fontWeight: 500 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {(isSuperAdmin ? admins : admins.filter(a => a.id === currentAdmin?.id)).map((admin) => (
                  <tr key={admin.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', color: '#fff' }}>{admin.username}</td>
                    {isSuperAdmin && (
                      <td style={{ padding: '1rem', color: '#666', fontSize: 12, fontFamily: 'monospace' }}>
                        {admin.password_hash ? `${admin.password_hash.substring(0, 30)}...` : '-'}
                      </td>
                    )}
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: 12,
                        background: admin.role === 'super_admin' ? 'rgba(255,200,0,0.15)' : 'rgba(0,200,150,0.15)',
                        color: admin.role === 'super_admin' ? '#ffc800' : '#00c896',
                      }}>
                        {admin.role === 'super_admin' ? '超级管理员' : '管理员'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#888', fontSize: 13 }}>
                      {new Date(admin.created_at).toLocaleString('zh-CN')}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {isSuperAdmin && admin.role !== 'super_admin' && (
                        <button
                          onClick={() => handleDelete(admin.id, admin.username)}
                          style={{
                            padding: '6px 14px',
                            background: 'rgba(255,82,82,0.1)',
                            border: '1px solid rgba(255,82,82,0.3)',
                            borderRadius: 6,
                            color: '#ff5252',
                            fontSize: 12,
                            cursor: 'pointer',
                            marginRight: 8,
                          }}
                        >
                          删除
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowPasswordModal(admin)
                          setNewPassword('')
                        }}
                        style={{
                          padding: '6px 14px',
                          background: 'rgba(255,200,0,0.1)',
                          border: '1px solid rgba(255,200,0,0.3)',
                          borderRadius: 6,
                          color: '#ffc800',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        修改密码
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              width: 400,
              padding: '2rem',
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
            }}>
              <h2 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                添加管理员
              </h2>
              <form onSubmit={handleAddSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: 13 }}>
                    用户名
                  </label>
                  <input
                    type="text"
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                    placeholder="输入用户名"
                    required
                    minLength={3}
                    maxLength={50}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: 13 }}>
                    密码
                  </label>
                  <input
                    type="password"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                    placeholder="输入密码（至少6位）"
                    required
                    minLength={6}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: 13 }}>
                    角色
                  </label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="admin">管理员</option>
                    <option value="super_admin">超级管理员</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setError('')
                    }}
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: '#888',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(0,200,150,0.15)',
                      border: '1px solid rgba(0,200,150,0.3)',
                      borderRadius: 8,
                      color: '#00c896',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    创建
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              width: 400,
              padding: '2rem',
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
            }}>
              <h2 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                修改密码 - {showPasswordModal.username}
              </h2>
              <form onSubmit={handlePasswordChange}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: 13 }}>
                    新密码
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                    placeholder="输入新密码（至少6位）"
                    required
                    minLength={6}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(null)
                      setError('')
                      setNewPassword('')
                    }}
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: '#888',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(255,200,0,0.15)',
                      border: '1px solid rgba(255,200,0,0.3)',
                      borderRadius: 8,
                      color: '#ffc800',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    确认修改
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
