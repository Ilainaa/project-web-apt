//api/main/history/route.js
import { NextResponse } from 'next/server'
import { mysqlpool } from '@/utils/db'

export async function GET() {
  try {
    const [rows] = await mysqlpool.promise().query('SELECT * FROM historybill')
    return NextResponse.json(rows)
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติบิล' }, { status: 500 })
  }
}


