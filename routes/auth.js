const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");

// GET - Register page
router.get("/register", (req, res) => {
    res.render("register", { error: null });
});

// POST - Register
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Check passwords match
        if (password !== confirmPassword) {
            return res.render("register", { error: "Passwords do not match!" });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("register", {
                error: "Email already registered!",
            });
        }

        // Create new user (password auto-encrypted via model hook)
        const user = new User({ username, email, password });
        await user.save();

        res.redirect("/login");
    } catch (err) {
        console.log("Registration error:", err);
        res.render("register", { error: err.message });
    }
});

// GET - Login page
router.get("/login", (req, res) => {
    res.render("login", { error: null, toast: req.query.toast || null });
});

// POST - Login (passport handles this)
router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.render("login", { error: info.message, toast: null });
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            res.redirect("/jobs");
        });
    })(req, res, next);
});

// GET - Logout
router.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/login");
    });
});

const isLoggedIn = require("../middleware/isLoggedIn");
const Job = require("../models/Job");

// GET - Profile page
router.get("/profile", isLoggedIn, async (req, res) => {
    const stats = {
        total: await Job.countDocuments({ user: req.user._id }),
        applied: await Job.countDocuments({
            user: req.user._id,
            status: "Applied",
        }),
        interview: await Job.countDocuments({
            user: req.user._id,
            status: "Interview",
        }),
        offer: await Job.countDocuments({
            user: req.user._id,
            status: "Offer",
        }),
        rejected: await Job.countDocuments({
            user: req.user._id,
            status: "Rejected",
        }),
    };
    res.render("profile", { stats });
});

module.exports = router;
