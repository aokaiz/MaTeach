import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { username, password, role = 'admin' } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      )
    }

    if (username.length < 3 || username.length > 50) {
      return NextResponse.json(
        { error: '用户名长度必须在 3-50 个字符之间' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度不能少于 6 个字符' },
        { status: 400 }
      )
    }

    if (!['admin', 'super_admin'].includes(role)) {
      return NextResponse.json(
        { error: '无效的角色' },
        { status: 400 }
      )
    }

    // 检查用户名是否已存在
    const existing = await pool.query(
      'SELECT id FROM admins WHERE username = $1',
      [username]
    )

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      )
    }

    // 哈希密码
    const passwordHash = await bcrypt.hash(password, 10)

    // 创建管理员
    const result = await pool.query(
      'INSERT INTO admins (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at',
      [username, passwordHash, role]
    )

    return NextResponse.json({
      success: true,
      message: '管理员创建成功',
      admin: result.rows[0]
    })
  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
