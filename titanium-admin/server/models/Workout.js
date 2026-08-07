const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: String, default: '10-12' },
  restTime: { type: String, default: '60s' }
});

const WorkoutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['Cardio', 'Strength', 'HIIT', 'Hypertrophy', 'Flexibility'], default: 'Strength' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  exercises: [ExerciseSchema],
  assignedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workout', WorkoutSchema);
