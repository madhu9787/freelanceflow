// import express from "express";
// import mongoose from "mongoose";
// const router = express.Router();

// // 🔥 FIX: Load Project model at module level (NOT inside route)
// let Project;

// const loadModels = async () => {
//   if (!Project) {
//     Project = (await import('../models/Project.js')).default;
//   }
// };

// // 🔥 MOCK PAYMENT - Razorpay/Stripe simulation
// router.post("/pay-project", async (req, res) => {
//   try {
//     await loadModels(); // 🔥 FIX: Ensure model loaded
    
//     const { projectId, amount, freelancerId } = req.body;
    
//     // 🔥 VALIDATION
//     if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
//       return res.status(400).json({ error: "Invalid project ID" });
//     }
    
//     console.log(`💳 PAYMENT: ₹${amount} → Project ${projectId}`);
    
//     // Simulate payment processing (2 sec delay)
//     await new Promise(resolve => setTimeout(resolve, 2000));
    
//     // 🔥 CHECK PROJECT EXISTS
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ error: "Project not found" });
//     }
    
//     // Create payment record (mock)
//     const payment = {
//       _id: new mongoose.Types.ObjectId(),
//       projectId,
//       amount,
//       freelancerId: freelancerId || project.freelancerId || "tempFreelancer",
//       status: "funded",
//       createdAt: new Date()
//     };
    
//     // 🔥 UPDATE PROJECT PAYMENT STATUS
//     await Project.findByIdAndUpdate(projectId, {
//       paymentStatus: "funded",
//       paymentId: payment._id,
//       escrowAmount: amount,
//       freelancerPayout: amount * 0.9, // 10% platform fee
//       paymentDate: new Date()
//     });
    
//     console.log(`✅ FUNDS LOCKED: ₹${amount} in ESCROW`);
    
//     // 🔥 SOCKET NOTIFICATION (if io available)
//     if (global.io) {
//       global.io.emit("project-funded", project);
//     }
    
//     res.json({ 
//       success: true, 
//       message: "Payment successful! Funds in escrow ✅",
//       payment 
//     });
    
//   } catch (error) {
//     console.error("❌ Payment failed:", error);
//     res.status(500).json({ error: "Payment processing failed" });
//   }
// });

// export default router;
import express from "express";
import mongoose from "mongoose";
import Project from "../models/Project.js";

const router = express.Router();

// 🔹 MOCK PAYMENT - FUND PROJECT (ESCROW)
router.post("/pay-project", async (req, res) => {
  try {
    const { projectId, amount, freelancerId } = req.body;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId))
      return res.status(400).json({ error: "Invalid project ID" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const payment = {
      _id: new mongoose.Types.ObjectId(),
      projectId,
      amount,
      freelancerId: freelancerId || project.freelancerId,
      status: "funded",
      createdAt: new Date()
    };

    // Update project payment info
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        paymentStatus: "funded",
        paymentId: payment._id,
        escrowAmount: amount,
        freelancerPayout: amount * 0.9, // 10% platform fee
        paymentDate: new Date()
      },
      { new: true }
    );

    console.log("✅ Project funded:", updatedProject._id);

    res.json({ success: true, message: "Payment funded in escrow ✅", payment, project: updatedProject });
  } catch (error) {
    console.error("❌ Payment failed:", error);
    res.status(500).json({ error: "Payment processing failed" });
  }
});

// 🔹 RELEASE PAYMENT AFTER CLIENT APPROVAL
router.post("/release-payment", async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId))
      return res.status(400).json({ error: "Invalid project ID" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.paymentStatus !== "funded")
      return res.status(400).json({ error: "Payment not ready to release" });

    // Release payment
    project.paymentStatus = "released";
    project.status = "completed"; // Optional: final confirmation
    await project.save();

    console.log(`💸 Payment released for project ${project._id} → Freelancer: ${project.freelancerId}`);
    
    // 🔹 Emit socket event if Socket.io available
    if (global.io) global.io.emit("payment-released", project);

    res.json({ success: true, message: "Payment released to freelancer ✅", project });
  } catch (error) {
    console.error("❌ Release payment error:", error);
    res.status(500).json({ error: "Payment release failed" });
  }
});

export default router;
