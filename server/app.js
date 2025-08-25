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

// ---------------------------
// 1. Database Connection
// ---------------------------
dbcon()
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ---------------------------
// 2. Environment Detection
// ---------------------------
const isProduction = process.env.NODE_ENV === 'production';

// Trust Render's proxy so secure cookies work
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3005;

// ---------------------------
// 3. CORS Configuration
// ---------------------------
const allowedOrigins = [
  "http://localhost:5173",        // React dev server
  "http://localhost:3005",        // Backend testing
  "https://mern-music-web.vercel.app",
  "https://www.mern-music-web.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    console.log("Blocked by CORS:", origin);
    callback(new Error("CORS not allowed"));
  }
},

     methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true 
}));

// ---------------------------
// 4. Express Middlewares
// ---------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------
// 5. Session Configuration
// ---------------------------
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey123',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.mongodb_url }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: isProduction,             // secure on Vercel
    sameSite: isProduction ? 'none' : 'lax'
  }
}));

// ---------------------------
// 6. View Engine
// ---------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------------------------
// 7. Routes
// ---------------------------
app.use('/admin', adminRoutes);   // Admin routes
app.use(authRoutes);              // Auth routes (login/register)
app.use('/songs', songRoutes);    // Song API
app.use('/', musicRoutes);        // Music frontend pages

// ---------------------------
// 8. Auth Check Endpoint
// ---------------------------
app.get('/api/me', async (req, res) => {
  try {
    if (!req.session?.user) return res.status(401).json({ error: 'Not authenticated' });

    const dbUser = await User.findById(req.session.user._id);
    if (!dbUser) return res.status(404).json({ error: 'User not found' });

    // Update session info
    req.session.user.isSubscribed = dbUser.isSubscribed;
    req.session.user.subscriptionExpires = dbUser.subscriptionExpires;

    res.json({ user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------------------------
// 9. Logout
// ---------------------------
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });

    res.clearCookie('connect.sid', {
      path: '/',
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction
    });

    res.json({ message: 'Logged out successfully' });
  });
});

// ---------------------------
// 10. Error Handling
// ---------------------------
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// ---------------------------
// 11. Start Server
// ---------------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
