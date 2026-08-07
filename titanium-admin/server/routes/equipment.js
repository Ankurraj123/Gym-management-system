const express = require('express'); const router = express.Router();
const Equipment = require('../models/Equipment'); const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 });
    res.json({ success: true, equipment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const item = await Equipment.create(req.body);
    res.status(201).json({ success: true, equipment: item });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const item = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, equipment: item });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Equipment deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
