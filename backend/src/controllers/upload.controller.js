import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import SmartParser from "pdf-parse-new/lib/SmartPDFParser.js";
import mammoth from "mammoth";
import { aiSkillExtractor } from "../utils/aiSkillExtractor.js";
import { projectExtractor } from "../utils/projectExtractor.js";
import { chunkText } from "../utils/chunkText.js";

export const uploadResume = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) {
    throw new ApiError(400, "No file uploaded");
  }

  let extractedText = "";

  // PDF parsing
  if (file.mimetype === "application/pdf") {
    const parser = new SmartParser();
    const data = await parser.parse(file.buffer);

    extractedText = data.text;
  }

  // DOCX parsing
  else if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    extractedText = result.value;
  }

  const chunks = extractedText ? chunkText(extractedText) : [];

  // Extract skills from chunks, tolerate partial failures
  const skillsSettled = await Promise.allSettled(
    chunks.map((chunk) => aiSkillExtractor(chunk)),
  );

  const skills = [
    ...new Set(
      skillsSettled
        .filter((r) => r.status === "fulfilled" && Array.isArray(r.value))
        .flatMap((r) => r.value),
    ),
  ];

  // Extract projects from chunks, projectExtractor returns { projects: [] }
  const projectSettled = await Promise.allSettled(
    chunks.map((chunk) => projectExtractor(chunk)),
  );

  const allProjects = projectSettled
    .filter((r) => r.status === "fulfilled" && r.value && Array.isArray(r.value.projects))
    .flatMap((r) => r.value.projects);

  const projectMap = new Map();
  allProjects.forEach((project) => {
    if (!project?.name) return;
    const key = project.name.trim().toLowerCase();
    if (!projectMap.has(key)) projectMap.set(key, project);
  });

  const projects = [...projectMap.values()];

  // Persist extracted data to the user record
  req.user.skills = skills;
  req.user.projects = projects;
  req.user.resumeUrl = file.originalname;
  req.user.resumeText = extractedText;
  await req.user.save();

  console.log("Extracted Skills:", skills);
  console.log("Extracted Projects: ", projects);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        filename: file.originalname,
        skills,
        extractedText,
        user: {
          _id: req.user._id,
          fullName: req.user.fullName,
          email: req.user.email,
          role: req.user.role,
          resumeUrl: req.user.resumeUrl,
          resumeText: req.user.resumeText,
          skills: req.user.skills,
          targetRole: req.user.targetRole,
          experienceLevel: req.user.experienceLevel,
          interviewsTaken: req.user.interviewsTaken,
          averageScore: req.user.averageScore,
        },
      },
      "Resume uploaded successfully",
    ),
  );
});
