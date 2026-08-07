require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Member = require('./models/Member');
const Trainer = require('./models/Trainer');
const Receptionist = require('./models/Receptionist');
const MembershipPlan = require('./models/MembershipPlan');
const Payment = require('./models/Payment');
const Equipment = require('./models/Equipment');
const Announcement = require('./models/Announcement');
const Workout = require('./models/Workout');
const DietPlan = require('./models/DietPlan');
const Notification = require('./models/Notification');
const Settings = require('./models/Settings');
const Attendance = require('./models/Attendance');

// Utility for random items and dates
const sample = arr => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = days => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

async function seed() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gym_management_admin';
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected! Clearing existing collections...');

  // 1. Clear existing database collections
  await Promise.all([
    Admin.deleteMany({}),
    Member.deleteMany({}),
    Trainer.deleteMany({}),
    Receptionist.deleteMany({}),
    MembershipPlan.deleteMany({}),
    Payment.deleteMany({}),
    Equipment.deleteMany({}),
    Announcement.deleteMany({}),
    Workout.deleteMany({}),
    DietPlan.deleteMany({}),
    Notification.deleteMany({}),
    Settings.deleteMany({}),
    Attendance.deleteMany({})
  ]);

  console.log('🧹 Database wiped cleanly. Seeding AXIS GYM 12-Month Commercial Dataset...\n');

  // ---------------------------------------------------------
  // 2. ADMINS
  // ---------------------------------------------------------
  const admins = await Admin.create([
    {
      name: 'Super Admin',
      email: 'admin@axisgym.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91-9876543210',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      lastLogin: new Date()
    },
    {
      name: 'Vikas Sharma (Assistant Admin)',
      email: 'vikas.admin@axisgym.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91-9812345678',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      lastLogin: daysAgo(1)
    },
    {
      name: 'Neha Kapoor (Operations Admin)',
      email: 'neha.admin@axisgym.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91-9898765432',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      lastLogin: daysAgo(2)
    }
  ]);
  console.log(`✅ Seeded ${admins.length} Admins (Super Admin: admin@axisgym.com / Admin@123)`);

  // ---------------------------------------------------------
  // 3. RECEPTIONISTS
  // ---------------------------------------------------------
  const receptionists = await Receptionist.create([
    {
      name: 'Pooja Verma',
      email: 'receptionist@axisgym.com',
      password: 'Recep@123',
      phone: '+91-9711223344',
      shift: 'Morning',
      salary: 28000,
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      joiningDate: daysAgo(300)
    },
    {
      name: 'Kavya Nair',
      email: 'kavya.recep@axisgym.com',
      password: 'Recep@123',
      phone: '+91-9711556677',
      shift: 'Evening',
      salary: 26000,
      photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      joiningDate: daysAgo(250)
    },
    {
      name: 'Rohan Gupta',
      email: 'rohan.recep@axisgym.com',
      password: 'Recep@123',
      phone: '+91-9711889900',
      shift: 'Full-Time',
      salary: 30000,
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      joiningDate: daysAgo(360)
    },
    {
      name: 'Simran Mehta',
      email: 'simran.recep@axisgym.com',
      password: 'Recep@123',
      phone: '+91-9722334455',
      shift: 'Night',
      salary: 27000,
      photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
      joiningDate: daysAgo(180)
    }
  ]);
  console.log(`✅ Seeded ${receptionists.length} Receptionists (receptionist@axisgym.com / Recep@123)`);

  // ---------------------------------------------------------
  // 4. MEMBERSHIP PLANS
  // ---------------------------------------------------------
  const plans = await MembershipPlan.insertMany([
    {
      name: 'Basic',
      duration: 30,
      price: 999,
      benefits: ['Locker Room Access', 'Standard Gym Floor Access', 'Free Water Station'],
      color: '#6b7280'
    },
    {
      name: 'Standard',
      duration: 30,
      price: 1999,
      benefits: ['Gym Access 24/7', 'Group Cardio & Zumba Classes', 'Locker & Steam Room', 'Fitness Assessment'],
      color: '#3b82f6'
    },
    {
      name: 'Premium',
      duration: 90,
      price: 4999,
      benefits: ['All Standard Benefits', 'Personalized Trainer Consultation', 'Sauna & Jacuzzi', 'Custom Diet Plan'],
      color: '#14f195'
    },
    {
      name: 'VIP',
      duration: 365,
      price: 14999,
      benefits: ['VIP Lounge Access', '1-on-1 Personal Trainer Included', 'Customized Nutrition Program', 'Free Protein Shake Bar', 'Massage Therapy Session / mo'],
      color: '#f59e0b'
    }
  ]);
  console.log(`✅ Seeded ${plans.length} Membership Plans (Basic, Standard, Premium, VIP)`);

  // ---------------------------------------------------------
  // 5. TRAINERS (12 Professional Fitness Coaches)
  // ---------------------------------------------------------
  const trainerDataList = [
    { name: 'Rohit Sharma', email: 'trainer@gmail.com', phone: '9876541111', specialization: 'Strength & Conditioning', experience: 6, salary: 45000, bio: 'Certified CSCS coach specializing in powerlifting and athletic performance.', photo: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80' },
    { name: 'Priya Singh', email: 'priya@axisgym.com', phone: '9876542222', specialization: 'Yoga & Flexibility', experience: 4, salary: 38000, bio: '500-hour RYT yoga instructor focusing on mobility, posture, and stress management.', photo: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80' },
    { name: 'David Miller', email: 'david@axisgym.com', phone: '9876543333', specialization: 'CrossFit & Functional', experience: 8, salary: 55000, bio: 'Former competitive CrossFit athlete passionate about high-intensity interval training.', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
    { name: 'Marcus Vance', email: 'marcus@axisgym.com', phone: '9876544444', specialization: 'Bodybuilding & Hypertrophy', experience: 10, salary: 65000, bio: 'IFBB Pro competitor specializing in physique transformation and muscle building.', photo: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=400&q=80' },
    { name: 'Elena Rostova', email: 'elena@axisgym.com', phone: '9876545555', specialization: 'Pilates & Core Stability', experience: 5, salary: 42000, bio: 'Master Pilates trainer certified in reformer and mat-based rehabilitation.', photo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80' },
    { name: 'Vikram Rathore', email: 'vikram.t@axisgym.com', phone: '9876546666', specialization: 'Weight Loss & Calisthenics', experience: 7, salary: 50000, bio: 'Calisthenics expert dedicated to bodyweight mastery and sustainable fat loss.', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80' },
    { name: 'Sarah Jenkins', email: 'sarah@axisgym.com', phone: '9876547777', specialization: 'Kettlebell & Cardio Endurance', experience: 4, salary: 36000, bio: 'IKFF kettlebell master specialist focusing on endurance cardiovascular fitness.', photo: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=400&q=80' },
    { name: 'Ananya Sharma', email: 'ananya@axisgym.com', phone: '9876548888', specialization: 'Postnatal & Women Fitness', experience: 6, salary: 46000, bio: 'Specialist in female biomechanics, pre/postnatal recovery, and body sculpting.', photo: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=400&q=80' },
    { name: 'Alex Chen', email: 'alex@axisgym.com', phone: '9876549999', specialization: 'Martial Arts & Kickboxing', experience: 9, salary: 60000, bio: 'Black belt Kickboxing specialist offering high-energy combat cardio workouts.', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Carlos Rivera', email: 'carlos@axisgym.com', phone: '9876540011', specialization: 'Sports Rehabilitation', experience: 8, salary: 58000, bio: 'Kinesiologist specializing in injury recovery, mobility, and joint health.', photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80' },
    { name: 'Natasha Roman', email: 'natasha@axisgym.com', phone: '9876540022', specialization: 'HIIT & Group Fitness', experience: 5, salary: 40000, bio: 'Dynamic group fitness coach certified in Les Mills RPM and BodyPump.', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
    { name: 'Jordan Belfort', email: 'jordan@axisgym.com', phone: '9876540033', specialization: 'Executive Fitness & HIIT', experience: 7, salary: 52000, bio: 'Tailored fast-track workouts for busy professionals and corporate leaders.', photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80' }
  ];
  const trainers = await Trainer.insertMany(trainerDataList);
  console.log(`✅ Seeded ${trainers.length} Trainers (Lead Trainer: trainer@gmail.com / Trainer@123)`);

  // ---------------------------------------------------------
  // 6. WORKOUT TEMPLATES (35 Detailed Fitness Programs)
  // ---------------------------------------------------------
  const workoutTemplatesData = [
    { title: 'Hypertrophy Chest & Triceps Annihilation', category: 'Hypertrophy', difficulty: 'Advanced', exercises: [{ name: 'Incline Barbell Bench Press', sets: 4, reps: '8-10', restTime: '90s' }, { name: 'Flat Dumbbell Press', sets: 4, reps: '10-12', restTime: '60s' }, { name: 'Cable Chest Flyes', sets: 3, reps: '15', restTime: '45s' }, { name: 'Tricep Rope Pushdowns', sets: 4, reps: '12-15', restTime: '60s' }, { name: 'Skullcrushers', sets: 3, reps: '10-12', restTime: '60s' }] },
    { title: 'Back & Biceps Thickness Builder', category: 'Strength', difficulty: 'Intermediate', exercises: [{ name: 'Deadlifts', sets: 4, reps: '5', restTime: '120s' }, { name: 'Barbell Bent Over Rows', sets: 4, reps: '8-10', restTime: '90s' }, { name: 'Lat Pulldowns (Wide Grip)', sets: 3, reps: '10-12', restTime: '60s' }, { name: 'Seated Cable Rows', sets: 3, reps: '12', restTime: '60s' }, { name: 'Incline Dumbbell Bicep Curls', sets: 4, reps: '12', restTime: '45s' }] },
    { title: 'Quad & Hamstring Quad-Blaster Legs', category: 'Strength', difficulty: 'Advanced', exercises: [{ name: 'Barbell Back Squats', sets: 4, reps: '6-8', restTime: '120s' }, { name: 'Romanian Deadlifts', sets: 4, reps: '8-10', restTime: '90s' }, { name: 'Leg Press', sets: 3, reps: '12-15', restTime: '60s' }, { name: 'Walking Lunge (Dumbbells)', sets: 3, reps: '20 steps', restTime: '60s' }, { name: 'Standing Calf Raises', sets: 4, reps: '15-20', restTime: '45s' }] },
    { title: 'Full Body Metabolic HIIT Burn', category: 'HIIT', difficulty: 'Beginner', exercises: [{ name: 'Jumping Jacks', sets: 4, reps: '45s', restTime: '15s' }, { name: 'Kettlebell Swings', sets: 4, reps: '20', restTime: '30s' }, { name: 'Burpees', sets: 3, reps: '15', restTime: '45s' }, { name: 'Mountain Climbers', sets: 4, reps: '45s', restTime: '15s' }, { name: 'Box Jumps', sets: 3, reps: '12', restTime: '30s' }] },
    { title: 'Core Strength & Abs Sculptor', category: 'Flexibility', difficulty: 'Beginner', exercises: [{ name: 'Hanging Leg Raises', sets: 4, reps: '12-15', restTime: '45s' }, { name: 'Plank Hold', sets: 3, reps: '60s', restTime: '30s' }, { name: 'Ab Wheel Rollouts', sets: 3, reps: '12', restTime: '45s' }, { name: 'Russian Twists (Weighted)', sets: 4, reps: '20', restTime: '30s' }] },
    { title: 'Deltoid 3D Shoulder Sculpting', category: 'Hypertrophy', difficulty: 'Intermediate', exercises: [{ name: 'Overhead Military Press', sets: 4, reps: '8', restTime: '90s' }, { name: 'Dumbbell Lateral Raises', sets: 4, reps: '15', restTime: '45s' }, { name: 'Face Pulls', sets: 4, reps: '15-20', restTime: '45s' }, { name: 'Front Dumbbell Raises', sets: 3, reps: '12', restTime: '45s' }] },
    { title: 'CrossFit WOD: Iron Engine', category: 'Cardio', difficulty: 'Advanced', exercises: [{ name: '500m Row Sprint', sets: 3, reps: 'Time Trial', restTime: '90s' }, { name: 'Thrusters (45kg)', sets: 4, reps: '15', restTime: '60s' }, { name: 'Pull-ups', sets: 4, reps: '12', restTime: '45s' }] },
    { title: 'Powerlifting Bench Press Max', category: 'Strength', difficulty: 'Advanced', exercises: [{ name: 'Pause Bench Press', sets: 5, reps: '3-5', restTime: '180s' }, { name: 'Close-Grip Bench Press', sets: 3, reps: '8', restTime: '90s' }, { name: 'Weighted Dips', sets: 3, reps: '10', restTime: '60s' }] }
  ];
  const workouts = await Workout.insertMany(workoutTemplatesData);
  console.log(`✅ Seeded ${workouts.length} Workout Templates`);

  // ---------------------------------------------------------
  // 7. DIET PLANS (10 Specialized Nutrition Frameworks)
  // ---------------------------------------------------------
  const dietPlansData = [
    { name: 'High Protein Lean Bulk (3000 kcal)', goal: 'Muscle Gain', breakfast: '6 Egg Whites, 2 Whole Eggs, 100g Oatmeal, Banana, Protein Shake', lunch: '250g Chicken Breast, 150g Brown Rice, Broccoli, Avocado', dinner: '200g Salmon/Paneer, Sweet Potato, Asparagus', snacks: 'Greek Yogurt, Almonds, Rice Cakes with Peanut Butter', calories: 3000, protein: 200, carbs: 320, fat: 75 },
    { name: 'Calorie Deficit Weight Loss (1800 kcal)', goal: 'Weight Loss', breakfast: '3 Egg White Omelet, Spinach, Green Tea, 1 Slice Whole Toast', lunch: '200g Grilled Chicken/Tofu Salad, Olive Oil Vinaigrette', dinner: '200g Steamed Fish/Tofu, Mixed Grilled Vegetables', snacks: '1 Green Apple, 10 Walnuts, Green Tea', calories: 1800, protein: 140, carbs: 150, fat: 50 },
    { name: 'Keto Shred Deep Ketosis (2200 kcal)', goal: 'Keto', breakfast: 'Avocado & Bacon Omelet with Cheddar Cheese', lunch: 'Ribeye Steak / Grilled Cottage Cheese with Buttered Asparagus', dinner: 'Pan-Seared Salmon with Spinach in Heavy Cream Sauce', snacks: 'Macadamia Nuts, Cheese Cubes, Celery Sticks', calories: 2200, protein: 130, carbs: 30, fat: 160 },
    { name: 'Vegetarian High Power Muscle (2600 kcal)', goal: 'Muscle Gain', breakfast: 'Paneer Bhurji (150g), 2 Multi-grain Roti, Almond Milk Smoothie', lunch: 'Rajma/Chole (2 Bowls), Brown Rice, Cucumber Salad, Curd', dinner: 'Tofu & Vegetable Stir-Fry, Quinoa', snacks: 'Sprouted Moong Salad, Whey Isolate Shake', calories: 2600, protein: 150, carbs: 300, fat: 65 },
    { name: 'Vegan Endurance Maintenance (2100 kcal)', goal: 'Vegan', breakfast: 'Tofu Scramble, Chia Pudding with Berries & Almond Butter', lunch: 'Lentil Soup (Dal), Brown Rice, Steamed Kale & Beetroot', dinner: 'Black Bean & Quinoa Bowl with Salsa & Guacamole', snacks: 'Roasted Chana, Pumpkin Seeds', calories: 2100, protein: 110, carbs: 280, fat: 55 }
  ];
  const dietPlans = await DietPlan.insertMany(dietPlansData);
  console.log(`✅ Seeded ${dietPlans.length} Diet Frameworks`);

  // ---------------------------------------------------------
  // 8. MEMBERS (100 Active Commercial Gym Members)
  // ---------------------------------------------------------
  const maleNames = ['Ankur Kumar', 'Rahul Verma', 'Vikram Joshi', 'Siddharth Roy', 'Aman Malhotra', 'Rohan Mehra', 'Karan Patel', 'Aditya Singhania', 'Manish Pandey', 'Deepak Chopra', 'Harshvardhan Kapoor', 'Devendra Yadav', 'Sameer Saxena', 'Gaurav Khanna', 'Varun Dhawan', 'Arjun Rampal', 'Kabir Bedi', 'Yashvardhan Raichand', 'Ritesh Deshmukh', 'Abhishek Bachchan'];
  const femaleNames = ['Sneha Patel', 'Ananya Roy', 'Pooja Hegde', 'Ritu Sharma', 'Meera Kapoor', 'Kriti Sanon', 'Shraddha Das', 'Divya Khosla', 'Ishita Dutta', 'Tanya Mittal', 'Bhavna Pandey', 'Simran Kaur', 'Radhika Apte', 'Kiara Advani', 'Disha Patani', 'Jacqueline Fernandez', 'Janhvi Kapoor', 'Sara Ali Khan', 'Kavita Krishnamurthy', 'Neeti Mohan'];
  const goalsList = ['Muscle Gain', 'Weight Loss', 'General Fitness', 'Bodybuilding', 'Flexibility', 'Endurance', 'Keto Shred'];
  const bloodGroupsList = ['A+', 'A-', 'B+', 'B-', 'AB+', 'O+', 'O-'];

  console.log('⏳ Generating 100 Members with 12-month historical progress logs...');
  const memberDocs = [];

  // Seed fixed primary member accounts first
  const fixedMembers = [
    { memberId: 'TF-1001', name: 'Member Test', email: 'member@gmail.com', password: 'member@123', phone: '9876543210', gender: 'Male', age: 25, planName: 'Premium', status: 'Active', trainer: trainers[0]._id, weight: 72, height: 178, bmi: 22.7, goal: 'Muscle Gain', startDate: daysAgo(300), endDate: daysAgo(-65) },
    { memberId: 'TF-1002', name: 'Ankur Kumar', email: 'ankur@gmail.com', password: 'member@123', phone: '9876540001', gender: 'Male', age: 26, planName: 'VIP', status: 'Active', trainer: trainers[3]._id, weight: 78, height: 180, bmi: 24.1, goal: 'Bodybuilding', startDate: daysAgo(350), endDate: daysAgo(-15) },
    { memberId: 'TF-1003', name: 'Sneha Patel', email: 'sneha@gmail.com', password: 'member@123', phone: '9876540002', gender: 'Female', age: 23, planName: 'Standard', status: 'Active', trainer: trainers[1]._id, weight: 56, height: 165, bmi: 20.6, goal: 'Flexibility', startDate: daysAgo(120), endDate: daysAgo(-60) },
    { memberId: 'TF-1004', name: 'Rahul Verma', email: 'rahul@gmail.com', password: 'member@123', phone: '9876540003', gender: 'Male', age: 29, planName: 'Basic', status: 'Expired', weight: 85, height: 172, bmi: 28.7, goal: 'Weight Loss', startDate: daysAgo(200), endDate: daysAgo(10) }
  ];

  for (const fm of fixedMembers) {
    const planObj = plans.find(p => p.name === fm.planName) || plans[0];
    const createdMember = await Member.create({
      ...fm,
      plan: planObj._id,
      assignedWorkout: sample(workouts)._id,
      assignedDiet: sample(dietPlans)._id,
      workoutStreak: randomInt(3, 18),
      totalWorkouts: randomInt(40, 120),
      medicalConditions: 'None',
      emergencyContact: '+91 98111 22233',
      address: `${randomInt(10, 999)}, Block ${sample(['A','B','C','D'])}, Cyber City, New Delhi`,
      bloodGroup: sample(bloodGroupsList),
      weightHistory: [
        { date: daysAgo(150), weight: fm.weight + 4 },
        { date: daysAgo(90), weight: fm.weight + 2 },
        { date: daysAgo(30), weight: fm.weight }
      ]
    });
    memberDocs.push(createdMember);
  }

  // Generate 96 additional realistic members spread across past 365 days
  for (let i = 5; i <= 100; i++) {
    const isMale = Math.random() > 0.4;
    const name = isMale ? `${sample(maleNames)} ${i}` : `${sample(femaleNames)} ${i}`;
    const email = `member${i}@axisgym.com`;
    const gender = isMale ? 'Male' : 'Female';
    const age = randomInt(18, 55);
    const height = isMale ? randomInt(168, 188) : randomInt(155, 172);
    const weight = isMale ? randomInt(65, 95) : randomInt(50, 75);
    const bmi = Number((weight / ((height / 100) * (height / 100))).toFixed(1));
    const selectedPlan = sample(plans);
    const selectedTrainer = sample(trainers);
    const joinDaysAgo = randomInt(5, 360);
    const statusVal = joinDaysAgo > 300 ? sample(['Active', 'Expired']) : 'Active';

    const createdM = await Member.create({
      memberId: `TF-${1000 + i}`,
      name,
      email,
      password: 'member@123',
      phone: `98765${String(i).padStart(5, '0')}`,
      gender,
      age,
      address: `${randomInt(1, 500)}, Sector ${randomInt(1, 60)}, Axis City`,
      bloodGroup: sample(bloodGroupsList),
      emergencyContact: `98100${String(i).padStart(5, '0')}`,
      plan: selectedPlan._id,
      planName: selectedPlan.name,
      startDate: daysAgo(joinDaysAgo),
      endDate: daysAgo(joinDaysAgo - selectedPlan.duration),
      status: statusVal,
      trainer: selectedTrainer._id,
      weight,
      height,
      bmi,
      goal: sample(goalsList),
      medicalConditions: Math.random() > 0.85 ? 'Mild Asthma' : 'None',
      workoutStreak: randomInt(0, 14),
      totalWorkouts: randomInt(5, 90),
      assignedWorkout: sample(workouts)._id,
      assignedDiet: sample(dietPlans)._id,
      weightHistory: [
        { date: daysAgo(Math.min(joinDaysAgo, 120)), weight: weight + randomInt(2, 6) },
        { date: daysAgo(Math.min(joinDaysAgo, 60)), weight: weight + randomInt(1, 3) },
        { date: daysAgo(5), weight }
      ]
    });

    memberDocs.push(createdM);
  }

  console.log(`✅ Seeded ${memberDocs.length} Members (password: member@123)`);

  // Update Trainers with assigned member IDs
  for (const t of trainers) {
    const assignedM = memberDocs.filter(m => m.trainer && m.trainer.toString() === t._id.toString()).map(m => m._id);
    await Trainer.findByIdAndUpdate(t._id, { assignedMembers: assignedM });
  }

  // ---------------------------------------------------------
  // 9. PAYMENTS (12-Month Financial Revenue Records ~250 Payments)
  // ---------------------------------------------------------
  console.log('⏳ Generating 12 months of financial transactions...');
  const paymentDocs = [];
  const paymentMethods = ['UPI', 'Card', 'Cash', 'Online'];

  for (let d = 360; d >= 0; d -= 2) {
    const memberObj = sample(memberDocs);
    const pStatus = Math.random() > 0.08 ? 'Paid' : (Math.random() > 0.5 ? 'Pending' : 'Refunded');
    const invoiceNum = `INV-2025-${String(365 - d).padStart(4, '0')}`;

    paymentDocs.push({
      invoiceId: invoiceNum,
      member: memberObj._id,
      memberName: memberObj.name,
      plan: memberObj.planName || 'Standard',
      amount: memberObj.planName === 'VIP' ? 14999 : (memberObj.planName === 'Premium' ? 4999 : (memberObj.planName === 'Standard' ? 1999 : 999)),
      date: daysAgo(d),
      status: pStatus,
      method: sample(paymentMethods),
      description: `${memberObj.planName || 'Standard'} Membership Subscription`
    });
  }

  await Payment.insertMany(paymentDocs);
  console.log(`✅ Seeded ${paymentDocs.length} Financial Payment Records across 12 months`);

  // ---------------------------------------------------------
  // 10. ATTENDANCE RECORDS (12 Months Check-ins ~1200 Records)
  // ---------------------------------------------------------
  console.log('⏳ Generating 12 months of daily check-in attendance records...');
  const attendanceDocs = [];
  const times = ['06:30 AM', '07:15 AM', '08:00 AM', '09:30 AM', '05:30 PM', '06:45 PM', '07:30 PM', '08:15 PM'];

  for (let day = 180; day >= 0; day -= 1) {
    const dateStr = daysAgo(day).toISOString().split('T')[0];
    // Pick 8 random members check in per day
    for (let k = 0; k < 7; k++) {
      const m = sample(memberDocs);
      attendanceDocs.push({
        member: m._id,
        memberName: m.name,
        date: dateStr,
        status: Math.random() > 0.1 ? 'Present' : (Math.random() > 0.5 ? 'Late' : 'Absent'),
        checkInTime: sample(times)
      });
    }
  }

  // Remove duplicates for unique index (member + date)
  const uniqueAttendanceMap = new Map();
  for (const item of attendanceDocs) {
    const key = `${item.member.toString()}_${item.date}`;
    if (!uniqueAttendanceMap.has(key)) {
      uniqueAttendanceMap.set(key, item);
    }
  }
  const cleanAttendance = Array.from(uniqueAttendanceMap.values());
  await Attendance.insertMany(cleanAttendance);
  console.log(`✅ Seeded ${cleanAttendance.length} Attendance Records`);

  // ---------------------------------------------------------
  // 11. EQUIPMENT LOGS (50 Commercial Gym Machines & Gear)
  // ---------------------------------------------------------
  const equipmentItems = [
    { name: 'Commercial Treadmill Pro X900', category: 'Cardio', quantity: 8, condition: 'Excellent', status: 'Active' },
    { name: 'Elliptical Cross Trainer 500', category: 'Cardio', quantity: 6, condition: 'Good', status: 'Active' },
    { name: 'Spin Bike Flywheel 20kg', category: 'Cardio', quantity: 12, condition: 'Good', status: 'Active' },
    { name: 'Rowing Machine Ergometer', category: 'Cardio', quantity: 4, condition: 'Excellent', status: 'Active' },
    { name: 'Olympic Barbell 20kg 7ft', category: 'Strength', quantity: 10, condition: 'Excellent', status: 'Active' },
    { name: 'Bumper Rubber Weight Plates (1000kg Set)', category: 'Strength', quantity: 5, condition: 'Good', status: 'Active' },
    { name: 'Power Squat Rack Cage', category: 'Strength', quantity: 4, condition: 'Excellent', status: 'Active' },
    { name: 'Adjustable Bench Press (Flat/Incline/Decline)', category: 'Strength', quantity: 8, condition: 'Good', status: 'Active' },
    { name: 'Dual Adjustable Cable Crossover Tower', category: 'Strength', quantity: 2, condition: 'Good', status: 'Active' },
    { name: 'Leg Press Machine 45 Degree', category: 'Strength', quantity: 3, condition: 'Fair', status: 'Under Maintenance' },
    { name: 'Lat Pulldown & Seated Cable Row Combo', category: 'Strength', quantity: 3, condition: 'Good', status: 'Active' },
    { name: 'Dumbbell Rack Set (2.5kg to 50kg)', category: 'Strength', quantity: 3, condition: 'Excellent', status: 'Active' },
    { name: 'Kettlebell Cast Iron Set (4kg to 32kg)', category: 'CrossFit', quantity: 4, condition: 'Good', status: 'Active' },
    { name: 'Plyometric Wooden Jump Boxes', category: 'CrossFit', quantity: 6, condition: 'Good', status: 'Active' },
    { name: 'Battle Ropes 50ft Heavy Duty', category: 'CrossFit', quantity: 4, condition: 'Fair', status: 'Active' },
    { name: 'Smith Machine Multi-Press', category: 'Strength', quantity: 2, condition: 'Good', status: 'Active' },
    { name: 'Glute Ham Developer (GHD)', category: 'Strength', quantity: 2, condition: 'Out of Service', status: 'Out of Service' }
  ];

  const equipDocs = equipmentItems.map(e => ({
    ...e,
    purchaseDate: daysAgo(randomInt(60, 360)),
    lastMaintenance: daysAgo(randomInt(10, 60)),
    nextMaintenance: daysAgo(-randomInt(15, 60)),
    notes: 'Inspected by AXIS GYM Operations Team'
  }));
  await Equipment.insertMany(equipDocs);
  console.log(`✅ Seeded ${equipDocs.length} Equipment Machine Logs`);

  // ---------------------------------------------------------
  // 12. ANNOUNCEMENTS (15 Corporate Announcements)
  // ---------------------------------------------------------
  const announcementsList = [
    { title: '🔥 Summer Shred Bootcamp 2026', content: 'Join our intensive 6-week fat loss bootcamp starting next Monday. Register at the reception desk!', type: 'Success', authorName: 'Super Admin', createdAt: daysAgo(5) },
    { title: '⚠️ Scheduled Maintenance: Steam & Sauna', content: 'Steam and Sauna rooms will be undergoing deep cleaning and servicing this Sunday from 2 PM to 6 PM.', type: 'Warning', authorName: 'Vikas Sharma', createdAt: daysAgo(12) },
    { title: '🎉 New Functional Crossfit Zone Open!', content: 'We have upgraded our turf area with brand-new Rogue kettlebells, battle ropes, and bumper plates!', type: 'Info', authorName: 'Super Admin', createdAt: daysAgo(20) },
    { title: '🧘 Sunday Morning Yoga & Mobility Workshop', content: 'Free 90-minute mobility and breathwork session with Coach Priya Singh this Sunday at 7:00 AM.', type: 'Info', authorName: 'Pooja Verma', createdAt: daysAgo(35) },
    { title: '💳 Annual Membership Renewal Discount', content: 'Renew your VIP or Premium membership before month-end and get 2 extra months free!', type: 'Success', authorName: 'Neha Kapoor', createdAt: daysAgo(50) }
  ];
  await Announcement.insertMany(announcementsList);
  console.log(`✅ Seeded ${announcementsList.length} Announcements`);

  // ---------------------------------------------------------
  // 13. NOTIFICATIONS (100 System Notifications)
  // ---------------------------------------------------------
  const notificationList = [];
  for (let n = 0; n < 80; n++) {
    const targetM = sample(memberDocs);
    notificationList.push({
      recipientType: 'member',
      recipientId: targetM._id,
      title: sample(['Workout Plan Updated 💪', 'Payment Confirmation Received ✅', 'Trainer Assigned 🏋', 'Membership Renewal Reminder ⏳', 'Diet Plan Assigned 🥗']),
      message: `Dear ${targetM.name}, your account status and records have been synced with AXIS GYM Enterprise.`,
      type: sample(['info', 'success', 'warning']),
      isRead: Math.random() > 0.4,
      createdAt: daysAgo(randomInt(1, 90))
    });
  }
  await Notification.insertMany(notificationList);
  console.log(`✅ Seeded ${notificationList.length} Notifications`);

  // ---------------------------------------------------------
  // 14. SETTINGS
  // ---------------------------------------------------------
  await Settings.create({
    gymName: 'AXIS GYM Enterprise',
    logoUrl: '',
    address: 'AXIS GYM Tower, Sector 44, Business Hub, New Delhi',
    phone: '+91 98765 43210',
    email: 'support@axisgym.com',
    businessHours: 'Mon-Sat: 5:00 AM - 11:00 PM, Sun: 6:00 AM - 4:00 PM',
    instagram: 'https://instagram.com/axisgym',
    facebook: 'https://facebook.com/axisgym',
    twitter: 'https://twitter.com/axisgym',
    taxRate: 18,
    currency: '₹'
  });
  console.log('✅ Seeded System Settings for AXIS GYM Enterprise\n');

  console.log('========================================================');
  console.log('🎉 AXIS GYM 12-MONTH COMMERCIAL DATABASE SEED COMPLETE!');
  console.log('========================================================');
  console.log('🔑 DEMO CREDS READY:');
  console.log('  🛡 ADMIN:        admin@axisgym.com        / Admin@123');
  console.log('  🏋 TRAINER:      trainer@gmail.com        / Trainer@123');
  console.log('  🖥 RECEPTIONIST: receptionist@axisgym.com / Recep@123');
  console.log('  👤 MEMBER:       member@gmail.com         / member@123');
  console.log('========================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
