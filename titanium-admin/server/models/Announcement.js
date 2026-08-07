const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['Info', 'Warning', 'Success', 'Urgent'], default: 'Info' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  authorName: { type: String, default: 'Admin' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
