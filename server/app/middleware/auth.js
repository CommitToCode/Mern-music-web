const Song = require('../models/song');



function ensureAdmin(req, res, next) {
  if (req.session?.user?.isAdmin) return next();
  return res.status(403).send('Access Denied');
}

module.exports = { ensureAdmin };



function ensureAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

function ensureSubscribed(req, res, next) {
  const user = req.session.user;
  if (user?.isSubscribed && new Date(user.subscriptionExpires) > new Date()) {
    return next();
  }
  return res.status(403).json({ error: 'Subscription required' });
}

async function loadSong(req, res, next) {
  const song = await Song.findById(req.params.id);
  if (!song) return res.status(404).send('Song not found');
  req.song = song;
  next();
}

module.exports = { ensureAuth, ensureSubscribed, loadSong };
