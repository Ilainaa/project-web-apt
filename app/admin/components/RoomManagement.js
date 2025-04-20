'use client'
import React, { useState, useEffect } from 'react'

export default function RoomManagement() {
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const roomsPerPage = 10
    const [error, setError] = useState(null)
    const [savingStatus, setSavingStatus] = useState({})
  
    useEffect(() => {
      const fetchRooms = async () => {
        setLoading(true)
        try {
          const res = await fetch('/api/admin/room')
          const data = await res.json()
          
          // เพิ่มค่า editing: false ให้กับทุกห้อง
          const roomsWithEditState = data.map(room => ({
            ...room,
            editing: false,
            // สร้าง copy ของค่าเดิมเพื่อใช้ในการแก้ไข
            tempData: {
              renprice_month: room.renprice_month,
              deposit: room.deposit,
              description: room.description,
              status_room: room.status_room
            }
          }))
          
          setRooms(roomsWithEditState)
        } catch (err) {
          console.error('โหลดข้อมูลห้องพักล้มเหลว:', err)
          setError('ไม่สามารถโหลดข้อมูลห้องพักได้')
        } finally {
          setLoading(false)
        }
      }
  
      fetchRooms()
    }, [])
  
    const toggleEdit = (roomId, status) => {
      setRooms(rooms.map(room => {
        if (room.room_id === roomId) {
          if (status) {
            // เริ่มการแก้ไข - เก็บค่าเดิมไว้ใน tempData
            return {
              ...room,
              editing: status,
              tempData: {
                renprice_month: room.renprice_month,
                deposit: room.deposit,
                description: room.description,
                status_room: room.status_room
              }
            }
          } else {
            // ยกเลิกการแก้ไข - คืนค่าเดิมจาก tempData
            return {
              ...room,
              editing: status,
              renprice_month: room.tempData.renprice_month,
              deposit: room.tempData.deposit,
              description: room.tempData.description,
              status_room: room.tempData.status_room
            }
          }
        }
        return room
      }))
    }
  
    const handleRoomChange = (roomId, field, value) => {
      setRooms(rooms.map(room => {
        if (room.room_id === roomId) {
          return { ...room, [field]: value }
        }
        return room
      }))
    }
  
    const saveRoom = async (roomId) => {
      setSavingStatus(prev => ({ ...prev, [roomId]: 'saving' }))
      
      const roomToSave = rooms.find(room => room.room_id === roomId)
      if (!roomToSave) return
      
      try {
        const res = await fetch('/api/admin/room', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room_id: roomId,
            renprice_month: roomToSave.renprice_month,
            deposit: roomToSave.deposit,
            description: roomToSave.description,
            status_room: roomToSave.status_room
          }),
        })
        
        if (res.ok) {
          setSavingStatus(prev => ({ ...prev, [roomId]: 'success' }))
          toggleEdit(roomId, false)
          
          setTimeout(() => {
            setSavingStatus(prev => {
              const newStatus = { ...prev }
              delete newStatus[roomId]
              return newStatus
            })
          }, 3000)
        } else {
          setSavingStatus(prev => ({ ...prev, [roomId]: 'error' }))
        }
      } catch (err) {
        console.error('บันทึกข้อมูลห้องพักล้มเหลว:', err)
        setSavingStatus(prev => ({ ...prev, [roomId]: 'error' }))
      }
    }
  
    const handleCancel = (roomId) => {
      toggleEdit(roomId, false)
    }
  
    const filteredRooms = rooms.filter(room => 
      room.room_num.toString().includes(searchTerm)
    )
  
    const indexOfLastRoom = currentPage * roomsPerPage
    const indexOfFirstRoom = indexOfLastRoom - roomsPerPage
    const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom)
  
    const totalPages = Math.ceil(filteredRooms.length / roomsPerPage)
  
    if (loading) return <div>กำลังโหลดข้อมูล...</div>
    if (error) return <div style={{ color: 'red' }}>{error}</div>
  
    return (
      <div>
        <h2>จัดการข้อมูลห้องพัก</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            className="boxtext"
            placeholder="ค้นหาเลขห้อง..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            style={{ width: '300px' }}
          />
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th>เลขห้อง</th>
                <th>ค่าเช่า/เดือน (บาท)</th>
                <th>ค่ามัดจำ (บาท)</th>
                <th>คำอธิบาย</th>
                <th>สถานะห้อง</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {currentRooms.map((room) => (
                <tr key={room.room_id}>
                  <td>{room.room_num}</td>
                  <td>
                    {room.editing ? (
                      <input
                        className="boxtext"
                        type="number"
                        value={room.renprice_month}
                        onChange={(e) => handleRoomChange(room.room_id, 'renprice_month', e.target.value)}
                        style={{ width: '100px' }}
                      />
                    ) : (
                      room.renprice_month
                    )}
                  </td>
                  <td>
                    {room.editing ? (
                      <input
                        className="boxtext"
                        type="number"
                        value={room.deposit}
                        onChange={(e) => handleRoomChange(room.room_id, 'deposit', e.target.value)}
                        style={{ width: '100px' }}
                      />
                    ) : (
                      room.deposit
                    )}
                  </td>
                  <td>
                    {room.editing ? (
                      <input
                        className="boxtext"
                        type="text"
                        value={room.description || ''}
                        onChange={(e) => handleRoomChange(room.room_id, 'description', e.target.value)}
                        style={{ width: '150px' }}
                      />
                    ) : (
                      room.description || '-'
                    )}
                  </td>
                  <td>
                    {room.editing ? (
                      <select
                        className="boxtext"
                        value={room.status_room}
                        style={{width : '100px',height:'40px'}}
                        onChange={(e) => handleRoomChange(room.room_id, 'status_room', e.target.value)}
                      >
                        <option value="ว่าง">ว่าง</option>
                        <option value="ไม่ว่าง">ไม่ว่าง</option>
                      </select>
                    ) : (
                      <span style={{ 
                        color: room.status_room === 'ว่าง' ? 'green' : 'red',
                        fontWeight: 'bold' 
                      }}>
                        {room.status_room}
                      </span>
                    )}
                  </td>
                  <td>
                    {room.editing ? (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => saveRoom(room.room_id)}
                          style={{
                            backgroundColor: 'green',
                            color: 'white',
                            padding: '5px 10px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          disabled={savingStatus[room.room_id] === 'saving'}
                        >
                          {savingStatus[room.room_id] === 'saving' ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                        <button
                          onClick={() => handleCancel(room.room_id)}
                          style={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            padding: '5px 10px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleEdit(room.room_id, true)}
                        style={{
                            backgroundColor: 'yellow',
                            padding: '5px 10px',
                            cursor: 'pointer',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                      >
                        แก้ไข
                      </button>
                    )}
                    {savingStatus[room.room_id] === 'success' && (
                      <span style={{ color: 'green', marginLeft: '5px' }}>✓ บันทึกสำเร็จ</span>
                    )}
                    {savingStatus[room.room_id] === 'error' && (
                      <span style={{ color: 'red', marginLeft: '5px' }}>✗ เกิดข้อผิดพลาด</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
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
        )}
      </div>
    )
}


  
