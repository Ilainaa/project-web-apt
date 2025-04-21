// app/login/page.js
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import './login.css'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const result = await res.json()

      if (result.success) {
        localStorage.setItem('username', username)
        if (result.isAdmin) {
          router.push('/admin')
        } else {
          router.push('/')
          
        }
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    }
  }

  return (
    <div className="container">
      <video autoPlay muted loop className="videoBackground">
        <source src="/video/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="content">
        <h1 className="title">ลงชื่อเข้าใช้งาน</h1>
        <form onSubmit={handleLogin} className="form">
          <input
            type="text"
            placeholder="อีเมลหรือเบอร์โทรศัพท์*"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input"
          />
          <div className="passwordContainer">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="รหัสผ่าน*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="optionsContainer">
            <div className="rememberContainer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox"
              />
              <label className="rememberLabel">จดจำฉัน</label>
            </div>
          </div>
          <button type="submit" className="button">เข้าสู่ระบบ</button>
        </form>
      </div>
    </div>
  )
}
