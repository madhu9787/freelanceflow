
// import express from "express";
// import Bid from "../models/Bid.js";
// import Project from "../models/Project.js";

// const router = express.Router();

// // ✅ Submit Bid
// router.post("/", async (req, res) => {
//   try {
//     const { projectId, freelancerId, freelancerName, amount, deadline, message } = req.body;

//     const bid = new Bid({
//       projectId,
//       freelancerId,
//       freelancerName,
//       amount,
//       deadline,
//       message
//     });

//     await bid.save();

//     // Increase bid count
//     await Project.findByIdAndUpdate(projectId, {
//       $inc: { bidsCount: 1 }
//     });

//     res.status(201).json({ message: "Bid submitted", bid });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// // ✅ Get all bids for a project
// router.get("/project/:projectId", async (req, res) => {
//   try {
//     const bids = await Bid.find({ projectId: req.params.projectId })
//       .populate("projectId", "title clientName")
//       .sort({ createdAt: -1 });

//     res.json(bids);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// // ✅ Get all bids of a freelancer
// router.get("/my-bids/:freelancerId", async (req, res) => {
//   try {
//     const bids = await Bid.find({
//       freelancerId: req.params.freelancerId
//     })
//       .populate("projectId", "title budget clientName status")
//       .sort({ createdAt: -1 });

//     res.json(bids);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// // ✅ Client Accepts Bid (MAIN HIRING LOGIC)
// router.put("/:bidId/accept", async (req, res) => {
//   try {
//     const bid = await Bid.findById(req.params.bidId);
//     if (!bid) return res.status(404).json({ error: "Bid not found" });

//     // 1️⃣ Mark bid as accepted
//     bid.status = "accepted";
//     await bid.save();

//     // 2️⃣ Reject other bids for same project
//     await Bid.updateMany(
//       { projectId: bid.projectId, _id: { $ne: bid._id } },
//       { status: "rejected" }
//     );

//     // 3️⃣ Assign freelancer to project
//     await Project.findByIdAndUpdate(bid.projectId, {
//       freelancerId: bid.freelancerId,
//       freelancerName: bid.freelancerName,
//       status: "accepted"
//     });

//     res.json({ message: "Bid accepted, project assigned successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// export default router;
import express from "express";
import Bid from "../models/Bid.js";
import Project from "../models/Project.js";

const router = express.Router();

// ✅ Submit a bid
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

    // Increment bid count in project
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $inc: { bidsCount: 1 } },
      { new: true }
    );

    console.log("✅ Bid submitted:", bid);
    res.status(201).json({ message: "Bid submitted", bid, project });
  } catch (error) {
    console.error("❌ Submit bid error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get all bids for a project
router.get("/project/:projectId", async (req, res) => {
  try {
    const bids = await Bid.find({ projectId: req.params.projectId })
      .populate("projectId", "title clientName")
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    console.error("❌ Get project bids error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get all bids of a freelancer
router.get("/my-bids/:freelancerId", async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.params.freelancerId })
      .populate("projectId", "title budget clientName status")
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    console.error("❌ Get freelancer bids error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Accept a bid (client hiring logic)
router.put("/:bidId/accept", async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId);
    if (!bid) return res.status(404).json({ error: "Bid not found" });

    // 1️⃣ Accept this bid
    bid.status = "accepted";
    await bid.save();

    // 2️⃣ Reject all other bids for same project
    await Bid.updateMany(
      { projectId: bid.projectId, _id: { $ne: bid._id } },
      { status: "rejected" }
    );

    // 3️⃣ Assign freelancer to project
    const project = await Project.findByIdAndUpdate(
      bid.projectId,
      {
        freelancerId: bid.freelancerId,
        freelancerName: bid.freelancerName,
        status: "accepted"
      },
      { new: true }
    );

    console.log("✅ Bid accepted, project updated:", project);

    res.json({ message: "Bid accepted, project assigned successfully", project });
  } catch (error) {
    console.error("❌ Accept bid error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
