const express = require('express');
const router = express.Router();
const { getAllStudents, getStats, addMilestone } = require('../controllers/sharedController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/students', verifyToken, getAllStudents);
router.get('/stats', verifyToken, getStats);
router.post('/milestones', verifyToken, addMilestone);

module.exports = router;
