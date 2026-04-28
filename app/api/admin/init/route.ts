import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'

export async function POST() {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json(
        { error: '请在 .env.local 中设置 ADMIN_PASSWORD' },
        { status: 500 }
      )
    }

    // 检查管理员是否已存在
    const checkResult = await pool.query(
      'SELECT * FROM admins WHERE username = $1',
      [adminUsername]
    )

    if (checkResult.rows.length > 0) {
      // 已存在则跳过，不重置密码
      return NextResponse.json({
        success: true,
        message: '管理员账号已存在，跳过创建'
      })
    }

    // 创建新管理员
    const passwordHash = await bcrypt.hash(adminPassword, 10)
    await pool.query(
      'INSERT INTO admins (username, password_hash, role) VALUES ($1, $2, $3)',
      [adminUsername, passwordHash, 'super_admin']
    )

    return NextResponse.json({
      success: true,
      message: '管理员账号创建成功'
    })
  } catch (error) {
    console.error('Init admin error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
