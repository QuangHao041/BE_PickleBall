const express = require('express');
const { authenticateUser, checkRole } = require('../Middleware/authMiddleware');
const {
  createPost,
  editPost,
  listAllPosts,
  getPostDetails,
  applyForPost
} = require('../Controller/postControllers');

const router = express.Router();

// Create post - only accessible to users with 'court' role
router.post('/create', authenticateUser, checkRole(['court']), createPost);

// Edit post - only accessible to users with 'court' role
router.put('/:id', authenticateUser, checkRole(['court']), editPost);

// List all posts - accessible to all authenticated users
router.get('/',  listAllPosts);

// Get post details - accessible to all authenticated users
router.get('/:id', getPostDetails);

// Apply for a post - only accessible to users with 'player' role
router.post('/:post_id/apply', authenticateUser, checkRole(['player']), applyForPost);

module.exports = router;