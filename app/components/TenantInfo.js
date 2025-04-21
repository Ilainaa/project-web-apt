"use client"
import { useEffect, useState } from "react"
import { getLastDayOfMonth, getNextMonthThai, getNextMonthYear } from "@/utils/dateUtils" // ปรับตาม path ที่คุณเก็บ utils

export default function TenantInfo() {
  const [user, setUser] = useState(null)
  const [room, setRoom] = useState(null)
  const [bill, setBill] = useState(null)

  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingRoom, setLoadingRoom] = useState(true)
  const [loadingBill, setLoadingBill] = useState(true)

  const handlePayment = () => {
    if (confirm("ยืนยันการชำระเงิน?")) {
      updatePaymentStatus()
    }
  }

  const updatePaymentStatus = async () => {
    try {
      const updateRoomRes = await fetch(`/api/main/room/${room.room_num}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_bill: "ชำระแล้ว" })
      })

      const updateBillRes = await fetch(`/api/main/historybill/${bill.historybill_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status_bill: "ชำระแล้ว",
          common_fee: 0,
          late_fee: 0
        })
      })

      if (updateRoomRes.ok && updateBillRes.ok) {
        alert("ชำระเงินเรียบร้อยแล้ว")
        window.location.reload()
      } else {
        throw new Error("ไม่สามารถอัพเดทสถานะการชำระเงินได้")
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัพเดทสถานะ:", error)
      alert("เกิดข้อผิดพลาดในการชำระเงิน: " + error.message)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const username = localStorage.getItem('username')
        if (!username) return

        const resUser = await fetch('/api/main/user')
        const users = await resUser.json()
        const thisUser = users.find(u => u.username === username)
        setUser(thisUser)
        setLoadingUser(false)

        if (!thisUser) return

        const roomNum = thisUser.room_num

        const resRoom = await fetch('/api/main/room')
        const rooms = await resRoom.json()
        const thisRoom = rooms.find(r => r.room_num === roomNum)
        setRoom(thisRoom)
        setLoadingRoom(false)

        const resBill = await fetch('/api/main/historybill')
        const bills = await resBill.json()
        const latestBill = bills
          .filter(b => b.room_num === roomNum)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
        setBill(latestBill)
        setLoadingBill(false)
      } catch (err) {
        console.error("โหลดข้อมูลผู้เช่าล้มเหลว:", err)
        setLoadingUser(false)
        setLoadingRoom(false)
        setLoadingBill(false)
      }
    }

    fetchData()
  }, [])

  if (loadingUser || loadingRoom || loadingBill) return <p>กำลังโหลดข้อมูล...</p>
  if (!user || !room || !bill) return <p>ไม่พบข้อมูลผู้เช่า</p>

  return (
    <div className="tenant-container">
      <div className="tenant-info">
        <div className="room-header">
          <h2>ห้อง {room?.room_num}</h2>
          <div className={`status-badge ${room.status_bill === "ชำระแล้ว" ? "status-paid" : "status-unpaid"}`}>
            {room.status_bill}
          </div>
        </div>

        <div className="tenant-detail-section">
          <h3>ข้อมูลผู้เช่า</h3>
          <div className="detail-row">
            <div className="detail-label">ชื่อ-นามสกุล:</div>
            <div className="detail-value">{user.firstname} {user.lastname}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">เบอร์โทรศัพท์:</div>
            <div className="detail-value">{user.phonenumber}</div>
          </div>
        </div>

        <div className="bill-section">
          <h3>รายละเอียดบิล</h3>
          <div className="detail-row">
            <div className="detail-label">หมายเลขบิล:</div>
            <div className="detail-value">{bill.historybill_id}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">รอบบิลวันที่:</div>
            <div className="detail-value">{bill.day_bill} {bill.month_bill} {bill.year_bill}</div>
          </div>

          <div className="bill-details">
            <div className="bill-item"><div className="bill-item-label">ค่าห้อง:</div><div className="bill-item-value">{bill.renprice_month} บาท</div></div>
            <div className="bill-item"><div className="bill-item-label">ค่าน้ำ:</div><div className="bill-item-value">{bill.water_price} บาท</div></div>
            <div className="bill-item"><div className="bill-item-label">ค่าไฟ:</div><div className="bill-item-value">{bill.electricity_price} บาท</div></div>
            <div className="bill-item"><div className="bill-item-label">ค่าส่วนกลาง:</div><div className="bill-item-value">{bill.common_fee} บาท</div></div>
            <div className="bill-item"><div className="bill-item-label">ค่าปรับ:</div><div className="bill-item-value">{bill.late_fee} บาท</div></div>
          </div>

          <div className="total-price">
            <div className="total-label">รวมทั้งสิ้น:</div>
            <div className="total-value">{bill.totalprice} บาท</div>
          </div>
        </div>

        <div className="due-date">
          <i className="due-icon">⏰</i>
          เวลากำหนดชำระครั้งต่อไป:{" "}
          {getLastDayOfMonth(getNextMonthThai(bill.month_bill), getNextMonthYear(bill.month_bill, bill.year_bill))}{" "}
          {getNextMonthThai(bill.month_bill)} {getNextMonthYear(bill.month_bill, bill.year_bill)}
        </div>

        {room?.status_bill === "ยังไม่ชำระ" && (
          <div className="payment-btn-container">
            <button className="payment-btn" onClick={handlePayment}>
              💰 ชำระเงิน
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
