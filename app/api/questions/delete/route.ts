import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '题目 ID 不能为空' },
        { status: 400 }
      )
    }

    await pool.query('DELETE FROM questions WHERE id = $1', [id])

    return NextResponse.json({
      success: true,
      message: '题目删除成功'
    })
  } catch (error) {
    console.error('Delete question error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
