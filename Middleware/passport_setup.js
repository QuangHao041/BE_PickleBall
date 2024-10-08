const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../Model/User'); // Model User của bạn

// // Cấu hình Facebook OAuth
// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_APP_ID,
//   clientSecret: process.env.FACEBOOK_APP_SECRET,
//   callbackURL: '/auth/facebook/callback',
//   profileFields: ['id', 'emails', 'name', 'picture.type(large)']  // Lấy thêm ảnh đại diện
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     const { email, first_name, last_name } = profile._json;
//     let user = await User.findOne({ email });

//     if (!user) {
//       user = new User({
//         username: first_name + ' ' + last_name,
//         email: email,
//         password: '',  // Để trống vì dùng đăng nhập OAuth
//         profile: {
//           name: first_name + ' ' + last_name,
//           avatar: profile.photos[0].value
//         }
//       });
//       await user.save();
//     }

//     return done(null, user);
//   } catch (err) {
//     return done(err, false);
//   }
// }));

// Cấu hình Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (token, tokenSecret, profile, done) => {
  try {
    const { email, name, picture } = profile._json;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: name,
        email: email,
        password: '',  // Để trống vì dùng đăng nhập OAuth
        profile: {
          name: name,
          avatar: picture
        }
      });
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
