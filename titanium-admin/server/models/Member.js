const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MemberSchema = new mongoose.Schema({
  memberId: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  role: { type: String, default: 'member' },
  phone: { type: String, default: '' },
  photo: { type: String, default: '' },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  age: { type: Number, default: 0 },
  address: { type: String, default: '' },
  bloodGroup: { type: String, default: 'N/A' },
  emergencyContact: { type: String, default: '' },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan' },
  planName: { type: String, default: 'Basic' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: { type: String, enum: ['Active', 'Expired', 'Suspended'], default: 'Active' },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  weight: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  bmi: { type: Number, default: 0 },
  goal: { type: String, default: 'General Fitness' },
  medicalConditions: { type: String, default: 'None' },
  workoutStreak: { type: Number, default: 0 },
  totalWorkouts: { type: Number, default: 0 },
  assignedWorkout: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout' },
  assignedDiet: { type: mongoose.Schema.Types.ObjectId, ref: 'DietPlan' },
  weightHistory: [
    {
      date: { type: Date, default: Date.now },
      weight: { type: Number, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

MemberSchema.pre('save', async function () {
  if (!this.memberId) {
    this.memberId = 'TF-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

MemberSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Member', MemberSchema);
