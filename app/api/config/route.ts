import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

const ALLOWED_KEYS = ['ai_base_url', 'ai_api_key', 'ai_model', 'ai_enabled']

// 验证超级管理员权限
async function verifySuperAdmin(request: Request): Promise<boolean> {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return false
    }

    // 从请求头获取管理员凭据
    const credentials = Buffer.from(authHeader.replace('Basic ', ''), 'base64').toString()
    const [username, password] = credentials.split(':')

    if (!username || !password) {
      return false
    }

    // 查询管理员
    const result = await pool.query(
      'SELECT * FROM admins WHERE username = $1 AND role = $2',
      [username, 'super_admin']
    )

    if (result.rows.length === 0) {
      return false
    }

    const admin = result.rows[0]
    return await bcrypt.compare(password, admin.password_hash)
  } catch {
    return false
  }
}

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT config_key, config_value, description FROM system_config ORDER BY id'
    )

    const config: Record<string, string> = {}
    result.rows.forEach(row => {
      config[row.config_key] = row.config_value
    })

    return NextResponse.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('Get config error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    // 验证超级管理员权限
    const isSuperAdmin = await verifySuperAdmin(request)
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: '只有超级管理员才能修改配置' },
        { status: 403 }
      )
    }

    const { key, value } = await request.json()

    if (!key) {
      return NextResponse.json(
        { error: '配置键不能为空' },
        { status: 400 }
      )
    }

    if (!ALLOWED_KEYS.includes(key)) {
      return NextResponse.json(
        { error: '不允许修改该配置项' },
        { status: 403 }
      )
    }

    await pool.query(
      `UPDATE system_config SET config_value = $1, updated_at = NOW() WHERE config_key = $2`,
      [value, key]
    )

    return NextResponse.json({
      success: true,
      message: '配置更新成功'
    })
  } catch (error) {
    console.error('Update config error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // 验证超级管理员权限
    const isSuperAdmin = await verifySuperAdmin(request)
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: '只有超级管理员才能修改配置' },
        { status: 403 }
      )
    }

    const updates = await request.json()

    for (const [key, value] of Object.entries(updates)) {
      if (ALLOWED_KEYS.includes(key)) {
        await pool.query(
          `UPDATE system_config SET config_value = $1, updated_at = NOW() WHERE config_key = $2`,
          [value as string, key]
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: '配置更新成功'
    })
  } catch (error) {
    console.error('Update config error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
