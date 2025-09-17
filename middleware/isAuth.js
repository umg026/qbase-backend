const isAuthenticated = (req, res, next) => {
    if (req.session.uid) {
      return next();
    } else {
      return res.redirect("/admin/login");
    }
  };

  module.exports = {isAuthenticated}