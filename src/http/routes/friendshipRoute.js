const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');
const authMiddleware = require('../../../config/authMiddleware');

router.get('/getFriends', authMiddleware, friendshipController.getFriendsList);
router.get('/searchByNickname/:nickname', friendshipController.searchByNickname);
router.post('/sendFriendRequest', authMiddleware, friendshipController.sendFriendRequest);
router.get('/getPendingFriendRequests', authMiddleware, friendshipController.getPendingFriendRequests);
router.post('/respondToFriendRequest', authMiddleware, friendshipController.respondToFriendRequest);


module.exports = router;