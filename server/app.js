const express = require('express');
const app = express();
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const dbcon = require('./app/config/dbcon');
const adminRoutes = require('./app/routes/admin');
const authRoutes = require('./app/routes/authroutes');
const songRoutes = require('./app/routes/songroutes');
const User = require('./app/models/user');
const musicRoutes = require('./app/routes/musicroutes');
require('dotenv').config();


dbcon();
app.use(
  session({
    secret: 'myverysecurekey123@!',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, 
      httpOnly: true,
      sameSite: 'lax', 
      secure: false    
    },
  })
);



app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/admin',adminRoutes);
app.use(authRoutes);
app.use('/songs',songRoutes);




app.get('/api/me', async (req, res) => {
    console.log('Session:', req.session);
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const dbUser = await User.findById(req.session.user._id);
  if (!dbUser) return res.status(404).json({ error: 'User not found' });

  req.session.user.isSubscribed = dbUser.isSubscribed;
  req.session.user.subscriptionExpires = dbUser.subscriptionExpires;

  res.json({ user: req.session.user });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); 
    res.json({ message: 'Logged out successfully' });
  });
});


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});




















// GET /api/tracks


app.use('/', musicRoutes);







app.listen(3005, () => {
  console.log('✅ Server running at http://localhost:3005');
});
