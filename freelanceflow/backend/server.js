

// import dotenv from "dotenv";
// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";
// import mongoose from "mongoose";
// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";

// dotenv.config();

// const app = express();
// app.use(cors({ origin: "*" }));
// app.use(express.json());

// // -------------------- FILE UPLOAD SETUP --------------------
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => {
//     cb(null, `file-${req.body.projectId}-${Date.now()}-${file.originalname}`);
//   }
// });
// const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // -------------------- ROUTES IMPORT --------------------
// import aiRoute from "./routes/aiRoute.js";
// import payments from "./routes/payments.js";
// import bidRoutes from "./routes/bids.js";

// app.use("/api/ai", aiRoute);
// app.use("/api/payments", payments);
// app.use("/api/bids", bidRoutes);

// // -------------------- DATABASE & MODELS --------------------
// let Project, ChatMessage, Bid, User;

// mongoose.connect(process.env.MONGO_URI, {
//   serverSelectionTimeoutMS: 30000,
//   socketTimeoutMS: 45000
// }).then(async () => {
//   console.log("✅ MongoDB Connected");
//   Project = (await import('./models/Project.js')).default;
//   ChatMessage = (await import('./models/ChatMessage.js')).default;
//   Bid = (await import('./models/Bid.js')).default;
//   User = (await import('./models/User.js')).default;
//   console.log("✅ Models loaded");
// }).catch(err => console.error("❌ MongoDB Error:", err));

// // -------------------- HELPER --------------------
// function isValidObjectId(id) {
//   return /^[0-9a-fA-F]{24}$/.test(id);
// }

// // -------------------- FILE UPLOAD ROUTE --------------------
// app.post("/api/files/upload", upload.array("files", 10), async (req, res) => {
//   try {
//     const { projectId, freelancerName } = req.body;
//     if (!Project) return res.status(500).json({ error: "Project model not ready" });

//     const files = req.files.map(file => ({
//       name: file.originalname,
//       url: `/uploads/${file.filename}`,
//       size: file.size,
//       uploadedBy: freelancerName || 'Freelancer',
//       uploadedAt: new Date()
//     }));

//     const updatedProject = await Project.findByIdAndUpdate(
//       projectId,
//       { $push: { files: { $each: files } } },
//       { new: true }
//     );

//     global.io?.emit("file-upload-complete", { projectId, files });

//     res.json({ success: true, files, project: updatedProject });
//   } catch (error) {
//     console.error("❌ Upload error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // -------------------- PROJECT ROUTES --------------------
// app.get("/api/projects", async (req, res) => {
//   try {
//     const projects = await Project?.find().sort({ createdAt: -1 }).lean();
//     res.json(projects || []);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.post("/api/projects/complete", async (req, res) => {
//   try {
//     const { projectId } = req.body;
//     if (!isValidObjectId(projectId)) return res.status(400).json({ error: "Invalid project" });

//     const project = await Project.findByIdAndUpdate(
//       projectId,
//       { status: "completed", completedAt: new Date() },
//       { new: true }
//     ).lean();

//     global.io?.emit("project-completed", project);
//     console.log(`✅ Project COMPLETED: ${project.title}`);
//     res.json({ success: true, project });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.post("/api/projects/rate", async (req, res) => {
//   try {
//     const { projectId, rating, review } = req.body;
//     const project = await Project.findByIdAndUpdate(
//       projectId,
//       { rating, review, reviewedAt: new Date(), status: "reviewed" },
//       { new: true }
//     ).lean();

//     global.io?.emit("project-reviewed", project);
//     console.log(`⭐ RATED: ${rating}/5 - ${project.title}`);
//     res.json({ success: true, project });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // -------------------- AUTH ROUTES --------------------
// app.post("/api/signup", async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     const existingUser = await User?.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: "User exists" });

//     const user = new User({ name, email, password, role: role || 'freelancer' });
//     await user.save();
//     res.json({ user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.post("/api/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User?.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid credentials" });

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     res.json({ user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // -------------------- HTTP + SOCKET.IO --------------------
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });
// global.io = io;

// io.on("connection", (socket) => {
//   console.log(`🟢 Socket ${socket.id} connected`);

//   socket.on("join", async ({ role }) => {
//     socket.join(role);
//     if (Project) {
//       const projects = await Project.find().sort({ createdAt: -1 }).limit(20);
//       socket.emit("projects", projects);
//     }
//   });

//   socket.on("post-project", async (projectData) => {
//     try {
//       const { _id, ...cleanData } = projectData;
//       const project = new Project({ ...cleanData, status: "open", bidsCount: 0, progress: 0, chatEnabled: true });
//       await project.save();
//       io.emit("new-project", project);
//       socket.emit("project-posted", { success: true, project });
//     } catch (error) {
//       socket.emit("post-error", { error: error.message });
//     }
//   });

//   socket.on("update-progress", async ({ projectId, progress }) => {
//     try {
//       if (!isValidObjectId(projectId)) return;

//       const project = await Project.findById(projectId);
//       if (!project) return;

//       let updateData = { progress, chatEnabled: progress >= 25 };

//       // Auto-transition: open -> accepted (via bid) -> in-progress (via work start)
//       if (progress > 0 && progress < 100 && project.status === "accepted") {
//         updateData.status = "in-progress";
//       }

//       const updated = await Project.findByIdAndUpdate(
//         projectId,
//         updateData,
//         { new: true }
//       ).lean();

//       if (updated) io.emit("project-progress", updated);
//     } catch (error) {
//       console.error("❌ Progress update failed:", error);
//     }
//   });

//   socket.on("deliver-project", async ({ projectId }) => {
//     try {
//       if (!isValidObjectId(projectId)) return;
//       const updated = await Project.findByIdAndUpdate(
//         projectId,
//         { status: "delivered", deliveredAt: new Date() },
//         { new: true }
//       ).lean();
//       if (updated) {
//         io.emit("project-progress", updated);
//         io.emit("project-delivered", updated);
//       }
//     } catch (error) {
//       console.error("❌ Delivery failed:", error);
//     }
//   });

//   socket.on("delete-project", async (projectId) => {
//     console.log("🗑️ RECEIVED DELETE REQUEST:", projectId);
//     try {
//       if (!isValidObjectId(projectId)) {
//         console.log("❌ Invalid ID for deletion");
//         return;
//       }
//       const deleted = await Project.findByIdAndDelete(projectId);
//       if (deleted) {
//         io.emit("project-deleted", projectId);
//         console.log(`✅ Project deleted from DB: ${projectId}`);
//       } else {
//         console.log("⚠️ Project not found in DB");
//       }
//     } catch (error) {
//       console.error("❌ Delete failed:", error);
//     }
//   });

//   socket.on("new-bid", async (bidData) => {
//     try {
//       const project = await Project.findById(bidData.projectId);
//       if (!project || project.status !== "open") {
//         return socket.emit("bid-error", { message: "Bidding closed" });
//       }

//       const bid = new Bid(bidData);
//       await bid.save();
//       await Project.findByIdAndUpdate(bid.projectId, { $inc: { bidsCount: 1 } });
//       io.emit("new-bid", bid);
//     } catch (error) {
//       console.error("❌ Bid save failed:", error);
//     }
//   });

//   socket.on("join-chat", async ({ projectId, senderName = "User" }) => {
//     try {
//       if (!isValidObjectId(projectId)) return socket.emit("chat-error", { message: "Invalid project" });
//       socket.join(`chat-${projectId}`);
//       if (ChatMessage) {
//         const messages = await ChatMessage.find({ projectId }).sort({ createdAt: 1 }).limit(50);
//         socket.emit("chat-history", messages);
//       }
//     } catch (error) {
//       socket.emit("chat-error", { message: "Chat failed" });
//     }
//   });

//   socket.on("chat-message", async ({ projectId, message, senderName = "User" }) => {
//     try {
//       if (!isValidObjectId(projectId)) return;
//       const newMessage = new ChatMessage({ projectId, message: message.trim(), senderName });
//       await newMessage.save();
//       io.to(`chat-${projectId}`).emit("new-chat-message", newMessage);
//     } catch (error) {
//       socket.emit("chat-error", { message: "Send failed" });
//     }
//   });

//   socket.on("disconnect", () => console.log(`🔴 ${socket.id} disconnected`));
// });

// // -------------------- START SERVER --------------------
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`\n🚀 Server running on port ${PORT}`);
//   console.log(`✅ Backend ready: Projects, Bids, Payments, Ratings, Files, Socket.io`);
// });
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// -------------------- CONFIG --------------------
dotenv.config();
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// -------------------- IMPORT MODELS (FIXED) --------------------
import Project from "./models/Project.js";
import ChatMessage from "./models/ChatMessage.js";
import Bid from "./models/Bid.js";
import User from "./models/User.js";

// -------------------- DATABASE CONNECT --------------------
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// -------------------- FILE UPLOAD SETUP --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(null, `file-${req.body.projectId}-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------- ROUTES IMPORT --------------------
import aiRoute from "./routes/aiRoute.js";
import payments from "./routes/payments.js";
import bidRoutes from "./routes/bids.js";

app.use("/api/ai", aiRoute);
app.use("/api/payments", payments);
app.use("/api/bids", bidRoutes);

// -------------------- HELPER --------------------
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// -------------------- AUTH ROUTES --------------------
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = new User({
      name,
      email,
      password,
      role: role || "freelancer"
    });

    await user.save();
    res.json({ user });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    res.json({ user });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- PROJECT ROUTES --------------------
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/projects/complete", async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!isValidObjectId(projectId))
      return res.status(400).json({ error: "Invalid project" });

    const project = await Project.findByIdAndUpdate(
      projectId,
      { status: "completed", completedAt: new Date() },
      { new: true }
    );

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------- FILE UPLOAD --------------------
app.post("/api/files/upload", upload.array("files", 10), async (req, res) => {
  try {
    const { projectId, freelancerName } = req.body;

    const files = req.files.map(file => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      size: file.size,
      uploadedBy: freelancerName || "Freelancer",
      uploadedAt: new Date()
    }));

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $push: { files: { $each: files } } },
      { new: true }
    );

    res.json({ success: true, files, project: updatedProject });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// -------------------- SOCKET.IO --------------------
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log(`🟢 Socket ${socket.id} connected`);

  socket.on("disconnect", () =>
    console.log(`🔴 ${socket.id} disconnected`)
  );
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
