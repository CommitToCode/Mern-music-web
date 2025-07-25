const express = require('express');
const Song = require('../models/song');

const router = express.Router();
const admin = require('../controllers/admincontroller');
const upload = require('../middleware/upload'); 




router.get('/api/songs', async (req, res) => {
  try {
    const searchTerm = req.query.search || '';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 8;
    const skip = (page - 1) * limit;

    const matchStage = searchTerm
      ? { title: { $regex: searchTerm, $options: 'i' } }
      : {};

  
    const totalCount = await Song.countDocuments(matchStage);


    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedBy',
          foreignField: '_id',
          as: 'uploadedBy',
        },
      },
      { $unwind: { path: '$uploadedBy', preserveNullAndEmptyArrays: true } },
      { $skip: skip },
      { $limit: limit },
    ];

    const songs = await Song.aggregate(pipeline);

    res.json({ songs, totalCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});





// Get single song by ID for sharing
router.get('/api/songs/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('uploadedBy');
    if (!song) return res.status(404).json({ message: 'Song not found' });

    res.json({
      _id: song._id,
      title: song.title,
      artist: song.artist,
      fileUrl: song.fileUrl,
      imageUrl: song.imageUrl,
      album: song.album,
      genre: song.genre,
      uploadedBy: song.uploadedBy?.name || null
    });
  } catch (err) {
    console.error('Error fetching song:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});






// Dashboard
router.get('/', admin.getDashboard);

// Song CRUD with file uploads
router.get('/songs', admin.getAllSongs);
router.get('/songs/add', admin.renderAddForm);

// Add song (upload song + image)
router.post(
  '/songs/add',
  upload.fields([
    { name: 'fileUrl', maxCount: 1 },
    { name: 'imageUrl', maxCount: 1 }
  ]),
  admin.addSong
);

// Edit song (with optional re-upload of files)
router.get('/songs/edit/:id', admin.renderEditForm);
router.post(
  '/songs/edit/:id',
  upload.fields([
    { name: 'fileUrl', maxCount: 1 },
    { name: 'imageUrl', maxCount: 1 }
  ]),
  admin.updateSong
);

// Delete, Approve, Activate/Deactivate
router.post('/songs/delete/:id', admin.deleteSong);
router.post('/songs/approve/:id', admin.approveSong);
router.post('/songs/toggle/:id', admin.toggleActive);











module.exports = router;
