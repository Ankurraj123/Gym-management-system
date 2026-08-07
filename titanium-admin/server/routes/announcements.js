const express = require('express'); const router = express.Router();
const Announcement = require('../models/Announcement'); const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const items = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, announcements: items });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const authorName = req.admin ? req.admin.name : (req.user ? req.user.name : 'Admin');
    const authorId = req.admin ? req.admin._id : (req.user ? req.user._id : null);
    const item = await Announcement.create({ ...req.body, author: authorId, authorName });

    const Notification = require('../models/Notification');
    await Notification.create({
      recipientType: 'all',
      title: `📢 Announcement: ${item.title}`,
      message: item.content,
      type: item.type === 'Warning' ? 'warning' : (item.type === 'Success' ? 'success' : 'info')
    });

    res.status(201).json({ success: true, announcement: item });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const item = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, announcement: item });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
