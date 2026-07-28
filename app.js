require("dotenv").config();


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Task = require("./models/Task");
const User = require("./models/User");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcryptjs");


const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/Taskify";
const SECRET = process.env.SECRET || "mysupersecretkeyfordevelopment";


async function main() {
    await mongoose.connect(MONGO_URL);
}


main()
.then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: MONGO_URL,
    crypto: {
        secret: SECRET
    },
    touchAfter: 24 * 3600
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

// Session Configuration
app.use(session({
    store: store,
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

// Auth status middleware
app.use(async (req, res, next) => {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (user) {
                res.locals.currentUser = user;
            } else {
                req.session.userId = undefined;
                res.locals.currentUser = null;
            }
        } catch (err) {
            res.locals.currentUser = null;
        }
    } else {
        res.locals.currentUser = null;
    }
    next();
});

// Pass res.locals to ejs-mate layout rendering options
app.use((req, res, next) => {
    const _render = res.render;
    res.render = function (view, options, fn) {
        options = options || {};
        if (typeof options === "object") {
            options.currentUser = res.locals.currentUser;
        }
        return _render.call(this, view, options, fn);
    };
    next();
});

// Middleware to protect routes
const isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect("/login?error=You must be logged in to access that page.");
    }
    next();
};


//home page
app.get("/", (req, res) => {
    if (req.session.userId) {
        return res.redirect("/tasks");
    }
    res.render("home.ejs");
});


// --- Auth Routes ---

// Signup Render
app.get("/signup", (req, res) => {
    if (req.session.userId) {
        return res.redirect("/tasks");
    }
    res.render("users/signup.ejs");
});

// Signup Logic
app.post("/signup", async (req, res, next) => {
    try {
        const { username, password } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render("users/signup.ejs", { error: "Username already exists." });
        }
        // Hash password and save user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        
        // Log user in automatically
        req.session.userId = newUser._id.toString();
        req.session.save((err) => {
            if (err) return next(err);
            res.redirect("/tasks");
        });
    } catch (err) {
        next(err);
    }
});

// Login Render
app.get("/login", (req, res) => {
    if (req.session.userId) {
        return res.redirect("/tasks");
    }
    const error = req.query.error || null;
    res.render("users/login.ejs", { error });
});

// Login Logic
app.post("/login", async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.render("users/login.ejs", { error: "Invalid username or password." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("users/login.ejs", { error: "Invalid username or password." });
        }
        req.session.userId = user._id.toString();
        req.session.save((err) => {
            if (err) return next(err);
            res.redirect("/tasks");
        });
    } catch (err) {
        next(err);
    }
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log("Error destroying session:", err);
        }
        res.clearCookie("connect.sid"); // Clear session cookie
        res.redirect("/");
    });
});


// --- Task Routes (Protected & Owner Filtered) ---

// Index route
app.get("/tasks", isLoggedIn, async(req, res) => {
    const allTasks = await Task.find({ user: req.session.userId });
    res.render("tasks/index.ejs", {allTasks});
});

// New Route
app.get("/tasks/new", isLoggedIn, (req, res) => {
    res.render("tasks/new.ejs");
});

// Edit Route
app.get("/tasks/:id/edit", isLoggedIn, async(req, res) => {
    let {id} = req.params;
    const task = await Task.findOne({ _id: id, user: req.session.userId });
    if (!task) {
        return res.redirect("/tasks");
    }
    res.render("tasks/edit.ejs", {task});
});

// Show Route
app.get("/tasks/:id", isLoggedIn, async(req, res) => {
    let {id} = req.params;
    const task = await Task.findOne({ _id: id, user: req.session.userId });
    if (!task) {
        return res.redirect("/tasks");
    }
    res.render("tasks/show.ejs", { task });
});

// Create Route
app.post("/tasks", isLoggedIn, async(req, res) => {
    const taskData = req.body.task;
    const newtask = new Task({
        ...taskData,
        user: req.session.userId
    });
    await newtask.save();
    res.redirect("/tasks");
});

// Update Route
app.put("/tasks/:id", isLoggedIn, async(req, res) => {
    let {id} = req.params;
    await Task.findOneAndUpdate({ _id: id, user: req.session.userId }, { ...req.body.task });
    res.redirect(`/tasks/${id}`);
});

// Delete Route
app.delete("/tasks/:id", isLoggedIn, async(req, res) => {
    let { id } = req.params;
    let deletedTask = await Task.findOneAndDelete({ _id: id, user: req.session.userId });
    console.log(deletedTask);
    res.redirect("/tasks");
});

// app.get("/testTask", async(req, res) => {
//     let sampleTask = new Task({
//      title: "Complete internship assignment",
//      description: "Build a task management app using Node, Express, and MongoDB",
//      status: "Pending"
//     });
//     await sampleTask.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});


