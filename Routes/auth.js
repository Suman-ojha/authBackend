const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

router.post('/register', authController.user_register);
router.post('/login', authController.signin);
router.post('/logout', authController.logout);

module.exports = router;
