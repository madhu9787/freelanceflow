import express from "express";
import mongoose from "mongoose";
const router = express.Router();

// 🔥 FIX: Load Project model at module level (NOT inside route)
let Project;

const loadModels = async () => {
  if (!Project) {
    Project = (await import('../models/Project.js')).default;
  }
};

// 🔥 MOCK PAYMENT - Razorpay/Stripe simulation
router.post("/pay-project", async (req, res) => {
  try {
    await loadModels(); // 🔥 FIX: Ensure model loaded
    
    const { projectId, amount, freelancerId } = req.body;
    
    // 🔥 VALIDATION
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }
    
    console.log(`💳 PAYMENT: ₹${amount} → Project ${projectId}`);
    
    // Simulate payment processing (2 sec delay)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 🔥 CHECK PROJECT EXISTS
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    // Create payment record (mock)
    const payment = {
      _id: new mongoose.Types.ObjectId(),
      projectId,
      amount,
      freelancerId: freelancerId || project.freelancerId || "tempFreelancer",
      status: "funded",
      createdAt: new Date()
    };
    
    // 🔥 UPDATE PROJECT PAYMENT STATUS
    await Project.findByIdAndUpdate(projectId, {
      paymentStatus: "funded",
      paymentId: payment._id,
      escrowAmount: amount,
      freelancerPayout: amount * 0.9, // 10% platform fee
      paymentDate: new Date()
    });
    
    console.log(`✅ FUNDS LOCKED: ₹${amount} in ESCROW`);
    
    // 🔥 SOCKET NOTIFICATION (if io available)
    if (global.io) {
      global.io.emit("project-funded", project);
    }
    
    res.json({ 
      success: true, 
      message: "Payment successful! Funds in escrow ✅",
      payment 
    });
    
  } catch (error) {
    console.error("❌ Payment failed:", error);
    res.status(500).json({ error: "Payment processing failed" });
  }
});

export default router;
