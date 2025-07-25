const path = require('path');
const fs = require('fs');
const Song = require('../models/song');
const User = require('../models/user');

class SongController {
  async listSongs(req, res) {
    try {
      const songs = await Song.find();
      res.json({ songs });
    } catch (err) {
      console.error('Failed to fetch songs:', err);
      res.status(500).json({ error: 'Failed to fetch songs' });
    }
  }

  async checkDownloadStatus(req, res) {
    res.json({ canDownload: true, fileUrl: req.song.fileUrl });
  }

  async downloadSong(req, res) {
    try {
      if (!req.song.isActive) {
        return res.status(404).send('Song inactive');
      }

      const fileName = path.basename(req.song.fileUrl);
      const filePath = path.join(__dirname, '..', '..', 'uploads', fileName);

      fs.stat(filePath, async (err) => {
        if (err) {
          console.error('File not found:', err);
          return res.status(404).send('File not found');
        }

        try {
          await User.findByIdAndUpdate(req.session.user._id, {
            $push: {
              downloads: {
                songId: req.song._id,
                date: new Date()
              }
            }
          });
        } catch (logErr) {
          console.warn('Could not log download:', logErr);
        }

        res.download(filePath, (err) => {
          if (err) {
            console.error('Download error:', err);
            res.status(500).send('Error downloading file');
          }
        });
      });
    } catch (err) {
      console.error('Error in downloadSong:', err);
      res.status(500).send('Server error');
    }
  }
}

module.exports = new SongController();
