// app/api/admin/room/route.js
import { NextResponse } from 'next/server'
import { mysqlpool } from '@/utils/db'

export async function GET() {
  try {
    const promisePool = mysqlpool.promise()
    const [rows] = await promisePool.query('SELECT * FROM room') // ดึงข้อมูลจาก table "room"
    return NextResponse.json(rows)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { room_id, renprice_month, deposit, description, status_room } = await request.json()
    
    const promisePool = mysqlpool.promise()
    
    await promisePool.query(
      'UPDATE room SET renprice_month = ?, deposit = ?, description = ?, status_room = ? WHERE room_id = ?',
      [renprice_month, deposit, description, status_room, room_id]
    )
    
    return NextResponse.json({ message: 'อัพเดทข้อมูลสำเร็จ' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล' }, { status: 500 })
  }
}