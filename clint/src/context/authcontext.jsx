import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const isLoggedIn = !!user;

  const register = ({ username }) => setUser({ username, isSubscribed: false });
  const login = ({ username }) => setUser({ username, isSubscribed: false });

  // Updated logout function
  const logout = async () => {
    try {
      const res = await fetch('https://mern-music-web.onrender.com/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        setUser(null);  
      } else {
        console.error('Logout failed on server');
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    }
  };

  const subscribe = () => setUser((u) => ({ ...u, isSubscribed: true }));

  const refreshAuth = async () => {
    try {
      const res = await fetch('https://mern-music-web.onrender.com/api/me', { credentials: 'include' });
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
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      register,
      login,
      logout,
      subscribe,
      refreshAuth,
      showSubscribeModal,
      setShowSubscribeModal,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
