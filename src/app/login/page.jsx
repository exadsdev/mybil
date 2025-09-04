'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // ✅ เช็ค localStorage ถ้าเคย login แล้วให้เข้าเลย
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      router.push('/'); // ✅ ไปหน้าหลังบ้าน
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (user === 'admin' && password === '1234') {
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/');
    } else {
      setError('Username หรือ Password ไม่ถูกต้อง');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="text-center mb-4">เข้าสู่ระบบแอดมิน</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control p-3"
            placeholder="Username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control p-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100 p-3">เข้าสู่ระบบ</button>
      </form>
    </div>
  );
}
