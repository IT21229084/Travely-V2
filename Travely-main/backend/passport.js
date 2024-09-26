const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GOOGLE_CLIENT_ID = '5341814403-0jkl6hmtlk83efeafijghkhk1n1b5klq.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'
const passport = require("passport")

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  function(accessToken, refreshToken, profile,done) {
    done(null,profile)
  }
));

passport.serializeUser((user,done) =>{
    done(null,user)
})

passport.deserializeUser((user,done) =>{
    done(null,user)
})