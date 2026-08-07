const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const MembershipPlan = require('../models/MembershipPlan');
const Workout = require('../models/Workout');
const DietPlan = require('../models/DietPlan');
const Trainer = require('../models/Trainer');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Helper to get active member from request token
async function getActiveMember(req, res) {
  const member = await Member.findById(req.user._id)
    .populate('trainer')
    .populate('plan')
    .populate('assignedWorkout')
    .populate('assignedDiet');
  if (!member) {
    res.status(404).json({ success: false, message: 'Member account not found' });
    return null;
  }
  if (member.status === 'Suspended') {
    res.status(403).json({ success: false, message: 'Your account has been suspended by Admin', suspended: true });
    return null;
  }
  return member;
}

// GET /api/member/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const member = await getActiveMember(req, res);
    if (!member) return;

    // Days left calculation
    let daysLeft = 0;
    if (member.endDate) {
      const diffTime = new Date(member.endDate) - new Date();
      daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // Attendance streak & count
    const totalAttendances = await Attendance.countDocuments({ member: member._id, status: 'Present' });
    const recentAttendances = await Attendance.find({ member: member._id, status: 'Present' })
      .sort({ date: -1 })
      .limit(30);

    // Calculate streak from recent dates
    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    for (let att of recentAttendances) {
      const attDate = new Date(att.date);
      attDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((checkDate - attDate) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        streak++;
        checkDate = attDate;
      } else {
        break;
      }
    }

    const currentStreak = Math.max(streak, member.workoutStreak || 0);
    const totalWorkouts = Math.max(totalAttendances, member.totalWorkouts || 0);

    // Dynamic Achievements Engine
    const achievements = [
      { id: 'first_session', title: 'First Session Completed 🏋️‍♂️', desc: 'Logged first workout session', unlocked: totalWorkouts >= 1 },
      { id: '7_day_streak', title: '7-Day Streak 🔥', desc: 'Maintained 7 active gym check-ins', unlocked: currentStreak >= 7 || totalWorkouts >= 7 },
      { id: '30_day_streak', title: 'Iron Warrior 🏆', desc: 'Reached 30 total gym visits', unlocked: totalWorkouts >= 30 },
      { id: 'weight_goal', title: 'Goal Crusher 🎯', desc: 'Achieved target weight milestone', unlocked: member.weightHistory && member.weightHistory.length >= 2 },
      { id: 'calories_10k', title: '10,000 Calorie Burner ⚡', desc: 'Burned 10,000+ total calories', unlocked: (totalWorkouts * 450) >= 10000 }
    ];

    // Equipment under maintenance
    const Equipment = require('../models/Equipment');
    const equipmentMaintenance = await Equipment.find({ status: 'Under Maintenance' });

    // Assigned workout
    let workout = member.assignedWorkout;
    if (!workout) {
      workout = await Workout.findOne({ assignedMembers: member._id }) || await Workout.findOne();
    }

    // Weight progress history
    let weightHistory = member.weightHistory && member.weightHistory.length > 0 
      ? member.weightHistory 
      : [{ date: new Date(), weight: member.weight || 70 }];

    res.json({
      success: true,
      stats: {
        activePlan: member.planName || 'Basic',
        daysLeft,
        expiryDate: member.endDate ? new Date(member.endDate).toLocaleDateString() : 'N/A',
        attendanceStreak: currentStreak,
        workoutsCompleted: totalWorkouts,
        caloriesBurned: (totalWorkouts || 5) * 450,
        weight: member.weight || 70,
        height: member.height || 175,
        bmi: member.bmi || 22.5,
        status: member.status
      },
      assignedWorkout: workout,
      weightHistory,
      achievements,
      equipmentMaintenance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/member/membership
router.get('/membership', protect, async (req, res) => {
  try {
    const member = await getActiveMember(req, res);
    if (!member) return;

    const planDetails = await MembershipPlan.findOne({ name: member.planName }) || member.plan;
    const allPlans = await MembershipPlan.find();
    const payments = await Payment.find({ member: member._id }).sort({ date: -1 });

    let daysLeft = 0;
    if (member.endDate) {
      const diffTime = new Date(member.endDate) - new Date();
      daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    res.json({
      success: true,
      currentPlan: {
        name: member.planName,
        startDate: member.startDate,
        endDate: member.endDate,
        status: member.status,
        daysLeft,
        price: planDetails ? planDetails.price : 999,
        benefits: planDetails ? planDetails.benefits : ['Gym Access', 'Locker Room']
      },
      availablePlans: allPlans,
      paymentHistory: payments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/member/membership/renew
router.post('/membership/renew', protect, async (req, res) => {
  try {
    const member = await getActiveMember(req, res);
    if (!member) return;

    await Notification.create({
      recipientType: 'admin',
      title: 'Membership Renewal Requested',
      message: `Member ${member.name} (${member.memberId}) has requested a renewal for their current plan (${member.planName}).`,
      type: 'info'
    });

    res.json({ success: true, message: 'Membership renewal request submitted successfully to Admin!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/member/membership/upgrade
router.post('/membership/upgrade', protect, async (req, res) => {
  try {
    const member = await getActiveMember(req, res);
    if (!member) return;
    const { planName } = req.body;

    if (!planName) {
      return res.status(400).json({ success: false, message: 'Please specify the tier to upgrade to' });
    }

    await Notification.create({
      recipientType: 'admin',
      title: 'Membership Upgrade Requested',
      message: `Member ${member.name} (${member.memberId}) has requested an upgrade to the ${planName} plan.`,
      type: 'info'
    });

    res.json({ success: true, message: `Upgrade request to ${planName} plan submitted successfully to Admin!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/member/workout
router.get('/workout', protect, async (req, res) => {
  try {
    const member = await getActiveMember(req, res);
    if (!member) return;

    let workout = member.assignedWorkout;
    if (!workout) {
      workout = await Workout.findOne({ assignedMembers: member._id }) || await Workout.findOne();
    }

    res.json({
      success: true,
      workout: workout || {
        title: 'Full Body Fitness Routine',
        category: 'General',
        difficulty: 'Intermediate',
        exercises: [
          { name: 'Barbell Squats', sets: 4, reps: '10', restTime: '60s' },
          { name: 'Push Ups', sets: 3, reps: '15', restTime: '45s' },
          { name: 'Dumbbell Rows', sets: 4, reps: '12', restTime: '60s' },
          { name: 'Plank Hold', sets: 3, reps: '60s', restTime: '30s' }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/member/diet
router.get('/diet', protect, async (req, res) => {
  try {
    const member = await getActiveMember(req, res);
    if (!member) return;

    let diet = member.assignedDiet;
    if (!diet) {
      diet = await DietPlan.findOne({ assignedMembers: member._id }) || await DietPlan.findOne();
    }

    res.json({
      success: true,
      diet: diet || {
        name: 'Balanced Nutrition Plan',
        goal: member.goal || 'General Health',
        breakfast: 'Oatmeal, 4 Egg Whites, Green Tea',
        lunch: 'Grilled Chicken/Tofu, Brown Rice, Vegetables',
        dinner: 'Fish/Paneer, Salad, Soup',
        snacks: 'Almonds, Protein Shake',
        calories: 2200,
        protein: 140,
        carbs: 220,
        fat: 60
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/member/trainer
router.get('/trainer', protect, async (req, res) => {
  try {
    const member = await getActiveMember(req, res);
    if (!member) return;

    let trainer = member.trainer;
    if (!trainer) {
      trainer = await Trainer.findOne();
    }

    res.json({
      success: true,
      trainer: trainer || {
        name: 'Head Coach',
        specialization: 'Fitness & Conditioning',
        experience: 5,
        email: 'trainer@titaniumfitness.com',
        phone: '+91 9876543210'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/member/book-session
router.post('/book-session', protect, async (req, res) => {
  try {
    const member = await getActiveMember(req, res);
    if (!member) return;
    const { date, time } = req.body;

    await Notification.create({
      recipientType: 'admin',
      title: 'Personal Training Session Requested',
      message: `Member ${member.name} booked a session for ${date} at ${time}.`,
      type: 'info'
    });

    res.json({ success: true, message: `Session booked successfully with your trainer for ${date} at ${time}!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/member/attendance
router.get('/attendance', protect, async (req, res) => {
  try {
    const member = await getActiveMember(req, res);
    if (!member) return;

    const attendances = await Attendance.find({ member: member._id }).sort({ date: -1 });
    const todayStr = new Date().toISOString().split('T')[0];

    const markedToday = attendances.some(a => a.date === todayStr);

    res.json({
      success: true,
      todayMarked: markedToday,
      totalPresent: attendances.filter(a => a.status === 'Present').length,
      streak: member.workoutStreak || attendances.length,
      history: attendances
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/member/attendance/mark
router.post('/attendance/mark', protect, async (req, res) => {
  try {
    const member = await getActiveMember(req, res);
    if (!member) return;

    const todayStr = new Date().toISOString().split('T')[0];

    const existing = await Attendance.findOne({
      member: member._id,
      date: todayStr
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Attendance already marked for today!' });
    }

    const attendance = await Attendance.create({
      member: member._id,
      memberName: member.name,
      memberId: member.memberId,
      date: todayStr,
      status: 'Present',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    member.workoutStreak = (member.workoutStreak || 0) + 1;
    member.totalWorkouts = (member.totalWorkouts || 0) + 1;
    await member.save();

    res.json({ success: true, message: 'Attendance marked successfully!', attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/member/payments
router.get('/payments', protect, async (req, res) => {
  try {
    const member = await getActiveMember(req, res);
    if (!member) return;

    const payments = await Payment.find({ member: member._id }).sort({ date: -1 });

    res.json({
      success: true,
      payments,
      activePlan: member.planName,
      status: member.status
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/member/reports
router.get('/reports', protect, async (req, res) => {
  try {
    const member = await getActiveMember(req, res);
    if (!member) return;

    const attendances = await Attendance.find({ member: member._id });
    const payments = await Payment.find({ member: member._id });

    res.json({
      success: true,
      reports: {
        weight: member.weight || 70,
        height: member.height || 175,
        bmi: member.bmi || 22.5,
        weightHistory: member.weightHistory || [],
        attendanceRate: attendances.length > 0 ? `${Math.round((attendances.length / 30) * 100)}%` : '85%',
        totalWorkouts: member.totalWorkouts || attendances.length,
        totalPaid: payments.reduce((acc, p) => acc + (p.amount || 0), 0)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/member/profile (Two-way sync)
router.put('/profile', protect, async (req, res) => {
  try {
    const member = await getActiveMember(req, res);
    if (!member) return;

    const { name, phone, address, gender, age, weight, height, goal, emergencyContact } = req.body;

    if (name) member.name = name;
    if (phone) member.phone = phone;
    if (address) member.address = address;
    if (gender) member.gender = gender;
    if (age) member.age = Number(age);
    if (emergencyContact) member.emergencyContact = emergencyContact;
    if (goal) member.goal = goal;

    if (weight) {
      member.weight = Number(weight);
      if (member.height) {
        const heightMeters = member.height / 100;
        member.bmi = Number((member.weight / (heightMeters * heightMeters)).toFixed(1));
      }
      if (!member.weightHistory) member.weightHistory = [];
      member.weightHistory.push({ date: new Date(), weight: Number(weight) });
    }
    if (height) {
      member.height = Number(height);
      if (member.weight) {
        const heightMeters = member.height / 100;
        member.bmi = Number((member.weight / (heightMeters * heightMeters)).toFixed(1));
      }
    }

    await member.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: member._id,
        memberId: member.memberId,
        name: member.name,
        email: member.email,
        role: 'member',
        planName: member.planName,
        status: member.status,
        phone: member.phone,
        address: member.address,
        weight: member.weight,
        height: member.height,
        bmi: member.bmi,
        goal: member.goal,
        emergencyContact: member.emergencyContact
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
