'use client'

import React, { useState, useEffect } from 'react'

export default function PaidBillsTable() {
  const [paidBills, setPaidBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const billsPerPage = 10

  useEffect(() => {
    fetchPaidBills()
  }, [])

  const fetchPaidBills = async () => {
    try {
      setLoading(true)
      // ใช้ API endpoint ที่มีอยู่แล้ว พร้อมกับ parameter status=ชำระแล้ว
      const response = await fetch('/api/admin/historybill?status=ชำระแล้ว')
      
      if (!response.ok) {
        throw new Error('ไม่สามารถโหลดข้อมูลได้')
      }
      
      const data = await response.json()
      setPaidBills(data)
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", err)
      setError('ไม่สามารถโหลดข้อมูลได้: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // กรองข้อมูลตามคำค้นหา
  const filteredBills = paidBills.filter(bill => 
    bill.room_num.toString().includes(searchTerm)
  )

  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(filteredBills.length / billsPerPage)
  
  // คำนวณบิลที่จะแสดงในหน้าปัจจุบัน
  const indexOfLastBill = currentPage * billsPerPage
  const indexOfFirstBill = indexOfLastBill - billsPerPage
  const currentBills = filteredBills.slice(indexOfFirstBill, indexOfLastBill)

  // ฟังก์ชันสำหรับการเปลี่ยนหน้า
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) return <div>กำลังโหลดข้อมูล...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <div>
      <h2>รายการชำระแล้ว</h2>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          className="boxtext"
          
          placeholder="ค้นหาเลขห้อง..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          style={{ padding: '8px', width: '100px' }}
        />
      </div>

      {filteredBills.length === 0 ? (
        <p>ไม่พบข้อมูลการชำระเงิน</p>
      ) : (
        <>
          <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th>หมายเลขบิล</th>
                <th>เลขห้อง</th>
                <th style={{ minWidth: '100px' }}>รอบบิลเดือน/ปี</th>
                <th>ค่าเช่า</th>
                <th>ค่าน้ำ</th>
                <th>ยูนิตน้ำ</th>
                <th>ค่าไฟ</th>
                <th>ยูนิตไฟ</th>
                <th>ค่าส่วนกลาง</th>
                <th>ค่าปรับล่าช้า</th>
                <th>รวมทั้งหมด</th>
                <th>สถานะ</th>
                <th>เวลาชำระ</th>
              </tr>
            </thead>
            <tbody>
              {currentBills.map((bill) => (
                <tr key={bill.historybill_id}>
                  <td>{bill.historybill_id}</td>
                  <td>{bill.room_num}</td>
                  <td>{bill.day_bill}/{bill.month_bill}/{bill.year_bill}</td>
                  <td>{bill.renprice_month}</td>
                  <td>{bill.water_price}</td>
                  <td>{bill.water_unit}</td>
                  <td>{bill.electricity_price}</td>
                  <td>{bill.electricity_unit}</td>
                  <td>{bill.common_fee}</td>
                  <td>{bill.late_fee}</td>
                  <td>{bill.totalprice}</td>
                  <td style={{ color: 'green', fontWeight: 'bold' }}>{bill.status_bill}</td>
                  <td>
                    {bill.timestamp && !isNaN(new Date(bill.timestamp))
                      ? new Date(bill.timestamp).toLocaleString('th-TH', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        })
                      : 'ไม่พบเวลาบันทึก'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                style={{
                  margin: '0 5px',
                  padding: '5px 10px',
                  backgroundColor: currentPage === i + 1 ? 'yellow' : 'white',
                  border: '1px solid #ccc',
                  cursor: 'pointer'
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}