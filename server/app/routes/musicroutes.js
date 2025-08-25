const express = require('express');
const router = express.Router();
const Song = require('../models/songupload');
const { ensureAuth } = require('../middleware/authsong');       
const subscriptionCheck = require('../middleware/subscriptioncheck');  
const { uploadSong } = require('../controllers/songuploadcontroller'); 
const upload = require('../middleware/upload')
const { getApprovedSongs } = require('../controllers/songuploadcontroller');

router.get('/dashboard/music', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.render('Upload', { songs });  
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).send('Server error');
  }
});


// Express route example






router.put('/dashboard/music/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid song ID' });
    }

    const song = await Song.findByIdAndUpdate(id, { status: 'approved' }, { new: true });

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json({ success: true, song });
  } catch (err) {
    console.error('Approval Error:', err);
    res.status(500).json({ error: 'Failed to approve song' });
  }
});


router.delete('/dashboard/music/delete/:id', async (req, res) => {
  try {
    await Song.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete song' });
  }
});



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




router.get('/songs/approved-songs', getApprovedSongs);


// GET /api/user/tracks


router.get('/tracks', ensureAuth, async (req, res) => {
  try {
    const tracks = await Track.find({ uploadedBy: req.user._id, status: 'approved' }).sort({ createdAt: -1 });
    res.json({ tracks });
  } catch (err) {
    console.error('Error fetching user tracks:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






module.exports = router;
