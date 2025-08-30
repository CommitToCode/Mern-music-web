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


dbcon()
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


const isProduction = process.env.NODE_ENV === 'production';


app.set('trust proxy', 1);

const PORT = process.env.PORT || 3005;


const allowedOrigins = [
  "http://localhost:5173",        
  "http://localhost:3005",        
  "https://mern-music-web.vercel.app",
  "https://www.mern-music-web.vercel.app",
    "https://mern-music-web.onrender.com" 
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


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey123',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.mongodb_url }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, 
    httpOnly: true,
    secure: isProduction,             
    sameSite: isProduction ? 'none' : 'lax'
  }
}));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use('/admin', adminRoutes);   
app.use(authRoutes);              
app.use('/songs', songRoutes);    
app.use('/', musicRoutes);        


app.get('/api/me', async (req, res) => {
  try {
    if (!req.session?.user) return res.status(401).json({ error: 'Not authenticated' });

    const dbUser = await User.findById(req.session.user._id);
    if (!dbUser) return res.status(404).json({ error: 'User not found' });

    
    req.session.user.isSubscribed = dbUser.isSubscribed;
    req.session.user.subscriptionExpires = dbUser.subscriptionExpires;

    res.json({ user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


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


app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
