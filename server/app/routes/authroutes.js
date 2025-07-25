const express = require('express');
const router = express.Router();
const auth = require('../controllers/authcontroller');
const { ensureAuth } = require('../middleware/auth');

// UI Routes
router.get('/register', auth.registerForm);
router.get('/login', auth.loginForm);
router.get('/subscribe', ensureAuth, auth.subscribeForm);

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/logout', auth.logout);

// API Routes
router.post('/api/register', auth.apiRegister);
router.post('/api/login', auth.apiLogin);
router.post('/api/subscribe', ensureAuth, auth.apiSubscribe);
router.post('/api/request-reset-otp', auth.requestResetOTP);
router.post('/api/reset-password-otp', auth.resetPasswordWithOTP);

module.exports = router;
