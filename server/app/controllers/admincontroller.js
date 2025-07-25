const Song = require('../models/song');
const User = require('../models/user');
const Track = require('../models/songupload');

class AdminController {
  async getDashboard(req, res) {
    try {
      const users = await User.find()
        .sort({ createdAt: -1 })
        .populate({
          path: 'downloads.songId',
          select: 'title'
        });

      const currentUserId = req.session.user?._id || null;
      let currentUser = null;

      if (currentUserId) {
        currentUser = await User.findById(currentUserId);
      }

      const tracks = await Track.find({ status: 'approved' }).lean();

      res.render('admin/adminDashboard', { users, user: currentUser, tracks });
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
      res.status(500).send('Server Error');
    }
  }

  async getAllSongs(req, res) {
    try {
      const songs = await Song.find().sort({ createdAt: -1 });
      res.render('admin/songManager', { songs });
    } catch (err) {
      res.status(500).send("Error fetching songs");
    }
  }

  async renderAddForm(req, res) {
    res.render('admin/addSong');
  }

  async addSong(req, res) {
    const { title, artist, language } = req.body;

    const songFile = req.files && req.files['fileUrl'] ? req.files['fileUrl'][0] : null;
    const imageFile = req.files && req.files['imageUrl'] ? req.files['imageUrl'][0] : null;

    const fileUrl = songFile ? `/uploads/${songFile.filename}` : '';
    const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : '';

    await Song.create({ title, artist, language, fileUrl, imageUrl });
    res.redirect('/admin/songs');
  }

  async renderEditForm(req, res) {
    const song = await Song.findById(req.params.id);
    res.render('admin/editSong', { song });
  }

  async updateSong(req, res) {
    const { title, artist, language, fileUrl, imageUrl, isActive } = req.body;
    await Song.findByIdAndUpdate(req.params.id, {
      title, artist, language, fileUrl, imageUrl,
      isActive: isActive === 'on'
    });
    res.redirect('/admin/songs');
  }

  async deleteSong(req, res) {
    await Song.findByIdAndDelete(req.params.id);
    res.redirect('/admin/songs');
  }

  async approveSong(req, res) {
    await Song.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.redirect('/admin/songs');
  }

  async toggleActive(req, res) {
    const song = await Song.findById(req.params.id);
    song.isActive = !song.isActive;
    await song.save();
    res.redirect('/admin/songs');
  }

  async activateUserSubscription(req, res) {
    try {
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      await User.findByIdAndUpdate(req.params.id, { isSubscribed: true, subscriptionExpires: expires });
      res.redirect('/admin');
    } catch (err) {
      console.error('Activation error:', err);
      res.status(500).send('Server error');
    }
  }

  async deactivateUserSubscription(req, res) {
    try {
      await User.findByIdAndUpdate(req.params.id, { isSubscribed: false, subscriptionExpires: null });
      res.redirect('/admin');
    } catch (err) {
      console.error('Deactivation error:', err);
      res.status(500).send('Server error');
    }
  }
}

module.exports = new AdminController();
