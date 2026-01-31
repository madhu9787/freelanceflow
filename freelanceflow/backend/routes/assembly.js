// import express from "express";
// import axios from "axios";
// import multer from "multer";
// import dotenv from "dotenv";

// dotenv.config();
// const router = express.Router();

// const upload = multer({ dest: "uploads/" }); // Temp folder to store audio files

// // ✅ AssemblyAI transcription endpoint
// router.post("/transcribe", upload.single("audio"), async (req, res) => {
//   try {
//     const audioFile = req.file;

//     // Upload file to AssemblyAI
//     const fileData = require("fs").readFileSync(audioFile.path);
//     const uploadRes = await axios.post(
//       "https://api.assemblyai.com/v2/upload",
//       fileData,
//       {
//         headers: {
//           authorization: process.env.ASSEMBLYAI_API_KEY,
//           "content-type": "application/octet-stream",
//         },
//       }
//     );

//     const audioUrl = uploadRes.data.upload_url;

//     // Request transcription
//     const transcriptRes = await axios.post(
//       "https://api.assemblyai.com/v2/transcript",
//       { audio_url: audioUrl, language_code: "en" },
//       { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } }
//     );

//     // Poll for transcription status
//     let transcription;
//     while (true) {
//       const statusRes = await axios.get(
//         `https://api.assemblyai.com/v2/transcript/${transcriptRes.data.id}`,
//         { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } }
//       );

//       if (statusRes.data.status === "completed") {
//         transcription = statusRes.data.text;
//         break;
//       } else if (statusRes.data.status === "failed") {
//         return res.status(500).json({ error: "Transcription failed" });
//       }

//       await new Promise((r) => setTimeout(r, 1000)); // wait 1 sec
//     }

//     // Send transcription back
//     res.json({ transcription });

//     // Cleanup temp file
//     require("fs").unlinkSync(audioFile.path);
//   } catch (err) {
//     console.error("❌ AssemblyAI Error:", err.message);
//     res.status(500).json({ error: "AssemblyAI transcription failed" });
//   }
// });

// export default router;
import express from "express";
import axios from "axios";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const router = express.Router();

const upload = multer({ dest: "uploads/" }); // Temp folder to store audio files

// ✅ AssemblyAI transcription endpoint
router.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const audioFile = req.file;

    // Upload file to AssemblyAI
    const fileData = fs.readFileSync(audioFile.path);
    const uploadRes = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      fileData,
      {
        headers: {
          authorization: process.env.ASSEMBLYAI_API_KEY,
          "content-type": "application/octet-stream",
        },
      }
    );

    const audioUrl = uploadRes.data.upload_url;

    // 🔒 FORCE ENGLISH TRANSCRIPTION (NO AUTO-DETECTION)
    const transcriptRes = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      {
        audio_url: audioUrl,
        language_code: "en",
        language_detection: false,
        speech_model: "best"
      },
      {
        headers: {
          authorization: process.env.ASSEMBLYAI_API_KEY,
          "content-type": "application/json"
        }
      }
    );

    // Poll for transcription status
    let transcription;
    while (true) {
      const statusRes = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptRes.data.id}`,
        {
          headers: {
            authorization: process.env.ASSEMBLYAI_API_KEY,
          },
        }
      );

      if (statusRes.data.status === "completed") {
        transcription = statusRes.data.text;
        break;
      } else if (statusRes.data.status === "failed") {
        fs.unlinkSync(audioFile.path);
        return res.status(500).json({ error: "Transcription failed" });
      }

      await new Promise((r) => setTimeout(r, 1000)); // wait 1 sec
    }

    // Send transcription back
    res.json({ transcription });

    // Cleanup temp file
    fs.unlinkSync(audioFile.path);

  } catch (err) {
    console.error("❌ AssemblyAI Error:", err.message);
    res.status(500).json({ error: "AssemblyAI transcription failed" });
  }
});

export default router;
