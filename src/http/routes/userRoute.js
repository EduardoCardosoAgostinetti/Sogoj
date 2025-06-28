const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//AUTH
router.post('/register', userController.validateRegister, userController.register);
router.post('/login', userController.validateLogin, userController.login);

module.exports = router;