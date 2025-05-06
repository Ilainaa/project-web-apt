'use client'
import React, { useState, useEffect } from 'react'

export default function UnpaidBillsTable({ onPaymentStatusUpdate }) {
  const [unpaidBills, setUnpaidBills] = useState([])
  const [userMap, setUserMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [refreshCounter, setRefreshCounter] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const billsRes = await fetch('/api/admin/historybill?status=ยังไม่ชำระ')
        const billsData = await billsRes.json()

        const usersRes = await fetch('/api/admin/user')
        const usersData = await usersRes.json()

        const usersMapByRoom = {}
        usersData.forEach(user => {
          usersMapByRoom[user.room_num] = `${user.firstname} ${user.lastname}`
        })

        setUserMap(usersMapByRoom)
        setUnpaidBills(billsData)
      } catch (err) {
        console.error(err)
        setError('โหลดข้อมูลล้มเหลว')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [refreshCounter])

  const filteredBills = unpaidBills.filter(bill =>
    bill.room_num.toString().includes(searchTerm) 
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const currentBills = filteredBills.slice(indexOfLastItem - itemsPerPage, indexOfLastItem)
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage)

  const handlePaymentStatus = (billId, roomNum) => {

    const billToUpdate = unpaidBills.find(bill => bill.historybill_id === billId);

    if (!billToUpdate) {
      console.error("ไม่พบบิลที่ต้องการอัปเดต:", billId);
      alert("เกิดข้อผิดพลาด: ไม่พบบิล");
      return;
    }

    if (confirm('ยืนยันการชำระเงิน?')) {
      fetch('/api/admin/historybill', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historybill_id: billId,
          status_bill: 'ชำระแล้ว',
          room_num: roomNum,
          common_fee: billToUpdate.common_fee,
          late_fee: billToUpdate.late_fee
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.message === 'อัพเดทข้อมูลสำเร็จ') {
            setUnpaidBills(prev => prev.filter(b => b.historybill_id !== billId))
            setRefreshCounter(prev => prev + 1)
            alert('อัพเดทสถานะสำเร็จ')
            onPaymentStatusUpdate?.()
          }else {
            alert(`อัพเดทสถานะไม่สำเร็จ: ${data.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'}`);
          }
        })
        .catch(err => {
          console.error(err)
          alert('เชื่อมต่อล้มเหลว')
        })
    }
  }

  if (loading) return <div>กำลังโหลด...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <div>
      <input
        className="boxtext"
        placeholder="ค้นหาเลขห้อง..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setCurrentPage(1)
        }}
        style={{ width: '150px', marginBottom: '15px' }}
      />
      {filteredBills.length === 0 ? (
        <p>ไม่พบรายการ</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th>หมายเลขบิล</th>
                  <th>เลขห้อง</th>
                  <th>ผู้เช่า</th>
                  <th>รอบบิล</th>
                  <th>ค่าเช่า</th>
                  <th>รวม(น้ำ)</th>
                  <th>รวม(ไฟ)</th>
                  <th>ค่าส่วนกลาง</th>
                  <th>ค่าปรับ</th>
                  <th>รวมทั้งสิ้น</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {currentBills.map(bill => (
                  <tr key={bill.historybill_id}>
                    <td>{bill.historybill_id}</td>
                    <td>{bill.room_num}</td>
                    <td>{userMap[bill.room_num] || '-'}</td>
                    <td>{bill.day_bill}/{bill.month_bill}/{bill.year_bill}</td>
                    <td>{bill.renprice_month}</td>
                    <td>{bill.water_price}</td>
                    <td>{bill.electricity_price}</td>
                    <td>{bill.common_fee}</td>
                    <td>{bill.late_fee}</td>
                    <td style={{ fontWeight: 'bold' }}>{bill.totalprice}</td>
                    <td>
                      <button
                        onClick={() => handlePaymentStatus(bill.historybill_id, bill.room_num)}
                        style={{
                          backgroundColor: 'green',
                          color: 'white',
                          borderRadius: '4px',
                          padding: '5px 10px',
                          border: 'none'
                        }}
                      >
                        ชำระเงิน
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    margin: '0 5px',
                    backgroundColor: currentPage === i + 1 ? 'yellow' : '#fff',
                    padding: '5px 10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
