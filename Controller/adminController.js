const User = require('../Model/User');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const formattedUsers = users.map(user => ({
      email: user.email,
      phone: user.phone,
      username: user.username,
      profile: {name: user.profile.name},
      account: user.role
    }));
    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'An error occurred while fetching users.' });
  }
};
