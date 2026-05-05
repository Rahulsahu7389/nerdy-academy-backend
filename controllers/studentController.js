const User = require('../models/User');

/**
 * GET /api/student/progress
 * Get the current student's progress
 */
const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      milestones: user.milestones,
      tests: user.tests,
      topicsLearned: user.topicsLearned,
      homeworks: user.homeworks,
      notes: user.notes,
      avgScore: user.avgScore,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

/**
 * PUT /api/student/progress
 * Update the current student's progress
 */
const updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { milestones, tests, topicsLearned, homeworks, notes, avgScore } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (milestones !== undefined) user.milestones = milestones;
    if (tests !== undefined) user.tests = tests;
    if (topicsLearned !== undefined) user.topicsLearned = topicsLearned;
    if (homeworks !== undefined) user.homeworks = homeworks;
    if (notes !== undefined) user.notes = notes;
    if (avgScore !== undefined) user.avgScore = avgScore;

    await user.save();

    res.status(200).json({
      message: 'Progress updated successfully',
      milestones: user.milestones,
      tests: user.tests,
      topicsLearned: user.topicsLearned,
      homeworks: user.homeworks,
      notes: user.notes,
      avgScore: user.avgScore,
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

module.exports = {
  getProgress,
  updateProgress
};
