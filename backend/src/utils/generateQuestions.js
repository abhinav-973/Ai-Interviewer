import axios from "axios";

const QUESTION_COUNT = 6;

const normalizeSkills = (skills = []) =>
  skills
    .map((skill) => String(skill || "").trim())
    .filter(Boolean);

const createFallbackQuestions = (skills = []) => {
  const normalizedSkills = normalizeSkills(skills);
  const primarySkill = normalizedSkills[0] || "your main technology";
  const secondarySkill = normalizedSkills[1] || primarySkill;
  const skillList = normalizedSkills.length
    ? normalizedSkills.join(", ")
    : "your technical skills";

  return [
    `Walk me through a project where you used ${primarySkill}. What problem did it solve?`,
    `How would you explain the core concepts of ${primarySkill} to a beginner?`,
    `Describe a technical challenge you faced while working with ${secondarySkill} and how you solved it.`,
    `How do you decide which tools or libraries to use when building with ${skillList}?`,
    `Tell me about a bug you debugged in a project using ${primarySkill}. What was your process?`,
    `If you had to improve the performance or reliability of one of your projects, what would you change first?`,
  ].map((question) => ({
    question,
    answer: "",
    score: 0,
    feedback: "",
  }));
};

const parseJsonResponse = (content = "") => {
  const cleanedContent = String(content)
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleanedContent);
  } catch {
    const objectStart = cleanedContent.indexOf("{");
    const objectEnd = cleanedContent.lastIndexOf("}");
    const arrayStart = cleanedContent.indexOf("[");
    const arrayEnd = cleanedContent.lastIndexOf("]");
    const hasArray =
      arrayStart !== -1 &&
      arrayEnd > arrayStart &&
      (objectStart === -1 || arrayStart < objectStart);

    if (hasArray) {
      return JSON.parse(cleanedContent.slice(arrayStart, arrayEnd + 1));
    }

    if (objectStart !== -1 && objectEnd > objectStart) {
      return JSON.parse(cleanedContent.slice(objectStart, objectEnd + 1));
    }

    throw new Error("Ollama response did not contain valid JSON");
  }
};

const normalizeQuestions = (parsedResponse, skills = []) => {
  const rawQuestions = Array.isArray(parsedResponse)
    ? parsedResponse
    : parsedResponse?.questions || [];

  const generatedQuestions = rawQuestions
    .map((question) => ({
      question:
        typeof question === "string"
          ? question.trim()
          : String(question?.question || "").trim(),
      answer: "",
      score: 0,
      feedback: "",
    }))
    .filter((question) => question.question);

  const fallbackQuestions = createFallbackQuestions(skills);
  const questions = [...generatedQuestions, ...fallbackQuestions];

  return questions.slice(0, QUESTION_COUNT);
};

export const generateQuestions = async ({
  role="",
  skills = [],
  projects = [],
}) => {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/chat";
    const ollamaModel = process.env.OLLAMA_MODEL || "llama3:latest";
    const normalizedSkills = normalizeSkills(skills);

    const { data } = await axios.post(
      ollamaUrl,
      {
        model: ollamaModel,
        messages: [
          {
            role: "system",
            content: `
You are a senior software engineer and technical interviewer.

Your task is to generate interview questions based on:

1. Candidate skills
2. Technologies used
3. Project descriptions
4. Project features and architecture

Rules:

* Generate exactly 6 questions.
* Focus on technologies and projects actually mentioned.
* Ask practical, scenario-based, and conceptual questions.
* Include both beginner and intermediate-level questions.
* Prioritize project-related questions over generic theory.
* Do not ask duplicate questions.
* If a project uses a specific technology, ask how it was implemented in that project.
* Return ONLY valid JSON.
* Do not include explanations or markdown.
* The first character of your response must be "{" and the last character must be "}".

Output Format:

{
"questions": [
{
"question": "",
"category": "Project | Technology | Concept",
"difficulty": "Beginner | Intermediate"
}
]
}

Examples:

{
"questions": [
{
"question": "Explain how you implemented JWT authentication in your project.",
"category": "Project",
"difficulty": "Intermediate"
},
{
"question": "What is the Virtual DOM in React and why is it useful?",
"category": "Technology",
"difficulty": "Beginner"
}
]
}

Candidate Data:
{{CANDIDATE_DATA}}
`,
          },
          {
            role: "user",
            content: JSON.stringify({ role, skills: normalizedSkills, projects }),
          },
        ],
        format: "json",
        stream: false,
      },
      {
        timeout: 300000,
      },
    );

    const content = data?.message?.content;

    if (!content) {
      throw new Error("Ollama returned an empty question response");
    }

    return normalizeQuestions(parseJsonResponse(content), normalizedSkills);
  } catch (error) {
    console.error("Question generation failed:", error);
    return createFallbackQuestions(skills);
  }
};
