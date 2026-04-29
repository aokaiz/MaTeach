import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { existsSync, unlinkSync } from 'fs'
import path from 'path'

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

    // 1. 先查询题目，获取图片路径
    const result = await pool.query(
      'SELECT image_url FROM questions WHERE id = $1',
      [id]
    )

    // 2. 如果有图片，删除文件
    if (result.rows.length > 0) {
      const imageUrl = result.rows[0].image_url
      if (imageUrl) {
        const filename = imageUrl.split('/').pop()
        const filepath = path.join(process.cwd(), 'public', 'uploads', 'questions', filename!)
        if (existsSync(filepath)) {
          unlinkSync(filepath)
        }
      }
    }

    // 3. 删除数据库记录
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
