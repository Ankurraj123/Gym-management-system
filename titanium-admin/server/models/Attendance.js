const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  memberName: { type: String },
  date: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' },
  checkInTime: { type: String, default: '' }
});

AttendanceSchema.index({ member: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
