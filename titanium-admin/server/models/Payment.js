const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  invoiceId: { type: String, unique: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  memberName: { type: String },
  plan: { type: String, default: 'Basic' },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Paid', 'Pending', 'Refunded'], default: 'Paid' },
  method: { type: String, enum: ['Cash', 'Card', 'UPI', 'Online'], default: 'Cash' },
  description: { type: String, default: 'Monthly Subscription' }
});

PaymentSchema.pre('save', function (next) {
  if (!this.invoiceId) {
    this.invoiceId = 'INV-' + Date.now().toString(36).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
