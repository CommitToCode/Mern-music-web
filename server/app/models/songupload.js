const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
  name: String,
  line: String,
  image: String,
  audio:{type: String, required: true},
  status: { type: String, enum: ['pending','approved','removed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
   date: { type: Date, default: Date.now },
   downloads: [{
     trackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
     date: Date
   }]
});

module.exports = mongoose.model('Track', TrackSchema);
