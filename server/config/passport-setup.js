import passport from 'passport'
import {Strategy} from 'passport-google-oauth20'
import keys from './keys'
import User from '../models/user-model'
import notificationsBox from '../models/notificationsBox-model'
import {Strategy as GoogleStrategy} from 'passport-google-oauth20'

passport.serializeUser((user,done) => {
  done(null,user.id)
});

passport.deserializeUser((id,done) => {
  User.findById(id).then((user) => {
    done(null,user);
  });
});

passport.use(
    new GoogleStrategy({
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {
        // check if user already exists in our own db
        User.findOne({googleId: profile.id}).then((currentUser) => {
            if(currentUser){
                // already have this user
                console.log('user is: ', currentUser);
                done(null, currentUser);
            } else {
                // if not, create user in our db
                new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    thumbnail: profile._json.image.url
                }).save().then((newUser) => {
                    done(null, newUser);
                    new notificationsBox({
                        userId:newUser._id,
                        messages:[]
                    }).save()                   
                })
            }
        });
    })
);