const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * POST /api/admin/students
 * Add a new student. Username is provided by the admin.
 */
const addStudent = async (req, res) => {
  try {
    const { name, username } = req.body;

    if (!name || !username) {
      return res.status(400).json({ message: 'Name and username are required.' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: `Username "${username}" is already taken.` });
    }

    const commonPassword = process.env.STUDENT_COMMON_PASSWORD;
    if (!commonPassword) {
      console.error('❌ FATAL: STUDENT_COMMON_PASSWORD is not set in .env');
      return res.status(500).json({ message: 'Server configuration error: STUDENT_COMMON_PASSWORD is missing.' });
    }

    // Hash the common password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(commonPassword, salt);

    const newStudent = new User({
      name,
      username,
      password: hashedPassword,
      role: 'student',
    });

    await newStudent.save();

    res.status(201).json({
      message: 'Student added successfully.',
      student: {
        _id: newStudent._id,
        name: newStudent.name,
        username: newStudent.username,
        role: newStudent.role,
      },
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

/**
 * GET /api/admin/students
 * Returns a list of all students (excluding password hash).
 */
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password -__v');
    res.status(200).json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

/**
 * DELETE /api/admin/students/:id
 * Deletes a student by their database _id.
 */
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStudent = await User.findOneAndDelete({ _id: id, role: 'student' });

    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    res.status(200).json({
      message: 'Student deleted successfully.',
      studentId: id,
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

module.exports = { addStudent, getAllStudents, deleteStudent };
