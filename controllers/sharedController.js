const User = require('../models/User');

const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password -__v');
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole === 'admin') {
      const allStudents = await User.find({ role: 'student' });
      let totalMilestones = 0;
      let topicsLearned = 0;
      let testsTaken = 0;
      let sumAvgScore = 0;

      allStudents.forEach(student => {
        topicsLearned += (student.milestones?.topicsCompleted || 0);
        testsTaken += (student.milestones?.testsGiven || 0);
        sumAvgScore += (student.avgScore || 0);
      });

      totalMilestones = topicsLearned + testsTaken;
      const averageScore = allStudents.length > 0 ? Math.round(sumAvgScore / allStudents.length) : 0;

      return res.status(200).json({
        totalMilestones,
        topicsLearned,
        testsTaken,
        averageScore
      });
    } else {
      const student = await User.findById(userId);
      if (!student) return res.status(404).json({ message: 'Student not found.' });

      const topicsLearned = student.milestones?.topicsCompleted || 0;
      const testsTaken = student.milestones?.testsGiven || 0;
      const totalMilestones = topicsLearned + testsTaken;

      return res.status(200).json({
        totalMilestones,
        topicsLearned,
        testsTaken,
        averageScore: student.avgScore || 0
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

const addMilestone = async (req, res) => {
  try {
    const { studentId, type, title, details, score, date } = req.body;
    
    if (!studentId || !type || !title || !details || !date) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Split date (assuming DD-MM-YYYY format from frontend, or JS date)
    // Actually the frontend sends "04-05-2026", new Date() might get confused if it expects MM-DD-YYYY.
    // I will let it just be stored, or parse safely.
    // For simplicity, just use new Date() which JS handles best-effort, or string.
    let dateObj;
    if (date.includes('-') && date.split('-')[0].length === 2) {
      // "DD-MM-YYYY" -> "YYYY-MM-DD"
      const parts = date.split('-');
      dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      dateObj = new Date(date);
    }

    if (type === 'Topic Learned') {
      student.topicsLearned.push({ title, details, date: dateObj });
      student.milestones.topicsCompleted = (student.milestones.topicsCompleted || 0) + 1;
    } else if (type === 'Test / Quiz') {
      if (score === undefined || score === null) {
        return res.status(400).json({ message: 'Score is required for Test / Quiz.' });
      }
      student.tests.push({ title, details, score: Number(score), dateAndTime: dateObj });
      student.milestones.testsGiven = (student.milestones.testsGiven || 0) + 1;
      
      const totalScore = student.tests.reduce((acc, test) => acc + test.score, 0);
      student.avgScore = Math.round(totalScore / student.tests.length);
    }

    await student.save();
    res.status(200).json({ message: 'Milestone added successfully.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

const updateMilestone = async (req, res) => {
  try {
    const { studentId, type, milestoneId, title, details, score, date } = req.body;
    
    if (!studentId || !type || !milestoneId || !title || !details || !date) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    let dateObj;
    if (date.includes('-') && date.split('-')[0].length === 2) {
      const parts = date.split('-');
      dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      dateObj = new Date(date);
    }

    if (type === 'Topic Learned') {
      const milestone = student.topicsLearned.id(milestoneId);
      if (!milestone) return res.status(404).json({ message: 'Milestone not found.' });
      
      milestone.title = title;
      milestone.details = details;
      milestone.date = dateObj;
    } else if (type === 'Test / Quiz') {
      const milestone = student.tests.id(milestoneId);
      if (!milestone) return res.status(404).json({ message: 'Milestone not found.' });
      
      if (score === undefined || score === null) {
        return res.status(400).json({ message: 'Score is required for Test / Quiz.' });
      }
      
      milestone.title = title;
      milestone.details = details;
      milestone.score = Number(score);
      milestone.dateAndTime = dateObj;

      const totalScore = student.tests.reduce((acc, test) => acc + test.score, 0);
      student.avgScore = Math.round(totalScore / student.tests.length);
    } else {
      return res.status(400).json({ message: 'Invalid milestone type.' });
    }

    await student.save();
    res.status(200).json({ message: 'Milestone updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

const deleteMilestone = async (req, res) => {
  try {
    const { studentId, type, milestoneId } = req.params;
    
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    let milestoneType = decodeURIComponent(type);

    if (milestoneType === 'Topic Learned') {
      const milestone = student.topicsLearned.id(milestoneId);
      if (!milestone) return res.status(404).json({ message: 'Milestone not found.' });
      
      student.topicsLearned.pull(milestoneId);
      student.milestones.topicsCompleted = Math.max((student.milestones.topicsCompleted || 0) - 1, 0);
    } else if (milestoneType === 'Test / Quiz') {
      const milestone = student.tests.id(milestoneId);
      if (!milestone) return res.status(404).json({ message: 'Milestone not found.' });
      
      student.tests.pull(milestoneId);
      student.milestones.testsGiven = Math.max((student.milestones.testsGiven || 0) - 1, 0);
      
      if (student.tests.length > 0) {
        const totalScore = student.tests.reduce((acc, test) => acc + test.score, 0);
        student.avgScore = Math.round(totalScore / student.tests.length);
      } else {
        student.avgScore = 0;
      }
    } else {
      return res.status(400).json({ message: 'Invalid milestone type.' });
    }

    await student.save();
    res.status(200).json({ message: 'Milestone deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

module.exports = { getAllStudents, getStats, addMilestone, updateMilestone, deleteMilestone };
