import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    projectId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Project", 
      required: true 
    },
    freelancerId: { type: String, required: true }, // from Clerk user.id
    freelancerName: { type: String, required: true },
    amount: { type: Number, required: true },
    deadline: { type: Date, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Bid", bidSchema);
