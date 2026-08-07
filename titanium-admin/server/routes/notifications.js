const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const isMember = req.user.role === 'member';
    const filter = isMember
      ? { $or: [{ recipientType: 'member', recipientId: req.user._id }, { recipientType: 'all' }] }
      : { $or: [{ recipientType: 'admin' }, { recipientType: 'all' }] };

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(20);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', protect, async (req, res) => {
  try {
    const isMember = req.user.role === 'member';
    const filter = isMember
      ? { $or: [{ recipientType: 'member', recipientId: req.user._id }, { recipientType: 'all' }] }
      : { $or: [{ recipientType: 'admin' }, { recipientType: 'all' }] };

    await Notification.updateMany(filter, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
