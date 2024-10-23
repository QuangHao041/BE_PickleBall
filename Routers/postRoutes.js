const express = require('express');
const { authenticateUser, checkRole, authenticateAdmin } = require('../Middleware/authMiddleware');
const {
  createPost,
  editPost,
  getPostDetails,
  applyForPost, listFuturePosts,listAppliedPosts,cancelApplication,searchPosts, deletePost,getPosts
} = require('../Controller/postControllers');
const upload = require('../Controller/upload');

const router = express.Router();

router.post('/create', authenticateUser, checkRole(['court', 'admin']), upload.array('images', 10), createPost);
router.put('/:id', authenticateUser, checkRole(['court', 'admin']), editPost);
router.delete('/delete/:id', authenticateUser,authenticateAdmin, checkRole(['court', 'admin']), deletePost);
router.get('/future', listFuturePosts);
router.get('/:id', getPostDetails);
router.get('/search', searchPosts);
router.post('/:post_id/apply', authenticateUser, checkRole(['player']), applyForPost);
router.delete('/cancel/:post_id', authenticateUser, checkRole(['player']),cancelApplication);
router.get('/futureApp', authenticateUser, listAppliedPosts);


module.exports = router;