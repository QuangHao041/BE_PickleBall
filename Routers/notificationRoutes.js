const express = require('express');
const router = express.Router();
const notificationController = require('../Controller/notificationController');
const { authenticateUser } = require('../Middleware/authMiddleware');

// Route để lấy danh sách thông báo
router.get('/', authenticateUser, notificationController.listNotifications);

// Route để xóa thông báo
router.delete('/:id', authenticateUser, notificationController.deleteNotification);

module.exports = router;
