const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipientType: { type: String, enum: ['member', 'admin', 'all'], default: 'member' },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'danger'], default: 'info' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
