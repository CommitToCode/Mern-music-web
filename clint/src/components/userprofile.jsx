import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authcontext';
import SubscriptionModal from '../pages/subscribe';

export default function UserProfilePage() {
  const { user } = useAuth();

  const [downloads, setDownloads] = useState([]);
  const [userUploads, setUserUploads] = useState([]);
  const [loadingDownloads, setLoadingDownloads] = useState(true);
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const getFileUrl = (filePath) => {
    if (!filePath) return '';
    const cleanedPath = filePath.replace(/^uploads[\\/]/, '').replace(/\\/g, '/');
    return `https://mern-music-web.onrender.com/uploads/${cleanedPath}`;
  };

  useEffect(() => {
    if (!user) return;

    const fetchDownloads = async () => {
      try {
        const res = await fetch('https://mern-music-web.onrender.com/songs/api/songs/downloads', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch downloads');
        const data = await res.json();
        setDownloads(data.downloads || []);
      } catch (err) {
        console.error('Fetch downloads error:', err);
      } finally {
        setLoadingDownloads(false);
      }
    };

    const fetchUserUploads = async () => {
      try {
        const res = await fetch('https://mern-music-web.onrender.com/user/tracks', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch user uploads');
        const data = await res.json();
        setUserUploads(data.tracks || []);
      } catch (err) {
        console.error('Fetch user uploads error:', err);
      } finally {
        setLoadingUploads(false);
      }
    };

    fetchDownloads();
    fetchUserUploads();
  }, [user]);

  const isSubscriptionExpired = () => {
    if (!user?.subscriptionExpires) return true;
    return new Date(user.subscriptionExpires) < new Date();
  };

  if (!user) {
    return <p style={msgStyle}>🔐 Please log in to view your profile.</p>;
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h2 style={headerStyle}>👤 User Profile</h2>

        {/* User Info */}
        <div style={infoBoxStyle}>
          <p><strong>Name:</strong> {user.name || 'N/A'}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Subscribed:</strong> {user.isSubscribed ? '✅ Yes' : '❌ No'}</p>
          {user.isSubscribed && (
            <p><strong>Expires:</strong> {new Date(user.subscriptionExpires).toLocaleString()}</p>
          )}
          {isSubscriptionExpired() && (
            <button style={subscribeBtnStyle} onClick={() => setShowModal(true)}>
              📅 Subscribe Now
            </button>
          )}
        </div>

    
        <section style={downloadSectionStyle}>
          <h3 style={headerStyle}>📥 Downloaded Songs</h3>
          {loadingDownloads ? (
            <p style={msgStyle}>Loading downloads...</p>
          ) : downloads.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {downloads.map((dl, idx) => (
                <li
                  key={idx}
                  style={{
                    background: '#1a1a1a',
                    marginBottom: '12px',
                    padding: '15px',
                    borderRadius: '6px',
                    color: '#f1f1f1',
                  }}
                >
                  <div>
                    <strong>Song:</strong> {dl.song?.title || 'Untitled Song'}
                    <br />
                    {/* <strong>Track:</strong> {dl.track?.name || 'Untitled Track'} */}
                    <br />
                    <small style={{ color: '#aaa', fontSize: '0.9em' }}>
                      Downloaded on:{' '}
                      {dl.date
                        ? new Date(dl.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                        : 'Date not available'}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={msgStyle}>😔 No songs available for download yet.</p>
          )}
        </section>

        
        <section style={{ ...downloadSectionStyle, marginTop: '3rem' }}>
          {/* <h3 style={headerStyle}>🎤 Your Uploaded Songs</h3> */}
          {loadingUploads ? (
            <p style={msgStyle}>Loading your uploads...</p>
          ) : userUploads.length > 0 ? (
            <div style={gridStyle}>
              {userUploads.map((song) => (
                <div key={song._id} style={cardStyle}>
                  <h4 style={songTitleStyle}>🎵 {song.name}</h4>
                  <p style={songDateStyle}>
                    Uploaded: {new Date(song.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </p>
                  {song.audio ? (
                    <a
                      href={getFileUrl(song.audio)}
                      download
                      style={downloadBtnStyle}
                    >
                      ⬇️ Download Track
                    </a>
                  ) : (
                    <p style={{ color: '#ccc', marginTop: '10px' }}>Audio file not available</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={msgStyle}>.</p>
          )}
        </section>
      </div>

      {showModal && (
        <SubscriptionModal
          selectedSong={null}
          onClose={() => setShowModal(false)}
          onSubscribe={async () => {
            setShowModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

// Styles
const pageStyle = {
  backgroundColor: '#0d0d0d',
  minHeight: '100vh',
  padding: '4rem 1rem',
  color: '#f1f1f1',
  display: 'flex',
  justifyContent: 'center',
};

const containerStyle = {
  maxWidth: '960px',
  width: '100%',
};

const headerStyle = {
  fontSize: '2rem',
  fontWeight: 700,
  marginBottom: '1.5rem',
  color: '#ffffff',
  textAlign: 'center',
};

const infoBoxStyle = {
  background: '#1a1a1a',
  padding: '1.5rem',
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  marginBottom: '2.5rem',
};

const subscribeBtnStyle = {
  marginTop: 20,
  padding: '10px 20px',
  background: '#e91e63',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const downloadSectionStyle = {
  marginTop: '2rem',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: '1.5rem',
};

const cardStyle = {
  background: '#222',
  padding: '1rem',
  borderRadius: '10px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
};

const songTitleStyle = {
  fontWeight: 'bold',
  fontSize: '1.1rem',
  color: '#f1f1f1',
  marginBottom: '0.5rem',
};

const songDateStyle = {
  fontSize: '0.9rem',
  color: '#ccc',
};

const msgStyle = {
  textAlign: 'center',
  padding: '1.5rem',
  fontSize: '1rem',
  color: 'white',
  backgroundColor: 'black',
  height: '100vh', 
  width: '100vw',  
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
};


const downloadBtnStyle = {
  marginTop: '10px',
  display: 'inline-block',
  padding: '8px 12px',
  backgroundColor: '#1db954',
  color: '#fff',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: '600',
};
