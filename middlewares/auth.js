var passport = require('passport');

module.exports.isAuthenticated = passport.authenticate('jwt', {
  session: false
})