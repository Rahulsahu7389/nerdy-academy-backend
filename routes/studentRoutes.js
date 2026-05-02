const express = require('express');
const router = express.Router();
const { getProgress, updateProgress } = require('../controllers/studentController');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/student/progress — Get student progress
router.get('/progress', verifyToken, getProgress);

// PUT /api/student/progress — Update student progress
router.put('/progress', verifyToken, updateProgress);

module.exports = router;
