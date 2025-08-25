import React, { useState } from 'react';

export default function SubscriptionModal({ selectedSong, onClose, onSubscribe }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://mern-music-web.onrender.com/api/subscribe', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Subscription failed');

      await onSubscribe();
    } catch (err) {
      setError(err.message || 'Subscription error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.heading}>Unlock Premium Access 🎵</h2>

        <p style={styles.songLine}>
          To download <strong>{selectedSong?.title}</strong>, you need a subscription.
        </p>

        <div style={styles.priceTag}>
          <span style={styles.price}>₹99</span> / 7 days
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleSubscribe} disabled={loading} style={styles.subscribeBtn}>
          {loading ? 'Processing...' : 'Subscribe & Download'}
        </button>

        <button onClick={onClose} style={styles.closeBtn} disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  modal: {
    background: 'linear-gradient(135deg, #1e1e1e, #121212)',
    padding: 30,
    borderRadius: 16,
    width: 360,
    color: '#fff',
    textAlign: 'center',
    boxShadow: '0 0 20px rgba(0,0,0,0.9)',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1db954',
  },
  songLine: {
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 1.5,
  },
  priceTag: {
    backgroundColor: '#333',
    padding: '10px 20px',
    borderRadius: 10,
    display: 'inline-block',
    fontSize: 18,
    fontWeight: '600',
    color: '#1db954',
    marginBottom: 18,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 4,
  },
  error: {
    color: '#ff4c4c',
    marginBottom: 12,
    marginTop: 10,
  },
  subscribeBtn: {
    backgroundColor: '#1db954',
    border: 'none',
    padding: '12px 16px',
    borderRadius: 8,
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    cursor: 'pointer',
    marginTop: 12,
    width: '100%',
    transition: '0.3s',
  },
  closeBtn: {
    backgroundColor: '#444',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 8,
    color: '#ccc',
    fontWeight: '500',
    fontSize: 14,
    cursor: 'pointer',
    marginTop: 10,
    width: '100%',
  },
};
