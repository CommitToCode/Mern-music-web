const express = require('express');
const router = express.Router();
const Track = require('../models/track');   // ✅ use Track model
const { ensureAuth } = require('../middleware/authsong');       
const subscriptionCheck = require('../middleware/subscriptioncheck');  
const { uploadSong } = require('../controllers/songuploadcontroller'); 
const upload = require('../middleware/upload');
const { getApprovedSongs } = require('../controllers/songuploadcontroller');


// Admin panel - view all tracks
router.get('/dashboard/music', async (req, res) => {
  try {
    const tracks = await Track.find().sort({ createdAt: -1 });
    res.render('Upload', { tracks });  
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).send('Server error');
  }
});


// Approve track
router.put('/dashboard/music/approve/:id', async (req, res) => {
  try {
    const updated = await Track.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json({ success: true, track: updated });
  } catch (err) {
    console.error('Error approving track:', err);
    res.status(500).json({ error: 'Failed to approve track' });
  }
});


// Delete track
router.delete('/dashboard/music/delete/:id', async (req, res) => {
  try {
    const deleted = await Track.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting track:', err);
    res.status(500).json({ error: 'Failed to delete track' });
  }
});


// Upload track (image + audio)
router.post(
  '/uploads',
  ensureAuth,
  subscriptionCheck,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]),
  uploadSong
);


// Public: get approved tracks
router.get('/songs/approved-songs', getApprovedSongs);


// User’s own tracks
router.get('/tracks', ensureAuth, async (req, res) => {
  try {
    const tracks = await Track.find({
      uploadedBy: req.user._id,
      status: 'approved'
    }).sort({ createdAt: -1 });

    res.json({ tracks });
  } catch (err) {
    console.error('Error fetching user tracks:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
