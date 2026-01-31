import express from "express";
import ChatMessage from "../models/ChatMessage.js";

const router = express.Router();

router.get("/project/:projectId", async (req, res) => {
  try {
    const messages = await ChatMessage.find({ projectId: req.params.projectId })
      .sort({ timestamp: 1 })
      .limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
