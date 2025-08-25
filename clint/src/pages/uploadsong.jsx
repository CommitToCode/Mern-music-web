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

  

  const checkLoginStatus = async () => {
    try {
      const res = await fetch('https://mern-music-web.onrender.com/api/me', {
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
      const res = await fetch('https://mern-music-web.onrender.com/songs/approved-songs');
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
      const res = await fetch('https://mern-music-web.onrender.com/api/downloads', {
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
      const res = await fetch(`https://mern-music-web.onrender.com/api/songs/${songId}/download`, {
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
        padding: '2rem',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 20 }}>🎙️ Upload Your Song</h2>

        {message && (
          <div
            style={{
              backgroundColor: '#2c3e50',
              padding: '12px 18px',
              borderRadius: 8,
              marginBottom: '1rem',
              color: '#f6ffed',
              border: '1px solid #4caf50',
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
              padding: '10px 16px',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              marginBottom: '1rem',
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
            gap: '1rem',
            marginBottom: '2rem',
            maxWidth: 400,
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required style={inputStyle} />
          <input value={line} onChange={(e) => setLine(e.target.value)} placeholder="Description Line" required style={inputStyle} />
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required style={inputStyle} />
          <input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files[0])} required style={inputStyle} />
          <button
            type="submit"
            style={{
              padding: '12px',
              backgroundColor: '#1db954',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
            }}
            disabled={!isLoggedIn || !isSubscribed}
          >
            Upload Song
          </button>
        </form>

        <h3 style={{ marginTop: 40, fontSize: '1.5rem', fontWeight: 600, color: '#9effd3' }}>
          Your voice tells a story—let others hear it.
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginTop: 20,
          }}
        >
          {approvedSongs.map((song) => (
            <div
              key={song._id}
              style={{
                background: '#1e1e1e',
                padding: 16,
                borderRadius: 12,
                boxShadow: '0 6px 14px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#f0f0f0',
              }}
            >
              <img
                src={song.image}
                alt={song.name}
                onError={(e) => {
                  e.target.src = '/placeholder.jpg';
                }}
                style={{
                  width: '100%',
                  height: 150,
                  objectFit: 'cover',
                  borderRadius: 10,
                }}
              />
              <h4 style={{ marginTop: 10 }}>{song.name}</h4>
              <p style={{ color: '#ccc', fontSize: 14 }}>{song.line}</p>
              <audio
                controls
                 controlsList="nodownload"
                style={{
                  width: '100%',
                  outline: 'none',
                  filter: 'invert(1) brightness(1.2)',
                }}
              >
                <source src={song.audio} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
             
            </div>
          ))}
        </div>

        {isLoggedIn && downloads.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#9effd3' }}>📥 Your Downloads ({userEmail})</h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {downloads.map((dl, i) => (
                <li key={i} style={{ marginBottom: '8px', color: '#ddd' }}>
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
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #555',
  backgroundColor: '#1e1e1e',
  color: '#fff',
};
