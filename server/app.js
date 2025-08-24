const express = require('express');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors=require('cors')
const path = require('path');
const dbcon = require('./app/config/dbcon');
const adminRoutes = require('./app/routes/admin');
const authRoutes = require('./app/routes/authroutes');
const songRoutes = require('./app/routes/songroutes');
const musicRoutes = require('./app/routes/musicroutes');
const User = require('./app/models/user');
require('dotenv').config();


dbcon();


app.use(cors({
  origin: ['http://localhost:5173', 'https://mern-music-web.vercel.app'],
  credentials: true
}));


const allowedOrigins = [
  "http://localhost:5173",
   "http://localhost:3005",
  "https://mern-music-web.vercel.app",
  "https://www.mern-music-web.vercel.app"
];


app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.includes(origin)) {
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
  } else {
    console.log("CORS blocked origin:", origin);
    return res.status(403).json({ error: "Not allowed by CORS" });
  }

  if (req.method === "OPTIONS") return res.sendStatus(200); 
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const isProduction = process.env.VERCEL === '1'; // Vercel automatically sets this env variable
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey123',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.mongodb_url }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: isProduction,   // ✅ secure cookies only in production (Vercel)
    sameSite: isProduction ? 'none' : 'lax' // ✅ cross-site cookie needed for Vercel
  }
}));



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use('/admin', adminRoutes);
app.use(authRoutes);
app.use('/songs', songRoutes);
app.use('/', musicRoutes);


app.get('/api/me', async (req, res) => {
  console.log('Session:', req.session);
  if (!req.session?.user) return res.status(401).json({ error: 'Not authenticated' });

  const dbUser = await User.findById(req.session.user._id);
  if (!dbUser) return res.status(404).json({ error: 'User not found' });

  req.session.user.isSubscribed = dbUser.isSubscribed;
  req.session.user.subscriptionExpires = dbUser.subscriptionExpires;

  res.json({ user: req.session.user });
});


app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });

    res.clearCookie('connect.sid', { path: '/', sameSite: 'none', secure: true });
    res.json({ message: 'Logged out successfully' });
  });
});


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});


const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(` Server running at port ${PORT}`);
});
