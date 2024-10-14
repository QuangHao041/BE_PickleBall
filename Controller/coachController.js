const Coach = require('../Model/Coach');
const cloudinary = require('../Config/cloudinaryConfig');

// Thêm huấn luyện viên mới
exports.addCoach = async (req, res) => {
  console.log(req.body); // Kiểm tra các trường thông tin không phải tệp
  console.log(req.files); // Kiểm tra các tệp đã được gửi
  try {
    const { name, description, price_per_session, contact_info, address } = req.body;

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
              console.error('Lỗi khi upload ảnh lên Cloudinary:', error);
              return reject(new Error('Lỗi khi upload ảnh lên Cloudinary: ' + error.message));
            }
            resolve(result.secure_url); // Lưu trữ URL của ảnh đã upload
          }
        );
        uploadStream.end(file.buffer); // Kết thúc luồng upload
      });
    });

    // Upload tất cả hình ảnh và lấy URLs
    const images = await Promise.all(uploadPromises);

    const newCoach = new Coach({
      name,
      description,
      price_per_session,
      contact_info,
      images, // Gán mảng hình ảnh vào đây
      address
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
    updateData.updated_at = Date.now(); // Cập nhật thời gian

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
