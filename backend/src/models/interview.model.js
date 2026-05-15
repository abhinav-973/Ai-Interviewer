import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      required: true,
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
  },
  { _id: false },
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

    // Interview level
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
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
      required: true,
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
      required: true,
    },

    // Strengths detected by AI
    strengths: [
      {
        type: String,
      },
    ],

    // Weaknesses detected by AI
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
      default: "Completed",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Interview", interviewSchema);
