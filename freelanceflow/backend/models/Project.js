
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    duration: String,
    skills: String,
    experience: String,
    category: String,
    clientName: String,
    clientId: { type: String, required: true },

    freelancerId: { type: String, default: null },
    bidsCount: { type: Number, default: 0 },

    progress: { type: Number, default: 0 },
    chatEnabled: { type: Boolean, default: false },
    freelancerName: { type: String, default: null },

    // 🔥 NEW FIELDS FOR RATINGS (YOUR EXISTING)
    files: [{
      name: { type: String, required: true },
      url: { type: String, required: true },
      size: { type: Number, required: true },
      uploadedBy: { type: String, default: "Freelancer" },
      uploadedAt: { type: Date, default: Date.now }
    }],

    // 🔥 RATING FIELDS (YOUR EXISTING)
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    completedAt: Date,
    reviewedAt: Date,
    deliveredAt: Date,
    deliverableUrl: String,

    status: {
      type: String,
      enum: ["open", "accepted", "in-progress", "delivered", "completed"],
      default: "open",
    },

    // 🔥 🔥 🔥 NEW PAYMENT FIELDS (STEP 2) 🔥 🔥 🔥
    paymentStatus: {
      type: String,
      enum: ['unfunded', 'funded', 'released', 'disputed'],
      default: 'unfunded'
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    escrowAmount: {
      type: Number,
      default: 0
    },
    freelancerPayout: {
      type: Number,
      default: 0
    },
    paymentDate: Date,
    // 🔥 🔥 🔥 END PAYMENT FIELDS 🔥 🔥 🔥
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
