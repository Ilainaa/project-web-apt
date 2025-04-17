// app/api/admin/route.js
import { NextResponse } from 'next/server'
import { mysqlpool } from '@/utils/db'

export async function GET() {
  try {
    const promisePool = mysqlpool.promise()
    const [rows] = await promisePool.query('SELECT * FROM user') // ดึงข้อมูลจาก table "room"
    return NextResponse.json(rows)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 })
  }
}
