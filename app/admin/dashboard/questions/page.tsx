'use client'

import { useEffect, useState, useRef } from 'react'

interface Question {
  id: number
  title: string
  content: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  difficulty: number
  subject: string
  image_url?: string
  created_at: string
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    difficulty: 1,
    subject: '',
    image_url: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions/list', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await res.json()
      if (data.success) {
        setQuestions(data.questions)
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/questions/upload', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(30000) // 30秒超时
      })
      const data = await res.json()

      if (data.success) {
        setForm({ ...form, image_url: data.url })
        setSuccess('图片上传成功')
      } else {
        setError(data.error || '上传失败')
      }
    } catch (err) {
      setError('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/questions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (data.success) {
        setSuccess('题目创建成功')
        setShowAddModal(false)
        setForm({
          title: '',
          content: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_answer: 'A',
          difficulty: 1,
          subject: '',
          image_url: ''
        })
        fetchQuestions()
      } else {
        setError(data.error || '创建失败')
      }
    } catch (err) {
      setError('网络错误')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这道题目吗？')) return

    try {
      const res = await fetch(`/api/questions/delete?id=${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.success) {
        setSuccess('题目删除成功')
        fetchQuestions()
      } else {
        setError(data.error || '删除失败')
      }
    } catch (err) {
      setError('网络错误')
    }
  }

  const difficultyLabels = { 1: '简单', 2: '中等', 3: '困难' }
  const difficultyColors = { 1: '#00c896', 2: '#ffc800', 3: '#ff5252' }

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
              题库管理
            </h1>
            <p style={{ color: '#666', fontSize: 13 }}>
              共 {questions.length} 道题目
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
              + 添加题目
            </button>
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

        {/* Questions List */}
        <div style={{
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
        }}>
          {loading ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>加载中...</p>
          ) : questions.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>暂无题目，点击上方按钮添加</p>
          ) : (
            questions.map((q) => (
              <div key={q.id} style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                marginBottom: '1rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontSize: 11,
                      background: 'rgba(0,200,150,0.15)',
                      color: '#00c896',
                    }}>
                      {difficultyLabels[q.difficulty as keyof typeof difficultyLabels] || '简单'}
                    </span>
                    {q.subject && (
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: 11,
                        background: 'rgba(255,200,0,0.1)',
                        color: '#ffc800',
                      }}>
                        {q.subject}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(q.id)}
                    style={{
                      padding: '6px 14px',
                      background: 'rgba(255,82,82,0.1)',
                      border: '1px solid rgba(255,82,82,0.3)',
                      borderRadius: 6,
                      color: '#ff5252',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    删除
                  </button>
                </div>
                <h3 style={{ color: '#fff', fontSize: 16, marginBottom: '0.5rem' }}>{q.title}</h3>
                <p style={{ color: '#888', fontSize: 14, marginBottom: '1rem', lineHeight: 1.6 }}>{q.content}</p>
                {q.image_url && (
                  <img 
                    src={q.image_url} 
                    alt="题目图片" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: 200, 
                      borderRadius: 8, 
                      marginBottom: '1rem',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }} 
                  />
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div key={opt} style={{
                      padding: '8px 12px',
                      background: q.correct_answer === opt ? 'rgba(0,200,150,0.15)' : 'rgba(255,255,255,0.02)',
                      border: q.correct_answer === opt ? '1px solid rgba(0,200,150,0.3)' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 6,
                      fontSize: 13,
                      color: q.correct_answer === opt ? '#00c896' : '#888',
                    }}>
                      <span style={{ fontWeight: 600, marginRight: 8 }}>{opt}.</span>
                      {q[`option_${opt.toLowerCase()}` as keyof Question]}
                      {q.correct_answer === opt && <span style={{ marginLeft: 8 }}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))
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
            overflowY: 'auto',
            padding: '2rem',
          }}>
            <div style={{
              width: 500,
              padding: '2rem',
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
            }}>
              <h2 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                添加题目
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: 13 }}>
                    题目标题 *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                    placeholder="例：材料热膨胀性质"
                    required
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: 13 }}>
                    题目内容 *
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 14,
                      boxSizing: 'border-box',
                      minHeight: 80,
                      resize: 'vertical',
                    }}
                    placeholder="详细描述题目要求"
                    required
                  />
                </div>
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <div key={opt} style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: 13 }}>
                      选项 {opt} *
                    </label>
                    <input
                      type="text"
                      value={form[`option_${opt.toLowerCase()}` as keyof typeof form] as string}
                      onChange={(e) => setForm({ ...form, [`option_${opt.toLowerCase()}`]: e.target.value })}
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
                      placeholder={`选项 ${opt} 内容`}
                      required
                    />
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: 13 }}>
                      正确答案 *
                    </label>
                    <select
                      value={form.correct_answer}
                      onChange={(e) => setForm({ ...form, correct_answer: e.target.value })}
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
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: 13 }}>
                      难度
                    </label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: parseInt(e.target.value) })}
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
                      <option value={1}>简单</option>
                      <option value={2}>中等</option>
                      <option value={3}>困难</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: 13 }}>
                      科目
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
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
                      placeholder="如：金属材料"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: 13 }}>
                    题目图片（可选）
                  </label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        color: '#888',
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                    {uploading && (
                      <span style={{ color: '#00c896', fontSize: 13, padding: '10px 0' }}>上传中...</span>
                    )}
                  </div>
                  {form.image_url && (
                    <div style={{ marginTop: 12 }}>
                      <img 
                        src={`${form.image_url}?t=${Date.now()}`}
                        alt="题目图片预览" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: 200, 
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.1)'
                        }} 
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image_url: '' })}
                        style={{
                          display: 'block',
                          marginTop: 8,
                          padding: '6px 12px',
                          background: 'rgba(255,82,82,0.1)',
                          border: '1px solid rgba(255,82,82,0.3)',
                          borderRadius: 6,
                          color: '#ff5252',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        删除图片
                      </button>
                    </div>
                  )}
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
                    创建题目
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
