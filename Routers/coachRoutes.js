const express = require('express');
const router = express.Router();
const { addCoach, editCoach, listCoaches, getCoachDetails } = require('../Controller/coachController');
const { authenticateUser, checkRole } = require('../Middleware/authMiddleware');

// Thêm huấn luyện viên (chỉ admin)
router.post('/add', checkRole(['admin']), addCoach);

// Chỉnh sửa huấn luyện viên (chỉ admin)
router.put('/edit/:id', authenticateUser, checkRole(['admin']), editCoach);

// Danh sách huấn luyện viên (có thể xem public)
router.get('/list', listCoaches);

// Chi tiết huấn luyện viên (có thể xem public)
router.get('/:id', getCoachDetails);

module.exports = router;
