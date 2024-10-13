const express = require('express');
const { authenticateUser, checkRole } = require('../Middleware/authMiddleware');
const {
  createPost,
  editPost,
  getPostDetails,
  applyForPost, listFuturePosts,listAppliedPosts,cancelApplication,searchPosts, deletePost
} = require('../Controller/postControllers');
const upload = require('../Controller/upload');

const router = express.Router();

// Create post - only accessible to users with 'court' role
router.post('/create', authenticateUser, checkRole(['court', 'admin']), upload.array('images', 10), createPost);
// Edit post - only accessible to users with 'court' role
router.put('/:id', authenticateUser, checkRole(['court', 'admin']), editPost);

// Delete post - only accessible to users with 'court' or 'admin' role
router.delete('/delete/:id', authenticateUser, checkRole(['court', 'admin']), deletePost); // Thêm route xóa bài đăng

// Thêm route cho chức năng này
router.get('/future', listFuturePosts);

// Route để hiển thị các bài từ hôm nay đến tương lai và các bài đã ứng tuyển
router.get('/futureApp', authenticateUser, listAppliedPosts);

router.get('/search', searchPosts);
// Get post details - accessible to all authenticated users
router.get('/:id', getPostDetails);

// Apply for a post - only accessible to users with 'player' role
router.post('/:post_id/apply', authenticateUser, checkRole(['player']), applyForPost);
router.delete('/cancel/:post_id', authenticateUser, checkRole(['player']),cancelApplication);
module.exports = router;