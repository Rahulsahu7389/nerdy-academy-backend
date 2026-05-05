const express = require('express');
const router = express.Router();
const { getAllStudents, getStats, addMilestone, updateMilestone, deleteMilestone } = require('../controllers/sharedController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/students', verifyToken, getAllStudents);
router.get('/stats', verifyToken, getStats);
router.post('/milestones', verifyToken, addMilestone);
router.put('/milestones', verifyToken, updateMilestone);
router.delete('/milestones/:studentId/:type/:milestoneId', verifyToken, deleteMilestone);

module.exports = router;
