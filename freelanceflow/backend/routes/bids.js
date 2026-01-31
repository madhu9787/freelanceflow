import express from "express";
import Bid from "../models/Bid.js";
import Project from "../models/Project.js";

const router = express.Router();

// POST /api/bids - Freelancer submits bid
router.post("/", async (req, res) => {
  try {
    const { projectId, freelancerId, freelancerName, amount, deadline, message } = req.body;
    
    const bid = new Bid({
      projectId,
      freelancerId,
      freelancerName,
      amount,
      deadline,
      message
    });
    
    await bid.save();
    
    // Update project with new bid count (for real-time)
    const project = await Project.findById(projectId);
    if (!project.bidsCount) project.bidsCount = 0;
    project.bidsCount += 1;
    await project.save();
    
    res.status(201).json({ message: "Bid submitted", bid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/bids/project/:projectId - Get all bids for a project
router.get("/project/:projectId", async (req, res) => {
  try {
    const bids = await Bid.find({ projectId: req.params.projectId })
      .populate("projectId", "title clientName")
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/bids/:bidId/accept - Client accepts bid
router.put("/:bidId/accept", async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId);
    if (!bid) return res.status(404).json({ error: "Bid not found" });
    
    bid.status = "accepted";
    await bid.save();
    
    // Assign freelancer to project
    await Project.findByIdAndUpdate(bid.projectId, {
      freelancerId: bid.freelancerId,
      status: "accepted"
    });
    
    res.json({ message: "Bid accepted, project assigned" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
