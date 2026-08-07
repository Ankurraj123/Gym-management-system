const mongoose = require('mongoose');

const MembershipPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: Number, default: 30, comment: 'Days' },
  price: { type: Number, required: true },
  benefits: [{ type: String }],
  active: { type: Boolean, default: true },
  color: { type: String, default: '#14f195' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MembershipPlan', MembershipPlanSchema);
