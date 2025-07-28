const bcrypt = require('bcrypt');
const User = require('../models/user');
const { sendOTP } = require('../emailsetup/email');

class AuthController {
  async registerForm(req, res) {
    res.render('register');
  }

  async loginForm(req, res) {
    res.render('login');
  }

  async subscribeForm(req, res) {
    res.render('subscribe');
  }

  
  async register(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.redirect('/register');

    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, email, passwordHash: hash });
    res.redirect('/login');
  }


  async login(req, res) {
    const user = await User.findOne({ email: req.body.email });
    const ok = user && await bcrypt.compare(req.body.password, user.passwordHash);
    if (!ok) return res.redirect('/login');

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isSubscribed: user.isSubscribed,
      subscriptionExpires: user.subscriptionExpires,
      isAdmin: user.isAdmin
    };

    res.redirect('/');
  }


  async logout(req, res) {
    req.session.destroy(() => res.redirect('/login'));
  }

  
  async apiRegister(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const hash = await bcrypt.hash(password, 10);
    const u = await User.create({ name, email, passwordHash: hash });

    req.session.user = {
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      isSubscribed: u.isSubscribed,
      subscriptionExpires: u.subscriptionExpires,
      isAdmin: u.isAdmin
    };

    res.json({ msg: 'registered' });
  }

  
  async apiLogin(req, res) {
    const u = await User.findOne({ email: req.body.email });
    if (!u || !(await bcrypt.compare(req.body.password, u.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = {
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      isSubscribed: u.isSubscribed,
      subscriptionExpires: u.subscriptionExpires,
      isAdmin: u.isAdmin
    };

    res.json({
      msg: 'loggedin',
      name: u.name,
      isSubscribed: u.isSubscribed,
      expires: u.subscriptionExpires
    });
  }

  
  async apiSubscribe(req, res) {
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
  }

  
  async requestResetOTP(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); 

    user.resetOTP = otp;
    user.resetOTPExpires = expires;
    await user.save();

    await sendOTP(email, otp);
    res.json({ msg: 'OTP sent to email' });
  }


  async resetPasswordWithOTP(req, res) {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ error: 'Email, OTP, and new password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (
      user.resetOTP !== otp ||
      !user.resetOTPExpires ||
      user.resetOTPExpires < new Date()
    ) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hash;
    user.resetOTP = null;
    user.resetOTPExpires = null;
    await user.save();

    res.json({ msg: 'Password reset successful' });
  }
}

module.exports = new AuthController();
