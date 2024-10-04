require('dotenv').config();
const mongoose = require("mongoose");
const User = require('../Model/User');
const Post = require('./Post');
const Court = require('./Court');
const Coach = require('./Coach');
const Booking = require('./Booking');
const Message = require('./Message');
const Notification = require('./Notification');
const AdminNotification = require("../Model/AdminNotification");
const Report = require('../Model/Report')
const Application = require('../Model/Application');


mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.user = User;
db.post = Post;
db.court = Court;
db.coach = Coach;
db.booking = Booking;
db.message = Message;
db.notification = Notification;
db.adminNoti = AdminNotification;
db.report = Report;
db.application = Application;

db.connectDB = async () => {
   await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME 
    })
    .then(() => console.log("connect to MongoDB success"))
    .catch(error => console.error(error.message));
};

module.exports = db;
