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
const coachRoutes = require('./Routers/coachRoutes');
const session = require('express-session');


// Khởi tạo express webserver
const app = express();

// Bổ sung các middleware kiểm soát hoạt động của client tới webserver

app.use(session({
    secret: process.env.JWT_SECRET || 'HaoNQHE161800SecretKey041', // Đảm bảo secret được đặt đúng
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Đặt thành true nếu chạy trên HTTPS
}));

app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cors({
    origin: '*', 
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));


// Đăng ký các route cho các chức năng
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coach", coachRoutes);
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
