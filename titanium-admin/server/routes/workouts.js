const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const { protect } = require('../middleware/auth');

// GET all workouts
router.get('/', protect, async (req, res) => {
  try {
    const workouts = await Workout.find().populate('assignedMembers', 'name memberId');
    res.json({ success: true, workouts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create workout
router.post('/', protect, async (req, res) => {
  try {
    const workout = await Workout.create(req.body);
    res.status(201).json({ success: true, workout });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update workout
router.put('/:id', protect, async (req, res) => {
  try {
    const workout = await Workout.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, workout });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE workout
router.delete('/:id', protect, async (req, res) => {
  try {
    await Workout.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Workout deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST assign workout to members
router.post('/:id/assign', protect, async (req, res) => {
  try {
    const { memberIds } = req.body;
    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      { assignedMembers: memberIds },
      { new: true }
    ).populate('assignedMembers', 'name memberId');

    if (memberIds && Array.isArray(memberIds)) {
      const Member = require('../models/Member');
      const Notification = require('../models/Notification');
      for (let mId of memberIds) {
        await Member.findByIdAndUpdate(mId, { assignedWorkout: workout._id });
        await Notification.create({
          recipientType: 'member',
          recipientId: mId,
          title: 'New Workout Routine Assigned 💪',
          message: `Admin assigned workout program "${workout.title}" to your portal.`,
          type: 'info'
        });
      }
    }

    res.json({ success: true, workout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
