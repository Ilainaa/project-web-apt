// app/api/admin/user/route.js
import { NextResponse } from 'next/server'
import { mysqlpool } from '@/utils/db'

export async function GET() {
  try {
    const promisePool = mysqlpool.promise()
    const [rows] = await promisePool.query('SELECT * FROM user')
    return NextResponse.json(rows)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const data = await request.json()
    const { user_id, citizen_id, firstname, lastname, phonenumber } = data
    
    // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วนหรือไม่
    if (!user_id) {
      return NextResponse.json({ message: 'ไม่พบ user_id' }, { status: 400 })
    }
    
    const promisePool = mysqlpool.promise()
    
    // อัพเดทข้อมูลในฐานข้อมูล
    await promisePool.query(
      'UPDATE user SET citizen_id = ?, firstname = ?, lastname = ?, phonenumber = ? WHERE user_id = ?',
      [citizen_id, firstname, lastname, phonenumber, user_id]
    )
    
    return NextResponse.json({ message: 'อัพเดทข้อมูลสำเร็จ' })
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัพเดทข้อมูล:', error)
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล' }, { status: 500 })
  }
}