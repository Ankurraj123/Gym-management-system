const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  gymName: { type: String, default: 'Titanium Fitness Club' },
  logoUrl: { type: String, default: '' },
  address: { type: String, default: '123 Powerhouse Gym Street, Sector 45, Cyber City' },
  phone: { type: String, default: '+91 98765 43210' },
  email: { type: String, default: 'support@titaniumfitness.com' },
  businessHours: { type: String, default: 'Mon-Sat: 6:00 AM - 10:00 PM, Sun: 7:00 AM - 2:00 PM' },
  instagram: { type: String, default: 'https://instagram.com/titaniumfitness' },
  facebook: { type: String, default: 'https://facebook.com/titaniumfitness' },
  twitter: { type: String, default: 'https://twitter.com/titaniumfitness' },
  taxRate: { type: Number, default: 18 },
  currency: { type: String, default: '₹' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', SettingsSchema);
