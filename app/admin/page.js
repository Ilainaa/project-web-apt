'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import './admin.css'

export default function Page() {
  const router = useRouter()
  const [activeBox, setActiveBox] = useState('page1')
  const [roomData, setRoomData] = useState([])

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

  const pageContent = {
    page1: <div className="box">หน้าหลัก</div>,
    page2: /*(
      <div>
        <h2>ข้อมูลห้องพัก</h2>
        <ul>
          {roomData.map((room) => (
            <li key={room.room_id}>
              ห้อง : {room.room_num} | สถานะห้อง : {room.status_room} | สถานะบิล : {room.status_bill} | ราคา : {room.renprice_month} | บาท/เดือน  เวลา : {room.timestamp}
            </li>
          ))}
        </ul>
      </div>
    )*/
      (
      <div>
      <h2>ข้อมูลห้องพัก</h2>
      <div className="boxroom">room1</div>
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
