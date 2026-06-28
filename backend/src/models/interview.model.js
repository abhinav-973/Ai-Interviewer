import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      default: "",
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    feedback: {
      type: String,
      default: "",
    },
    strength: {
      type:  String,
      default: "",
    },
    improvement: {
      type: String,
      default: "",
    },
  },
);

const interviewSchema = new Schema(
  {
    // User who gave the interview
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Job role
    role: {
      type: String,
      required: true,
      trim: true,
    },

    // Tech stack / skills
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],

    // Total interview score
    score: {
      type: Number,
      min: 0,
      max: 100,
    },

    // Average score across questions
    averageScore: {
      type: Number,
      default: 0,
    },

    // Overall interview feedback
    feedback: {
      type: String,
      default: "",
    },

    // Strengths detected by mock evaluation
    strengths: [
      {
        type: String,
      },
    ],

    // Weaknesses detected by mock evaluation
    weaknesses: [
      {
        type: String,
      },
    ],

    // Interview questions + answers
    questions: [questionSchema],

    // Total interview duration in minutes
    duration: {
      type: Number,
      default: 0,
    },

    // Interview status
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
    strict: "throw",
  },
);

export default mongoose.model("Interview", interviewSchema);
