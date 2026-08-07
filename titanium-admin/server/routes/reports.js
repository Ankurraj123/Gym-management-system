const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/auth');

// GET /api/reports?type=revenue|attendance|membership|trainer|active|expired
router.get('/', protect, async (req, res) => {
  try {
    const { type = 'revenue' } = req.query;
    let data = {};

    if (type === 'revenue') {
      const payments = await Payment.find().sort({ date: -1 });
      const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);
      const pendingRevenue = payments.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);
      data = { title: 'Revenue Report', summary: { totalRevenue, pendingRevenue, totalTransactions: payments.length }, list: payments };
    } else if (type === 'attendance') {
      const records = await Attendance.find().populate('member', 'name memberId').sort({ date: -1 });
      const totalPresent = records.filter(r => r.status === 'Present').length;
      const totalAbsent = records.filter(r => r.status === 'Absent').length;
      const totalLate = records.filter(r => r.status === 'Late').length;
      data = { title: 'Attendance Analytics Report', summary: { totalPresent, totalAbsent, totalLate, totalRecords: records.length }, list: records };
    } else if (type === 'membership') {
      const members = await Member.find().sort({ createdAt: -1 });
      const planCounts = {};
      members.forEach(m => {
        const p = m.planName || 'Basic';
        planCounts[p] = (planCounts[p] || 0) + 1;
      });
      data = { title: 'Membership Status & Distribution', summary: { totalMembers: members.length, planDistribution: planCounts }, list: members };
    } else if (type === 'trainer') {
      const trainers = await Trainer.find().populate('assignedMembers', 'name memberId');
      data = { title: 'Trainer Performance Report', summary: { totalTrainers: trainers.length }, list: trainers };
    } else if (type === 'active') {
      const activeMembers = await Member.find({ status: 'Active' }).populate('trainer', 'name').sort({ startDate: -1 });
      data = { title: 'Top Active Members', summary: { totalActive: activeMembers.length }, list: activeMembers };
    } else if (type === 'expired') {
      const expiredMembers = await Member.find({ status: 'Expired' }).sort({ endDate: -1 });
      data = { title: 'Expired Memberships Report', summary: { totalExpired: expiredMembers.length }, list: expiredMembers };
    }

    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
