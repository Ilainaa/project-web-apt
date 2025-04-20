'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false) // For toggling password visibility
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
        if (result.isAdmin) {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div style={styles.container}>
      {/* วิดีโอพื้นหลัง */}
      <video autoPlay muted loop style={styles.videoBackground}>
        <source src="/video/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* คอนเทนต์หน้า Login */}
      <div style={styles.content}>
        <h1 style={styles.title}>ลงชื่อเข้าใช้งาน</h1>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="text"
            placeholder="อีเมลหรือเบอร์โทรศัพท์*"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />
          <div style={styles.passwordContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="รหัสผ่าน*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <div style={styles.optionsContainer}>
            <div style={styles.rememberContainer}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={styles.checkbox}
              />
              <label style={styles.rememberLabel}>จดจำฉัน</label>
            </div>

          </div>
          <button type="submit" style={styles.button}>เข้าสู่ระบบ</button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    overflow: 'hidden',
  },
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover', // ให้วิดีโอเต็มจอโดยไม่ยืด
    zIndex: -1, // ทำให้วิดีโออยู่ด้านหลัง
  },
  content: {
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // เพิ่มความโปร่งแสง
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 1, // ทำให้คอนเทนต์อยู่ด้านบน
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 500,
    marginBottom: '3rem',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    marginBottom: '1rem',
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ddd',
    outline: 'none',
    backgroundColor: '#d3d3d3', // พื้นหลังสีเทา (Light Gray)
    color: '#333', // เปลี่ยนสีตัวอักษรให้เข้ากับพื้นหลัง
    transition: 'border-color 0.3s',
    width: '92%',
  },
  passwordContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
    position: 'relative',
  },
  optionsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  rememberContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: '0.5rem',
  },
  rememberLabel: {
    fontSize: '0.9rem',
    color: '#333',
  },
  eyeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
  },
}