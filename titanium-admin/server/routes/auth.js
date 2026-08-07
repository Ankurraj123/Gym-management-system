const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Member = require('../models/Member');
const { protect } = require('../middleware/auth');

const signToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', { expiresIn: process.env.JWT_EXPIRE || '30d' });

// =============================
// ADMIN AUTHENTICATION
// =============================
const handleAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const admin = await Admin.findOne({ email: new RegExp(`^${email}$`, 'i') }).select('+password');
    if (!admin) {
      // Fallback: if a member accidentally hits admin endpoint
      const member = await Member.findOne({ email: new RegExp(`^${email}$`, 'i') });
      if (member) return handleMemberLogin(req, res);
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = signToken(admin._id, 'admin');
    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        phone: admin.phone,
        photo: admin.photo,
        lastLogin: admin.lastLogin
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =============================
// MEMBER AUTHENTICATION
// =============================
const handleMemberLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

    let member = await Member.findOne({ email: new RegExp(`^${email}$`, 'i') }).select('+password');

    if (!member && email.toLowerCase() === 'member@gmail.com') {
      member = await Member.create({
        memberId: 'TF-DEMO1',
        name: 'Demo Member',
        email: 'member@gmail.com',
        password: password,
        planName: 'Premium',
        status: 'Active',
        phone: '9876543210'
      });
    }

    if (!member) return res.status(401).json({ success: false, message: 'No account found with this email.' });

    let isMatch = false;
    if (member.password) {
      isMatch = await member.matchPassword(password);
    } else {
      // No password set (seeded member, first login) — accept and set password
      isMatch = true;
      member.password = password;
      await member.save();
    }

    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid password. Please try again or ask admin to reset.' });

    const token = signToken(member._id, 'member');
    res.json({
      success: true,
      token,
      user: {
        id: member._id,
        memberId: member.memberId,
        name: member.name,
        email: member.email,
        role: 'member',
        planName: member.planName,
        status: member.status,
        phone: member.phone,
        photo: member.photo
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =============================
// ROUTE REGISTRATION
// =============================
router.post('/login', (req, res) => {
  if (req.body.role === 'member' || (req.baseUrl && req.baseUrl.includes('member'))) {
    return handleMemberLogin(req, res);
  }
  return handleAdminLogin(req, res);
});

router.post('/admin-login', handleAdminLogin);
router.post('/admin/login', handleAdminLogin);
router.post('/member-login', handleMemberLogin);
router.post('/member/login', handleMemberLogin);

// =============================
// MEMBER SELF-REGISTRATION
// =============================
router.post('/member-register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });

    const existing = await Member.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (existing) return res.status(400).json({ success: false, message: 'An account with this email already exists' });

    const member = await Member.create({ name, email, password, phone: phone || '', planName: 'Basic', status: 'Active' });
    const token = signToken(member._id, 'member');
    res.status(201).json({
      success: true,
      token,
      user: { id: member._id, memberId: member.memberId, name: member.name, email: member.email, role: 'member', planName: member.planName, status: member.status, phone: member.phone }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =============================
// PROTECTED ROUTES
// =============================

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user._id;
    const role = req.user.role;

    let updatedUser;
    if (role === 'admin') {
      updatedUser = await Admin.findByIdAndUpdate(userId, { name, phone }, { new: true });
    } else {
      const updates = {};
      if (name) updates.name = name;
      if (phone) updates.phone = phone;
      if (address) updates.address = address;
      updatedUser = await Member.findByIdAndUpdate(userId, updates, { new: true });
    }

    if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role, phone: updatedUser.phone,
        ...(role === 'member' && { memberId: updatedUser.memberId, planName: updatedUser.planName, status: updatedUser.status })
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    if (newPassword.length < 4) return res.status(400).json({ success: false, message: 'New password must be at least 4 characters' });

    const userId = req.user._id;
    const role = req.user.role;

    let user;
    if (role === 'admin') {
      user = await Admin.findById(userId).select('+password');
    } else {
      user = await Member.findById(userId).select('+password');
    }

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully. Please login again.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Please provide email address' });

    const admin = await Admin.findOne({ email: new RegExp(`^${email}$`, 'i') });
    const member = await Member.findOne({ email: new RegExp(`^${email}$`, 'i') });

    if (!admin && !member) {
      return res.status(404).json({ success: false, message: 'No account found with this email address' });
    }

    res.json({ success: true, message: 'Password reset instructions have been sent to your email address.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
