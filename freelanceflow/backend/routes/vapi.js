import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text is required" });

    const response = await fetch("https://api.vapi.ai/voice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.VAPI_PUBLIC_KEY}`,
      },
      body: JSON.stringify({
        text,
        voice: "alloy",
        language: "en-US",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ message: "VAPI request failed", details: errText });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    res.json({ audio: `data:audio/mpeg;base64,${base64Audio}` });
  } catch (err) {
    console.error("VAPI route error:", err);
    res.status(500).json({ message: "VAPI backend failed" });
  }
});

export default router;
