import { NextResponse } from 'next/server'
import { mysqlpool } from '@/utils/db'

// ดึงข้อมูลทั้งหมด
export async function GET() {
  try {
    const promisePool = mysqlpool.promise()
    const [rows] = await promisePool.query('SELECT * FROM billrate')
    return NextResponse.json(rows)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 })
  }
}

// อัปเดตข้อมูล billrate
export async function PUT(req) {
  try {
    const body = await req.json()
    const { billrate_id, water_unit, electric_unit } = body

    const promisePool = mysqlpool.promise()
    const [result] = await promisePool.query(
      'UPDATE billrate SET water_unit = ?, electric_unit = ? WHERE billrate_id = ?',
      [water_unit, electric_unit, billrate_id]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลที่ต้องการอัปเดต' }, { status: 404 })
    }

    return NextResponse.json({ message: 'อัปเดตสำเร็จ' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' }, { status: 500 })
  }
}
