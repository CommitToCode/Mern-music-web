const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { ensureAuth } = require('../middleware/authsong');
const router = express.Router();

// UI routes
router.get('/register', (req, res) => res.render('register'));
router.get('/login', (req, res) => res.render('login'));
router.get('/subscribe', ensureAuth, (req, res) => res.render('subscribe'));
router.post('/logout', (req, res) => req.session.destroy(() => res.redirect('/login')));

// Register API
router.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already registered' });

  const hash = await bcrypt.hash(password, 10);
  const u = await User.create({ email, passwordHash: hash });

  req.session.user = {
    _id: u._id.toString(),
    email: u.email,
    isSubscribed: u.isSubscribed,
    subscriptionExpires: u.subscriptionExpires,
    isAdmin: u.isAdmin
  };

  res.json({ msg: 'registered' });
});

// Login API
router.post('/api/login', async (req, res) => {
  const u = await User.findOne({ email: req.body.email });
  if (!u || !(await bcrypt.compare(req.body.password, u.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.user = {
    _id: u._id.toString(),
    email: u.email,
    isSubscribed: u.isSubscribed,
    subscriptionExpires: u.subscriptionExpires,
    isAdmin: u.isAdmin
  };

  res.json({ msg: 'loggedin', isSubscribed: u.isSubscribed, expires: u.subscriptionExpires });
});

// Subscribe API
router.post('/api/subscribe', ensureAuth, async (req, res) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);

  const user = await User.findByIdAndUpdate(
    req.session.user._id,
    { isSubscribed: true, subscriptionExpires: expires },
    { new: true }
  );

  req.session.user.isSubscribed = true;
  req.session.user.subscriptionExpires = expires;

  res.json({ success: true, expires });
});

module.exports = router;
