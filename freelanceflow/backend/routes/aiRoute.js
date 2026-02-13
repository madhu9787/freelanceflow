
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { message } = req.body;

        const response = await axios.post(
            "https://api.sambanova.ai/v1/chat/completions",
            {
                model: "Meta-Llama-3.3-70B-Instruct",
                messages: [
                    { role: "system", content: "You are an AI assistant for FreelanceFlow." },
                    { role: "user", content: message }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.SAMBANOVA_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({
            reply: response.data.choices[0].message.content
        });

    } catch (err) {
        console.error("AI error:", err.message);
        res.json({ reply: "AI fallback response." });
    }
});

// 🤖 AI BID DESCRIPTION GENERATOR
router.post("/generate-bid", async (req, res) => {
    try {
        const { projectTitle, projectDescription, budget, skills } = req.body;

        const prompt = `You are a professional freelancer writing a bid proposal. 

Project Title: ${projectTitle}
Project Description: ${projectDescription}
Budget: ₹${budget}
Required Skills: ${skills || 'Not specified'}

Write a compelling, professional bid proposal (150-200 words) that:
1. Shows understanding of the project requirements
2. Highlights relevant expertise
3. Mentions a realistic timeline
4. Expresses enthusiasm
5. Sounds professional but friendly

Write ONLY the proposal text, no extra formatting or labels.`;

        const response = await axios.post(
            "https://api.sambanova.ai/v1/chat/completions",
            {
                model: "Meta-Llama-3.3-70B-Instruct",
                messages: [
                    { role: "system", content: "You are an expert freelance proposal writer. Write concise, professional, and persuasive bid proposals." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 300
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.SAMBANOVA_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({
            description: response.data.choices[0].message.content.trim()
        });

    } catch (err) {
        console.error("AI Bid Generation error:", err.message);
        res.status(500).json({
            error: "Failed to generate bid description",
            description: "I am excited to work on this project and deliver high-quality results within the specified timeline. With my expertise and dedication, I'm confident I can exceed your expectations."
        });
    }
});

export default router;
