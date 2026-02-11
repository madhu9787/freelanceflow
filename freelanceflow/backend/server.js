



// import dotenv from "dotenv";
// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";
// import mongoose from "mongoose";

// dotenv.config();

// const app = express();
// app.use(cors({ origin: "*" }));
// app.use(express.json());
// import aiRoute from "./routes/aiRoute.js";
// app.use("/api/ai", aiRoute);
// import payments from "./routes/payments.js"

// app.use('/api/payments', payments);

// // 🔥 FILE UPLOAD + PROGRESS - COMPLETE BLOCK
// import multer from 'multer';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => {
//     cb(null, `file-${req.body.projectId}-${Date.now()}-${file.originalname}`);
//   }
// });
// const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

// // 🔥 FILE UPLOAD ROUTE
// app.post("/api/files/upload", upload.array("files", 10), async (req, res) => {
//   try {
//     const { projectId, freelancerId, freelancerName } = req.body;
    
//     if (!Project) return res.status(500).json({ error: "Project model not ready" });
    
//     const files = req.files.map(file => ({
//       name: file.originalname,
//       url: `/uploads/${file.filename}`,
//       size: file.size,
//       uploadedBy: freelancerName || 'Freelancer',
//       uploadedAt: new Date()
//     }));

//     await Project.findByIdAndUpdate(projectId, { 
//       $push: { files: { $each: files } } 
//     });

//     // Socket notification
//     io.emit("file-upload-complete", { 
//       projectId, 
//       fileName: files[0]?.name, 
//       fileUrl: files[0]?.url 
//     });

//     res.json({ success: true, files });
//   } catch (error) {
//     console.error("❌ Upload error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // 🔥 SERVE UPLOADED FILES
// app.use('/uploads', express.static('uploads'));

// // 🔥 ObjectId validation
// function isValidObjectId(id) {
//   return /^[0-9a-fA-F]{24}$/.test(id);
// }

// // Load models
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

// // 🔥 API ROUTES
// app.get("/api/projects", async (req, res) => {
//   try {
//     const projects = await Project?.find().sort({ createdAt: -1 }).lean();
//     res.json(projects || []);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/chat/project/:projectId", async (req, res) => {
//   try {
//     if (!ChatMessage) return res.json([]);
//     const messages = await ChatMessage.find({ projectId: req.params.projectId })
//       .sort({ createdAt: 1 })
//       .limit(50)
//       .lean();
//     res.json(messages);
//   } catch (error) {
//     console.error("Chat fetch error:", error);
//     res.json([]);
//   }
// });

// app.get("/api/bids/my-bids", async (req, res) => {
//   try {
//     const bids = await Bid?.find({ freelancerId: "tempFreelancer" })
//       .populate('projectId', 'title clientName budget')
//       .sort({ createdAt: -1 })
//       .lean();
//     res.json(bids || []);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/client/stats", async (req, res) => {
//   try {
//     const projects = await Project?.find({}).lean();
//     const totalProjects = projects?.length || 0;
//     const activeProjects = projects?.filter(p => p.status === 'open').length || 0;
//     res.json({ totalProjects, activeProjects });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // 🔥 MARK PROJECT COMPLETE - NEW ROUTE
// app.post("/api/projects/complete", async (req, res) => {
//   try {
//     const { projectId } = req.body;
//     if (!isValidObjectId(projectId)) return res.status(400).json({ error: "Invalid project" });
    
//     const project = await Project.findByIdAndUpdate(
//       projectId,
//       { 
//         status: "completed", 
//         completedAt: new Date()
//       },
//       { new: true }
//     ).lean();
    
//     io.emit("project-completed", project);
//     console.log(`✅ Project COMPLETED: ${project.title}`);
//     res.json({ success: true, project });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // 🔥 SUBMIT RATING & REVIEW - NEW ROUTE
// app.post("/api/projects/rate", async (req, res) => {
//   try {
//     const { projectId, rating, review } = req.body;
    
//     const project = await Project.findByIdAndUpdate(
//       projectId,
//       { 
//         status: "reviewed", 
//         rating: rating,
//         review: review,
//         reviewedAt: new Date()
//       },
//       { new: true }
//     ).lean();
    
//     io.emit("project-reviewed", project);
//     console.log(`⭐ RATED: ${rating}/5 - ${project.title}`);
//     res.json({ success: true, project });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // AUTH ROUTES
// app.post("/api/signup", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const existingUser = await User?.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: "User exists" });
//     const user = new User({ name, email, password });
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
//     if (!user || user.password !== password) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }
//     res.json({ user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

// io.on("connection", (socket) => {
//   console.log(`🟢 Socket ${socket.id} connected`);

//   socket.on("join", async ({ role }) => {
//     socket.join(role);
//     console.log(`👤 ${socket.id} joined ${role}`);
//     if (Project) {
//       const projects = await Project.find().sort({ createdAt: -1 }).limit(20);
//       socket.emit("projects", projects);
//     }
//   });

//   socket.on("post-project", async (projectData) => {
//     try {
//       console.log("📤 POST PROJECT:", projectData.title);
//       const { _id, ...cleanData } = projectData;
//       const project = new Project({
//         ...cleanData,
//         status: "open",
//         bidsCount: 0,
//         progress: 0,
//         chatEnabled: true
//       });
//       await project.save();
//       console.log(`✅ NEW PROJECT SAVED: ${project._id}`);
//       io.emit("new-project", project);
//       socket.emit("project-posted", { success: true, project });
//     } catch (error) {
//       console.error("❌ Project error:", error);
//       socket.emit("post-error", { error: error.message });
//     }
//   });

//   socket.on("update-progress", async ({ projectId, progress }) => {
//     try {
//       if (!isValidObjectId(projectId)) return;
//       const project = await Project.findByIdAndUpdate(
//         projectId,
//         { progress, chatEnabled: progress >= 25 },
//         { new: true }
//       ).lean();
//       if (project) {
//         io.emit("project-progress", project);
//         console.log(`📊 Progress: ${project.title} → ${progress}%`);
//       }
//     } catch (error) {
//       console.error("❌ Progress update failed:", error);
//     }
//   });

//   socket.on("new-bid", async (bidData) => {
//     try {
//       const bid = new Bid(bidData);
//       await bid.save();
//       await Project.findByIdAndUpdate(bid.projectId, { 
//         $inc: { bidsCount: 1 } 
//       });
//       io.emit("new-bid", bid);
//       console.log(`💰 New bid on ${bidData.projectId}`);
//     } catch (error) {
//       console.error("❌ Bid save failed:", error);
//     }
//   });

//   socket.on("join-chat", async ({ projectId, senderName = "User" }) => {
//     try {
//       if (!isValidObjectId(projectId)) {
//         return socket.emit("chat-error", { message: "Invalid project" });
//       }
//       socket.join(`chat-${projectId}`);
//       console.log(`💬 ${senderName} joined chat-${projectId}`);
      
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
      
//       const newMessage = new ChatMessage({
//         projectId,
//         message: message.trim(),
//         senderName
//       });
//       await newMessage.save();
//       io.to(`chat-${projectId}`).emit("new-chat-message", newMessage);
//       console.log(`💬 ${senderName}: ${message.substring(0, 30)}`);
//     } catch (error) {
//       socket.emit("chat-error", { message: "Send failed" });
//     }
//   });

//   socket.on("disconnect", () => console.log(`🔴 ${socket.id} disconnected`));
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`\n🚀 Server: http://localhost:${PORT}`);
//   console.log(`✅ ALL ROUTES + SOCKET.IO + RATINGS = PERFECT! 🎉\n`);
// });





// import dotenv from "dotenv";
// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";
// import mongoose from "mongoose";

// dotenv.config();

// const app = express();
// app.use(cors({ origin: "*" }));
// app.use(express.json());
// import aiRoute from "./routes/aiRoute.js";
// app.use("/api/ai", aiRoute);
// import payments from "./routes/payments.js"

// app.use('/api/payments', payments);
// import bidRoutes from "./routes/bids.js";
// app.use("/api/bids", bidRoutes);
// // 🔥 FILE UPLOAD + PROGRESS - COMPLETE BLOCK
// import multer from 'multer';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => {
//     cb(null, `file-${req.body.projectId}-${Date.now()}-${file.originalname}`);
//   }
// });
// const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

// // 🔥 FILE UPLOAD ROUTE
// app.post("/api/files/upload", upload.array("files", 10), async (req, res) => {
//   try {
//     const { projectId, freelancerId, freelancerName } = req.body;
    
//     if (!Project) return res.status(500).json({ error: "Project model not ready" });
    
//     const files = req.files.map(file => ({
//       name: file.originalname,
//       url: `/uploads/${file.filename}`,
//       size: file.size,
//       uploadedBy: freelancerName || 'Freelancer',
//       uploadedAt: new Date()
//     }));

//     await Project.findByIdAndUpdate(projectId, { 
//       $push: { files: { $each: files } } 
//     });

//     // Socket notification
//     io.emit("file-upload-complete", { 
//       projectId, 
//       fileName: files[0]?.name, 
//       fileUrl: files[0]?.url 
//     });

//     res.json({ success: true, files });
//   } catch (error) {
//     console.error("❌ Upload error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // 🔥 SERVE UPLOADED FILES
// app.use('/uploads', express.static('uploads'));

// // 🔥 ObjectId validation
// function isValidObjectId(id) {
//   return /^[0-9a-fA-F]{24}$/.test(id);
// }

// // Load models
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

// // 🔥 API ROUTES
// app.get("/api/projects", async (req, res) => {
//   try {
//     const projects = await Project?.find().sort({ createdAt: -1 }).lean();
//     res.json(projects || []);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/chat/project/:projectId", async (req, res) => {
//   try {
//     if (!ChatMessage) return res.json([]);
//     const messages = await ChatMessage.find({ projectId: req.params.projectId })
//       .sort({ createdAt: 1 })
//       .limit(50)
//       .lean();
//     res.json(messages);
//   } catch (error) {
//     console.error("Chat fetch error:", error);
//     res.json([]);
//   }
// });

// app.get("/api/bids/my-bids", async (req, res) => {
//   try {
//     const bids = await Bid?.find({ freelancerId: "tempFreelancer" })
//       .populate('projectId', 'title clientName budget')
//       .sort({ createdAt: -1 })
//       .lean();
//     res.json(bids || []);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/client/stats", async (req, res) => {
//   try {
//     const projects = await Project?.find({}).lean();
//     const totalProjects = projects?.length || 0;
//     const activeProjects = projects?.filter(p => p.status === 'open').length || 0;
//     res.json({ totalProjects, activeProjects });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // 🔥 MARK PROJECT COMPLETE - NEW ROUTE
// app.post("/api/projects/complete", async (req, res) => {
//   try {
//     const { projectId } = req.body;
//     if (!isValidObjectId(projectId)) return res.status(400).json({ error: "Invalid project" });
    
//     const project = await Project.findByIdAndUpdate(
//       projectId,
//       { 
//         status: "completed", 
//         completedAt: new Date()
//       },
//       { new: true }
//     ).lean();
    
//     io.emit("project-completed", project);
//     console.log(`✅ Project COMPLETED: ${project.title}`);
//     res.json({ success: true, project });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // 🔥 SUBMIT RATING & REVIEW - NEW ROUTE
// // 🔥 SUBMIT RATING & REVIEW - FIXED (STAYS IN DASHBOARD)
// app.post("/api/projects/rate", async (req, res) => {
//   try {
//     const { projectId, rating, review } = req.body;
    
//     const project = await Project.findByIdAndUpdate(
//       projectId,
//       { 
//         // 🔥 REMOVED status: "reviewed" - STAYS "completed"
//         rating: rating,
//         review: review,
//         reviewedAt: new Date()
//       },
//       { new: true }
//     ).lean();
    
//     io.emit("project-reviewed", project);
//     console.log(`⭐ RATED: ${rating}/5 - ${project.title}`);
//     res.json({ success: true, project });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// // AUTH ROUTES
// app.post("/api/signup", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const existingUser = await User?.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: "User exists" });
//     const user = new User({ name, email, password });
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
//     if (!user || user.password !== password) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }
//     res.json({ user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

// io.on("connection", (socket) => {
//   console.log(`🟢 Socket ${socket.id} connected`);

//   socket.on("join", async ({ role }) => {
//     socket.join(role);
//     console.log(`👤 ${socket.id} joined ${role}`);
//     if (Project) {
//       const projects = await Project.find().sort({ createdAt: -1 }).limit(20);
//       socket.emit("projects", projects);
//     }
//   });

//   socket.on("post-project", async (projectData) => {
//     try {
//       console.log("📤 POST PROJECT:", projectData.title);
//       const { _id, ...cleanData } = projectData;
//       const project = new Project({
//         ...cleanData,
//         status: "open",
//         bidsCount: 0,
//         progress: 0,
//         chatEnabled: true
//       });
//       await project.save();
//       console.log(`✅ NEW PROJECT SAVED: ${project._id}`);
//       io.emit("new-project", project);
//       socket.emit("project-posted", { success: true, project });
//     } catch (error) {
//       console.error("❌ Project error:", error);
//       socket.emit("post-error", { error: error.message });
//     }
//   });

//   socket.on("update-progress", async ({ projectId, progress }) => {
//     try {
//       if (!isValidObjectId(projectId)) return;
//       const project = await Project.findByIdAndUpdate(
//         projectId,
//         { progress, chatEnabled: progress >= 25 },
//         { new: true }
//       ).lean();
//       if (project) {
//         io.emit("project-progress", project);
//         console.log(`📊 Progress: ${project.title} → ${progress}%`);
//       }
//     } catch (error) {
//       console.error("❌ Progress update failed:", error);
//     }
//   });

//   socket.on("new-bid", async (bidData) => {
//     try {
//       const bid = new Bid(bidData);
//       await bid.save();
//       await Project.findByIdAndUpdate(bid.projectId, { 
//         $inc: { bidsCount: 1 } 
//       });
//       io.emit("new-bid", bid);
//       console.log(`💰 New bid on ${bidData.projectId}`);
//     } catch (error) {
//       console.error("❌ Bid save failed:", error);
//     }
//   });

//   socket.on("join-chat", async ({ projectId, senderName = "User" }) => {
//     try {
//       if (!isValidObjectId(projectId)) {
//         return socket.emit("chat-error", { message: "Invalid project" });
//       }
//       socket.join(`chat-${projectId}`);
//       console.log(`💬 ${senderName} joined chat-${projectId}`);
      
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
      
//       const newMessage = new ChatMessage({
//         projectId,
//         message: message.trim(),
//         senderName
//       });
//       await newMessage.save();
//       io.to(`chat-${projectId}`).emit("new-chat-message", newMessage);
//       console.log(`💬 ${senderName}: ${message.substring(0, 30)}`);
//     } catch (error) {
//       socket.emit("chat-error", { message: "Send failed" });
//     }
//   });

//   socket.on("disconnect", () => console.log(`🔴 ${socket.id} disconnected`));
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`\n🚀 Server: http://localhost:${PORT}`);
//   console.log(`✅ ALL ROUTES + SOCKET.IO + RATINGS = PERFECT! 🎉\n`);
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

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// -------------------- FILE UPLOAD SETUP --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, `file-${req.body.projectId}-${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -------------------- ROUTES IMPORT --------------------
import aiRoute from "./routes/aiRoute.js";
import payments from "./routes/payments.js";
import bidRoutes from "./routes/bids.js";

app.use("/api/ai", aiRoute);
app.use("/api/payments", payments);
app.use("/api/bids", bidRoutes);

// -------------------- DATABASE & MODELS --------------------
let Project, ChatMessage, Bid, User;

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000
}).then(async () => {
  console.log("✅ MongoDB Connected");
  Project = (await import('./models/Project.js')).default;
  ChatMessage = (await import('./models/ChatMessage.js')).default;
  Bid = (await import('./models/Bid.js')).default;
  User = (await import('./models/User.js')).default;
  console.log("✅ Models loaded");
}).catch(err => console.error("❌ MongoDB Error:", err));

// -------------------- HELPER --------------------
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// -------------------- FILE UPLOAD ROUTE --------------------
app.post("/api/files/upload", upload.array("files", 10), async (req, res) => {
  try {
    const { projectId, freelancerName } = req.body;
    if (!Project) return res.status(500).json({ error: "Project model not ready" });

    const files = req.files.map(file => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      size: file.size,
      uploadedBy: freelancerName || 'Freelancer',
      uploadedAt: new Date()
    }));

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $push: { files: { $each: files } } },
      { new: true }
    );

    global.io?.emit("file-upload-complete", { projectId, files });

    res.json({ success: true, files, project: updatedProject });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// -------------------- PROJECT ROUTES --------------------
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project?.find().sort({ createdAt: -1 }).lean();
    res.json(projects || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/projects/complete", async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!isValidObjectId(projectId)) return res.status(400).json({ error: "Invalid project" });

    const project = await Project.findByIdAndUpdate(
      projectId,
      { status: "completed", completedAt: new Date() },
      { new: true }
    ).lean();

    global.io?.emit("project-completed", project);
    console.log(`✅ Project COMPLETED: ${project.title}`);
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/projects/rate", async (req, res) => {
  try {
    const { projectId, rating, review } = req.body;
    const project = await Project.findByIdAndUpdate(
      projectId,
      { rating, review, reviewedAt: new Date() },
      { new: true }
    ).lean();

    global.io?.emit("project-reviewed", project);
    console.log(`⭐ RATED: ${rating}/5 - ${project.title}`);
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------- AUTH ROUTES --------------------
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User?.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    const user = new User({ name, email, password });
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User?.findOne({ email });
    if (!user || user.password !== password) return res.status(400).json({ message: "Invalid credentials" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- HTTP + SOCKET.IO --------------------
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
global.io = io;

io.on("connection", (socket) => {
  console.log(`🟢 Socket ${socket.id} connected`);

  socket.on("join", async ({ role }) => {
    socket.join(role);
    if (Project) {
      const projects = await Project.find().sort({ createdAt: -1 }).limit(20);
      socket.emit("projects", projects);
    }
  });

  socket.on("post-project", async (projectData) => {
    try {
      const { _id, ...cleanData } = projectData;
      const project = new Project({ ...cleanData, status: "open", bidsCount: 0, progress: 0, chatEnabled: true });
      await project.save();
      io.emit("new-project", project);
      socket.emit("project-posted", { success: true, project });
    } catch (error) {
      socket.emit("post-error", { error: error.message });
    }
  });

  socket.on("update-progress", async ({ projectId, progress }) => {
    try {
      if (!isValidObjectId(projectId)) return;
      const project = await Project.findByIdAndUpdate(
        projectId,
        { progress, chatEnabled: progress >= 25 },
        { new: true }
      ).lean();
      if (project) io.emit("project-progress", project);
    } catch (error) {
      console.error("❌ Progress update failed:", error);
    }
  });

  socket.on("new-bid", async (bidData) => {
    try {
      const bid = new Bid(bidData);
      await bid.save();
      await Project.findByIdAndUpdate(bid.projectId, { $inc: { bidsCount: 1 } });
      io.emit("new-bid", bid);
    } catch (error) {
      console.error("❌ Bid save failed:", error);
    }
  });

  socket.on("join-chat", async ({ projectId, senderName = "User" }) => {
    try {
      if (!isValidObjectId(projectId)) return socket.emit("chat-error", { message: "Invalid project" });
      socket.join(`chat-${projectId}`);
      if (ChatMessage) {
        const messages = await ChatMessage.find({ projectId }).sort({ createdAt: 1 }).limit(50);
        socket.emit("chat-history", messages);
      }
    } catch (error) {
      socket.emit("chat-error", { message: "Chat failed" });
    }
  });

  socket.on("chat-message", async ({ projectId, message, senderName = "User" }) => {
    try {
      if (!isValidObjectId(projectId)) return;
      const newMessage = new ChatMessage({ projectId, message: message.trim(), senderName });
      await newMessage.save();
      io.to(`chat-${projectId}`).emit("new-chat-message", newMessage);
    } catch (error) {
      socket.emit("chat-error", { message: "Send failed" });
    }
  });

  socket.on("disconnect", () => console.log(`🔴 ${socket.id} disconnected`));
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`✅ Backend ready: Projects, Bids, Payments, Ratings, Files, Socket.io`);
});
