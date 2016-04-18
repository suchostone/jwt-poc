var passport = require('passport');

var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('../models/user');
var config = require('./index');
var configAuth = require('./auth');

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
opts.secretOrKey = config.secret;

module.exports = function(passport) {

  //Local
  passport.use('local-login', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({
        email: email
      }, function(err, user) {
        // if there are any errors, return the error before anything else
        if (err)
          return done(err);

        // if no user is found, return the message
        if (!user)
          return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash


        user.comparePassword(req.body.password, function(err, isMatch) {
            if (isMatch && !err) {
              // all is well, return successful user
              return done(null, user);
            } else {
              // if the user is found but the password is wrong
              return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
            }
          }

        )
      });
    }));

  //Facebook
  passport.use(new FacebookStrategy({

      // pull in our app id and secret from our auth.js file
      clientID: configAuth.facebook.clientID,
      clientSecret: configAuth.facebook.clientSecret,
      callbackURL: configAuth.facebook.callbackURL

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

      // asynchronous
      process.nextTick(function() {

        // find the user in the database based on their facebook id
        User.findOne({
          'facebook.id': profile.id
        }, function(err, user) {

          // if there is an error, stop everything and return that
          // ie an error connecting to the database
          if (err)
            return done(err);

          // if the user is found, then log them in
          if (user) {
            return done(null, user); // user found, return that user
          } else {
            // if there is no user found with that facebook id, create them
            var newUser = new User();

            // set all of the facebook information in our user model
            newUser.facebook.id = profile.id; // set the users facebook id                   
            newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
            newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

            // save our user to the database
            newUser.save(function(err) {
              if (err)
                throw err;

              // if successful, return the new user
              return done(null, newUser);
            });
          }

        });
      });

    }));

  //Check JWT token
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({
      id: jwt_payload.id
    }, function(err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  }));

}