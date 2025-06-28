const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');

//FORGOT PASSWORD
router.post('/verify', codeController.verifyCode);
router.post('/request', codeController.validateRequestCode, codeController.requestPasswordResetCode);
router.post('/resetPass', codeController.validateResetPassword, codeController.resetPassword);

module.exports = router;