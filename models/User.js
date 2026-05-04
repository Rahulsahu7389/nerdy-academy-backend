const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'student'],
      default: 'student',
    },
    milestones: {
      topicsCompleted: { type: Number, default: 0 },
      testsGiven: { type: Number, default: 0 },
    },
    tests: [
      {
        title: { type: String, required: true },
        dateAndTime: { type: Date, default: Date.now },
        score: { type: Number, required: true },
      },
    ],
    topicsLearned: [
      {
        title: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    avgScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
