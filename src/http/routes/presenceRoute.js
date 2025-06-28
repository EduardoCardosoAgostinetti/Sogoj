const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../config/authMiddleware');
const presenceController = require('../controllers/presenceController')

router.put('/updatePresence', authMiddleware, presenceController.updatePresence);

module.exports = router;