
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

export default function Header() {
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <header style={headerWrapper}>
      {/* Brand / App Name */}
      <div style={brandArea}>
        <span style={appName}>🎵 R•Songs</span>
      </div>

      {/* Navigation */}
      <nav style={navLinks}>
        <Link to="/" style={link}>🎶 Discover</Link>
        <Link to="/favorites" style={link}>❤️ My Vibes</Link>
        <Link to="/upload" style={link}>⬆️ Drop a Track</Link>
      </nav>

  
      <div style={userSection}>
        {isLoggedIn ? (
          <>
            <span style={welcomeText}>
              Welcome, {user?.name?.split(' ')[0]}
            </span>

      
            <Link to="/profile" style={profileBtn}>👤 Profile</Link>

            <button onClick={logout} style={logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={link}>Login</Link>
            {' | '}
            <Link to="/register" style={link}>Register</Link>
          </>
        )}
      </div>
    </header>
  );
}

const headerWrapper = {
  background: '#121212',
  padding: '16px 32px',
  color: '#fff',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '2px solid #1db954',
  flexWrap: 'wrap',
};

const brandArea = {
  display: 'flex',
  flexDirection: 'column',
  lineHeight: '1.2',
};

const appName = {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#1db954',
  letterSpacing: '1px',
};

const navLinks = {
  display: 'flex',
  gap: '20px',
  fontSize: 16,
  alignItems: 'center',
  flexWrap: 'wrap',
};

const link = {
  color: '#fff',
  textDecoration: 'none',
  transition: 'color 0.2s',
};

const userSection = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
};

const welcomeText = {
  fontSize: 14,
  color: '#ccc',
};

const logoutBtn = {
  background: '#ff5a5f',
  border: 'none',
  padding: '8px 14px',
  color: '#fff',
  fontWeight: 'bold',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 14,
};

const profileBtn = {
  backgroundColor: '#2c2c2c',
  padding: '6px 12px',
  color: '#fff',
  border: '1px solid #1db954',
  borderRadius: 4,
  textDecoration: 'none',
  fontSize: 14,
  transition: 'background 0.3s',
};
