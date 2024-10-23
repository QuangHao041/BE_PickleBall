const Coach = require('../Model/Coach');
const cloudinary = require('../Config/cloudinaryConfig');
const Post = require('../Model/Post');


exports.addCoach = async (req, res) => {
  try {
    const { name, description, price_per_session, contact_info, address } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Không có file nào được upload.' });
    }
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' }, // Tự động nhận diện loại tệp
          (error, result) => {
            if (error) {
              console.error('Lỗi khi upload ảnh lên Cloudinary:', error);
              return reject(new Error('Lỗi khi upload ảnh lên Cloudinary: ' + error.message));
            }
            resolve(result.secure_url); 
          }
        );
        uploadStream.end(file.buffer); 
      });
    });
    const images = await Promise.all(uploadPromises);

    const newCoach = new Coach({
      name,
      description,
      price_per_session,
      contact_info,
      images, 
      address
    });

    await newCoach.save();
    res.status(201).json({ message: 'Thêm huấn luyện viên thành công', coach: newCoach });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.editCoach = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updated_at = Date.now();

    const coach = await Coach.findByIdAndUpdate(id, updateData, { new: true });

    if (!coach) {
      return res.status(404).json({ error: 'Không tìm thấy huấn luyện viên' });
    }

    res.json({ message: 'Cập nhật thông tin huấn luyện viên thành công', coach });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.listCoaches = async (req, res) => {
  try {
    const coaches = await Coach.find().sort({ created_at: -1 });
    res.json(coaches);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.getCoachDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const coach = await Coach.findById(id);

    if (!coach) {
      return res.status(404).json({ error: 'Không tìm thấy huấn luyện viên' });
    }

    res.json(coach);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.deleteCoach = async (req, res) => {
  try {
    const { id } = req.params;
    const coach = await Coach.findByIdAndDelete(id);

    if (!coach) {
      return res.status(404).json({ error: 'Không tìm thấy huấn luyện viên' });
    }

    res.json({ message: 'Xóa huấn luyện viên thành công' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUserApplyPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate({
      path: 'applied_players', 
      select: 'username email phone profile.name profile.skill_level' 
    });

    if (!post) {
      return res.status(404).json({ error: 'Bài đăng không tồn tại.' });
    }

    if (req.user.role !== 'court' || post.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Bạn không có quyền xem danh sách ứng viên của bài đăng này.' });
    }
    res.status(200).json({
      postId: post._id,
      courtName: post.court_name,
      applicants: post.applied_players,
    });
  } catch (error) {
    console.error('Error fetching applicants for post:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách ứng viên.' });
  }
};
