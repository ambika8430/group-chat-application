const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth')
const userController = require('../controllers/user');
const chatController = require('../controllers/chat');

router.post('/user/sign-up', userController.createUser);
router.post('/user/sign-in', userController.verifyUser);

router.post('/chat', auth, chatController.createChat);
router.get('/chat', auth, chatController.getAllChats);

module.exports = router;