//app/page.js
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import './globals.css'
import './main.css'
import TenantInfo from './components/TenantInfo' // ✅ นำเข้า component ที่แยกไว้
// ถ้า utils ยังต้องใช้ในหน้านี้ ให้ import แบบนี้:
// import { getLastDayOfMonth, getNextMonthThai, getNextMonthYear } from '@/utils/dateUtils'

export default function Page() {
  const [activePage, setActivePage] = useState('page1')
  const [activeBox, setActiveBox] = useState('info')
  const [newsImageIndex, setNewsImageIndex] = useState(0)
  const [busImageIndex, setBusImageIndex] = useState(0)
  const router = useRouter()

  

  const newsImages = [
    '/image/apt1.jpg',
    '/image/apt2.jpg',
    '/image/apt3.jpg'
  ]

  const busImages = ['/image/bustable.jpg']

  const handlePrevImage = () => {
    setNewsImageIndex((prevIndex) =>
      prevIndex === 0 ? newsImages.length - 1 : prevIndex - 1
    )
  }

  const handleNextImage = () => {
    setNewsImageIndex((prevIndex) =>
      prevIndex === newsImages.length - 1 ? 0 : prevIndex + 1
    )
  }

  const handleClick = (page) => {
    setActivePage(page)
  }

  const handleLogout = () => {
    router.push('/login')
  }

  const pageContent = {
    page1: (
      <>
        <div style={{ display: 'flex', gap: '100px', justifyContent: 'center', marginTop: '-50px' }}>
          <div
            className={`boxmain ${activeBox === 'info' ? 'active-boxmain' : ''}`}
            onClick={() => setActiveBox('info')}
          >
            ข้อมูลข่าวสาร
          </div>
          <div
            className={`boxmain ${activeBox === 'bus' ? 'active-boxmain' : ''}`}
            onClick={() => setActiveBox('bus')}
          >
            ตารางเวลารถ
          </div>
        </div>


        {activeBox === 'info' && (
          <div style={{ display: 'flex', gap: '50px', marginTop: '100px', marginLeft: '90px', alignItems: 'flex-start' }}>
            <div className="carousel-wrapper">
              <div className="image-carousel" style={{ width: '100%', maxWidth: '600px', height: '100%', maxHeight: '500px' }}>
                <button className="carousel-btn left" onClick={handlePrevImage}>⟨</button>
                <img src={newsImages[newsImageIndex]} alt="news" className="carousel-image" />
                <button className="carousel-btn right" onClick={handleNextImage}>⟩</button>
              </div>
            </div>
            <div className="boxdata">
              <h3>📰 ข้อมูลข่าวสาร</h3>
              <p>ประกาศเกี่ยวกับอพาร์ตเมนต์ วันนี้อากาศดีเหมาะแก่การพักผ่อน🤣</p>
            </div>
          </div>
        )}

        {activeBox === 'bus' && (
          <div style={{ display: 'flex', gap: '30px', marginTop: '30px', alignItems: 'flex-start' }}>
            <div className="carousel-wrapper" style={{ width: '100%', maxWidth: '600px', height: '50%', maxHeight: '500px' }}>
              <img src={busImages[busImageIndex]} alt="bus schedule" className="carousel-image" />
            </div>
            <div className="boxdata" style={{ width: '100%', maxWidth: '600px', height: '50%', maxHeight: '500px' }}>
              <h3>🚐 ตารางรถตู้หอพัก - มหาวิทยาลัย</h3>
              <p>
                <strong>ลำดับ เวลาออกจากหอพัก - เวลาเดินทางถึงมหาวิทยาลัย - หมายเลขรถ - หมายเหตุ</strong><br />
                1. 07:00 น. - 07:30 น. - 001 - รอบแรกของวัน<br />
                2. 08:00 น. - 08:30 น. - 002<br />
                3. 09:00 น. - 09:30 น. - 003<br />
                4. 10:00 น. - 10:30 น. - 004<br />
                5. 11:00 น. - 11:30 น. - 005<br />
                6. 12:00 น. - 12:30 น. - 006<br />
                7. 13:00 น. - 13:30 น. - 007<br />
                8. 14:00 น. - 14:30 น. - 008<br />
                9. 15:00 น. - 15:30 น. - 009<br />
                10. 16:00 น. - 16:30 น. - 010 - รอบสุดท้าย
              </p>
            </div>
          </div>
        )}
      </>
    ),

    page2: (
      <>
        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', marginTop: '-60px' }}>
          <div className="boxx hoverable-boxx" style={{ marginBottom: '20px' }}>
            ข้อมูลห้องพัก
          </div>

          <div style={{ width: '50%', maxWidth: '600px', height: '50%', maxHeight: '500px' }}>
            <TenantInfo />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <video autoPlay muted loop className="video-background">
        <source src="/video/bgmain.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="overlay-content">
        <div
          className="menubarmain"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '96%',
            zIndex: 1000, // ให้ลอยเหนือ element อื่น ๆ
          }}
        >

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src="/image/logosunmoon.png" alt="logo" style={{ height: '40px' }} />
            <div className="brand-name">Sunmoon apartment</div>
            <div className={`menumain-tab ${activePage === 'page1' ? 'active' : ''}`} onClick={() => handleClick('page1')}>
              หน้าหลัก
            </div>
            <div className={`menumain-tab ${activePage === 'page2' ? 'active' : ''}`} onClick={() => handleClick('page2')}>
              ห้องของคุณ
            </div>
          </div>

          <div className="logoutmain-btn" onClick={handleLogout}>
            ออกจากระบบ
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(90vh - 60px)',
            padding: '30px',
            paddingTop: '100px',
          }}
        >
          <div
            style={{
              width: '80%',
              minHeight: '500px',
              padding: '20px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              paddingTop: '20px', 
            }}
          >
            {pageContent[activePage]}
          </div>
        </div>
      </div>
    </>
  )
}
