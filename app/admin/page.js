//app/addmin/page.js
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import './admin.css'

import UnpaidBillsTable from './components/UnpaidBillsTable'
import RoomManagement from './components/RoomManagement'
import UserManagement from './components/UserManagement'
import PaidBillsTable from './components/PaidBillsTable'

export default function Page() {
  const router = useRouter()
  const [activeBox, setActiveBox] = useState('page1')
  const [roomData, setRoomData] = useState([])

  const [selectedDay, setSelectedDay] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const roomsPerPage = 10
  const [searchTerm, setSearchTerm] = useState('')

  const [waterPrice, setWaterPrice] = useState('')
  const [electricPrice, setElectricPrice] = useState('')
  const [commonFee, setCommonFee] = useState('')
  const [lateFee, setLateFee] = useState('')

  const [billRates, setBillRates] = useState([])
  const [historyData, setHistoryData] = useState([])
  const [bill, setBill] = useState(null)
  const [rate, setRate] = useState(null)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const [refreshData, setRefreshData] = useState(0);

  const handleLogout = () => {
    router.push('/login')
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        // โหลดข้อมูลห้องพักใหม่
        const res = await fetch('/api/admin/room')
        const data = await res.json()
        setRoomData(data)
      } catch (err) {
        console.error('โหลดข้อมูลห้องพักล้มเหลว:', err)
      }
    }

    loadData();
  }, []); 

  const handleClick = async (pageName) => {
    setActiveBox(pageName)
    if (pageName.startsWith('page1')) {
      try {
        const res = await fetch('/api/admin/room')
        const data = await res.json()
        setRoomData(data)
      } catch (err) {
        console.error('โหลดข้อมูลห้องพักล้มเหลว:', err)
      }
    }

    if (pageName === 'page6') {
      try {
        const res = await fetch('/api/admin/billrate')
        const data = await res.json()
        const editableRates = data.map((item) => ({
          ...item,
          editing: false,
        }))
        setBillRates(editableRates)
      } catch (err) {
        console.error('โหลดข้อมูล billrate ล้มเหลว:', err)
      }
    }
  }

  // effect เพื่อโหลดข้อมูลใหม่เมื่อมีการชำระเงิน
  useEffect(() => {
    if (activeBox === 'page2' || activeBox === 'page3') {
      const loadData = async () => {
        try {
          // โหลดข้อมูลห้องพักใหม่
          const res = await fetch('/api/admin/room')
          const data = await res.json()
          setRoomData(data)
        } catch (err) {
          console.error('โหลดข้อมูลห้องพักล้มเหลว:', err)
        }
      }

      loadData();
    }
  }, [refreshData, activeBox]);

  const handlePaymentStatusUpdate = () => {
    // อัพเดทค่า refreshData เพื่อบังคับให้โหลดข้อมูลใหม่
    setRefreshData(prev => prev + 1);
  }

  const filteredRooms = roomData.filter((room) =>
    room.room_num.toString().includes(searchTerm)
  )

  const unpaidCount = filteredRooms.filter((room) => room.status_bill === 'ยังไม่ชำระ').length

  const indexOfLastRoom = currentPage * roomsPerPage
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom)

  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage)

  const handleBack = () => {
    setWaterPrice('')
    setElectricPrice('')
    setCommonFee('')
    setLateFee('')
    setSelectedMonth('--เดือน--')
    setSelectedYear('--ปี--')
    setSaveMessage('')
    setActiveBox('page1')
  }

  useEffect(() => {
    if (activeBox.startsWith('page1_1_1_')) {
      const roomId = parseInt(activeBox.split('_')[3]);

      setHistoryData([]);
      setBill(null);

      const foundRoom = roomData.find(r => r.room_id === roomId);
      setCurrentRoom(foundRoom);

      if (foundRoom) {
        fetch(`/api/admin/historybill?room_num=${foundRoom.room_num}`)
          .then(res => res.json())
          .then(data => {
            setHistoryData(data);
            if (data && data.length > 0) {
              setBill(data[0]);
            }
          })
          .catch(err => {
            console.error(`โหลดประวัติบิลห้อง ${foundRoom.room_num} ล้มเหลว:`, err);
            setHistoryData([]);
          });

        fetch('/api/admin/billrate')
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0) {
              setRate(data[0]);
            }
          })
          .catch(err => console.error('โหลดข้อมูลอัตราค่าน้ำ/ไฟล้มเหลว:', err));
      }
    }
  }, [activeBox, roomData]);

  const toggleEdit = (index, status) => {
    const updatedRates = [...billRates]
    updatedRates[index].editing = status
    setBillRates(updatedRates)
  }

  const handleRateChange = (index, field, value) => {
    const updatedRates = [...billRates]
    updatedRates[index][field] = value
    setBillRates(updatedRates)
  }

  const saveRate = async (index) => {
    const rateToSave = billRates[index]
    try {
      const res = await fetch('/api/admin/billrate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rateToSave),
      })
      if (res.ok) {
        toggleEdit(index, false)
        alert('บันทึกสำเร็จ')
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึก')
      }
    } catch (err) {
      console.error('บันทึกข้อมูลล้มเหลว:', err)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  // ฟังก์ชันคำนวณต่างๆ
  const calculateWaterUnits = () => {
    if (waterPrice) {
      return parseInt(waterPrice) - parseInt(bill?.water_unit || 0);
    }
    return 0;
  }

  const calculateWaterCost = () => {
    const units = calculateWaterUnits();
    if (units !== 0 && rate?.water_unit) {
      return units * parseInt(rate.water_unit);
    }
    return 0;
  }

  const calculateElectricUnits = () => {
    if (electricPrice) {
      return parseInt(electricPrice) - parseInt(bill?.electricity_unit || 0);
    }
    return 0;
  }

  const calculateElectricCost = () => {
    const units = calculateElectricUnits();
    if (units !== 0 && rate?.electric_unit) {
      return units * parseInt(rate.electric_unit);
    }
    return 0;
  }

  const calculateTotalCommonFee = () => {
    return parseInt(commonFee || 0) + parseInt(bill?.common_fee || 0);
  }

  const calculateTotalLateFee = () => {
    return parseInt(lateFee || 0) + parseInt(bill?.late_fee || 0);
  }

  const calculateTotalBill = () => {
    const roomRent = parseInt(currentRoom?.renprice_month || 0);
    const waterTotal = calculateWaterCost();
    const electricTotal = calculateElectricCost();
    const commonFeeTotal = calculateTotalCommonFee();
    const lateFeeTotal = calculateTotalLateFee();

    return roomRent + waterTotal + electricTotal + commonFeeTotal + lateFeeTotal;
  }

  const saveBill = async () => {
    // 1. ตรวจสอบการเลือกรอบบิล
    if (!selectedDay || selectedDay === '' ||
      !selectedMonth || selectedMonth === '' || selectedMonth === '--เดือน--' ||
      !selectedYear || selectedYear === '' || selectedYear === '--ปี--') {
      alert('กรุณาเลือกวัน เดือน และปีให้ถูกต้อง')
      return
    }

    // 2. ตรวจสอบข้อมูลมิเตอร์น้ำและไฟ
    if (!waterPrice || !electricPrice) {
      alert('กรุณากรอกเลขมิเตอร์น้ำและไฟ')
      return
    }

    // 3. ตรวจสอบว่าเลขมิเตอร์ครั้งนี้ต้องไม่น้อยกว่าครั้งก่อน
    const prevWaterUnit = parseInt(bill?.water_unit || 0);
    const prevElectricUnit = parseInt(bill?.electricity_unit || 0);
    const currentWaterUnit = parseInt(waterPrice);
    const currentElectricUnit = parseInt(electricPrice);

    if (currentWaterUnit < prevWaterUnit) {
      alert('เลขมิเตอร์น้ำครั้งนี้ต้องไม่น้อยกว่าครั้งก่อน');
      return;
    }

    if (currentElectricUnit < prevElectricUnit) {
      alert('เลขมิเตอร์ไฟครั้งนี้ต้องไม่น้อยกว่าครั้งก่อน');
      return;
    }

    // 4. ตรวจสอบค่าส่วนกลางและค่าปรับ
    const prevCommonFee = parseInt(bill?.common_fee || 0);
    const prevLateFee = parseInt(bill?.late_fee || 0);
    const currentCommonFee = parseInt(commonFee || 0);
    const currentLateFee = parseInt(lateFee || 0);

    if (currentCommonFee < prevCommonFee) {
      alert('ค่าส่วนกลางครั้งนี้ต้องไม่น้อยกว่าครั้งก่อน');
      return;
    }

    if (currentLateFee < prevLateFee) {
      alert('ค่าปรับครั้งนี้ต้องไม่น้อยกว่าครั้งก่อน');
      return;
    }

    const waterCost = calculateWaterCost()
    const electricCost = calculateElectricCost()
    const totalBill = calculateTotalBill()

    setIsSaving(true)
    setSaveMessage('')

    try {
      const newBillData = {
        room_num: currentRoom.room_num,
        day_bill: selectedDay,
        month_bill: selectedMonth,
        year_bill: selectedYear,
        renprice_month: currentRoom.renprice_month,
        water_price: waterCost,
        water_unit: waterPrice,
        electricity_price: electricCost,
        electricity_unit: electricPrice,
        common_fee: calculateTotalCommonFee(),
        late_fee: calculateTotalLateFee(),
        totalprice: totalBill,
        status_bill: 'ยังไม่ชำระ',
        timestamp: new Date().toISOString()
      }//ตรวจสอบบันทึกค่า...

      const response = await fetch('/api/admin/historybill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBillData),
      })

      const result = await response.json()

      if (response.ok) {
        const updatedHistory = [result, ...historyData]
        setHistoryData(updatedHistory)
        setBill(result)

        setWaterPrice('')
        setElectricPrice('')
        setCommonFee('')
        setLateFee('')
        setSelectedMonth('-เลือกรอบบิล-')

        setSaveMessage('บันทึกสำเร็จ')

        const updatedRoomData = roomData.map(r => {
          if (r.room_id === currentRoom.room_id) {
            return { ...r, status_bill: 'ยังไม่ชำระ' }
          }
          return r
        })
        setRoomData(updatedRoomData)
      } else {
        setSaveMessage(`บันทึกไม่สำเร็จ: ${result.message || 'เกิดข้อผิดพลาด'}`)
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการบันทึกบิล:', error)
      setSaveMessage('เกิดข้อผิดพลาดในการบันทึกบิล')
    } finally {
      setIsSaving(false)
    }
  }

  const getDaysInMonth = (month) => {
    if (!month) return 0;

    if (month === 'กุมภาพันธ์') {
      return 28;
    } else if (month.endsWith('คม')) {
      return 31;
    } else if (month.endsWith('ยน')) {
      return 30;
    } else {
      return 30; // ค่าเริ่มต้นกรณีไม่ตรงกับเงื่อนไขใด
    }
  }

  useEffect(() => {
    setSelectedDay('');
  }, [selectedMonth]);

  const pageContent = {

    page1: (
      <div>
        <h2>ข้อมูลห้องพัก</h2>
        <p style={{ color: 'red' }}>* ค้างชำระ : {unpaidCount} ห้อง</p>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            className="boxtext"
            style={{ width: '100px' }}
            placeholder="ค้นหาเลขห้อง..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {currentRooms.map((room) => {
            let bgColor = 'white'

            if (room.status_room === 'ว่าง') {
              bgColor = 'gray'
            } else if (room.status_bill === 'ยังไม่ชำระ') {
              bgColor = 'red'
            } else if (room.status_bill === 'ชำระแล้ว') {
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
                onClick={() => setActiveBox(`page1_1_1_${room.room_id}`)}
              >
                ROOM{room.room_num}
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '20px' }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
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
      </div>
    ),
    page2: (
      <div>
        <h2>รายการรอชำระ</h2>
        <UnpaidBillsTable onPaymentStatusUpdate={handlePaymentStatusUpdate} />
      </div>
    ),
    page3: <PaidBillsTable />,
    page4: <RoomManagement />,
    page5: <UserManagement />,
    page6: (
      <div>
        <h2>จัดการเรทค่าน้ำ/ไฟ</h2>
        {billRates.map((rate, index) => (
          <div
            key={index}
            style={{
              width: '400px',
              border: '1px solid #ccc',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ width: '200px' }}>ค่าน้ำ (บาท/หน่วย):</label>
              <input
                className="boxtext"
                type="text"
                value={rate.water_unit}
                onChange={(e) => handleRateChange(index, 'water_unit', e.target.value)}
                disabled={!rate.editing}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ width: '200px' }}>ค่าไฟ (บาท/หน่วย):</label>
              <input
                className="boxtext"
                type="text"
                value={rate.electric_unit}
                onChange={(e) => handleRateChange(index, 'electric_unit', e.target.value)}
                disabled={!rate.editing}
              />
            </div>

            {!rate.editing ? (
              <button
                style={{
                  backgroundColor: 'yellow',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
                onClick={() => toggleEdit(index, true)}
              >
                แก้ไข
              </button>
            ) : (
              <button
                style={{ backgroundColor: 'green', color: 'white', padding: '5px 10px' }}
                onClick={() => saveRate(index)}
              >
                บันทึก
              </button>
            )}
          </div>
        ))}
      </div>
    ),

  }

  if (activeBox.startsWith('page1_1_1_')) {
    const roomId = parseInt(activeBox.split('_')[3])
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
              readOnly
            />
          </div>
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ marginRight: '10px' }}>เลือกรอบบิล :</label>

              {/*select วัน */}
              <select
                className="boxtexts"
                value={selectedDay}
                style={{ width: '80px', marginRight: '10px' }}
                onChange={(e) => setSelectedDay(e.target.value)}
              >
                <option value="">--วัน--</option>
                {Array.from({ length: getDaysInMonth(selectedMonth) }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>

              <select
                className="boxtexts"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">--เดือน--</option>
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
              <select
                className="boxtexts"
                value={selectedYear}
                style={{ width: '80px', margin: '15px' }}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">--ปี--</option>
                <option value="2567">2567</option>
                <option value="2568">2568</option>

              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '10px' }}>ค่าเช่าห้อง :</label>
            <input
              className="boxtext"
              type="text"
              value={room.renprice_month}
              readOnly
            />
          </div>

          {/* ค่าน้ำ */}
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>ค่าน้ำ</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>เลขมิเตอร์ครั้งนี้</label>
                <input
                  className="boxtext"
                  type="number"
                  value={waterPrice}
                  onChange={(e) => setWaterPrice(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>ครั้งก่อน</label>
                <input
                  className="boxtext"
                  type="number"
                  value={bill?.water_unit ?? '0'}
                  readOnly
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>หน่วยที่ใช้</label>
                <input
                  className="boxtext"
                  type="number"
                  value={calculateWaterUnits() || ''}
                  readOnly
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>ราคา/หน่วย</label>
                <input
                  className="boxtext"
                  type="number"
                  value={rate?.water_unit ?? ''}
                  readOnly
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>รวม (บาท)</label>
                <input
                  className="boxtext"
                  type="number"
                  value={calculateWaterCost() || ''}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* ค่าไฟ */}
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>ค่าไฟ</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>เลขมิเตอร์ครั้งนี้</label>
                <input
                  className="boxtext"
                  type="number"
                  value={electricPrice}
                  onChange={(e) => setElectricPrice(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>ครั้งก่อน</label>
                <input
                  className="boxtext"
                  type="number"
                  value={bill?.electricity_unit ?? '0'}
                  readOnly
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>หน่วยที่ใช้</label>
                <input
                  className="boxtext"
                  type="number"
                  value={calculateElectricUnits() || ''}
                  readOnly
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>ราคา/หน่วย</label>
                <input
                  className="boxtext"
                  type="number"
                  value={rate?.electric_unit ?? ''}
                  readOnly
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>รวม (บาท)</label>
                <input
                  className="boxtext"
                  type="number"
                  value={calculateElectricCost() || ''}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* ค่าส่วนกลาง */}
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>ค่าส่วนกลาง</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>ค่าส่วนกลางครั้งนี้</label>
                <input
                  className="boxtext"
                  type="number"
                  value={commonFee}
                  onChange={(e) => setCommonFee(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>ครั้งก่อน</label>
                <input
                  className="boxtext"
                  type="number"
                  value={bill?.common_fee ?? '0'}
                  readOnly
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>รวม (บาท)</label>
                <input
                  className="boxtext"
                  type="number"
                  value={calculateTotalCommonFee()}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* ค่าปรับล่าช้า */}
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>ค่าปรับล่าช้า</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>ค่าปรับครั้งนี้</label>
                <input
                  className="boxtext"
                  type="number"
                  value={lateFee}
                  onChange={(e) => setLateFee(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>ครั้งก่อน</label>
                <input
                  className="boxtext"
                  type="number"
                  value={bill?.late_fee ?? '0'}
                  readOnly
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>รวม (บาท)</label>
                <input
                  className="boxtext"
                  type="number"
                  value={calculateTotalLateFee()}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* รวมทั้งสิ้น */}
          <div style={{ marginTop: '30px', borderTop: '2px solid #000', paddingTop: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ marginRight: '10px', fontWeight: 'bold', fontSize: '18px' }}>รวมทั้งสิ้น:</label>
              <input
                className="boxtext"
                type="number"
                value={calculateTotalBill()}
                readOnly
                style={{ fontWeight: 'bold', fontSize: '18px', width: '150px' }}
              />
              <span style={{ marginLeft: '5px', fontWeight: 'bold' }}>บาท</span>
            </div>


            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
              <button onClick={handleBack}
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  margin: '10px',
                  padding: '10px 20px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '5px',

                }}
              >ย้อนกลับ</button>
              <button
                onClick={saveBill}
                disabled={isSaving}
                style={{
                  backgroundColor: 'green',
                  color: 'white',
                  padding: '10px 20px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>

              {saveMessage && (
                <span style={{
                  marginLeft: '10px',
                  color: saveMessage.includes('สำเร็จ') ? 'green' : 'red',
                  fontWeight: 'bold'
                }}>
                  {saveMessage}
                </span>
              )}
            </div>
          </div>



          <div className="boxhistory" style={{ marginTop: '30px' }}>
            <h2>ประวัติบิล</h2>
            {historyData.length === 0 ? (
              <p>ไม่มีข้อมูล</p>
            ) : (
              <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th>หมายเลขบิล</th>
                    <th style={{ minWidth: '100px' }}>รอบบิลวัน/เดือน/ปี</th>
                    <th>ค่าเช่า</th>
                    <th>ค่าน้ำ</th>
                    <th>ยูนิตน้ำ</th>
                    <th>ค่าไฟ</th>
                    <th>ยูนิตไฟ</th>
                    <th>ค่าส่วนกลาง</th>
                    <th>ค่าปรับล่าช้า</th>
                    <th>รวมทั้งหมด</th>
                    <th>สถานะ</th>
                    <th>เวลาบันทึก</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((bill) => (
                    <tr key={bill.historybill_id}>
                      <td>{bill.historybill_id}</td>
                      <td>{bill.day_bill}/{bill.month_bill}/{bill.year_bill}</td>
                      <td>{bill.renprice_month}</td>
                      <td>{bill.water_price}</td>
                      <td>{bill.water_unit}</td>
                      <td>{bill.electricity_price}</td>
                      <td>{bill.electricity_unit}</td>
                      <td>{bill.common_fee}</td>
                      <td>{bill.late_fee}</td>
                      <td>{bill.totalprice}</td>
                      <td>{bill.status_bill}</td>
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
            )}
          </div>
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
          {['page1', 'page2', 'page3', 'page4', 'page5', 'page6'].map((page) => (
            <div
              key={page}
              className="box"
              style={{ backgroundColor: activeBox === page ? 'yellow' : 'white' }}
              onClick={() => handleClick(page)}
            >
              {{
                page1: 'รายการห้องพัก',
                page2: 'รายการรอชำระ',
                page3: 'รายการชำระแล้ว',
                page4: 'จัดการห้องพัก',
                page5: 'จัดการข้อมูลผู้เช่า',
                page6: 'จัดการเรทค่าน้ำ/ไฟ',
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



