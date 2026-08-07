const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  specialization: { type: String, default: 'General Fitness' },
  experience: { type: Number, default: 0 },
  salary: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  assignedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  photo: { type: String, default: '' },
  bio: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trainer', TrainerSchema);
