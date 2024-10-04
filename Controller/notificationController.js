const Notification = require('../Model/Notification');
const User = require('../Model/User');

// Gửi thông báo đến một người dùng
exports.sendNotification = async (user_id, content, related_post_id) => {
    try {
        const notification = new Notification({
            user_id,
            content,
            related_post_id,
        });
        await notification.save();
    } catch (error) {
        console.error('Lỗi khi gửi thông báo:', error);
    }
};

// Gửi thông báo đến tất cả người dùng
exports.sendNotificationToAll = async (content, related_post_id) => {
    try {
        const users = await User.find(); // Lấy tất cả người dùng
        for (const user of users) {
            await exports.sendNotification(user._id, content, related_post_id);
        }
    } catch (error) {
        console.error('Lỗi khi gửi thông báo cho tất cả người dùng:', error);
    }
};
