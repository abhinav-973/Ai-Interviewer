import axios from "axios";
import { chunkQuestions } from "./sendBatches.js";

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

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item || "").trim()).filter(Boolean);
};

const normalizeAnalysis = (analysis, questionCount) => {
  const evaluations = Array.from({ length: questionCount }, (_, index) => {
    const evaluation = Array.isArray(analysis?.evaluations)
      ? analysis.evaluations[index]
      : null;

    return {
      questionNumber: Number(evaluation?.question || index + 1),
      score: clampScore(evaluation?.score),
      feedback: String(evaluation?.feedback || "").trim(),
      strength: String(evaluation?.strength || "").trim(),
      improvement: String(evaluation?.improvement || "").trim(),
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
You are a senior technical interviewer evaluating a completed mock interview transcript.

## INPUT YOU WILL RECEIVE (in the user message)
- Candidate Context: role, skills, projects, experience level
- Interview Transcript: a numbered list of question + candidate answer pairs

Do not invent or assume any skill, project, or experience detail not explicitly provided. If context is missing or sparse (e.g., no projects listed), do not penalize the candidate for it — simply skip or down-weight that evaluation criterion and note "insufficient context" instead of guessing.

## EXPERIENCE LEVEL CALIBRATION
1. Beginner
   - Basic, correct understanding of fundamentals is sufficient for high scores
   - Do not penalize missing advanced concepts (scaling, architecture, edge cases)
   - Reward clear reasoning even if the final answer is imperfect
2. Intermediate
   - Expect hands-on implementation knowledge, not just theory
   - Penalize answers that are correct but shallow (no "how" or "why")
   - Expect awareness of common pitfalls/tradeoffs in their stated skills
3. Advanced
   - Expect system design thinking: architecture, scalability, tradeoffs, failure modes
   - Vague, textbook, or buzzword-only answers should score low even if technically not wrong
   - Reward answers that proactively discuss tradeoffs or edge cases unprompted

## EVALUATION CRITERIA (apply per question, weighted by relevance to that question)
- Technical Accuracy — is the content correct?
- Depth — does it go beyond surface-level recall?
- Clarity — is it well-structured and easy to follow?
- Practical Understanding — does it reflect real hands-on experience vs. memorized theory?
- Problem Solving Ability — for scenario/design questions, is the reasoning process sound?
- Project Knowledge — only apply if the question references the candidate's stated projects; judge consistency with the project context given.

If a question references a candidate project:
- Evaluate consistency with the provided project description.
- Reward answers that reference implementation details, architecture, technologies, tradeoffs, debugging experiences, or lessons learned.
- Penalize answers that contradict the supplied project context.

## SCORING SCALE (0-100, per question and overall)
- 90-100: Excellent — accurate, deep, clear, demonstrates real experience
- 70-89: Good — solid and correct, minor gaps in depth or clarity
- 50-69: Average — partially correct or correct-but-shallow for the stated experience level
- 30-49: Weak — significant gaps, confusion, or inaccuracy
- 0-29: Poor or no answer — incorrect, off-topic, or skipped

overallScore must be a fair reflection of the per-question evaluations (e.g., their average), not an independent guess — do not let one strong or weak answer disproportionately skew it unless it reveals a critical gap.

## FEEDBACK QUALITY RULES
- Every feedback string must reference something specific the candidate actually said or didn't say — no generic filler like "good job" or "could improve clarity" without saying what was unclear.
- strengths and weaknesses must each be specific and evidence-based (max 5 items each), not restatements of the criteria list.
- Be honest and direct, not falsely encouraging — but constructive, not harsh for its own sake.
- Keep each evaluation feedback to 1-3 sentences. Keep the overall feedback to 2-4 sentences.

## OUTPUT FORMAT

Return ONLY raw valid JSON. No markdown code fences, no preamble, and no explanation outside the JSON object.

The "evaluations" array must contain exactly one entry per question in the transcript, in the same order as the questions were asked.

Each evaluation must include:

* question
* score
* feedback
* strength
* improvement

The overallScore should be consistent with the individual question scores.

{
  "overallScore": 0,
  "feedback": "",
  "strengths": [],
  "weaknesses": [],
  "evaluations": [{
    "question": 1,
    "score": 0,
    "feedback": "",
    "strength": "",
    "improvement": ""
  }]
}
`;

const analyseBatch = async ({
  questions = [],
  role = "",
  skills = [],
  projects = [],
  experienceLevel = "beginner",
}) => {
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
            content: JSON.stringify({
              role,
              skills,
              projects,
              experienceLevel,
              questions: interviewResponses,
            }),
          },
        ],
        format: "json",
        stream: false,
      },
      {
        timeout: 3000000,
      },
    );

    const content = data?.message?.content;

    if (!content) {
      throw new Error("Ollama returned an empty analysis response");
    }

    const analysis = parseJsonResponse(content);
    return normalizeAnalysis(analysis, interviewResponses.length);
  } catch (error) {
    throw new Error(`Interview analysis failed: ${error.message}`);
  }
};

// Dedupe strings case-insensitively, keeping the first version seen
const mergeUniqueStrings = (lists, maxItems = 5) => {
  const seen = new Set();
  const merged = [];

  for (const list of lists) {
    for (const item of list) {
      const key = item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    }
  }

  return merged.slice(0, maxItems);
};

const aiInterviewAnalyser = async ({
  questions = [],
  role = "",
  skills = [],
  projects = [],
  experienceLevel = "beginner",
  batchSize = 5,
}) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Questions must be a non-empty array");
  }

  const batches = chunkQuestions(questions, batchSize);

  // Sequential to avoid overloading a local Ollama instance.
  const batchResults = [];
  for (const batch of batches) {
    const result = await analyseBatch({
      questions: batch,
      role,
      skills,
      projects,
      experienceLevel,
    });
    batchResults.push(result);
  }

  // Renumber evaluations using their position across the full question list
  let runningIndex = 0;
  const evaluations = batchResults.flatMap((result) =>
    result.evaluations.map((evaluation) => {
      runningIndex += 1;
      return {
        ...evaluation,
        questionNumber: runningIndex,
      };
    }),
  );

  const overallScore = clampScore(
    evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) /
      evaluations.length,
  );

  const strengths = mergeUniqueStrings(batchResults.map((r) => r.strengths));
  const weaknesses = mergeUniqueStrings(batchResults.map((r) => r.weaknesses));

  const feedback = batchResults
    .map((result) => result.feedback)
    .filter(Boolean)
    .join(" ");

  return {
    overallScore,
    feedback,
    strengths,
    weaknesses,
    evaluations,
  };
};

export default aiInterviewAnalyser;
export { analyseBatch };