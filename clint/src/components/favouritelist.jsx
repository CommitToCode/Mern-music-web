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
    return <p style={msgStyle}>❤️ You haven't added any favorites yet.</p>;

  return (
    <div style={pageStyle}>
      <h2 style={headerStyle}>🎶 Your Favorite Songs</h2>
      <div style={gridStyle}>
        {favorites.map((song) => {
          const audioRef = useRef(null);
          const playing = useAudioPlaying(audioRef);

          
const imgUrl = song.imageUrl || '/images/default-cover.png';

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

              <h4 style={{ margin: '0.5rem 0', fontSize: 'clamp(1rem, 3vw, 1.1rem)', color: '#fff' }}>
                {song.title}
              </h4>
              <p style={{ color: '#aaa', marginBottom: 'clamp(8px, 2vw, 10px)', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>{song.artist}</p>

              {song.fileUrl && (
                <audio
                  controls
                  controlsList="nodownload"
                  style={audioStyle}
                  ref={audioRef}
                  src={song.fileUrl}
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
  height: 'clamp(140px, 30vw, 160px)',
  borderRadius: '10px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  marginBottom: 'clamp(8px, 2vw, 10px)',
  overflow: 'hidden',
  minHeight: '140px',
};

const styles = {
  visualizer: {
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '4px',
    height: '30px',
    zIndex: 10,
    pointerEvents: 'none',
    alignItems: 'flex-end',
  },

  visualizerBar: {
    width: '5px',
    height: '100%',
    backgroundColor: '#1db954',
    borderRadius: '2px',
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

@media (max-width: 480px) {
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) !important;
    gap: 1rem !important;
  }
  
  .favorites-header {
    font-size: 1.5rem !important;
    margin-bottom: 1.5rem !important;
  }
  
  .favorites-page {
    padding: 1.5rem 1rem !important;
  }
}

@media (max-width: 768px) {
  .favorites-grid {
    justify-content: center;
  }
}
`;

// Inject keyframes and media queries into document head
if (typeof window !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = styleSheet;
  document.head.appendChild(styleEl);
}

const pageStyle = {
  padding: 'clamp(1.5rem, 5vw, 2rem)',
  background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
  minHeight: '100vh',
  color: '#fff',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  className: 'favorites-page'
};

const headerStyle = {
  marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
  fontSize: 'clamp(1.5rem, 5vw, 2rem)',
  fontWeight: 700,
  letterSpacing: '0.5px',
  textAlign: 'center',
  className: 'favorites-header'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(240px, 30vw, 280px), 1fr))',
  gap: 'clamp(1rem, 3vw, 1.5rem)',
  justifyContent: 'center',
  className: 'favorites-grid'
};

const cardStyle = {
  background: '#1f1f1f',
  padding: 'clamp(12px, 3vw, 16px)',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  width: '100%',
  boxSizing: 'border-box',
};

const audioStyle = {
  width: '100%',
  borderRadius: '6px',
  outline: 'none',
  filter: 'invert(1) brightness(1.2)',
  minHeight: '40px',
};

const msgStyle = {
  padding: 'clamp(2rem, 8vw, 3rem)',
  textAlign: 'center',
  color: '#ddd',
  fontSize: 'clamp(1rem, 4vw, 1.1rem)',
  background: '#121212',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 0,
};