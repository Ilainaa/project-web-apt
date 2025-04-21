// api/main/historybill/[historybill_id]/route.js
import { NextResponse } from 'next/server'
import { mysqlpool } from '@/utils/db'

export async function PUT(request, { params }) {
  const { historybill_id } = params;
  const { status_bill, common_fee, late_fee } = await request.json();

  try {
    // ตรวจสอบว่ามีการส่งค่า common_fee และ late_fee มาด้วยหรือไม่
    if (common_fee !== undefined && late_fee !== undefined) {
      await mysqlpool.promise().query(
        'UPDATE historybill SET status_bill = ?, common_fee = ?, late_fee = ? WHERE historybill_id = ?',
        [status_bill, common_fee, late_fee, historybill_id]
      );
    } else {
      await mysqlpool.promise().query(
        'UPDATE historybill SET status_bill = ? WHERE historybill_id = ?',
        [status_bill, historybill_id]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทสถานะบิล' }, 
      { status: 500 }
    );
  }
}