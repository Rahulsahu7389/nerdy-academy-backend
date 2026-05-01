const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// POST /api/auth/login — Public route for admin and student login
router.post('/login', login);

module.exports = router;
