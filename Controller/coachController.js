const Coach = require('../Model/Coach');
const cloudinary = require('../Config/cloudinaryConfig'); // Cấu hình Cloudinary

// Thêm huấn luyện viên mới
exports.addCoach = async (req, res) => {
  try {
    const { name, description, price_per_session, contact_info, address } = req.body;
    
    // Kiểm tra có file không
    if (!req.file) {
      return res.status(400).json({ error: 'Không có ảnh được upload.' });
    }

    // Upload ảnh lên Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    const profile_image = result.secure_url; // Lấy URL của ảnh sau khi upload

    // Tạo huấn luyện viên mới
    const newCoach = new Coach({
      name,
      description,
      price_per_session,
      contact_info,
      address,
      profile_image // Lưu URL ảnh vào profile_image
    });

    await newCoach.save();
    res.status(201).json({ message: 'Thêm huấn luyện viên thành công', coach: newCoach });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Chỉnh sửa thông tin huấn luyện viên
exports.editCoach = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updated_at = Date.now();

    // Nếu có ảnh mới được upload, upload lên Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updateData.profile_image = result.secure_url; // Cập nhật URL ảnh mới
    }

    const coach = await Coach.findByIdAndUpdate(id, updateData, { new: true });

    if (!coach) {
      return res.status(404).json({ error: 'Không tìm thấy huấn luyện viên' });
    }

    res.json({ message: 'Cập nhật thông tin huấn luyện viên thành công', coach });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Lấy danh sách huấn luyện viên
exports.listCoaches = async (req, res) => {
  try {
    const coaches = await Coach.find().sort({ created_at: -1 });
    res.json(coaches);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Lấy chi tiết huấn luyện viên
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
