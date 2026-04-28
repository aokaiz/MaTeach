import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { adminId, newPassword } = await request.json()

    if (!adminId || !newPassword) {
      return NextResponse.json(
        { error: '管理员ID和新密码不能为空' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '密码长度不能少于 6 个字符' },
        { status: 400 }
      )
    }

    // 哈希新密码
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // 更新密码
    await pool.query(
      'UPDATE admins SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, adminId]
    )

    return NextResponse.json({
      success: true,
      message: '密码修改成功'
    })
  } catch (error) {
    console.error('Update password error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
