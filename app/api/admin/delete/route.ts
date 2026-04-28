import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '管理员 ID 不能为空' },
        { status: 400 }
      )
    }

    // 检查是否是最后一个管理员
    const countResult = await pool.query('SELECT COUNT(*) FROM admins')
    if (parseInt(countResult.rows[0].count) <= 1) {
      return NextResponse.json(
        { error: '不能删除最后一个管理员' },
        { status: 400 }
      )
    }

    // 检查要删除的是否是超级管理员
    const adminResult = await pool.query(
      'SELECT role FROM admins WHERE id = $1',
      [id]
    )

    if (adminResult.rows.length === 0) {
      return NextResponse.json(
        { error: '管理员不存在' },
        { status: 404 }
      )
    }

    // 获取所有超级管理员数量
    const superAdminCount = await pool.query(
      "SELECT COUNT(*) FROM admins WHERE role = 'super_admin'"
    )

    // 如果要删除的是超级管理员，且只剩一个，不能删除
    if (adminResult.rows[0].role === 'super_admin' && parseInt(superAdminCount.rows[0].count) <= 1) {
      return NextResponse.json(
        { error: '不能删除最后一个超级管理员' },
        { status: 400 }
      )
    }

    // 删除管理员
    await pool.query('DELETE FROM admins WHERE id = $1', [id])

    return NextResponse.json({
      success: true,
      message: '管理员删除成功'
    })
  } catch (error) {
    console.error('Delete admin error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
