import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('https://mern-music-web.onrender.com/api/register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      navigate('/login');
    } else {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div style={pageBackground}>
      <div style={formContainer}>
        <h2 style={title}>Create an Account</h2>
        <form onSubmit={handleSubmit} style={form}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full Name"
            required
            style={input}
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={input}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={input}
          />
          <button type="submit" style={button}>Register</button>
        </form>
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
  background: '#ff5a5f',
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
