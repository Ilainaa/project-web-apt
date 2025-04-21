// app/admin/components/UserManagement.js
'use client'

import React, { useState, useEffect } from 'react'

export default function UserManagement() {
  const [userData, setUserData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/user')
        
        if (!response.ok) {
          throw new Error('ไม่สามารถโหลดข้อมูลผู้เช่าได้')
        }
        
        const users = await response.json()
        
        // กรองเฉพาะห้องที่มีเลขห้องมากกว่าหรือเท่ากับ 3 ตัว
        const filteredUsers = users.filter(user => {
          const roomNum = user.room_num?.toString() || '';
          return roomNum.length >= 3;
        });
        
        // เพิ่มสถานะการแก้ไขให้กับข้อมูลผู้เช่าแต่ละคน
        const editableUsers = filteredUsers.map(user => ({
          ...user,
          editing: false
        }))
        
        setUserData(editableUsers)
        setError(null)
      } catch (err) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้เช่า:', err)
        setError('ไม่สามารถโหลดข้อมูลผู้เช่าได้')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // ฟังก์ชันสำหรับการค้นหา
  const filteredUsers = userData.filter(user => 
    user.room_num?.toString().includes(searchTerm) 
  )

  // จัดการหน้า
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  // เปิด/ปิดโหมดแก้ไข
  const toggleEdit = (userId, status) => {
    const updatedUsers = userData.map(user => {
      if (user.user_id === userId) {
        return { ...user, editing: status }
      }
      return user
    })
    setUserData(updatedUsers)
  }

  // อัพเดทค่าใน state เมื่อมีการแก้ไข
  const handleUserChange = (userId, field, value) => {
    const updatedUsers = userData.map(user => {
      if (user.user_id === userId) {
        return { ...user, [field]: value }
      }
      return user
    })
    setUserData(updatedUsers)
  }

  // บันทึกข้อมูลที่แก้ไข
  const saveUser = async (userId) => {
    const userToSave = userData.find(user => user.user_id === userId)
    
    try {
      const response = await fetch('/api/admin/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userToSave.user_id,
          citizen_id: userToSave.citizen_id,
          firstname: userToSave.firstname,
          lastname: userToSave.lastname,
          phonenumber: userToSave.phonenumber
        })
      })

      if (response.ok) {
        toggleEdit(userId, false)
        alert('บันทึกข้อมูลสำเร็จ')
      } else {
        const errorData = await response.json()
        alert(`เกิดข้อผิดพลาด: ${errorData.message || 'ไม่สามารถบันทึกข้อมูลได้'}`)
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', err)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>
  }

  return (
    <div>
      <h2>จัดการข้อมูลผู้เช่า</h2>
      
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
          style={{ width: '100px' }}
        />
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>เลขห้อง</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>เลขบัตรประชาชน</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ชื่อ</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>นามสกุล</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>เบอร์โทรศัพท์</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.user_id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.room_num}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {user.editing ? (
                      <input
                        className="boxtext"
                        type="text"
                        value={user.citizen_id || ''}
                        onChange={(e) => handleUserChange(user.user_id, 'citizen_id', e.target.value)}
                        style={{ width: '150px' }}
                      />
                    ) : (
                      user.citizen_id || '-'
                    )}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {user.editing ? (
                      <input
                        className="boxtext"
                        type="text"
                        value={user.firstname || ''}
                        onChange={(e) => handleUserChange(user.user_id, 'firstname', e.target.value)}
                      />
                    ) : (
                      user.firstname || '-'
                    )}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {user.editing ? (
                      <input
                        className="boxtext"
                        type="text"
                        value={user.lastname || ''}
                        onChange={(e) => handleUserChange(user.user_id, 'lastname', e.target.value)}
                      />
                    ) : (
                      user.lastname || '-'
                    )}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {user.editing ? (
                      <input
                        className="boxtext"
                        type="text"
                        value={user.phonenumber || ''}
                        onChange={(e) => handleUserChange(user.user_id, 'phonenumber', e.target.value)}
                        style={{ width: '100px' }}
                      />
                    ) : (
                      user.phonenumber || '-'
                    )}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {!user.editing ? (
                      <button
                        style={{
                          backgroundColor: 'yellow',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                        onClick={() => toggleEdit(user.user_id, true)}
                      >
                        แก้ไข
                      </button>
                    ) : (
                      <button
                        style={{
                          backgroundColor: 'green',
                          color: 'white',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                        onClick={() => saveUser(user.user_id)}
                      >
                        บันทึก
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '10px' }}>
                  ไม่พบข้อมูลผู้เช่า
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
                cursor: 'pointer',
                borderRadius: '4px'
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