const express = require('express'); const router = express.Router();
const Payment = require('../models/Payment'); const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status && status !== 'All' ? { status } : {};
    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query).populate('member', 'name memberId').sort({ date: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const totalRevenue = await Payment.aggregate([{ $match: { status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    res.json({ success: true, payments, total, pages: Math.ceil(total / limit), totalRevenue: totalRevenue[0]?.total || 0 });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    if (payment.member) {
      const Notification = require('../models/Notification');
      await Notification.create({
        recipientType: 'member',
        recipientId: payment.member,
        title: 'Payment Invoice Recorded 💳',
        message: `Payment of ₹${payment.amount} for ${payment.plan || 'Membership'} has been recorded. Status: ${payment.status}.`,
        type: payment.status === 'Paid' ? 'success' : 'info'
      });
    }
    res.status(201).json({ success: true, payment });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.patch('/:id/status', protect, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (payment && payment.member) {
      const Notification = require('../models/Notification');
      await Notification.create({
        recipientType: 'member',
        recipientId: payment.member,
        title: 'Payment Status Updated',
        message: `Payment status for invoice ${payment.invoiceId || 'record'} updated to ${payment.status}.`,
        type: payment.status === 'Paid' ? 'success' : 'warning'
      });
    }
    res.json({ success: true, payment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Payment deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
