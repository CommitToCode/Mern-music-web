import React, { useRef, useEffect, useState } from 'react';
import { useFavorites } from '../context/favouritecontext';
import { useAuth } from '../context/authcontext';

export default function Favorites() {
  const { favorites } = useFavorites();
  const { isLoggedIn } = useAuth();

  
  function useAudioPlaying(audioRef) {
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
      if (!audioRef.current) return;

      const audio = audioRef.current;

      const onPlay = () => setPlaying(true);
      const onPause = () => setPlaying(false);
      const onEnded = () => setPlaying(false);

      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);
      audio.addEventListener('ended', onEnded);

      return () => {
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('ended', onEnded);
      };
    }, [audioRef]);

    return playing;
  }

  if (!isLoggedIn)
    return <p style={msgStyle}>🔐 Please log in to see your favorite songs.</p>;

  if (favorites.length === 0)
    return <p style={msgStyle}>❤️ You haven’t added any favorites yet.</p>;

  return (
    <div style={pageStyle}>
      <h2 style={headerStyle}>🎶 Your Favorite Songs</h2>
      <div style={gridStyle}>
        {favorites.map((song) => {
          const audioRef = useRef(null);
          const playing = useAudioPlaying(audioRef);

          
          const imgUrl = `http://localhost:3005${song.imageUrl || '/images/default-cover.png'}`;

          return (
            <div key={song._id} style={cardStyle}>
              <div style={{ ...visualizerContainerStyle, backgroundImage: `url(${imgUrl})` }}>
                {song.fileUrl && playing && (
                  <div style={styles.visualizer}>
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          ...styles.visualizerBar,
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <h4 style={{ margin: '0.5rem 0', fontSize: '1.1rem', color: '#fff' }}>
                {song.title}
              </h4>
              <p style={{ color: '#aaa', marginBottom: 10 }}>{song.artist}</p>

              {song.fileUrl && (
                <audio
                  controls
                  controlsList="nodownload"
                  style={audioStyle}
                  ref={audioRef}
                  src={`http://localhost:3005${song.fileUrl}`}
                  type="audio/mpeg"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const visualizerContainerStyle = {
  position: 'relative',
  width: '100%',
  height: 160,
  borderRadius: 10,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  marginBottom: 10,
  overflow: 'hidden',
};

const styles = {
  visualizer: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 4,
    height: 30,
    zIndex: 10,
    pointerEvents: 'none',
    alignItems: 'flex-end',
  },

  visualizerBar: {
    width: 5,
    height: '100%',
    backgroundColor: '#1db954',
    borderRadius: 2,
    animationName: 'barPulse',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    transformOrigin: 'bottom',
  },
};

const styleSheet = `
@keyframes barPulse {
  0%, 100% { transform: scaleY(0.4); opacity: 0.7; }
  50% { transform: scaleY(1); opacity: 1; }
}
`;

// Inject keyframes into document head (works in React)
if (typeof window !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = styleSheet;
  document.head.appendChild(styleEl);
}

const pageStyle = {
  padding: '2rem',
  background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
  minHeight: '100vh',
  color: '#fff',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const headerStyle = {
  marginBottom: 30,
  fontSize: '2rem',
  fontWeight: 700,
  letterSpacing: '0.5px',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: '1.5rem',
};

const cardStyle = {
  background: '#1f1f1f',
  padding: 16,
  borderRadius: 10,
  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
};

const audioStyle = {
  width: '100%',
  borderRadius: 6,
  outline: 'none',
  filter: 'invert(1) brightness(1.2)',
};

const msgStyle = {
  padding: '3rem',
  textAlign: 'center',
  color: '#ddd',
  fontSize: '1.1rem',
  background: '#121212',
  minHeight: '100vh',
};
