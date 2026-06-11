import axios from "axios";

const clampScore = (score) => {
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(numericScore)));
};

const getOllamaConfig = () => {
  const ollamaUrl = process.env.OLLAMA_URL;
  const ollamaModel = process.env.OLLAMA_MODEL;

  if (!ollamaUrl || !ollamaModel) {
    throw new Error("OLLAMA_URL and OLLAMA_MODEL must be configured");
  }

  return { ollamaUrl, ollamaModel };
};

const parseJsonResponse = (content = "") => {
  const cleanedContent = String(content)
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleanedContent);
};

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
};

const normalizeAnalysis = (analysis, questionCount) => {
  const evaluations = Array.from({ length: questionCount }, (_, index) => {
    const evaluation = Array.isArray(analysis?.evaluations)
      ? analysis.evaluations[index]
      : null;

    return {
      score: clampScore(evaluation?.score),
      feedback: String(evaluation?.feedback || "").trim(),
    };
  });

  return {
    overallScore: clampScore(analysis?.overallScore),
    feedback: String(analysis?.feedback || "").trim(),
    strengths: normalizeStringArray(analysis?.strengths),
    weaknesses: normalizeStringArray(analysis?.weaknesses),
    evaluations,
  };
};

const SYSTEM_PROMPT = `
You are a senior technical interviewer evaluating a completed mock interview.

Return ONLY valid JSON in this exact shape:
{
  "overallScore": 0,
  "feedback": "",
  "strengths": [],
  "weaknesses": [],
  "evaluations": [
    {
      "score": 0,
      "feedback": ""
    }
  ]
}

Rules:
- Score the overall interview from 0 to 100.
- Score each answer from 0 to 100.
- Keep evaluations in the same order as the submitted questions.
- Evaluate technical accuracy, depth, clarity, and practical understanding.
- Penalize missing, vague, incorrect, or copied-looking answers.
- Give concise, constructive feedback.
- Return JSON only. Do not include markdown or explanations outside JSON.
`;

export const aiInterviewAnalyser = async (questions = []) => {
  if (!Array.isArray(questions)) {
    throw new Error("Questions must be an array");
  }

  const { ollamaUrl, ollamaModel } = getOllamaConfig();
  const interviewResponses = questions.map((item) => ({
    question: String(item?.question || "").trim(),
    answer: String(item?.answer || "").trim(),
  }));

  try {
    const { data } = await axios.post(
      ollamaUrl,
      {
        model: ollamaModel,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: JSON.stringify({ questions: interviewResponses }),
          },
        ],
        format: "json",
        stream: false,
      },
      {
        timeout: 120000,
      },
    );

    const content = data?.message?.content;

    if (!content) {
      throw new Error("Ollama returned an empty analysis response");
    }

    return normalizeAnalysis(
      parseJsonResponse(content),
      interviewResponses.length,
    );
  } catch (error) {
    throw new Error(`Interview analysis failed: ${error.message}`);
  }
};

