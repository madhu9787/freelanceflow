
import express from "express";
import Project from "../models/Project.js";

const router = express.Router();

// =======================
// ✅ GET ALL PROJECTS (Filtered by clientId if provided)
// =======================
router.get("/", async (req, res) => {
  try {
    const { clientId } = req.query;
    let query = {};
    if (clientId) {
      query.clientId = clientId;
    }
    const projects = await Project.find(query).sort({ createdAt: -1 });
    console.log("✅ All projects fetched:", projects.length);
    res.json(projects);
  } catch (err) {
    console.error("❌ Get all projects error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// ✅ GET FREELANCER PROJECTS
// =======================
router.get("/my-projects/:freelancerId", async (req, res) => {
  try {
    const { freelancerId } = req.params;

    const projects = await Project.find({
      freelancerId,
      status: { $in: ["accepted", "in-progress", "completed"] }
    }).sort({ createdAt: -1 });

    console.log(`✅ Projects fetched for freelancer ${freelancerId}:`, projects.length);
    res.json(projects);
  } catch (err) {
    console.error("❌ Get freelancer projects error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// ✅ CREATE PROJECT
// =======================
router.post("/", async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    console.log("✅ Project created:", project._id);
    res.status(201).json(project);
  } catch (error) {
    console.error("❌ Create project error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// ✅ UPDATE PROJECT
// =======================
router.put("/:id", async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    console.log("✅ Project updated:", updatedProject._id);
    res.json(updatedProject);
  } catch (error) {
    console.error("❌ Update project error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// ✅ DELETE PROJECT
// =======================
router.delete("/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    console.log("✅ Project deleted:", req.params.id);
    res.json({ message: "Project deleted" });
  } catch (error) {
    console.error("❌ Delete project error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// ✅ UPDATE PROJECT PROGRESS
// =======================
router.put("/:id/progress", async (req, res) => {
  try {
    const { progress, chatEnabled } = req.body;
    const parsedProgress = parseInt(progress);

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.progress = parsedProgress;
    project.chatEnabled = chatEnabled === true;

    // 🔹 Auto-update status based on progress
    if (parsedProgress === 100) {
      project.status = "completed"; // Can also be "ready-for-review"
      project.completedAt = new Date();
      console.log(`✅ Project ${project._id} marked as completed`);
      // Optionally trigger frontend to request payment
    } else if (parsedProgress > 0) {
      project.status = "in-progress";
    }

    await project.save();

    console.log(`✅ Project progress updated: ${project._id}, progress: ${project.progress}`);
    res.json(project);
  } catch (error) {
    console.error("❌ Progress update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// ✅ KANBAN TASK ROUTES
// =======================

// 1. Add Task
router.post("/:id/tasks", async (req, res) => {
  try {
    const { title } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const newTask = { title, status: 'todo' };
    project.tasks.push(newTask);
    await project.save();

    console.log(`✅ Task added to ${project._id}: ${title}`);
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 2. Update Task Status
router.put("/:id/tasks/:taskId", async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const task = project.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = status;
    await project.save();

    console.log(`✅ Task ${req.params.taskId} updated: ${status}`);
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 3. Delete Task
router.delete("/:id/tasks/:taskId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.tasks.pull({ _id: req.params.taskId });
    await project.save();

    console.log(`✅ Task ${req.params.taskId} deleted`);
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
