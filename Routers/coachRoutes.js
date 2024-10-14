const express = require('express');
const router = express.Router();
const { addCoach, editCoach, listCoaches, getCoachDetails } = require('../Controller/coachController');
const { authenticateUser, checkRole } = require('../Middleware/authMiddleware');
const upload = require('../Controller/upload');

// Thêm huấn luyện viên (chỉ admin)
router.post('/add', checkRole(['admin']), upload.array('images', 10),addCoach);

// Chỉnh sửa huấn luyện viên (chỉ admin)
router.put('/edit/:id', authenticateUser, checkRole(['admin']), upload.array('images', 10),editCoach);

// Danh sách huấn luyện viên (có thể xem public)
router.get('/list', listCoaches);

// Chi tiết huấn luyện viên (có thể xem public)
router.get('/:id', getCoachDetails);

module.exports = router;
