const express = require('express');
const router = express.Router();
const multer = require("multer");
const upload = multer();

const auth = require('../middlewares/auth')
const userController = require('../controllers/user');
const chatController = require('../controllers/chat');
const groupController = require('../controllers/group');
const groupMemberController = require("../controllers/groupMember");
const storageController = require("../controllers/storage");

router.post('/user/sign-up', userController.createUser);
router.post('/user/sign-in', userController.verifyUser);

router.post('/group/:group_id/chat', auth, chatController.createChat);
router.get('/group/:group_id/chat/:lastMessageId', auth, chatController.getAllChats);

router.post('/group', auth, groupController.createGroup);
router.put('/group/:group_id', auth, groupController.updateGroup);
router.get('/group', auth, groupController.getGroupsByUser);
router.delete('/group/:group_id', auth, groupController.deleteGroup);
router.get('/group/:group_id/admin', auth, groupController.getGroupAdmin);

router.post("/invite/group/:group_id", auth, groupMemberController.addMember);
router.get("/group/:group_id/members", auth, groupMemberController.getGroupMembers);
router.put("/group/:group_id/member", auth, groupMemberController.removeMembers);

router.post("/file", auth, upload.single("file"), storageController.uploadFile);

module.exports = router;