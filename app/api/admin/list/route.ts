import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentRole = searchParams.get('currentRole')

    // 普通管理员只能看到自己的信息（不含密码哈希）
    if (currentRole !== 'super_admin') {
      const result = await pool.query(
        'SELECT id, username, role, created_at, updated_at FROM admins WHERE role != $1',
        ['super_admin']
      )
      return NextResponse.json({
        success: true,
        admins: result.rows,
        isSuperAdmin: false
      })
    }

    // 超级管理员可以看到所有信息，包括密码哈希
    const result = await pool.query(
      'SELECT id, username, password_hash, role, created_at, updated_at FROM admins ORDER BY created_at ASC'
    )

    return NextResponse.json({
      success: true,
      admins: result.rows,
      isSuperAdmin: true
    })
  } catch (error) {
    console.error('Get admins error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
