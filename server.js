require('dotenv').config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors")
const httpErrors = require("http-errors");
const bodyParser = require("body-parser");
const db = require("./Model/index");
const authRoutes = require("./Routers/authRoutes"); 
const postRoutes = require('./Routers/postRoutes');
const adminRoutes = require('./Routers/adminRoutes');



// khoi tao express webserver
const app = express();

// bo sung cac middleware kiem soat hoat dong cua client toi webserver
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));
// Đăng ký các route cho các chức năng
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/admin", adminRoutes);



// route toi web root
app.get('/', (req, res) => {
    res.status(200).json({
        message: "oke"
    });
});


// catch 404 and forward to error handler
app.use(async (req, res, next) => {
    next(httpErrors.NotFound());
});

// error handler middleware

app.use((err, req, res) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    });
});

// tiep nhan cac request
app.listen(process.env.PORT, process.env.HOST_NAME, () => {
    console.log(`Server is running at: http://${process.env.HOST_NAME}:${process.env.PORT}`);
    db.connectDB(); // Corrected function call
});
