require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Member = require('./models/Member');
const Trainer = require('./models/Trainer');
const MembershipPlan = require('./models/MembershipPlan');
const Payment = require('./models/Payment');
const Equipment = require('./models/Equipment');
const Announcement = require('./models/Announcement');
const Workout = require('./models/Workout');
const DietPlan = require('./models/DietPlan');
const Settings = require('./models/Settings');

async function seed() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gym_management_admin';
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB. Seeding...');

  // Clear all
  await Promise.all([
    Admin.deleteMany(),
    Member.deleteMany(),
    Trainer.deleteMany(),
    MembershipPlan.deleteMany(),
    Payment.deleteMany(),
    Equipment.deleteMany(),
    Announcement.deleteMany(),
    Workout.deleteMany(),
    DietPlan.deleteMany(),
    Settings.deleteMany()
  ]);

  // Admin
  const admin = await Admin.create({
    name: 'Super Admin',
    email: 'admin@titaniumfitness.com',
    password: 'Admin@123',
    role: 'Admin',
    phone: '+91-9876543210'
  });

  // Plans
  const plans = await MembershipPlan.insertMany([
    { name: 'Basic', duration: 30, price: 999, benefits: ['Gym Access', 'Locker Room'], color: '#6b7280' },
    { name: 'Standard', duration: 30, price: 1999, benefits: ['Gym Access', 'Locker', 'Group Cardio Classes'], color: '#3b82f6' },
    { name: 'Premium', duration: 90, price: 4999, benefits: ['Gym Access', 'Locker', 'Group Classes', 'Personal Trainer', 'Sauna'], color: '#14f195' },
    { name: 'VIP', duration: 365, price: 14999, benefits: ['All Access 24/7', 'Dedicated Trainer', 'Custom Diet Plan', 'Free Supplements Bar', 'Spa & Massage'], color: '#f59e0b' }
  ]);

  // Trainers
  const trainers = await Trainer.insertMany([
    { name: 'Rohit Sharma', email: 'rohit@tf.com', phone: '9876541111', specialization: 'Strength & Conditioning', experience: 5, salary: 35000, status: 'Active' },
    { name: 'Priya Singh', email: 'priya@tf.com', phone: '9876542222', specialization: 'Yoga & Flexibility', experience: 3, salary: 28000, status: 'Active' },
    { name: 'David Miller', email: 'david@tf.com', phone: '9876543333', specialization: 'Crossfit & Functional', experience: 7, salary: 45000, status: 'Active' }
  ]);

  // Members (use create() not insertMany so pre-save password hash hook fires)
  const memberData = [
    { memberId: 'TF-1001', name: 'Ankur Kumar', email: 'ankur@gmail.com', password: 'member@123', phone: '9876543210', gender: 'Male', age: 25, planName: 'Premium', status: 'Active', trainer: trainers[0]._id, weight: 72, height: 178, bmi: 22.7, startDate: new Date('2025-12-01'), endDate: new Date('2026-12-01'), goal: 'Muscle Gain' },
    { memberId: 'TF-1002', name: 'Rahul Verma', email: 'rahul@gmail.com', password: 'member@123', phone: '9876540001', gender: 'Male', age: 28, planName: 'Standard', status: 'Active', trainer: trainers[1]._id, weight: 80, height: 175, bmi: 26.1, startDate: new Date('2026-06-01'), endDate: new Date('2026-07-01'), goal: 'Weight Loss' },
    { memberId: 'TF-1003', name: 'Sneha Patel', email: 'sneha@gmail.com', password: 'member@123', phone: '9876540002', gender: 'Female', age: 22, planName: 'Basic', status: 'Expired', weight: 58, height: 162, bmi: 22.1, startDate: new Date('2026-05-01'), endDate: new Date('2026-06-01'), goal: 'Flexibility' },
    { memberId: 'TF-1004', name: 'Vikram Joshi', email: 'vikram@gmail.com', password: 'member@123', phone: '9876540003', gender: 'Male', age: 35, planName: 'VIP', status: 'Active', trainer: trainers[2]._id, weight: 90, height: 180, bmi: 27.8, startDate: new Date('2026-01-01'), endDate: new Date('2027-01-01'), goal: 'Bodybuilding' },
    { memberId: 'TF-1005', name: 'Member Test', email: 'member@gmail.com', password: 'member@123', phone: '9876543210', gender: 'Male', age: 24, planName: 'Premium', status: 'Active', trainer: trainers[0]._id, weight: 70, height: 175, bmi: 22.9, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-01'), goal: 'General Fitness' }
  ];
  const members = [];
  for (const d of memberData) {
    members.push(await Member.create(d));
  }
  console.log(`  ✅ ${members.length} members seeded with password: member@123`);

  // Link members to trainer assigned list
  await Trainer.findByIdAndUpdate(trainers[0]._id, { assignedMembers: [members[0]._id] });
  await Trainer.findByIdAndUpdate(trainers[1]._id, { assignedMembers: [members[1]._id] });
  await Trainer.findByIdAndUpdate(trainers[2]._id, { assignedMembers: [members[3]._id] });

  // Payments
  await Payment.insertMany([
    { invoiceId: 'INV-2026-001', member: members[0]._id, memberName: members[0].name, plan: 'Premium', amount: 4999, status: 'Paid', method: 'UPI', date: new Date('2026-07-01') },
    { invoiceId: 'INV-2026-002', member: members[1]._id, memberName: members[1].name, plan: 'Standard', amount: 1999, status: 'Paid', method: 'Card', date: new Date('2026-07-01') },
    { invoiceId: 'INV-2026-003', member: members[2]._id, memberName: members[2].name, plan: 'Basic', amount: 999, status: 'Pending', method: 'Cash', date: new Date('2026-06-01') },
    { invoiceId: 'INV-2026-004', member: members[3]._id, memberName: members[3].name, plan: 'VIP', amount: 14999, status: 'Paid', method: 'Card', date: new Date('2026-06-15') }
  ]);

  // Equipment
  await Equipment.insertMany([
    { name: 'Commercial Treadmill X100', category: 'Cardio', condition: 'Good', status: 'Active', quantity: 5, nextMaintenance: new Date('2026-09-01') },
    { name: 'Olympic Barbell & Bumper Plates', category: 'Strength', condition: 'Excellent', status: 'Active', quantity: 10 },
    { name: 'Elliptical Trainer', category: 'Cardio', condition: 'Fair', status: 'Under Maintenance', quantity: 2, nextMaintenance: new Date('2026-08-05') },
    { name: 'Adjustable Bench Press', category: 'Strength', condition: 'Good', status: 'Active', quantity: 8 }
  ]);

  // Announcements
  await Announcement.insertMany([
    { title: 'New Yoga Batch Starting', content: 'A new morning yoga batch starts from Aug 5 at 6 AM. Limited seats available!', type: 'Info', authorName: 'Admin' },
    { title: 'Gym Closed Sunday', content: 'Gym will remain closed on Sunday for routine facility maintenance.', type: 'Warning', authorName: 'Admin' },
    { title: 'Special Discount Offer', content: 'Get 20% off on all annual VIP memberships this month!', type: 'Success', authorName: 'Admin' }
  ]);

  // Workouts
  await Workout.insertMany([
    {
      title: 'Hypertrophy Upper Body Blast',
      category: 'Hypertrophy',
      difficulty: 'Intermediate',
      exercises: [
        { name: 'Bench Press', sets: 4, reps: '8-10', restTime: '90s' },
        { name: 'Incline Dumbbell Flyes', sets: 3, reps: '12', restTime: '60s' },
        { name: 'Lat Pulldowns', sets: 4, reps: '10-12', restTime: '60s' },
        { name: 'Overhead Shoulder Press', sets: 3, reps: '10', restTime: '90s' }
      ],
      assignedMembers: [members[0]._id, members[3]._id]
    },
    {
      title: 'Fat Loss HIIT Circuit',
      category: 'HIIT',
      difficulty: 'Beginner',
      exercises: [
        { name: 'Jumping Jacks', sets: 4, reps: '45s', restTime: '15s' },
        { name: 'Kettlebell Swings', sets: 4, reps: '15', restTime: '30s' },
        { name: 'Burpees', sets: 3, reps: '12', restTime: '45s' }
      ],
      assignedMembers: [members[1]._id]
    }
  ]);

  // Diet Plans
  await DietPlan.insertMany([
    {
      name: 'High Protein Lean Bulk Plan',
      goal: 'Muscle Gain',
      breakfast: '6 Egg Whites, 2 Slices Whole Wheat Toast, 1 Banana, Oats Shake',
      lunch: '250g Grilled Chicken Breast, Brown Rice, Mixed Veggies, Olive Oil',
      dinner: '200g Fish or Paneer, Sweet Potato, Green Salad',
      snacks: 'Whey Protein Shake, Almonds, Greek Yogurt',
      calories: 2800,
      protein: 180,
      carbs: 300,
      fat: 70,
      assignedMembers: [members[0]._id, members[3]._id]
    },
    {
      name: 'Calorie Deficit Weight Loss Plan',
      goal: 'Weight Loss',
      breakfast: 'Oatmeal with Berries, Chia Seeds, Green Tea',
      lunch: 'Tofu/Chicken Salad with Avocado dressing, Quinoa',
      dinner: 'Steamed Broccoli, Grilled Salmon/Tofu, Vegetable Soup',
      snacks: 'Green Apple, Handful of Walnuts',
      calories: 1800,
      protein: 130,
      carbs: 160,
      fat: 50,
      assignedMembers: [members[1]._id]
    }
  ]);

  // Settings
  await Settings.create({
    gymName: 'Titanium Fitness Club',
    logoUrl: '',
    address: '123 Powerhouse Gym Street, Sector 45, Cyber City',
    phone: '+91 98765 43210',
    email: 'support@titaniumfitness.com',
    businessHours: 'Mon-Sat: 6:00 AM - 10:00 PM, Sun: 7:00 AM - 2:00 PM',
    instagram: 'https://instagram.com/titaniumfitness',
    facebook: 'https://facebook.com/titaniumfitness',
    twitter: 'https://twitter.com/titaniumfitness',
    taxRate: 18,
    currency: '₹'
  });

  console.log('✅ Seed complete!');
  console.log('📧 Admin Login: admin@titaniumfitness.com');
  console.log('🔑 Password: Admin@123');
  mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
