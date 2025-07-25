// routes/adminRoutes.js
const express = require('express');
const User = require('../models/user');
const { ensureAdmin } = require('../middleware/auth');
const router = express.Router();
const adminController = require('../app/controllers/admincontroller');

router.get('/', ensureAdmin, async (req, res) => {
  const users = await User.find();
  res.render('adminDashboard', { users, user: req.session.user });



  // res.render(path.join(__dirname, '..', 'views', 'admin', 'adminDashboard'), { users, user: req.session.user });

});

// router.post('/admin/users/:id/deactivate', ensureAdmin, async (req, res) => {
//   await User.findByIdAndUpdate(req.params.id, { isSubscribed: false, subscriptionExpires: null });
//   res.redirect('/admin');
// });

// router.post('/users/:id/activate', ensureAdmin, async (req, res) => {
//   const expires = new Date();
//   expires.setFullYear(expires.getFullYear() + 1);
//   await User.findByIdAndUpdate(req.params.id, { isSubscribed: true, subscriptionExpires: expires });
//   res.redirect('/admin');
// });

// router.post('/users/:id/deactivate', ensureAdmin, adminController.deactivateUserSubscription);

// routes/adminRoutes.js
router.post('/users/:id/activate', ensureAdmin, adminController.activateUserSubscription);
router.post('/users/:id/deactivate', ensureAdmin, adminController.deactivateUserSubscription);




module.exports = router;
