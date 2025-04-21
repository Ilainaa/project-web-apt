////api/main/room/[room]
import { NextResponse } from 'next/server'
import { mysqlpool } from '@/utils/db'

export async function PUT(request, { params }) {
  const { room_num } = params;
  const { status_bill } = await request.json();

  try {
    await mysqlpool.promise().query(
      'UPDATE room SET status_bill = ? WHERE room_num = ?',
      [status_bill, room_num]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทสถานะห้อง' }, 
      { status: 500 }
    );
  }
}