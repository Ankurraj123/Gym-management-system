const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { protect } = require('../middleware/auth');

// GET all members (search + filter + pagination)
router.get('/', protect, async (req, res) => {
  try {
    const { search = '', status, planName, page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { memberId: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }
    if (status && status !== 'All') query.status = status;
    if (planName && planName !== 'All') query.planName = planName;

    const total = await Member.countDocuments(query);
    const members = await Member.find(query)
      .populate('trainer', 'name')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, members, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single member
router.get('/:id', protect, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).populate('trainer plan');
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create member
router.post('/', protect, async (req, res) => {
  try {
    const member = await Member.create(req.body);
    const Notification = require('../models/Notification');
    await Notification.create({
      recipientType: 'member',
      recipientId: member._id,
      title: 'Welcome to Titanium Fitness! 🎉',
      message: `Your member account ${member.memberId} has been created with plan ${member.planName}.`,
      type: 'success'
    });
    res.status(201).json({ success: true, member });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update member
router.put('/:id', protect, async (req, res) => {
  try {
    const prevMember = await Member.findById(req.params.id);
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (member) {
      const Notification = require('../models/Notification');
      if (req.body.planName && req.body.planName !== prevMember.planName) {
        await Notification.create({
          recipientType: 'member',
          recipientId: member._id,
          title: 'Membership Plan Updated',
          message: `Admin updated your membership plan to ${req.body.planName}.`,
          type: 'info'
        });
      }
      if (req.body.trainer && String(req.body.trainer) !== String(prevMember.trainer)) {
        await Notification.create({
          recipientType: 'member',
          recipientId: member._id,
          title: 'Personal Trainer Assigned',
          message: `Admin assigned a new trainer to your account.`,
          type: 'info'
        });
      }
    }
    res.json({ success: true, member });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE member
router.delete('/:id', protect, async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH suspend/activate
router.patch('/:id/suspend', protect, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    member.status = member.status === 'Suspended' ? 'Active' : 'Suspended';
    await member.save();

    const Notification = require('../models/Notification');
    await Notification.create({
      recipientType: 'member',
      recipientId: member._id,
      title: `Account Status Changed`,
      message: `Your account status is now ${member.status}.`,
      type: member.status === 'Suspended' ? 'danger' : 'success'
    });

    res.json({ success: true, member, message: `Member status updated to ${member.status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST reset password for member
router.post('/:id/reset-password', protect, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
    }

    const member = await Member.findById(req.params.id).select('+password');
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    // Actually set and save the new password (triggers bcrypt pre-save hook)
    member.password = newPassword;
    await member.save();

    // Notify member about the password reset
    const Notification = require('../models/Notification');
    await Notification.create({
      recipientType: 'member',
      recipientId: member._id,
      title: 'Password Reset by Admin 🔑',
      message: `Your login password has been reset by an administrator. Please use your new credentials to log in.`,
      type: 'warning'
    });

    res.json({ success: true, message: `Password for ${member.name} has been reset successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
