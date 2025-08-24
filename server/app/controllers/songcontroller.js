const path = require('path');
const fs = require('fs');
const axios = require('axios'); 
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
      const song = req.song; 
      if (!song.isActive) return res.status(404).send('Song inactive');

      
      try {
        await User.findByIdAndUpdate(req.session.user._id, {
          $push: {
            downloads: { songId: song._id, date: new Date() }
          }
        });
      } catch (err) {
        console.warn('Could not log download:', err);
      }

    
      const fileName = `${song.title.replace(/\s+/g, '_')}.mp3`;

      
      const response = await axios({
        url: song.fileUrl, 
        method: 'GET',
        responseType: 'stream'
      });

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'audio/mpeg');

      response.data.pipe(res);

    } catch (err) {
      console.error('Error downloading song:', err);
      res.status(500).send('Error downloading file');
    }
  }
}

module.exports = new SongController();
