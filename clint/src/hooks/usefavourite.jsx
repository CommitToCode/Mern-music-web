import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  function toggleFavorite(song) {
    setFavorites(prev =>
      prev.find(s => s._id === song._id)
        ? prev.filter(s => s._id !== song._id)
        : [...prev, song]
    );
  }

  return { favorites, toggleFavorite };
}
