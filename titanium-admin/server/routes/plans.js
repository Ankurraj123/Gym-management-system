const express = require('express'); const router = express.Router();
const MembershipPlan = require('../models/MembershipPlan'); const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try { const plans = await MembershipPlan.find(); res.json({ success: true, plans }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try { const plan = await MembershipPlan.create(req.body); res.status(201).json({ success: true, plan }); }
  catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try { const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, plan }); }
  catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try { await MembershipPlan.findByIdAndDelete(req.params.id); res.json({ success: true, message: 'Plan deleted' }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
