import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query('SELECT NOW() AS db_time, version() AS db_version')
    return NextResponse.json({
      message: 'Mat - Materials Science AI Q&A System',
      db_time: result.rows[0].db_time,
      db_version: result.rows[0].db_version,
      status: 'PostgreSQL connected ✅',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message, status: 'DB connection failed ❌' }, { status: 500 })
  }
}
