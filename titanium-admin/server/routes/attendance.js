const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { date, memberId } = req.query;
    const query = {};
    if (date) query.date = date;
    if (memberId) query.member = memberId;
    const records = await Attendance.find(query).populate('member', 'name memberId').sort({ date: -1 }).limit(200);
    const today = new Date().toISOString().split('T')[0];
    const present = await Attendance.countDocuments({ date: today, status: 'Present' });
    const absent = await Attendance.countDocuments({ date: today, status: 'Absent' });
    res.json({ success: true, records, todayPresent: present, todayAbsent: absent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const record = await Attendance.create(req.body);
    res.status(201).json({ success: true, record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/attendance/scan-qr (Reception QR scanning & manual check-in)
router.post('/scan-qr', protect, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'No QR Code or Member ID provided' });

    // Find member by memberId, Mongo _id, or email
    const member = await Member.findOne({
      $or: [
        { memberId: code.trim() },
        { email: code.trim().toLowerCase() },
        ...(code.trim().match(/^[0-9a-fA-F]{24}$/) ? [{ _id: code.trim() }] : [])
      ]
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found with provided QR Code or Member ID' });
    }

    if (member.status === 'Suspended') {
      return res.status(403).json({ success: false, message: `Member ${member.name} is Suspended and cannot check in!` });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const existing = await Attendance.findOne({
      member: member._id,
      date: todayStr
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Member ${member.name} (${member.memberId}) has already checked in today at ${existing.checkInTime || 'earlier today'}!`
      });
    }

    const checkInTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const attendance = await Attendance.create({
      member: member._id,
      memberName: member.name,
      memberId: member.memberId,
      date: todayStr,
      status: 'Present',
      checkInTime: checkInTimeStr
    });

    member.workoutStreak = (member.workoutStreak || 0) + 1;
    member.totalWorkouts = (member.totalWorkouts || 0) + 1;
    await member.save();

    // Push notification to member
    await Notification.create({
      recipientType: 'member',
      recipientId: member._id,
      title: 'QR Check-in Recorded 📲',
      message: `Reception verified your QR code! Attendance logged for today at ${checkInTimeStr}. Keep up the streak! 🔥`,
      type: 'success'
    });

    res.json({
      success: true,
      message: `✅ Check-in successful for ${member.name} (${member.memberId})! Streak: ${member.workoutStreak} days`,
      attendance,
      member: {
        id: member._id,
        name: member.name,
        memberId: member.memberId,
        workoutStreak: member.workoutStreak,
        totalWorkouts: member.totalWorkouts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
