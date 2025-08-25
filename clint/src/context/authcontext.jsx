import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const isLoggedIn = !!user;

  // Register
  const register = async ({ name, email, password }) => {
    try {
      const res = await fetch('https://mern-music-web.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        await refreshAuth();
      }
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  // ✅ Real login
  const login = async ({ email, password }) => {
    try {
      const res = await fetch('https://mern-music-web.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        await refreshAuth(); // get session user
      } else {
        console.error('Login failed');
        setUser(null);
      }
    } catch (err) {
      console.error('Login error:', err);
      setUser(null);
    }
  };

  // Logout
  const logout = async () => {
    try {
      const res = await fetch('https://mern-music-web.onrender.com/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setUser(null);
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Refresh current user session
  const refreshAuth = async () => {
    try {
      const res = await fetch('https://mern-music-web.onrender.com/api/me', {
        credentials: 'include',
      });
      if (res.ok) {
        const { user } = await res.json();
        setUser(user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth refresh error:', err);
      setUser(null);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        register,
        login,
        logout,
        refreshAuth,
        showSubscribeModal,
        setShowSubscribeModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
