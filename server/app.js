const express = require('express');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');
const dbcon = require('./app/config/dbcon');
const adminRoutes = require('./app/routes/admin');
const authRoutes = require('./app/routes/authroutes');
const songRoutes = require('./app/routes/songroutes');
const musicRoutes = require('./app/routes/musicroutes');
const User = require('./app/models/user');

dbcon();

// Detect production (Vercel)
const isProduction = process.env.VERCEL === '1';

// CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3005",
  "https://mern-music-web.vercel.app",
  "https://www.mern-music-web.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folders
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey123',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.mongodb_url }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: isProduction,           // secure cookies on Vercel
    sameSite: isProduction ? 'none' : 'lax' // cross-site for Vercel
  }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/admin', adminRoutes);
app.use(authRoutes);
app.use('/songs', songRoutes);
app.use('/', musicRoutes);

// Auth check endpoint
app.get('/api/me', async (req, res) => {
  if (!req.session?.user) return res.status(401).json({ error: 'Not authenticated' });

  const dbUser = await User.findById(req.session.user._id);
  if (!dbUser) return res.status(404).json({ error: 'User not found' });

  req.session.user.isSubscribed = dbUser.isSubscribed;
  req.session.user.subscriptionExpires = dbUser.subscriptionExpires;

  res.json({ user: req.session.user });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });

    res.clearCookie('connect.sid', { path: '/', sameSite: isProduction ? 'none' : 'lax', secure: isProduction });
    res.json({ message: 'Logged out successfully' });
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
