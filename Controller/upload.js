const multer = require('multer');
const path = require('path');

// Cấu hình Multer để lưu trữ file
const storage = multer.memoryStorage(); // Sử dụng memoryStorage thay vì diskStorage

// Kiểm tra file ảnh
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/; // Chấp nhận các loại file .jpeg, .jpg, .png
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận các file ảnh có định dạng .jpeg, .jpg, .png!'));
  }
};

// Giới hạn kích thước và số lượng file
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước mỗi file là 5MB
  fileFilter: fileFilter
});


module.exports = upload;
