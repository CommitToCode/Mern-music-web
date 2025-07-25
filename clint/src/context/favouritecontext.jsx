import React, { createContext, useContext, useState } from 'react';

const FavoriteContext = createContext();

export const useFavorites = () => useContext(FavoriteContext);

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (song) => {
    setFavorites(prev => {
      const exists = prev.find(s => s._id === song._id);
      if (exists) {
        return prev.filter(s => s._id !== song._id);
      } else {
        return [...prev, song];
      }
    });
  };

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};
