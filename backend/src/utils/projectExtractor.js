import axios from "axios";

const SYSTEM_PROMPT = `
You are an ATS-grade resume parser specializing in project extraction.

Extract ALL projects from the resume.

Rules:
- Return ONLY valid JSON.
- Do not use markdown.
- Do not hallucinate.
- Preserve project names exactly.
- Extract every project separately.

Output Format:

{
  "projects": [
    {
      "name": "",
      "description": "",
      "keyFeatures": [],
      "technologies": [],
      "frameworks": [],
      "languages": [],
      "databases": [],
      "github": "",
      "liveDemo": "",
      "duration": ""
    }
  ]
}

If no projects are found:

{
  "projects": []
}
`;

export const projectExtractor = async (resumeText) => {
  try {
    const { data } = await axios.post("http://127.0.0.1:11434/api/chat", {
      model: "llama3:latest",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: resumeText,
        },
      ],
      format: "json",
      stream: false,
    });

    return JSON.parse(data.message.content);
  } catch (error) {
    console.error("Project extraction failed:", error);

    return {
      projects: [],
    };
  }
};
