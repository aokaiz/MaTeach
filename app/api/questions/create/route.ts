import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { title, content, option_a, option_b, option_c, option_d, correct_answer, difficulty = 1, subject, image_url } = await request.json()

    if (!title || !content || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    if (!['A', 'B', 'C', 'D'].includes(correct_answer.toUpperCase())) {
      return NextResponse.json(
        { error: '正确答案必须是 A、B、C 或 D' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `INSERT INTO questions (title, content, option_a, option_b, option_c, option_d, correct_answer, difficulty, subject, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, title, content, option_a, option_b, option_c, option_d, correct_answer, difficulty, subject, image_url, created_at`,
      [title, content, option_a, option_b, option_c, option_d, correct_answer.toUpperCase(), difficulty, subject, image_url || null]
    )

    return NextResponse.json({
      success: true,
      message: '题目创建成功',
      question: result.rows[0]
    })
  } catch (error) {
    console.error('Create question error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
