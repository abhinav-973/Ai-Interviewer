import axios from "axios";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/chat";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3:latest";

const SYSTEM_PROMPT = `
You are a resume skill extractor.

Extract technical and professional skills from the resume.

Return ONLY valid JSON in this exact shape:
{
  "skills": []
}

Rules:
- Include programming languages, frameworks, libraries, databases, tools, cloud platforms, and professional skills.
- Return concise skill names only.
- Do not include explanations.
- Do not use markdown.
- Do not invent skills that are not supported by the resume.
`;

const extractJson = (content = "") => {
  const text = String(content).trim();
  const fencedJson = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

  if (fencedJson?.[1]) {
    return JSON.parse(fencedJson[1]);
  }

  try {
    return JSON.parse(text);
  } catch {
    const objectStart = text.indexOf("{");
    const objectEnd = text.lastIndexOf("}");
    const arrayStart = text.indexOf("[");
    const arrayEnd = text.lastIndexOf("]");

    if (objectStart !== -1 && objectEnd > objectStart) {
      return JSON.parse(text.slice(objectStart, objectEnd + 1));
    }

    if (arrayStart !== -1 && arrayEnd > arrayStart) {
      return JSON.parse(text.slice(arrayStart, arrayEnd + 1));
    }

    throw new Error("Ollama did not return valid JSON");
  }
};

const normalizeSkills = (value) => {
  const skills = Array.isArray(value) ? value : value?.skills;

  if (!Array.isArray(skills)) {
    return [];
  }

  return [...new Set(
    skills
      .map((skill) => String(skill || "").trim())
      .filter(Boolean),
  )];
};

export const aiSkillExtractor = async (resumeText = "") => {
  if (!String(resumeText).trim()) {
    return [];
  }

  try {
    const { data } = await axios.post(
      OLLAMA_URL,
      {
        model: OLLAMA_MODEL,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: String(resumeText),
          },
        ],
        format: "json",
        stream: false,
      },
      {
        timeout: 120000,
      },
    );

    return normalizeSkills(extractJson(data?.message?.content));
  } catch (error) {
    console.error("Skill extraction failed:", error.message);
    return [];
  }
};

