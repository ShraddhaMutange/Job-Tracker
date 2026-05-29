module.exports = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next(); // logged in, continue
    }
    res.redirect("/login"); // not logged in, go to login page
};
