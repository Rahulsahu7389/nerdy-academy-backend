const express = require('express');
const router = express.Router();
const { addStudent, getAllStudents, deleteStudent } = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// All routes below require a valid JWT + admin role
router.use(verifyToken, isAdmin);

// POST   /api/admin/students     — Add a new student
// GET    /api/admin/students     — List all students
// DELETE /api/admin/students/:id — Delete a student by ID
router.post('/students', addStudent);
router.get('/students', getAllStudents);
router.delete('/students/:id', deleteStudent);

module.exports = router;
