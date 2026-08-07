const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ReceptionistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, select: false },
  role: { type: String, default: 'receptionist' },
  phone: { type: String, default: '' },
  shift: { type: String, enum: ['Morning', 'Evening', 'Night', 'Full-Time'], default: 'Morning' },
  salary: { type: Number, default: 25000 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  joiningDate: { type: Date, default: Date.now },
  photo: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

ReceptionistSchema.pre('save', async function () {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

module.exports = mongoose.model('Receptionist', ReceptionistSchema);
