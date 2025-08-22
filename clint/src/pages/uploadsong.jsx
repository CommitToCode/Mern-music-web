import React, { useState, useEffect } from 'react';
import SubscriptionModal from './subscribe';

export default function Upload() {
  const [name, setName] = useState('');
  const [line, setLine] = useState('');
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [message, setMessage] = useState('');
  const [approvedSongs, setApprovedSongs] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const getFileUrl = (filePath) => {
    if (!filePath) return '';
    const cleanedPath = filePath.replace(/^uploads[\\/]/, '').replace(/\\/g, '/');
    return `https://mern-music-web.onrender.com/uploads/${cleanedPath}`;
  };

  const checkLoginStatus = async () => {
    try {
      const res = await fetch('http://localhost:3005/api/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const { user } = await res.json();
        const isSubValid = user.isSubscribed && new Date(user.subscriptionExpires) > new Date();
        setIsLoggedIn(true);
        setIsSubscribed(isSubValid);
        setUserName(user.name);
        setUserEmail(user.email);
        if (!isSubValid) {
          setMessage('🔒 Please subscribe to upload your song.');
        } else {
          setMessage('');
        }
      } else {
        setIsLoggedIn(false);
        setIsSubscribed(false);
        setUserName('');
        setUserEmail('');
        setMessage('🔑 Please log in to upload songs.');
      }
    } catch (err) {
      console.error(err);
      setIsLoggedIn(false);
      setIsSubscribed(false);
      setUserName('');
      setUserEmail('');
      setMessage('⚠️ Error checking login.');
    }
  };

  const fetchApprovedSongs = async () => {
    try {
      const res = await fetch('http://localhost:3005/songs/approved-songs');
      if (res.ok) {
        const data = await res.json();
        setApprovedSongs(data);
      }
    } catch (err) {
      console.error('Error fetching approved songs:', err);
    }
  };

  const fetchDownloads = async () => {
    try {
      const res = await fetch('http://localhost:3005/api/downloads', {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setDownloads(data);
      }
    } catch (err) {
      console.error('Error fetching downloads:', err);
    }
  };

  const handleDownload = async (songId) => {
    if (!isLoggedIn) {
      setMessage('🔑 Please log in to download songs.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3005/api/songs/${songId}/download`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'track.mp3';
        document.body.appendChild(a);
        a.click();
        a.remove();
        fetchDownloads(); // Refresh download history
      } else {
        setMessage('❌ Download failed.');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Download error.');
    }
  };

  useEffect(() => {
    checkLoginStatus();
    fetchApprovedSongs();
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchDownloads();
  }, [isLoggedIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !line || !image || !audio) {
      setMessage('⚠️ Please fill in all fields.');
      return;
    }

    if (!isLoggedIn) {
      setMessage('Please log in first.');
      return;
    }

    if (!isSubscribed) {
      setMessage('🔒 Please subscribe before uploading.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('line', line);
      formData.append('image', image);
      formData.append('audio', audio);

      const uploadRes = await fetch('https://mern-music-web.onrender.com/uploads', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await uploadRes.json();

      if (uploadRes.ok) {
        setMessage(`🎉 Thank you ${userName}, your song is pending approval.`);
        setName('');
        setLine('');
        setImage(null);
        setAudio(null);
        fetchApprovedSongs();
      } else {
        setMessage(result.error || '❌ Upload failed.');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Error during upload.');
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
        minHeight: '100vh',
        color: '#f0f0f0',
        padding: 'clamp(1rem, 5vw, 2rem)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 700, marginBottom: 'clamp(1rem, 3vw, 1.25rem)', textAlign: 'center' }}>🎙️ Upload Your Song</h2>

        {message && (
          <div
            style={{
              backgroundColor: '#2c3e50',
              padding: 'clamp(0.75rem, 2vw, 0.875rem) clamp(1rem, 2.5vw, 1.125rem)',
              borderRadius: '8px',
              marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
              color: '#f6ffed',
              border: '1px solid #4caf50',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            }}
          >
            {message}
          </div>
        )}

        {isLoggedIn && !isSubscribed && (
          <button
            onClick={() => setShowSubscriptionModal(true)}
            style={{
              backgroundColor: '#ff9800',
              color: '#fff',
              border: 'none',
              padding: 'clamp(0.5rem, 1.5vw, 0.625rem) clamp(0.75rem, 2vw, 1rem)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            }}
          >
            Go to Subscription
          </button>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(0.75rem, 2vw, 1rem)',
            marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
            maxWidth: '400px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required style={inputStyle} />
          <input value={line} onChange={(e) => setLine(e.target.value)} placeholder="Description Line" required style={inputStyle} />
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required style={inputStyle} />
          <input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files[0])} required style={inputStyle} />
          <button
            type="submit"
            style={{
              padding: 'clamp(0.75rem, 2vw, 0.875rem)',
              backgroundColor: '#1db954',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            }}
            disabled={!isLoggedIn || !isSubscribed}
          >
            Upload Song
          </button>
        </form>

        <h3 style={{ marginTop: 'clamp(2rem, 5vw, 2.5rem)', fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: 600, color: '#9effd3', textAlign: 'center' }}>
          Your voice tells a story—let others hear it.
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(250px, 30vw, 300px), 1fr))',
            gap: 'clamp(1rem, 3vw, 1.5rem)',
            marginTop: 'clamp(1rem, 3vw, 1.25rem)',
            justifyContent: 'center',
          }}
        >
          {approvedSongs.map((song) => (
            <div
              key={song._id}
              style={{
                background: '#1e1e1e',
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                borderRadius: '12px',
                boxShadow: '0 6px 14px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#f0f0f0',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <img
                src={getFileUrl(song.image)}
                alt={song.name}
                onError={(e) => {
                  e.target.src = '/placeholder.jpg';
                }}
                style={{
                  width: '100%',
                  height: 'clamp(120px, 25vw, 150px)',
                  objectFit: 'cover',
                  borderRadius: '10px',
                }}
              />
              <h4 style={{ marginTop: 'clamp(0.5rem, 1.5vw, 0.625rem)', fontSize: 'clamp(1rem, 3vw, 1.125rem)' }}>{song.name}</h4>
              <p style={{ color: '#ccc', fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', textAlign: 'center' }}>{song.line}</p>
              <audio
                controls
                controlsList="nodownload"
                style={{
                  width: '100%',
                  outline: 'none',
                  filter: 'invert(1) brightness(1.2)',
                  marginTop: 'clamp(0.5rem, 1.5vw, 0.625rem)',
                }}
              >
                <source src={getFileUrl(song.audio)} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ))}
        </div>

        {isLoggedIn && downloads.length > 0 && (
          <div style={{ marginTop: 'clamp(2rem, 5vw, 3rem)', padding: '0 clamp(0.5rem, 2vw, 1rem)' }}>
            <h3 style={{ marginBottom: 'clamp(0.75rem, 2vw, 1rem)', color: '#9effd3', fontSize: 'clamp(1.125rem, 3.5vw, 1.375rem)', textAlign: 'center' }}>📥 Your Downloads ({userEmail})</h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {downloads.map((dl, i) => (
                <li key={i} style={{ marginBottom: 'clamp(0.5rem, 1.5vw, 0.625rem)', color: '#ddd', fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}>
                  {dl.songName} – {new Date(dl.downloadedAt).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showSubscriptionModal && (
        <SubscriptionModal
          selectedSong={{ title: 'your next upload' }}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribe={async () => {
            await checkLoginStatus();
            setShowSubscriptionModal(false);
            setMessage('✅ Subscription complete! You can now upload songs.');
          }}
        />
      )}
    </div>
  );
}

const inputStyle = {
  padding: 'clamp(0.5rem, 1.5vw, 0.625rem) clamp(0.75rem, 2vw, 0.875rem)',
  borderRadius: '6px',
  border: '1px solid #555',
  backgroundColor: '#1e1e1e',
  color: '#fff',
  fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
  boxSizing: 'border-box',
  width: '100%',
};