const Post = require('../Model/Post');
const { sendNotification } = require('./notificationController'); 
const { authenticateUser, checkRole } = require('../Middleware/authMiddleware');

// Tạo bài mới và gửi thông báo đến admin
exports.createPost = [
  async (req, res) => {
    try {
      const {
        court_address,
        group_type,
        images,
        total_players,
        court_type,
        players_needed,
        skill_level,
        time,
        cost,
        contact_info
      } = req.body;
      // Kiểm tra định dạng của trường 'time'
      const regexDate = /^\d{4}-\d{2}-\d{2}$/; // Định dạng YYYY-MM-DD

      // Nếu time không khớp với định dạng, trả về lỗi
      if (!regexDate.test(time)) {
        return res.status(400).json({ error: 'Định dạng ngày không hợp lệ. Định dạng yêu cầu: YYYY-MM-DD.' });
      }

      const postTime = new Date(time); // Chuyển chuỗi time thành kiểu Date

      // Kiểm tra xem thời gian có hợp lệ không (ngày 2024/20/20 không hợp lệ)
      if (isNaN(postTime.getTime())) {
        return res.status(400).json({ error: 'Thời gian không hợp lệ, vui lòng nhập ngày hợp lệ theo định dạng YYYY-MM-DD.' });
      }
      const newPost = new Post({
        user_id: req.user._id,
        court_address,
        group_type,
        images,
        total_players,
        court_type,
        players_needed,
        skill_level,
        time,
        cost,
        contact_info
      });

      await newPost.save();

      // // // Tạo thông báo cho người dùng
      // await Notification.create({
      //   user_id: req.user._id,
      //   message: `Bạn đã tạo một bài đăng mới: ${newPost.court_address}`,
      //   related_post_id: newPost._id // Liên kết với bài đăng
      // });
      await sendNotification(req.user._id, "Bài đăng của bạn đã được tạo thành công", newPost._id);

      res.status(201).json({ message: 'Tạo bài đăng thành công', post: newPost });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
];

// Chỉnh sửa bài đăng
exports.editPost = [
  authenticateUser,
  checkRole(['court']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      updateData.updated_at = Date.now();

      const post = await Post.findOneAndUpdate(
        { _id: id, user_id: req.user._id },
        updateData,
        { new: true }
      );

      if (!post) {
        return res.status(404).json({ error: 'Không tìm thấy bài đăng hoặc bạn không có quyền chỉnh sửa' });
      }

      res.json({ message: 'Cập nhật bài đăng thành công', post });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
];

exports.listFuturePosts = [
  async (req, res) => {
    try {
      const currentTime = new Date(); // Lấy thời gian hiện tại

      // Tìm tất cả các bài đăng với thời gian lớn hơn hoặc bằng thời gian hiện tại và có trạng thái approved
      const posts = await Post.find({ time: { $gte: currentTime }, status: 'approved' })
        .populate('user_id', 'username profile.name')
        .sort({ time: 1 }); // Sắp xếp theo thời gian tăng dần

      if (posts.length === 0) {
        return res.status(404).json({ message: 'Không có bài đăng nào hiện tại hoặc trong tương lai.' });
      }

      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Đã xảy ra lỗi, vui lòng thử lại sau' });
    }
  }
];

// Lấy chi tiết bài đăng
exports.getPostDetails = [
  async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Post.findById(id)
        .populate('user_id', 'username profile.name profile.skill_level profile.phone_number profile.facebook_link');

      if (!post) {
        return res.status(404).json({ error: 'Không tìm thấy bài đăng' });
      }

      res.json(post);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
];

exports.applyForPost = [
  authenticateUser,
  checkRole(['player']),
  async (req, res) => {
    const { post_id } = req.params;
    const user_id = req.user._id;

    try {
      const post = await Post.findById(post_id);

      if (!post) {
        return res.status(404).json({ error: 'Không tìm thấy bài đăng' });
      }

      if (post.players_needed <= 0) {
        return res.status(400).json({ error: 'Số người cần thiết đã đủ' });
      }

      // Kiểm tra nếu applied_players tồn tại và sử dụng includes
      if (!post.applied_players) {
        post.applied_players = []; // Khởi tạo nếu chưa có
      }

      if (post.applied_players.includes(user_id)) {
        return res.status(400).json({ error: 'Bạn đã ứng tuyển cho bài đăng này rồi' });
      }

      post.applied_players.push(user_id);
      post.players_needed -= 1;
      await post.save();

      // // Tạo thông báo ứng tuyển
      // await Notification.create({
      //   user_id: post.user_id, // ID của người tạo bài đăng
      //   content: `${req.user.username} đã ứng tuyển cho bài đăng: ${post.court_address}`,
      //   related_post_id: post._id
      // });
      // Gửi thông báo cho người tạo bài đăng
      await sendNotification(post.user_id, `Người dùng ${req.user.username} đã ứng tuyển cho bài đăng của bạn`, post._id);

      // Gửi thông báo cho người ứng tuyển về việc ứng tuyển thành công
      await sendNotification(user_id, `Bạn đã ứng tuyển thành công cho bài đăng: ${post.court_address}`, post._id);


      res.status(200).json({ message: 'Bạn đã ứng tuyển thành công', post });
    } catch (error) {
      console.error('Lỗi khi ứng tuyển:', error);
      res.status(500).json({ error: 'Đã xảy ra lỗi, vui lòng thử lại sau' });
    }
  }
];
exports.listAppliedPosts = [
  authenticateUser,
  async (req, res) => {
    try {
      const userId = req.user._id; // Lấy ID người dùng từ token

      // Tìm tất cả các bài đăng mà người dùng đã ứng tuyển
      const posts = await Post.find({ applied_players: userId })
        .populate('user_id', 'username profile.name')
        .sort({ created_at: -1 }); // Sắp xếp theo thời gian tạo bài đăng, mới nhất trước

      if (posts.length === 0) {
        return res.status(404).json({ message: 'Bạn chưa ứng tuyển vào bài nào.' });
      }

      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Đã xảy ra lỗi, vui lòng thử lại sau' });
    }
  }
];
