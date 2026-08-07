const mongoose = require('mongoose');

const DietPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  goal: { type: String, enum: ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Keto', 'Vegan'], default: 'General Fitness' },
  breakfast: { type: String, default: '' },
  lunch: { type: String, default: '' },
  dinner: { type: String, default: '' },
  snacks: { type: String, default: '' },
  calories: { type: Number, default: 2000 },
  protein: { type: Number, default: 150 }, // in grams
  carbs: { type: Number, default: 200 },   // in grams
  fat: { type: Number, default: 60 },       // in grams
  assignedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DietPlan', DietPlanSchema);
