const passport = require('passport');

exports.login = passport.authenticate('local', {
  successRedirect: '/products',
  failureRedirect: '/login',   
});

exports.logout = (req, res) => {
  req.logout();
  res.redirect('/'); 
};
