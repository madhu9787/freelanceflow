
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Robust helper to strip out any thinking process, internal monologue, or tags
function cleanResponse(text) {
    if (!text) return "";
    
    let cleaned = text;

    // 1. Remove XML/HTML style <think>...</think> blocks
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "");
    cleaned = cleaned.replace(/<think>[\s\S]*/gi, ""); // Remove trailing open think tags

    // 2. Remove Markdown italicized thinking / thoughts (e.g. *Self-Correction*, *Thinking*, *thought*)
    cleaned = cleaned.replace(/\*(?:self-correction|thinking|thought|verification)[\s\S]*?\*/gi, "");
    
    // 3. Remove thinking sections starting with headings or indicators
    cleaned = cleaned.replace(/(?:thinking process|internal monologue|self-correction):\s*[\s\S]*/gi, "");

    // 4. Remove any loose brackets/braces that models might use for thinking steps
    cleaned = cleaned.replace(/\[\s*(?:self-correction|thinking|thought)[\s\S]*?\]/gi, "");

    return cleaned.trim();
}

router.post("/", async (req, res) => {
    try {
        const { message } = req.body;

        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "qwen/qwen3.6-27b",
                messages: [
                    {
                        role: "system",
                        content: `You are the official conversational AI assistant for FreelanceFlow (a premium freelancing platform that connects freelancers with clients, provides bid generation tools, invoice tracking, and voice-assisted project management).

Rules:
1. Provide direct, professional, and friendly answers.
2. NEVER include any thinking process, "Self-Correction", "thought", or internal monologue in your output. Just output the final response.
3. Keep answers concise, helpful, and natural.`
                    },
                    { role: "user", content: message }
                ],
                temperature: 0.5,
                max_tokens: 400
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const rawReply = response.data.choices[0].message.content;
        const cleanedReply = cleanResponse(rawReply);

        res.json({ reply: cleanedReply || "Hello! How can I assist you with FreelanceFlow today?" });

    } catch (err) {
        console.error("AI error:", err.response?.data || err.message);
        res.status(500).json({ reply: "Sorry, I'm having trouble right now. Please try again." });
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

Write ONLY the proposal text, no extra formatting, labels, thinking, or reasoning.`;

        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "qwen/qwen3.6-27b",
                messages: [
                    { role: "system", content: "You are an expert freelance proposal writer. Write concise, professional, and persuasive bid proposals. Do NOT output any thinking process." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.5,
                max_tokens: 300
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const rawDescription = response.data.choices[0].message.content;
        res.json({ description: cleanResponse(rawDescription) });

    } catch (err) {
        console.error("AI Bid Generation error:", err.message);
        res.status(500).json({
            error: "Failed to generate bid description",
            description: "I am excited to work on this project and deliver high-quality results within the specified timeline. With my expertise and dedication, I'm confident I can exceed your expectations."
        });
    }
});

export default router;
