const express = require('express');
const { authenticateUser, checkRole } = require('../Middleware/authMiddleware');
const {
  createPost,
  editPost,
  getPostDetails,
  applyForPost, listFuturePosts,listAppliedPosts,cancelApplication
} = require('../Controller/postControllers');

const router = express.Router();

// Create post - only accessible to users with 'court' role
router.post('/create', authenticateUser, checkRole(['court']), createPost);

// Edit post - only accessible to users with 'court' role
router.put('/:id', authenticateUser, checkRole(['court']), editPost);

// Thêm route cho chức năng này
router.get('/future', listFuturePosts);

// Route để hiển thị các bài từ hôm nay đến tương lai và các bài đã ứng tuyển
router.get('/futureApp', authenticateUser, listAppliedPosts);


// Get post details - accessible to all authenticated users
router.get('/:id', getPostDetails);

// Apply for a post - only accessible to users with 'player' role
router.post('/:post_id/apply', authenticateUser, checkRole(['player']), applyForPost);
router.delete('/cancel/:post_id', authenticateUser, checkRole(['player']),cancelApplication);
module.exports = router;