const express = require('express');
const router = express.Router();
const Trainer = require('../models/Trainer');
const Member = require('../models/Member');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const trainers = await Trainer.find().populate('assignedMembers', 'name memberId');
    res.json({ success: true, trainers });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const trainer = await Trainer.create(req.body);
    res.status(201).json({ success: true, trainer });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, trainer });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Trainer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Trainer deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Assign member to trainer
router.post('/:id/assign', protect, async (req, res) => {
  try {
    const { memberId } = req.body;
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, { $addToSet: { assignedMembers: memberId } }, { new: true });
    await Member.findByIdAndUpdate(memberId, { trainer: req.params.id });
    res.json({ success: true, trainer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
