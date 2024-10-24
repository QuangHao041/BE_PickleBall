const express = require('express');
const { listCoaches, getCoachDetails,getUserApplyPost} = require('../Controller/coachController');
const {getPosts} = require('../Controller/postControllers')
const router = express.Router();
const {authenticateUser} = require('../Middleware/authMiddleware');

router.get('/list', listCoaches);
router.get('/:id', getCoachDetails);
router.get('/posts/court', authenticateUser, getPosts);
router.get('/posts/:postId/applicants', authenticateUser, getUserApplyPost);



module.exports = router;
