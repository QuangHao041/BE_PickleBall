const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../Model/User'); 
require('dotenv').config();

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
        password: '',  
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


