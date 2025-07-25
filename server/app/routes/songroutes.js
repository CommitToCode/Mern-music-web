const express = require('express');
const { ensureAuth, ensureSubscribed, loadSong } = require('../middleware/auth');
const songController = require('../controllers/songcontroller');
const User = require('../models/user');

const router = express.Router();

router.get('/api/songs', songController.listSongs);

router.get('/api/songs/:id/status', ensureAuth, (req, res) => {
  const user = req.session.user;
  const now = new Date();

  const isSubscribed = user?.isSubscribed && new Date(user.subscriptionExpires) > now;
  if (!isSubscribed) return res.status(403).json({ error: 'Subscription required' });

  res.json({ canDownload: true });
});

router.get('/api/songs/:id/download',
  ensureAuth,
  loadSong,
  ensureSubscribed,
  songController.downloadSong
);




// songRoutes.js
// router.get('/api/songs/downloads', ensureAuth, async (req, res) => {
//   try {
//     const user = await User.findById(req.session.user._id)
//       .populate('downloads.songId', 'title')  // populate song title only
//       .populate('downloads.trackId', 'name'); // populate track name only

//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const downloads = user.downloads.map(d => ({
//       date: d.date,
//       song: d.songId ? { _id: d.songId._id, title: d.songId.title } : null,
//       track: d.trackId ? { _id: d.trackId._id, name: d.trackId.name } : null,
//     }));

//     res.json({ downloads });
//   } catch (err) {
//     console.error('Error fetching downloads:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });


router.get('/api/songs/downloads', ensureAuth, async (req, res) => {
  try {
    const userId = req.session.user._id;
   const user = await User.findById(userId)
  .populate('downloads.songId', 'title')
  .populate('downloads.trackId', 'name');
console.log('Populated downloads:', JSON.stringify(user.downloads, null, 2));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

  

    const downloads = (user.downloads || []).map(d => ({
      date: d.date,
      song: d.songId ? { _id: d.songId._id, title: d.songId.title } : null,
      track: d.trackId ? { _id: d.trackId._id, name: d.trackId.name } : null,
    }));

    res.json({ downloads });
  } catch (err) {
    console.error('Error fetching downloads:', err);
    res.status(500).json({ error: 'Server error' });
  }
});





// In routes/admin.js or similar



module.exports = router;
