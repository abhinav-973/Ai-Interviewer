import axios from "axios";

const parseJsonResponse = (content = "") => {
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

const extractQuestionText = (question) => {
  if (typeof question === "string") {
    return question;
  }

  if (question && typeof question === "object") {
    return question.question || question.text || question.title || "";
  }

  return "";
};

const normalizeQuestions = (response) => {
  const questions = Array.isArray(response) ? response : response?.questions;

  if (!Array.isArray(questions)) {
    return [];
  }

  return questions
    .map(extractQuestionText)
    .map((question) => String(question || "").trim())
    .filter(Boolean)
    .map((question) => ({
      question,
      answer: "",
      score: 0,
      feedback: "",
    }));
};

export const generateQuestions = async (skills = [], resumeText = "") => {
  const ollamaUrl = process.env.OLLAMA_URL;
  const ollamaModel = process.env.OLLAMA_MODEL;

  if (!ollamaUrl || !ollamaModel) {
    throw new Error("OLLAMA_URL and OLLAMA_MODEL must be configured");
  }

  try {
    const { data } = await axios.post(
      ollamaUrl,
      {
        model: ollamaModel,
        messages: [
          {
            role: "system",
            content: `
You are a senior technical interviewer.

Generate 6 interview questions based on the candidate's skills and resume.

Return ONLY valid JSON in this exact shape:
{
  "questions": []
}

Rules:
- Focus on practical and conceptual questions.
- Mix beginner and intermediate level questions.
- Prefer questions that match the candidate's actual project and resume context.
- Put only question strings inside the questions array.
- Do not include markdown or explanations.

Example:
{
  "questions": [
    "Explain React Virtual DOM.",
    "How does JWT authentication work?"
  ]
}
            `,
          },
          {
            role: "user",
            content: JSON.stringify({
              skills,
              resumeText,
            }),
          },
        ],
        format: "json",
        stream: false,
      },
      {
        timeout: 120000,
      },
    );

    return normalizeQuestions(parseJsonResponse(data?.message?.content));
  } catch (error) {
    throw new Error(`Question generation failed: ${error.message}`);
  }
};
