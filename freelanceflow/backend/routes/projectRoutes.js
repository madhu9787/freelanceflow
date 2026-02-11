
// import express from "express";
// import Project from "../models/Project.js";

// const router = express.Router();

// // ✅ 1. Get ALL projects (open + accepted + in-progress)
// router.get("/", async (req, res) => {
//   try {
//     const projects = await Project.find({}).sort({ createdAt: -1 });
//     res.status(200).json(projects);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ✅ 2. Get only freelancer's projects
// router.get("/my-projects", async (req, res) => {
//   try {
//     const freelancerId = "tempFreelancer";
//     const projects = await Project.find({ 
//       freelancerId, 
//       status: { $in: ["accepted", "in-progress", "completed"] } 
//     }).sort({ createdAt: -1 });
//     res.json(projects);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ✅ 🔥 PROGRESS UPDATE API - THIS WAS MISSING!
// router.put("/:id/progress", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { progress, chatEnabled } = req.body;
    
//     console.log(`📈 Updating project ${id}: ${progress}% (chat: ${chatEnabled})`);
    
//     const updatedProject = await Project.findByIdAndUpdate(
//       id,
//       { 
//         progress: parseInt(progress),
//         chatEnabled: chatEnabled === true,
//         updatedAt: new Date()
//       },
//       { new: true }
//     );
    
//     if (!updatedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     console.log("✅ Progress saved:", updatedProject.title, `${progress}%`);
    
//     // 🔥 REAL-TIME BROADCAST (clients see instantly)
//     if (req.io) {
//       req.io.emit('project-progress', updatedProject);
//       console.log("🔥 Broadcasted to all clients");
//     }
    
//     res.json({
//       success: true,
//       project: updatedProject,
//       message: `Progress updated to ${progress}%`
//     });
//   } catch (error) {
//     console.error('❌ Progress update error:', error);
//     res.status(500).json({ message: "Server error during progress update" });
//   }
// });

// // ✅ 3. Accept project (your existing route - keeping it)
// router.put("/accept/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedProject = await Project.findByIdAndUpdate(
//       id,
//       {
//         status: "accepted",
//         freelancerId: "tempFreelancer",
//         freelancerName: "John Doe",
//         progress: 0,
//         chatEnabled: false
//       },
//       { new: true }
//     );
    
//     if (!updatedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     res.json(updatedProject);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ✅ 4. Create new project (if missing)
// router.post("/", async (req, res) => {
//   try {
//     const project = new Project(req.body);
//     await project.save();
//     res.status(201).json(project);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ✅ 5. Update project status (completion, etc.)
// router.put("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedProject = await Project.findByIdAndUpdate(id, req.body, { new: true });
//     if (!updatedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }
//     res.json(updatedProject);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ✅ 6. Delete project
// router.delete("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Project.findByIdAndDelete(id);
//     res.json({ message: "Project deleted" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;
import express from "express";
import Project from "../models/Project.js";

const router = express.Router();

// ✅ Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Freelancer My Projects (VERY IMPORTANT)
router.get("/my-projects/:freelancerId", async (req, res) => {
  try {
    const { freelancerId } = req.params;

    const projects = await Project.find({
      freelancerId,
      status: { $in: ["accepted", "in-progress", "completed"] }
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Update Progress
router.put("/:id/progress", async (req, res) => {
  try {
    const { progress, chatEnabled } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        progress: parseInt(progress),
        chatEnabled: chatEnabled === true
      },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Create Project
router.post("/", async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Update Project
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

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Delete Project
router.delete("/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
