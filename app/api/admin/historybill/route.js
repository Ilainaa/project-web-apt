///app/api/admin/historybill.route.js
import { NextResponse } from 'next/server'
import { mysqlpool } from '@/utils/db'

export async function GET(request) {
    try {
        const url = new URL(request.url)
        const room_num = url.searchParams.get('room_num')
        const status = url.searchParams.get('status') // เพิ่มตัวแปร status

        const promisePool = mysqlpool.promise()
        let query = 'SELECT * FROM historybill'
        let conditions = []
        let params = []

        // ตรวจสอบ query เงื่อนไข
        if (room_num) {
            conditions.push('room_num = ?')
            params.push(room_num)
        }

        if (status) {
            conditions.push('status_bill = ?')
            params.push(status)
        }

        // ถ้ามีเงื่อนไขใด ๆ ให้ต่อ WHERE
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ')
        }

        // เรียงจากใหม่ไปเก่า
        query += ' ORDER BY timestamp DESC'

        const [rows] = await promisePool.query(query, params)
        return NextResponse.json(rows)
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error)
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
            { status: 500 }
        )
    }
}


export async function POST(request) {
    try {
        const billData = await request.json()

        // ตรวจสอบข้อมูลที่จำเป็น
        const requiredFields = ['room_num', 'month_bill', 'year_bill', 'renprice_month', 'water_price',
            'water_unit', 'electricity_price', 'electricity_unit',
            'common_fee', 'late_fee', 'totalprice', 'status_bill'];

        for (const field of requiredFields) {
            if (billData[field] === undefined) {
                return NextResponse.json(
                    { error: `ข้อมูลไม่ครบถ้วน: ไม่พบข้อมูล ${field}` },
                    { status: 400 }
                );
            }
        }

        const promisePool = mysqlpool.promise();

        // หา historybill_id ล่าสุด เพื่อเพิ่มค่าต่อ
        const [lastIdResult] = await promisePool.query(
            'SELECT historybill_id FROM historybill ORDER BY historybill_id DESC LIMIT 1'
        );

        let nextId = 1;
        if (lastIdResult.length > 0) {
            nextId = lastIdResult[0].historybill_id + 1;
        }

        // อัพเดทสถานะบิลของห้องพัก
        await promisePool.query(
            'UPDATE room SET status_bill = ? WHERE room_num = ?',
            [billData.status_bill, billData.room_num]
        );

        // เพิ่มข้อมูลบิลใหม่
        const query = `
            INSERT INTO historybill (
                historybill_id, room_num, month_bill,year_bill, renprice_month, 
                water_price, water_unit, electricity_price, electricity_unit,
                common_fee, late_fee, totalprice, status_bill, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            nextId,
            billData.room_num,
            billData.month_bill,
            billData.year_bill,
            billData.renprice_month,
            billData.water_price,
            billData.water_unit,
            billData.electricity_price,
            billData.electricity_unit,
            billData.common_fee,
            billData.late_fee,
            billData.totalprice,
            billData.status_bill,
            billData.timestamp || new Date().toISOString()
        ];

        const [result] = await promisePool.query(query, params);

        // คืนค่าข้อมูลบิลที่เพิ่มพร้อมกับ ID ใหม่
        return NextResponse.json({
            ...billData,
            historybill_id: nextId,
            message: 'บันทึกข้อมูลสำเร็จ'
        });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const billData = await request.json()

        // ตรวจสอบว่ามี historybill_id
        if (!billData.historybill_id) {
            return NextResponse.json(
                { error: 'ไม่พบ historybill_id' },
                { status: 400 }
            );
        }

        const promisePool = mysqlpool.promise();

        // สร้าง query สำหรับการอัพเดท
        let updateFields = [];
        let params = [];

        // ตรวจสอบฟิลด์ที่จะอัพเดท
        const updateableFields = [
            'room_num', 'month_bill', 'year_bill', 'renprice_month',
            'water_price', 'water_unit', 'electricity_price',
            'electricity_unit', 'common_fee', 'late_fee',
            'totalprice', 'status_bill'
        ];

        updateableFields.forEach(field => {
            if (billData[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                params.push(billData[field]);
            }
        });

        // เพิ่ม timestamp ล่าสุด
        updateFields.push('timestamp = ?');
        params.push(billData.timestamp || new Date().toISOString());

        // เพิ่ม historybill_id ที่ต้องการอัพเดท
        params.push(billData.historybill_id);

        const query = `
            UPDATE historybill 
            SET ${updateFields.join(', ')} 
            WHERE historybill_id = ?
        `;

        const [result] = await promisePool.query(query, params);

        // ถ้ามีการอัพเดทสถานะบิล และมีเลขห้อง
        // ถ้ามีการอัพเดทสถานะบิล และมีเลขห้อง
        if (billData.status_bill && billData.room_num) {
            // อัพเดทสถานะบิลของห้องพัก
            await promisePool.query(
                'UPDATE room SET status_bill = ? WHERE room_num = ?',
                [billData.status_bill, billData.room_num]
            );
        }

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { error: 'ไม่พบข้อมูลที่ต้องการอัพเดท' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ...billData,
            message: 'อัพเดทข้อมูลสำเร็จ'
        });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอัพเดทข้อมูล:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล' },
            { status: 500 }
        );
    }
}