import axios from "axios";

const DEFAULT_TIMEOUT_MS = 300000;
const DEFAULT_BATCH_SIZE = 2;

const clampScore = (score) => {
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(numericScore)));
};

const getPositiveNumber = (value, fallback) => {
  const number = Number(value);

  if (Number.isFinite(number) && number > 0) {
    return number;
  }

  return fallback;
};

const getOllamaConfig = () => {
  const ollamaUrl = process.env.OLLAMA_URL;
  const ollamaModel = process.env.OLLAMA_MODEL;

  if (!ollamaUrl || !ollamaModel) {
    throw new Error("OLLAMA_URL and OLLAMA_MODEL must be configured");
  }

  return {
    ollamaUrl,
    ollamaModel,
    timeout: getPositiveNumber(process.env.OLLAMA_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    batchSize: Math.max(
      1,
      Math.floor(
        getPositiveNumber(
          process.env.OLLAMA_ANALYSIS_BATCH_SIZE,
          DEFAULT_BATCH_SIZE,
        ),
      ),
    ),
  };
};

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

    if (objectStart !== -1 && objectEnd > objectStart) {
      return JSON.parse(text.slice(objectStart, objectEnd + 1));
    }

    throw new Error("Ollama did not return valid JSON");
  }
};

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
};

const uniqueLimited = (items, limit = 3) => {
  const seen = new Set();

  return items
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, limit);
};

const compactText = (value, maxLength = 2000) => {
  const text = String(value || "").trim();

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength);
};

const chunkArray = (items, size) => {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

const createEmptyEvaluation = () => ({
  score: 0,
  feedback: "No usable answer was provided.",
});

const normalizeEvaluation = (evaluation) => ({
  score: clampScore(evaluation?.score),
  feedback: String(evaluation?.feedback || "").trim(),
});

const normalizeBatchAnalysis = (analysis, batchSize) => {
  const evaluations = Array.isArray(analysis?.evaluations)
    ? analysis.evaluations
    : [];

  return {
    evaluations: Array.from({ length: batchSize }, (_, index) =>
      normalizeEvaluation(evaluations[index]),
    ),
    strengths: normalizeStringArray(analysis?.strengths),
    weaknesses: normalizeStringArray(analysis?.weaknesses),
  };
};

const calculateOverallScore = (evaluations) => {
  if (!evaluations.length) {
    return 0;
  }

  return Math.round(
    evaluations.reduce((total, evaluation) => total + evaluation.score, 0) /
      evaluations.length,
  );
};

const BATCH_PROMPT = `
You are a senior technical interviewer evaluating one small batch of interview answers.

Return ONLY valid JSON in this exact shape:
{
  "evaluations": [
    {
      "score": 0,
      "feedback": ""
    }
  ],
  "strengths": [],
  "weaknesses": []
}

Rules:
- Score each answer from 0 to 100.
- Keep evaluations in the same order as the submitted questions.
- Evaluate technical accuracy, depth, clarity, and practical understanding.
- Penalize missing, vague, incorrect, or copied-looking answers.
- Keep each answer feedback under 25 words.
- Include at most 2 strengths and 2 weaknesses for this batch.
- Return JSON only. Do not include markdown or explanations outside JSON.
`;

const SUMMARY_PROMPT = `
You are a senior technical interviewer summarizing already-scored interview results.

Return ONLY valid JSON in this exact shape:
{
  "feedback": "",
  "strengths": [],
  "weaknesses": []
}

Rules:
- Do not rescore anything.
- Use the supplied scores, feedback, strengths, and weaknesses.
- Keep feedback under 45 words.
- Include at most 3 strengths and 3 weaknesses.
- Return JSON only. Do not include markdown or explanations outside JSON.
`;

const callOllama = async ({
  ollamaUrl,
  ollamaModel,
  timeout,
  prompt,
  payload,
  numPredict,
}) => {
  const { data } = await axios.post(
    ollamaUrl,
    {
      model: ollamaModel,
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
      format: "json",
      options: {
        temperature: 0.1,
        num_predict: numPredict,
      },
      stream: false,
    },
    {
      timeout,
    },
  );

  const content = data?.message?.content;

  if (!content) {
    throw new Error("Ollama returned an empty response");
  }

  return parseJsonResponse(content);
};

const buildFallbackFeedback = (overallScore) => {
  if (overallScore >= 80) {
    return "Strong interview performance with clear technical understanding and practical depth.";
  }

  if (overallScore >= 60) {
    return "Solid interview attempt. Add more detail, examples, and tradeoff discussion to improve.";
  }

  if (overallScore >= 35) {
    return "The interview needs stronger technical depth and clearer explanations across answers.";
  }

  return "The submitted answers need more completeness, accuracy, and practical explanation.";
};

export const aiInterviewAnalyser = async (questions = []) => {
  if (!Array.isArray(questions)) {
    throw new Error("Questions must be an array");
  }

  const config = getOllamaConfig();
  const interviewResponses = questions.map((item, index) => ({
    index,
    question: compactText(item?.question, 500),
    answer: compactText(item?.answer, 1200),
  }));
  const batches = chunkArray(interviewResponses, config.batchSize);
  const evaluations = [];
  const strengths = [];
  const weaknesses = [];

  try {
    for (const batch of batches) {
      const batchAnalysis = await callOllama({
        ...config,
        prompt: BATCH_PROMPT,
        payload: { questions: batch },
        numPredict: Math.max(350, batch.length * 180),
      });
      const normalizedBatch = normalizeBatchAnalysis(
        batchAnalysis,
        batch.length,
      );

      evaluations.push(...normalizedBatch.evaluations);
      strengths.push(...normalizedBatch.strengths);
      weaknesses.push(...normalizedBatch.weaknesses);
    }

    while (evaluations.length < interviewResponses.length) {
      evaluations.push(createEmptyEvaluation());
    }

    const overallScore = calculateOverallScore(evaluations);
    let summary = {
      feedback: buildFallbackFeedback(overallScore),
      strengths: uniqueLimited(strengths),
      weaknesses: uniqueLimited(weaknesses),
    };

    try {
      const summaryAnalysis = await callOllama({
        ...config,
        prompt: SUMMARY_PROMPT,
        payload: {
          overallScore,
          evaluations,
          strengths: uniqueLimited(strengths, 8),
          weaknesses: uniqueLimited(weaknesses, 8),
        },
        numPredict: 350,
      });

      summary = {
        feedback:
          String(summaryAnalysis?.feedback || "").trim() ||
          summary.feedback,
        strengths:
          uniqueLimited(summaryAnalysis?.strengths).length > 0
            ? uniqueLimited(summaryAnalysis.strengths)
            : summary.strengths,
        weaknesses:
          uniqueLimited(summaryAnalysis?.weaknesses).length > 0
            ? uniqueLimited(summaryAnalysis.weaknesses)
            : summary.weaknesses,
      };
    } catch (error) {
      console.error("Interview summary generation failed:", error.message);
    }

    return {
      overallScore,
      feedback: summary.feedback,
      strengths: summary.strengths,
      weaknesses: summary.weaknesses,
      evaluations: evaluations.slice(0, interviewResponses.length),
    };
  } catch (error) {
    throw new Error(`Interview analysis failed: ${error.message}`);
  }
};

