const express = require('express');
const { login } = require('../controllers/authController');
const { apiKeyMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', apiKeyMiddleware, login);

module.exports = router;