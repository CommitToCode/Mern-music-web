const Song = require('../models/songupload');


async function getApprovedSongs(req, res) {
  const songs = await Song.find({ status: 'approved' }).sort({ createdAt: -1 });
  res.json(songs);
}




async function uploadSong(req, res) {
  try {
    const { name, line } = req.body;
    const image = req.files?.image?.[0]?.filename;  
    const audio = req.files?.audio?.[0]?.filename;

    if (!name || !line || !image || !audio) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const song = new Song({
       name,
      line,
      image,
      audio,
      status: 'pending',
    });

    await song.save();

    res.json({ msg: 'Your song is uploaded. Please wait for admin approval.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getApprovedSongs(req, res) {
  const songs = await Song.find({ status: 'approved' }).sort({ createdAt: -1 });
  res.json(songs);
}

async function adminPanel(req, res) {
  const songs = await Song.find().sort({ createdAt: -1 });
  res.render('admin', { songs });
}

async function approveSong(req, res) {
  const id = req.params.id;
  await Song.findByIdAndUpdate(id, { status: 'approved' });
  res.json({ msg: 'Song approved' });
}

async function deleteSong(req, res) {
  const id = req.params.id;
  await Song.findByIdAndDelete(id);
  res.json({ msg: 'Song deleted' });
}

module.exports = {
  uploadSong,
  getApprovedSongs,
  adminPanel,
  approveSong,
  deleteSong
};
