'use client'

import { useEffect, useState } from 'react'

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
}

interface AIEvaluation {
  evaluation: string | null
  isCorrect: boolean
  loading: boolean
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [aiEvaluation, setAiEvaluation] = useState<AIEvaluation>({ evaluation: null, isCorrect: false, loading: false })

  useEffect(() => {
    fetchQuestions()
  }, [])

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
        const shuffled = [...data.questions].sort(() => Math.random() - 0.5)
        setQuestions(shuffled)
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAIEvaluation = async (question: Question, studentAnswer: string) => {
    setAiEvaluation({ evaluation: null, isCorrect: false, loading: true })
    
    try {
      const res = await fetch('/api/ai/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: question.id,
          question_title: question.title,
          question_content: question.content,
          question_options: {
            A: question.option_a,
            B: question.option_b,
            C: question.option_c,
            D: question.option_d
          },
          correct_answer: question.correct_answer,
          student_answer: studentAnswer
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setAiEvaluation({
          evaluation: data.evaluation,
          isCorrect: data.isCorrect,
          loading: false
        })
      } else {
        setAiEvaluation({ evaluation: null, isCorrect: false, loading: false })
      }
    } catch (err) {
      console.error('AI evaluation error:', err)
      setAiEvaluation({ evaluation: null, isCorrect: false, loading: false })
    }
  }

  const handleAnswer = (answer: string) => {
    if (answered) return
    setSelectedAnswer(answer)
    setAnswered(true)
    setAiEvaluation({ evaluation: null, isCorrect: false, loading: false })
    
    if (answer === questions[currentIndex].correct_answer) {
      setScore(prev => prev + 1)
    }
    setShowResult(true)
    
    // 获取 AI 评价
    fetchAIEvaluation(questions[currentIndex], answer)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setAnswered(false)
      setAiEvaluation({ evaluation: null, isCorrect: false, loading: false })
    } else {
      setQuizStarted(false)
    }
  }

  const restartQuiz = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    setQuestions(shuffled)
    setCurrentIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setAnswered(false)
    setAiEvaluation({ evaluation: null, isCorrect: false, loading: false })
    setQuizStarted(true)
  }

  const difficultyLabels = { 1: '简单', 2: '中等', 3: '困难' }
  const difficultyColors = { 1: '#00c896', 2: '#ffc800', 3: '#ff5252' }

  // 未开始
  if (!quizStarted) {
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
          backgroundImage: 'linear-gradient(rgba(0,200,150,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,150,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 500, width: '100%', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            color: '#fff',
            marginBottom: '1rem',
          }}>
            材料科学<span style={{ color: '#00c896' }}>答题系统</span>
          </h1>
          <p style={{ color: '#888', fontSize: 16, marginBottom: '2rem' }}>
            {loading ? '加载中...' : `共 ${questions.length} 道选择题`}
          </p>
          
          {loading ? (
            <p style={{ color: '#666' }}>加载题目中...</p>
          ) : questions.length === 0 ? (
            <div>
              <p style={{ color: '#ffc800', marginBottom: '1rem' }}>暂无题目</p>
              <a
                href="/admin/login"
                style={{
                  padding: '12px 24px',
                  background: 'rgba(0,200,150,0.15)',
                  border: '1px solid rgba(0,200,150,0.3)',
                  borderRadius: 8,
                  color: '#00c896',
                  fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                去添加题目
              </a>
            </div>
          ) : (
            <button
              onClick={() => setQuizStarted(true)}
              style={{
                padding: '16px 48px',
                background: 'rgba(0,200,150,0.15)',
                border: '1px solid rgba(0,200,150,0.3)',
                borderRadius: 8,
                color: '#00c896',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: 2,
              }}
            >
              开始答题
            </button>
          )}
          
          <div style={{ marginTop: '2rem' }}>
            <a
              href="/"
              style={{
                color: '#666',
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              返回首页
            </a>
          </div>
        </div>
      </main>
    )
  }

  // 答题结束
  if (currentIndex >= questions.length) {
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
          maxWidth: 400,
          padding: '2rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          textAlign: 'center',
        }}>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>答题完成!</h2>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#00c896', marginBottom: '0.5rem' }}>
            {score} / {questions.length}
          </div>
          <p style={{ color: '#888', marginBottom: '2rem' }}>
            正确率 {Math.round((score / questions.length) * 100)}%
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={restartQuiz}
              style={{
                padding: '12px 24px',
                background: 'rgba(0,200,150,0.15)',
                border: '1px solid rgba(0,200,150,0.3)',
                borderRadius: 8,
                color: '#00c896',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              再来一次
            </button>
            <a
              href="/"
              style={{
                padding: '12px 24px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#888',
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              返回首页
            </a>
          </div>
        </div>
      </main>
    )
  }

  const currentQ = questions[currentIndex]

  return (
    <main style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0f1a 100%)',
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Progress */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}>
          <a
            href="/"
            style={{
              color: '#888',
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            ← 返回
          </a>
          <span style={{ color: '#888', fontSize: 14 }}>
            第 {currentIndex + 1} / {questions.length} 题
          </span>
          <span style={{
            padding: '4px 12px',
            background: 'rgba(0,200,150,0.15)',
            borderRadius: 4,
            color: difficultyColors[currentQ.difficulty as keyof typeof difficultyColors],
            fontSize: 12,
          }}>
            {difficultyLabels[currentQ.difficulty as keyof typeof difficultyLabels]}
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: 4,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 2,
          marginBottom: '2rem',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
            background: '#00c896',
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* Score */}
        <div style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}>
          <span style={{
            padding: '6px 16px',
            background: 'rgba(255,200,0,0.1)',
            borderRadius: 20,
            color: '#ffc800',
            fontSize: 14,
            fontWeight: 600,
          }}>
            当前得分: {score}
          </span>
        </div>

        {/* Question Card */}
        <div style={{
          padding: '2rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            {currentQ.title}
          </h2>
          {currentQ.image_url && (
            <img 
              src={currentQ.image_url} 
              alt="题目图片" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: 300, 
                borderRadius: 8, 
                marginBottom: '1rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }} 
            />
          )}
          <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>
            {currentQ.content}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['A', 'B', 'C', 'D'].map((opt) => {
            const optionKey = `option_${opt.toLowerCase()}` as keyof Question
            const isSelected = selectedAnswer === opt
            const isCorrect = showResult && opt === currentQ.correct_answer
            const isWrong = showResult && isSelected && opt !== currentQ.correct_answer
            
            let bg = 'rgba(255,255,255,0.03)'
            let border = 'rgba(255,255,255,0.1)'
            let color = '#fff'
            
            if (isCorrect) {
              bg = 'rgba(0,200,150,0.15)'
              border = 'rgba(0,200,150,0.4)'
              color = '#00c896'
            } else if (isWrong) {
              bg = 'rgba(255,82,82,0.15)'
              border = 'rgba(255,82,82,0.4)'
              color = '#ff5252'
            } else if (isSelected) {
              bg = 'rgba(255,200,0,0.1)'
              border = 'rgba(255,200,0,0.3)'
            }

            return (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={answered}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '1rem 1.5rem',
                  background: bg,
                  border: `1px solid ${border}`,
                  borderRadius: 12,
                  cursor: answered ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  opacity: answered && !isCorrect && !isSelected ? 0.5 : 1,
                }}
              >
                <span style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: border,
                  borderRadius: 8,
                  color: color,
                  fontWeight: 600,
                  fontSize: 14,
                }}>
                  {opt}
                </span>
                <span style={{ color, fontSize: 15, flex: 1 }}>
                  {currentQ[optionKey]}
                </span>
                {isCorrect && <span style={{ color: '#00c896' }}>✓</span>}
                {isWrong && <span style={{ color: '#ff5252' }}>✗</span>}
              </button>
            )
          })}
        </div>

        {/* Result & Next */}
        {showResult && (
          <div style={{ marginTop: '1.5rem' }}>
            {/* AI Evaluation Card */}
            {(aiEvaluation.loading || aiEvaluation.evaluation) && (
              <div style={{
                padding: '1.25rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(0,200,150,0.15)',
                borderRadius: 12,
                marginBottom: '1rem',
                textAlign: 'left',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: '0.75rem',
                }}>
                  <span style={{ fontSize: 16 }}>🤖</span>
                  <span style={{ color: '#00c896', fontSize: 13, fontWeight: 600 }}>AI 评价</span>
                  {aiEvaluation.loading && (
                    <span style={{ color: '#666', fontSize: 12 }}>生成中...</span>
                  )}
                </div>
                {aiEvaluation.loading ? (
                  <div style={{
                    color: '#666',
                    fontSize: 13,
                    fontStyle: 'italic',
                  }}>
                    正在生成个性化评价...
                  </div>
                ) : (
                  <p style={{
                    color: '#ccc',
                    fontSize: 14,
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {aiEvaluation.evaluation}
                  </p>
                )}
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <p style={{
                color: selectedAnswer === currentQ.correct_answer ? '#00c896' : '#ff5252',
                fontSize: 16,
                fontWeight: 600,
                marginBottom: '1rem',
              }}>
                {selectedAnswer === currentQ.correct_answer ? '回答正确! 🎉' : '回答错误'}
              </p>
              <button
                onClick={handleNext}
                style={{
                  padding: '12px 32px',
                  background: 'rgba(0,200,150,0.15)',
                  border: '1px solid rgba(0,200,150,0.3)',
                  borderRadius: 8,
                  color: '#00c896',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {currentIndex < questions.length - 1 ? '下一题 →' : '查看结果'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
