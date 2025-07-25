const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  isSubscribed: { type: Boolean, default: false },
  subscriptionExpires: { type: Date },
  isAdmin: { type: Boolean, default: false },
resetOTP: String,
  resetOTPExpires: Date,
  downloads: [{
  songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
  trackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
  date: Date
}]
});

module.exports = mongoose.model('Usernamemusic', userSchema);
