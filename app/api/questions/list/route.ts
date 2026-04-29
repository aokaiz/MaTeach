import { NextResponse } from 'next/server'
import pool from '@/lib/db'

// 禁用缓存，确保数据实时更新
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT id, title, content, option_a, option_b, option_c, option_d, correct_answer, difficulty, subject, image_url, created_at FROM questions ORDER BY created_at DESC'
    )

    return NextResponse.json({
      success: true,
      questions: result.rows
    })
  } catch (error) {
    console.error('Get questions error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
