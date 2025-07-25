import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ResetPasswordOTP() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    const res = await fetch('http://localhost:3005/api/reset-password-otp', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data = await res.json();

    if (res.ok) {
      setMsg('Password reset successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(data.error || 'Invalid OTP or something went wrong.');
    }
  };

  return (
    <div style={pageBackground}>
      <div style={formContainer}>
        <h2 style={title}>Reset Password</h2>
        <form onSubmit={handleSubmit} style={form}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={input}
          />
          <input
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            placeholder="Enter OTP"
            required
            style={input}
          />
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="New Password"
            required
            style={input}
          />
          <button type="submit" style={button}>Reset Password</button>
        </form>
        {msg && <p style={{ color: 'lightgreen' }}>{msg}</p>}
        {error && <p style={{ color: 'salmon' }}>{error}</p>}
        <div style={{ marginTop: 10 }}>
          <Link to="/login" style={link}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

const pageBackground = {
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1db954 100%)',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const formContainer = {
  maxWidth: 400,
  margin: 'auto',
  background: 'rgba(32, 35, 42, 0.85)',
  padding: 30,
  borderRadius: 12,
  color: '#fff',
  boxShadow: '0 8px 32px 0 rgba(29, 185, 84, 0.6)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
};

const form = {
  display: 'flex',
  flexDirection: 'column',
};

const input = {
  marginBottom: 15,
  padding: 12,
  fontSize: 16,
  borderRadius: 6,
  border: '1px solid #2a5298',
  background: '#2c2c2c',
  color: '#eee',
  outline: 'none',
  transition: 'border-color 0.3s',
};

const button = {
  padding: 14,
  fontSize: 16,
  background: '#1db954',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  color: '#fff',
  fontWeight: '600',
  transition: 'background-color 0.3s',
};

const title = {
  marginBottom: 20,
  textAlign: 'center',
};

const link = {
  color: '#1db954',
  textDecoration: 'none',
  fontSize: 14,
  textAlign: 'center',
};
