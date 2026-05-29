const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const isLoggedIn = require("../middleware/isLoggedIn");

// Protect ALL job routes
router.use(isLoggedIn);

// GET - Dashboard (only current user's jobs)
router.get("/", async (req, res) => {
    try {
        const filter = { user: req.user._id };
        if (req.query.status) filter.status = req.query.status;

        const jobs = await Job.find(filter).sort({ appliedDate: -1 });

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

        res.render("index", {
            jobs,
            stats,
            currentFilter: req.query.status || "All",
            toast: req.query.toast || null,
        });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// GET - New job form
router.get("/new", (req, res) => {
    res.render("new");
});

// POST - Add new job (attach to current user)
router.post("/", async (req, res) => {
    try {
        req.body.user = req.user._id;
        await Job.create(req.body);
        res.redirect("/jobs?toast=Application added successfully!");
    } catch (err) {
        res.status(500).send("Error adding job");
    }
});

// GET - Edit form
router.get("/:id/edit", async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!job) return res.status(403).send("Not authorized");
        res.render("edit", { job });
    } catch (err) {
        res.status(500).send("Job not found");
    }
});

// PUT - Update job
router.put("/:id", async (req, res) => {
    try {
        await Job.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
        );
        res.redirect("/jobs?toast=Application updated!");
    } catch (err) {
        res.status(500).send("Error updating job");
    }
});

// DELETE - Delete job
router.delete("/:id", async (req, res) => {
    try {
        await Job.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.redirect("/jobs?toast=Application deleted.");
    } catch (err) {
        res.status(500).send("Error deleting job");
    }
});

module.exports = router;
