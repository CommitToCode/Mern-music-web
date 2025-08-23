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
        src={`https://mern-music-web.onrender.com${song.imageUrl || ''}`}
        alt={song.title}
        style={imgStyle}
        onError={(e) => e.currentTarget.src = '/images/default-cover.png'}
      />

      <h4 style={titleStyle}>{song.title || 'Untitled'}</h4>
      <p style={artistStyle}>{song.artist || 'Unknown Artist'}</p>

      {song.isActive && song.fileUrl ? (
        <>
          <audio
            controls
            src={`https://mern-music-web.onrender.com${song.fileUrl}`}
            style={audioStyle}
          />
          {isLoggedIn ? (
            <ProtectedDownload url={`https://mern-music-web.onrender.com${song.fileUrl}`} />
          ) : (
            <p style={{ color: 'red', fontSize: '14px', margin: '8px 0' }}>Login to Download</p>
          )}
        </>
      ) : (
        <p style={{ color: 'gray', fontSize: '14px', margin: '8px 0' }}>Not Active</p>
      )}

      <button onClick={() => addFavorite(song)} style={favBtnStyle}>
        ❤️
      </button>
    </div>
  );
}

const cardStyle = {
  border: '1px solid #ccc',
  padding: '12px',
  margin: '12px',
  width: '100%',
  maxWidth: '280px',
  borderRadius: '8px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
};

const imgStyle = {
  width: '100%',
  height: '140px',
  objectFit: 'cover',
  borderRadius: '6px',
};

const titleStyle = {
  fontSize: 'clamp(16px, 4vw, 18px)',
  margin: '8px 0 4px 0',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const artistStyle = {
  fontSize: 'clamp(14px, 3vw, 16px)',
  color: '#666',
  margin: '0 0 12px 0',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const audioStyle = { 
  width: '100%',
  margin: '8px 0'
};

const favBtnStyle = {
  marginTop: '8px',
  background: 'hotpink',
  color: '#fff',
  border: 'none',
  padding: '6px 10px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
  alignSelf: 'center',
};