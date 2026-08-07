const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Cardio' },
  purchaseDate: { type: Date },
  condition: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor'], default: 'Good' },
  lastMaintenance: { type: Date },
  nextMaintenance: { type: Date },
  status: { type: String, enum: ['Active', 'Under Maintenance', 'Out of Service'], default: 'Active' },
  notes: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Equipment', EquipmentSchema);
