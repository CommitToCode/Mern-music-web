import React from 'react';
import { useFavorites } from '../context/favouritecontext';
import { useAuth } from '../context/authcontext';
import ProtectedDownload from './protectdownload';

export default function SongCard({ song }) {
  const { addFavorite } = useFavorites();
  const { isLoggedIn } = useAuth();

  if (!song) return null; 

  return (
    <div style={cardStyle}>
      <img
        src={`http://localhost:3005${song.imageUrl || ''}`}
        alt={song.title}
        style={imgStyle}
        onError={(e) => e.currentTarget.src = '/images/default-cover.png'}
      />

      <h4>{song.title || 'Untitled'}</h4>
      <p>{song.artist || 'Unknown Artist'}</p>

      {song.isActive && song.fileUrl ? (
        <>
          <audio
            controls
            src={`http://localhost:3005${song.fileUrl}`}
            style={{ width: '100%' }}
          />
          {isLoggedIn ? (
            <ProtectedDownload url={`http://localhost:3005${song.fileUrl}`} />
          ) : (
            <p style={{ color: 'red' }}>Login to Download</p>
          )}
        </>
      ) : (
        <p style={{ color: 'gray' }}>Not Active</p>
      )}

      <button onClick={() => addFavorite(song)} style={favBtnStyle}>
        ❤️
      </button>
    </div>
  );
}

const cardStyle = {
  border: '1px solid #ccc',
  padding: 12,
  margin: 12,
  width: 240,
  borderRadius: 8,
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  textAlign: 'center',
};

const imgStyle = {
  width: '100%',
  height: 140,
  objectFit: 'cover',
  borderRadius: 6,
};

const favBtnStyle = {
  marginTop: 8,
  background: 'hotpink',
  color: '#fff',
  border: 'none',
  padding: '6px 10px',
  borderRadius: 4,
  cursor: 'pointer',
};
