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
  padding: '16px 5%',
  color: '#fff',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '2px solid #1db954',
  flexWrap: 'wrap',
  gap: '16px',
};

const brandArea = {
  display: 'flex',
  flexDirection: 'column',
  lineHeight: '1.2',
  flexShrink: 0,
};

const appName = {
  fontSize: 'clamp(20px, 5vw, 24px)',
  fontWeight: 'bold',
  color: '#1db954',
  letterSpacing: '1px',
};

const navLinks = {
  display: 'flex',
  gap: 'clamp(10px, 2vw, 20px)',
  fontSize: 'clamp(14px, 2.5vw, 16px)',
  alignItems: 'center',
  flexWrap: 'wrap',
  justifyContent: 'center',
  flex: 1,
  minWidth: 'min-content',
};

const link = {
  color: '#fff',
  textDecoration: 'none',
  transition: 'color 0.2s',
  whiteSpace: 'nowrap',
};

const userSection = {
  display: 'flex',
  alignItems: 'center',
  gap: 'clamp(8px, 1.5vw, 12px)',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  flexShrink: 0,
};

const welcomeText = {
  fontSize: 'clamp(12px, 2.5vw, 14px)',
  color: '#ccc',
  whiteSpace: 'nowrap',
};

const logoutBtn = {
  background: '#ff5a5f',
  border: 'none',
  padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2vw, 14px)',
  color: '#fff',
  fontWeight: 'bold',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: 'clamp(12px, 2.5vw, 14px)',
  whiteSpace: 'nowrap',
};

const profileBtn = {
  backgroundColor: '#2c2c2c',
  padding: 'clamp(5px, 1.5vw, 6px) clamp(8px, 2vw, 12px)',
  color: '#fff',
  border: '1px solid #1db954',
  borderRadius: '4px',
  textDecoration: 'none',
  fontSize: 'clamp(12px, 2.5vw, 14px)',
  transition: 'background 0.3s',
  whiteSpace: 'nowrap',
};

// Add media queries for better mobile experience
const mediaQueries = `
  @media (max-width: 768px) {
    header {
      flex-direction: column;
      text-align: center;
      padding: 12px 5%;
    }
    
    nav {
      order: 3;
      width: 100%;
      margin-top: 10px;
    }
    
    .user-section {
      order: 2;
      justify-content: center;
      width: 100%;
      margin: 10px 0;
    }
    
    .brand-area {
      order: 1;
      width: 100%;
      margin-bottom: 10px;
    }
  }
  
  @media (max-width: 480px) {
    nav {
      flex-direction: column;
      gap: 8px;
    }
    
    .user-section {
      flex-direction: column;
      gap: 8px;
    }
  }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = mediaQueries;
  document.head.appendChild(styleElement);
}