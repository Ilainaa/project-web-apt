'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import './admin.css'
import { red } from '@mui/material/colors'

export default function Page() {
  const router = useRouter()
  const [activeBox, setActiveBox] = useState('page1')
  const [roomData, setRoomData] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')


  const handleLogout = () => {
    router.push('/login')
  }

  const handleClick = async (pageName) => {
    setActiveBox(pageName)
    if (pageName === 'page2') {
      try {
        const res = await fetch('/api/admin/room')
        const data = await res.json()
        setRoomData(data)
      } catch (err) {
        console.error('โหลดข้อมูลห้องพักล้มเหลว:', err)
      }
    }
  }

  const handleRoomClick = (roomId) => {
    setActiveBox(`page2_1_${roomId}`)
  }


  const pageContent = {
    page1: <div className="box">หน้าหลัก</div>,
    page2: (
      <div>
        <h2>ข้อมูลห้องพัก</h2>
        <p style={{ color: 'red' }}>* ค้างชำระ :</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {roomData.map((room) => {
            let bgColor = 'white'

            if (room.status_room === 'ว่าง') {
              bgColor = 'gray'
            } else if (room.status_bill === 'ยังไม่ชำละ') {
              bgColor = 'red'
            } else if (room.status_bill === 'ชำละแล้ว') {
              bgColor = 'rgb(33, 232, 49)'
            }

            return (
              <div
                key={room.room_id}
                className="boxroom"
                style={{
                  backgroundColor: bgColor,
                  color: 'white',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveBox(`page2_1_${room.room_id}`)}
              >
                ROOM{room.room_num}
              </div>
            )
          })}
        </div>
      </div>
    ),

    page3: 'ข้อมูลผู้ที่ยังไม่ชำระเงิน',
    page4: 'ข้อมูลผู้ที่ชำระเงินแล้ว',
    page5: 'รอย้ายออก',
    page6: 'ย้ายออกแล้ว',
    page7: 'จัดการห้องพัก',
    page8: 'จัดการข้อมูลผู้เช่า',
    page9: 'จักการเรทค่าน้ำ/ไฟ',
  }

  if (activeBox.startsWith('page2_1_')) {
    const roomId = parseInt(activeBox.split('_')[2])
    const room = roomData.find((r) => r.room_id === roomId)

    if (room) {
      pageContent[activeBox] = (
        <div>
          <h1>ฟอร์มออกบิลค่าเช่า</h1>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '10px' }}>เลขห้อง :</label>
            <input
              className="boxtext"
              type="text"
              value={room.room_num}
              onChange={(e) => {

              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '10px' }}>เลือกรอบบิล :</label>
            <select
              className="boxtexts"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="มกราคม">มกราคม</option>
              <option value="กุมภาพันธ์">กุมภาพันธ์</option>
              <option value="มีนาคม">มีนาคม</option>
              <option value="เมษายน">เมษายน</option>
              <option value="พฤษภาคม">พฤษภาคม</option>
              <option value="มิถุนายน">มิถุนายน</option>
              <option value="กรกฎาคม">กรกฎาคม</option>
              <option value="สิงหาคม">สิงหาคม</option>
              <option value="กันยายน">กันยายน</option>
              <option value="ตุลาคม">ตุลาคม</option>
              <option value="พฤศจิกายน">พฤศจิกายน</option>
              <option value="ธันวาคม">ธันวาคม</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '10px' }}>ค่าเช่าห้อง :</label>
            <input
              className="boxtext"
              type="text"
              value={room.renprice_month}
              onChange={(e) => {

              }}
            />
          </div>
          <p>เวลาบันทึก: {new Date(room.timestamp).toLocaleString()}</p>
          <button onClick={() => setActiveBox('page2')}>ย้อนกลับ</button>
        </div>
      )
    } else {
      pageContent[activeBox] = <p>ไม่พบข้อมูลห้อง</p>
    }
  }


  return (
    <>
      <div className="menubar">
        <div>Sunmoon apartment</div>
        <div className="logout-btn" onClick={handleLogout}>ออกจากระบบ</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', height: '90vh' }}>
        <div style={{ width: '250px', background: '#f4f4f4', padding: '10px' }}>
          {['page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'page7', 'page8', 'page9'].map((page) => (
            <div
              key={page}
              className="box"
              style={{ backgroundColor: activeBox === page ? 'yellow' : 'white' }}
              onClick={() => handleClick(page)}
            >
              {{
                page1: 'หน้าหลัก',
                page2: 'รายการห้องพัก',
                page3: 'รายการรอชำระ',
                page4: 'รายการชำระแล้ว',
                page5: 'รอย้ายออก',
                page6: 'ย้ายออกแล้ว',
                page7: 'จัดการห้องพัก',
                page8: 'จัดการข้อมูลผู้เช่า',
                page9: 'จักการเรทค่าน้ำ/ไฟ'
              }[page]}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', padding: '20px' }}>
          <div className="boxoutput" style={{ width: '100%', height: '95%', padding: '20px', display: 'block' }}>
            {pageContent[activeBox]}
          </div>
        </div>
      </div>
    </>
  )
}
