require('dotenv').config(); // Tải các biến môi trường từ tệp .env
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const httpErrors = require("http-errors");
const bodyParser = require("body-parser");
const db = require("./Model/index");
const authRoutes = require("./Routers/authRoutes"); 
const postRoutes = require('./Routers/postRoutes');
const adminRoutes = require('./Routers/adminRoutes');

// Khởi tạo express webserver
const app = express();

// Bổ sung các middleware kiểm soát hoạt động của client tới webserver
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cors({
    origin: '*', // Hoặc thêm domain của ứng dụng trên Vercel vào đây
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

// Đăng ký các route cho các chức năng
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/admin", adminRoutes);

// Route tới web root
app.get('/', (req, res) => {
    res.status(200).json({
        message: "oke"
    });
});

// Catch 404 and forward to error handler
app.use(async (req, res, next) => {
    next(httpErrors.NotFound());
});

// Error handler middleware
app.use((err, req, res) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    });
});

// Kết nối đến database và khởi động server
db.connectDB(); // Kết nối database
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
