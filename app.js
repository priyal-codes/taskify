const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Task = require("./models/Task");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = "mongodb://127.0.0.1:27017/Taskify";

main()
.then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


//home page
app.get("/", (req, res) => {
    res.render("home.ejs");
});


// Index route
app.get("/tasks", async(req, res) => {
    const allTasks = await Task.find({});
    res.render("tasks/index.ejs", {allTasks});
});

// New Route
app.get("/tasks/new", (req, res) => {
    res.render("tasks/new.ejs");
});

// Edit Route
app.get("/tasks/:id/edit", async(req, res) => {
    let {id} = req.params;
    const task = await Task.findById(id);
    res.render("tasks/edit.ejs", {task});
});

// Show Route
app.get("/tasks/:id", async(req, res) => {
    let {id} = req.params;
    const task = await Task.findById(id);
    res.render("tasks/show.ejs", { task });
});

// Create Route
app.post("/tasks", async(req, res) => {
    const newtask = new Task(req.body.task);
    await newtask.save();
    res.redirect("/tasks");
});

// Update Route
app.put("/tasks/:id", async(req, res) => {
    let {id} = req.params;
    await Task.findByIdAndUpdate(id, { ...req.body.task });
    res.redirect(`/tasks/${id}`);
});

// Delete Route
app.delete("/tasks/:id", async(req, res) => {
    let { id } = req.params;
    let deletedTask = await Task.findByIdAndDelete(id);
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

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});


