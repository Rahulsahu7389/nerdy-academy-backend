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

    res.status(200).json({ completedModules: user.completedModules });
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
    const { completedModules } = req.body;

    if (!Array.isArray(completedModules)) {
      return res.status(400).json({ message: 'completedModules must be an array' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.completedModules = completedModules;
    await user.save();

    res.status(200).json({ message: 'Progress updated successfully', completedModules: user.completedModules });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

module.exports = {
  getProgress,
  updateProgress
};
