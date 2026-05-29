const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo").default || require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User");
require("dotenv").config();

const app = express();

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ Connection Error:", err));

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static("public"));

// Session setup
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: "sessions",
        }),
        cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
    }),
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
passport.use(
    new LocalStrategy(
        { usernameField: "email" },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });
                if (!user)
                    return done(null, false, {
                        message: "No account found with that email.",
                    });

                const isMatch = await user.comparePassword(password);
                if (!isMatch)
                    return done(null, false, {
                        message: "Incorrect password.",
                    });

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        },
    ),
);

// Store user ID in session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Get user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Make user available in all views
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// Routes
const jobRoutes = require("./routes/jobs");
const authRoutes = require("./routes/auth");
app.use("/jobs", jobRoutes);
app.use("/", authRoutes);

// Home redirect
app.get("/", (req, res) => {
    res.redirect("/jobs");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
