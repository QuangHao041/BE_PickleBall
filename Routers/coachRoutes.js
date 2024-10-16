const express = require('express');
const router = express.Router();
const { addCoach, editCoach, listCoaches, getCoachDetails,deleteCoach } = require('../Controller/coachController');
const { checkRole, authenticateAdmin } = require('../Middleware/authMiddleware');
const upload = require('../Controller/upload');

// Thêm huấn luyện viên (chỉ admin)
router.post('/add', authenticateAdmin, checkRole(['admin']), upload.array('images', 10), addCoach);

// Chỉnh sửa huấn luyện viên (chỉ admin)
router.put('/edit/:id', authenticateAdmin, checkRole(['admin']), upload.array('images', 10),editCoach);

// Danh sách huấn luyện viên (có thể xem public)
router.get('/list', listCoaches);

// Chi tiết huấn luyện viên (có thể xem public)
router.get('/:id', getCoachDetails);

// Xóa huấn luyện viên (chỉ admin)
router.delete('/delete/:id', authenticateAdmin, checkRole(['admin']), deleteCoach);


module.exports = router;
