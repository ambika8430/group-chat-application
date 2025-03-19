const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

router.post('/user/sign-up', userController.createUser);
router.post('/user/sign-in', userController.verifyUser);

module.exports = router;