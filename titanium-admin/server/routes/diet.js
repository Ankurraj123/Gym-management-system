const express = require('express');
const router = express.Router();
const DietPlan = require('../models/DietPlan');
const { protect } = require('../middleware/auth');

// GET all diet plans
router.get('/', protect, async (req, res) => {
  try {
    const plans = await DietPlan.find().populate('assignedMembers', 'name memberId');
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create diet plan
router.post('/', protect, async (req, res) => {
  try {
    const plan = await DietPlan.create(req.body);
    res.status(201).json({ success: true, plan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update diet plan
router.put('/:id', protect, async (req, res) => {
  try {
    const plan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, plan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE diet plan
router.delete('/:id', protect, async (req, res) => {
  try {
    await DietPlan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Diet plan deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST assign diet plan to members
router.post('/:id/assign', protect, async (req, res) => {
  try {
    const { memberIds } = req.body;
    const plan = await DietPlan.findByIdAndUpdate(
      req.params.id,
      { assignedMembers: memberIds },
      { new: true }
    ).populate('assignedMembers', 'name memberId');

    if (memberIds && Array.isArray(memberIds)) {
      const Member = require('../models/Member');
      const Notification = require('../models/Notification');
      for (let mId of memberIds) {
        await Member.findByIdAndUpdate(mId, { assignedDiet: plan._id });
        await Notification.create({
          recipientType: 'member',
          recipientId: mId,
          title: 'New Diet Plan Assigned 🥗',
          message: `Admin assigned diet plan "${plan.name}" to your portal.`,
          type: 'info'
        });
      }
    }

    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
