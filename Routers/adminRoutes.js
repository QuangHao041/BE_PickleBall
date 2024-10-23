const express = require('express');
const router = express.Router();
const adminController = require('../Controller/adminController');
const { addCoach, editCoach,deleteCoach } = require('../Controller/coachController');
const { checkRole, authenticateAdmin} = require('../Middleware/authMiddleware');
const upload = require('../Controller/upload');

// Admin xem chi tiết bài đăng
router.get('/list-user', authenticateAdmin, adminController.listUsers);
router.post('/add', authenticateAdmin, checkRole(['admin']), upload.array('images', 10), addCoach);
router.put('/edit/:id', authenticateAdmin, checkRole(['admin']), upload.array('images', 10),editCoach);
router.delete('/delete/:id', authenticateAdmin, checkRole(['admin']), deleteCoach);


module.exports = router;
