const Post = require('../Model/Post');
const { sendNotification } = require('./notificationController');
const { authenticateUser, checkRole } = require('../Middleware/authMiddleware');
const cloudinary = require('../Config/cloudinaryConfig');
const moment = require('moment');

exports.createPost = [
  async (req, res) => {
    try {
      const {
        court_name,
        location,
        total_players,
        court_type,
        players_needed,
        skill_level,
        play_date, 
        play_time, 
        cost,
        contact_info
      } = req.body;


       // Kiểm tra có file không
       if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Không có file nào được upload.' });
      }

      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' }, // Tự động nhận diện loại tệp
            (error, result) => {
              if (error) {
                return reject(new Error('Lỗi khi upload ảnh lên Cloudinary'));
              }
              resolve(result.secure_url); // Lưu trữ URL của ảnh đã upload
            }
          );
          uploadStream.end(file.buffer); // Kết thúc luồng upload
        });
      });

      // Upload tất cả hình ảnh và lấy URLs
      const images = await Promise.all(uploadPromises);
      // Kiểm tra định dạng của trường 'play_date'
      const regexDate = /^\d{2}\/\d{2}\/\d{4}$/;  // Định dạng DD/MM/YYYY
      if (!regexDate.test(play_date)) {
        return res.status(400).json({ error: 'Định dạng ngày không hợp lệ. Định dạng yêu cầu: DD/MM/YYYY.' });
      }

      const newPost = new Post({
        user_id: req.user._id,
        court_name,
        location,
        images, 
        total_players,
        court_type,
        players_needed,
        skill_level,
        play_date,
        play_time, 
        cost,
        contact_info
      });

      await newPost.save();
      await sendNotification(req.user._id, "Bài đăng của bạn đã được tạo thành công", newPost._id);
      res.status(201).json({ message: 'Tạo bài đăng thành công', post: newPost });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
];



exports.editPost = [
  authenticateUser,
  checkRole(['court']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      updateData.updated_at = Date.now();

      // Kiểm tra định dạng cho play_date và play_time trong updateData
      if (updateData.play_date && !moment(updateData.play_date, 'DD/MM/YYYY', true).isValid()) {
        return res.status(400).json({ error: 'Định dạng ngày không hợp lệ. Định dạng yêu cầu: DD/MM/YYYY.' });
      }

      if (updateData.play_time && !/^\d{1,2}:\d{2} - \d{1,2}:\d{2}$/.test(updateData.play_time)) {
        return res.status(400).json({ error: 'Định dạng thời gian không hợp lệ. Định dạng yêu cầu: HH:mm - HH:mm.' });
      }

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

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id; // Lấy ID từ tham số URL
    const post = await Post.findById(postId); // Tìm bài đăng theo ID

    // Kiểm tra xem bài đăng có tồn tại không
    if (!post) {
      return res.status(404).json({ error: 'Bài đăng không tồn tại' });
    }

    // Kiểm tra quyền xóa bài đăng
    const isAdmin = req.user.role === 'admin'; // Kiểm tra nếu người dùng là admin
    const isOwner = req.user.role === 'court' && post.user_id.toString() === req.user._id.toString(); // Kiểm tra xem người dùng có phải là chủ bài đăng hay không

    console.log('User ID:', req.user._id.toString());
    console.log('Post User ID:', post.user_id.toString());
    console.log('Is Admin:', isAdmin);
    console.log('Is Court Owner:', isOwner);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa bài đăng này' });
    }

    // Xóa bài đăng
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Xóa bài đăng thành công' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.listFuturePosts = [
  async (req, res) => {
    try {
      const currentTime = new Date(); // Lấy thời gian hiện tại

      // Tìm tất cả các bài đăng với play_date lớn hơn hoặc bằng thời gian hiện tại và có trạng thái approved
      const posts = await Post.find({
        play_date: { $gte: moment(currentTime).format('DD/MM/YYYY') }, 
        status: 'approved'
      })
        .populate('user_id', 'username profile.name')
        .sort({ play_date: 1 }); // Sắp xếp theo thời gian tăng dần
        // .lean(); // Chuyển đổi kết quả từ mongoose document sang object thông thường

      if (posts.length === 0) {
        return res.status(404).json({ message: 'Không có bài đăng nào hiện tại hoặc trong tương lai.' });
      }

      // Chuyển đổi play_date sang định dạng DD/MM/YYYY
      const formattedPosts = posts.map(post => ({
        ...post._doc, // Chuyển đổi post thành object thông thường
        play_date: moment(post.play_date, 'DD/MM/YYYY').format('DD/MM/YYYY'),
        applied_count: post.applied_players ? post.applied_players.length : 0, // Đếm số người ứng tuyển
      }));

      res.json(formattedPosts);
    } catch (error) {
      console.log(error);
      
      res.status(500).json({ error: 'Đã xảy ra lỗi, vui lòng thử lại sau' });
    }
  }
];


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

// Controller: postController.js

exports.cancelApplication = [
  authenticateUser,
  checkRole(['player']),
  async (req, res) => {
    const { post_id } = req.params; // Lấy ID bài đăng từ tham số
    const user_id = req.user._id; // Lấy ID người dùng từ token

    try {
      const post = await Post.findById(post_id); // Tìm bài đăng

      if (!post) {
        return res.status(404).json({ error: 'Không tìm thấy bài đăng' });
      }

      // Kiểm tra xem người dùng đã ứng tuyển chưa
      if (!post.applied_players || !post.applied_players.includes(user_id)) {
        return res.status(400).json({ error: 'Bạn chưa ứng tuyển cho bài đăng này' });
      }

      // Xóa ID người dùng khỏi danh sách ứng tuyển
      post.applied_players = post.applied_players.filter(id => id.toString() !== user_id.toString());
      post.players_needed += 1; // Tăng số người cần thiết lên 1
      await post.save(); // Lưu lại thay đổi

      // Gửi thông báo cho người tạo bài đăng
      await sendNotification(post.user_id, `Người dùng ${req.user.username} đã hủy ứng tuyển cho bài đăng của bạn`, post._id);

      res.status(200).json({ message: 'Hủy ứng tuyển thành công', post });
    } catch (error) {
      console.error('Lỗi khi hủy ứng tuyển:', error);
      res.status(500).json({ error: 'Đã xảy ra lỗi, vui lòng thử lại sau' });
    }
  }
];


exports.listAppliedPosts = [
  authenticateUser,
  async (req, res) => {
    try {
      const userId = req.user._id; // Lấy ID người dùng từ token

      // Lấy thời gian hiện tại để so sánh
      const currentTime = new Date();

      // Tìm tất cả các bài đăng mà người dùng đã ứng tuyển
      const posts = await Post.find({ applied_players: userId })
        .populate('user_id', 'username profile.name')
        .sort({ created_at: -1 }); // Sắp xếp theo thời gian tạo bài đăng, mới nhất trước

      if (posts.length === 0) {
        return res.status(404).json({ message: 'Bạn chưa ứng tuyển vào bài nào.' });
      }

      // Duyệt qua từng bài đăng để kiểm tra trạng thái
      const updatedPosts = posts.map(post => {
        const postDate = new Date(post.play_date); // Lấy ngày chơi từ bài đăng

        if (postDate < currentTime) {
          // Nếu bài viết đã qua ngày
          post.status = 'Hoàn thành'; // Cập nhật trạng thái là 'Hoàn thành'
        } else {
          // Nếu bài viết chưa qua ngày
          post.status = 'Có thể hủy'; // Cho phép hủy bài viết
        }

        return post;
      });

      res.json(updatedPosts);
    } catch (error) {
      res.status(500).json({ error: 'Đã xảy ra lỗi, vui lòng thử lại sau' });
    }
  }
];

exports.searchPosts = [
  async (req, res) => {
    try {
      const { court_address, play_time, skill_level, court_type } = req.query;

      // Tạo đối tượng điều kiện tìm kiếm
      const searchCriteria = {};

      // Thêm điều kiện vào đối tượng tìm kiếm nếu có giá trị
      if (court_address) {
        searchCriteria.court_address = { $regex: court_address, $options: 'i' }; // Tìm kiếm không phân biệt chữ hoa chữ thường
      }
      if (play_time) {
        searchCriteria.play_time = { $regex: play_time, $options: 'i' };
      }
      if (skill_level) {
        searchCriteria.skill_level = skill_level; // Tìm kiếm chính xác cho trình độ
      }
      if (court_type) {
        searchCriteria.court_type = court_type; // Tìm kiếm chính xác cho loại sân
      }

      // Tìm các bài viết theo tiêu chí tìm kiếm
      const posts = await Post.find(searchCriteria)
        .populate('user_id', 'username profile.name')
        .sort({ created_at: -1 }); // Sắp xếp theo thời gian tạo bài đăng, mới nhất trước

      if (posts.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy bài đăng nào.' });
      }

      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Đã xảy ra lỗi, vui lòng thử lại sau' });
    }
  }
];

exports.getPosts = async (req, res) => {
  try {
    if (req.user.role === 'court') {
      const posts = await Post.find({ user_id: req.user._id }).select('-__v');
      if (!posts.length) {
        return res.status(404).json({ message: 'Không tìm thấy bài đăng nào của court.' });
      }
      return res.status(200).json(posts);
    } else if (req.user.role === 'admin') {
      const posts = await Post.find().select('-__v');
      if (!posts.length) {
        return res.status(404).json({ message: 'Không tìm thấy bài đăng nào.' });
      }
      return res.status(200).json(posts);
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy bài đăng.' });
  }
};