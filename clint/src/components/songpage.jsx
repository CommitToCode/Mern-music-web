import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionModal from '../pages/subscribe';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/authcontext';
import { useFavorites } from '../context/favouritecontext';

const PAGE_SIZE = 8;

export default function SongsPage() {
  const [songs, setSongs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState(null);
  const [artistFilter, setArtistFilter] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const { isLoggedIn, user, refreshAuth, showSubscribeModal, setShowSubscribeModal } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const audioRefs = useRef({});
  const dropdownRef = useRef(null);
  const loaderRef = useRef(null);

  const fetchSongs = useCallback(
    async (pageToLoad, search, isNewQuery = false) => {
      setLoading(true);
      try {
        const url = `http://localhost:3005/admin/api/songs?search=${encodeURIComponent(search)}&page=${pageToLoad}&limit=${PAGE_SIZE}`;
        const res = await fetch(url, { credentials: 'include' });

        if (!res.ok) throw new Error('Failed to fetch songs');
        const data = await res.json();

        setTotalPages(Math.ceil(data.totalCount / PAGE_SIZE));
        setSongs((prev) => (isNewQuery ? data.songs : [...prev, ...data.songs]));
      } catch (err) {
        toast.error('Error loading songs: ' + err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!filterMode && !artistFilter) {
      setSongs([]);
      setPage(1);
      fetchSongs(1, searchTerm, true);
    }
  }, [searchTerm, filterMode, artistFilter, fetchSongs]);

  useEffect(() => {
    if (!filterMode && !artistFilter && page > 1) {
      fetchSongs(page, searchTerm);
    }
  }, [page, filterMode, artistFilter, searchTerm, fetchSongs]);

  useEffect(() => {
    if (filterMode || artistFilter || page >= totalPages || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [page, filterMode, artistFilter, totalPages, loading]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        clearFilters();
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const clearFilters = () => {
    setFilterMode(null);
    setArtistFilter(null);
    setSongs([]);
    setPage(1);
  };

  let displayedSongs = songs;

  if (filterMode === 'recentlyAdded') {
    displayedSongs = [...songs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  } else if (filterMode === 'artist' && artistFilter) {
    displayedSongs = songs.filter((song) => song.artist === artistFilter);
  }

  const uniqueArtists = Array.from(new Set(songs.map((song) => song.artist))).filter(Boolean);

  const startDownload = (song) => {
    window.open(`http://localhost:3005/songs/api/songs/${song._id}/download`, '_blank');
  };

  const handleDownload = async (song) => {
    if (!isLoggedIn) {
      toast.info('🔐 Please login with your registered email or register to download songs.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3005/songs/api/songs/${song._id}/status`, {
        credentials: 'include',
      });

      if (res.status === 401) {
        toast.info('🔐 Please login with your registered email or register to download songs.');
        return;
      }

      if (!res.ok) {
        setSelectedSong(song);
        setShowSubscribeModal(true);
        return;
      }

      startDownload(song);
      toast.success(`⬇️ Download started: "${song.title}"`);
    } catch (error) {
      toast.error('Failed to check subscription status.');
    }
  };

  const handleFavorite = (song) => {
    if (!isLoggedIn) {
      toast.info('🔐 Please login to add songs to favorites.');
      return;
    }

    const isFav = favorites.some((fav) => fav._id === song._id);
    toggleFavorite(song);
    toast[isFav ? 'info' : 'success'](
      isFav
        ? `💔 "${song.title}" removed from your favorites.`
        : `🎵 "${song.title}" added to your favorites!`
    );
  };

  const isSubscriptionExpired = () => {
    if (!user?.subscriptionExpires) return true;
    const expires = new Date(user.subscriptionExpires);
    return expires < new Date();
  };

  const skipTime = (songId, amount) => {
    const audio = audioRefs.current[songId];
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + amount));
    }
  };

  return (
    <div style={styles.container}>
      {user && (
        <div style={styles.welcomeBox}>
          <div style={styles.welcomeRow}>
            <span role="img" aria-label="welcome" style={{ fontSize: '1.2rem' }}>👋</span>
            <span>Welcome, {user.name?.split(' ')[0]}!</span>
          </div>
          {isSubscriptionExpired() ? (
            <div style={styles.expiredRow}>
              <span role="img" aria-label="expired">❌</span>
              <span>Your subscription has expired or you're not subscribed. Please check.</span>
            </div>
          ) : (
            <div style={styles.activeRow}>
              <span role="img" aria-label="active">✅</span>
              <span>You are subscribed. Enjoy downloads!</span>
            </div>
          )}
        </div>
      )}

      <div style={styles.searchBarWrapper}>
        <input
          type="text"
          placeholder="🔍 Search songs..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            clearFilters();
          }}
          style={styles.searchInput}
        />
        <div style={styles.dropdownWrapper} ref={dropdownRef}>
          <button onClick={() => setShowDropdown((prev) => !prev)} style={styles.threeDotBtn}>
            ⋮
          </button>
          {showDropdown && (
            <div style={styles.dropdownMenu}>
              <button
                style={styles.dropdownItem}
                onClick={() => {
                  setFilterMode('recentlyAdded');
                  setArtistFilter(null);
                  setShowDropdown(false);
                }}
              >
                Recently Added
              </button>
              <div style={styles.dropdownArtistSection}>
                <div style={{ marginBottom: 6, fontWeight: 'bold', color: '#d2dfd7ff' }}>Artists</div>
                {uniqueArtists.length === 0 && <div style={{ color: '#777', fontSize: 14 }}>No artists</div>}
                {uniqueArtists.map((artist) => (
                  <button
                    key={artist}
                    style={{
                      ...styles.dropdownItem,
                      fontWeight: artistFilter === artist ? 'bold' : 'normal',
                    }}
                    onClick={() => {
                      setFilterMode('artist');
                      setArtistFilter(artist);
                      setShowDropdown(false);
                    }}
                  >
                    {artist}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={styles.songListContainer}>
        {displayedSongs.map((song) => {
          const isFavorite = favorites.some((fav) => fav._id === song._id);
          const isPlaying = playingSongId === song._id;

          return (
            <div key={song._id} style={styles.card}>
              <div style={styles.imageWrapper}>
                <img
                  src={`http://localhost:3005${song.imageUrl || '/images/default-cover.png'}`}
                  alt={song.title}
                  style={styles.img}
                />
                {song.fileUrl && isPlaying && (
                  <div style={styles.visualizer}>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} style={{ ...styles.visualizerBar, animationDelay: `${i * 0.12}s` }} />
                    ))}
                  </div>
                )}
              </div>

              <h4 style={{ margin: '8px 0 4px' }}>{song.title}</h4>
              <p style={{ color: '#aaa', marginBottom: 8 }}>{song.artist}</p>

              {song.fileUrl && (
                <>
                  <audio
                    ref={(el) => (audioRefs.current[song._id] = el)}
                    controls
                    controlsList="nodownload"
                    style={{
                      width: '100%',
                      outline: 'none',
                      filter: 'invert(1) brightness(1.2)',
                    }}
                    onPlay={() => setPlayingSongId(song._id)}
                    onPause={() => setPlayingSongId(null)}
                    onEnded={() => setPlayingSongId(null)}
                  >
                    <source src={`http://localhost:3005${song.fileUrl}`} type="audio/mpeg" />
                  </audio>
                  {isPlaying && (
                    <div style={styles.seekControls}>
                      <button style={styles.seekButton} onClick={() => skipTime(song._id, -10)}>⏪</button>
                      <button style={styles.seekButton} onClick={() => skipTime(song._id, 10)}>⏩</button>
                    </div>
                  )}
                </>
              )}

              <div style={styles.buttonRow}>
                <button onClick={() => handleFavorite(song)} style={styles.favBtn}>
                  {isFavorite ? '❤️' : '🤍'}
                </button>
                {song.fileUrl && (
                  <button onClick={() => handleDownload(song)} style={styles.dlBtn}>⬇️</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!filterMode && !artistFilter && page < totalPages && (
        <div ref={loaderRef} style={{ height: 60, marginTop: 20, textAlign: 'center' }}>
          <p style={{ color: '#ccc' }}>⏳ Loading more songs...</p>
        </div>
      )}

      {showSubscribeModal && (
        <SubscriptionModal
          selectedSong={selectedSong}
          onClose={() => setShowSubscribeModal(false)}
          onSubscribe={async () => {
            await refreshAuth();
            setShowSubscribeModal(false);
            toast.success(
              '🎉 Subscription successful! You can now download songs. Please click the download button again.'
            );
          }}
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <style>{`
        @keyframes upDown {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
}

// Keep styles as-is — no changes required.

  

const styles = {
  container: {
    padding: 24,
    background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
    minHeight: '100vh',
    color: '#f0f0f0',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: 'relative',
  },

  searchBarWrapper: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  searchInput: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #444',
    fontSize: 14,
    backgroundColor: '#111',
    color: '#eee',
    width: 220,
    outline: 'none',
  },

  dropdownWrapper: {
    position: 'relative',
  },

  threeDotBtn: {
    background: 'transparent',
    border: 'none',
    color: '#eee',
    fontSize: 24,
    cursor: 'pointer',
    userSelect: 'none',
    padding: '0 6px',
    outline: 'none',
    lineHeight: 1,
      marginLeft: 1050,  // <-- added margin here
  },

  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 0,
    backgroundColor: '#222',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.8)',
    padding: 8,
    minWidth: 160,
    zIndex: 1000,
  },

  dropdownItem: {
    width: '100%',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    color: '#1db954',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: 14,
    userSelect: 'none',
    borderRadius: 4,
  },

  dropdownArtistSection: {
    marginTop: 8,
    borderTop: '1px solid #444',
    paddingTop: 8,
  },

  songListContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    marginTop: 80,
    paddingBottom: 100,
  },

  card: {
    background: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    width: 280,
    textAlign: 'center',
    boxShadow: '0 6px 14px rgba(0,0,0,0.5)',
    position: 'relative',
  },

  imageWrapper: {
    position: 'relative',
  },

  img: {
    width: '100%',
    height: 180,
    objectFit: 'cover',
    borderRadius: 12,
  },

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
  },

 visualizerBar: {
    width: 5,
    height: '100%',
    backgroundColor: '#1db954',
    borderRadius: 2,
    animationName: 'upDown',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    transformOrigin: 'bottom',
  },

  seekControls: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: 8,
    marginBottom: 8,
  },

  seekButton: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: 20,
    cursor: 'pointer',
    padding: 0,
    outline: 'none',
    userSelect: 'none',
  },

  buttonRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  favBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: 24,
    cursor: 'pointer',
    color: '#f00',
  },

  dlBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: 20,
    cursor: 'pointer',
    color: '#1db954',
  },

  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#ccc',
  },

  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
    flexWrap: 'wrap',
  },

  pageBtn: {
    backgroundColor: 'transparent',
    border: '1.5px solid #1db954',
    borderRadius: 6,
    padding: '6px 12px',
    cursor: 'pointer',
    color: '#1db954',
    userSelect: 'none',
  },

  welcomeBox: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 12,
    marginBottom: 56,
    position: 'relative',
    maxWidth: 280,
  },

  welcomeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 18,
    marginBottom: 8,
    color: '#1db954',
  },

  expiredRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    color: '#e33',
  },

  activeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    color: '#1db954',
  },
};
