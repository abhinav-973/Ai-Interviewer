const normalizeSkill = (skill) => String(skill || "").trim();

const QUESTION_BANK = {
  javascript: [
    "Explain how closures work in JavaScript and describe a real use case.",
    "Walk through the JavaScript event loop, including microtasks and macrotasks.",
    "How would you debug a memory leak in a large JavaScript application?",
  ],
  react: [
    "How do React reconciliation and keys affect rendering performance?",
    "Explain when you would use useMemo, useCallback, and React.memo.",
    "How would you structure state management in a medium sized React app?",
  ],
  node: [
    "How does Node.js handle concurrent requests on a single thread?",
    "What practices would you follow to secure an Express API?",
    "How would you diagnose a slow endpoint in a Node.js backend?",
  ],
  express: [
    "Explain middleware ordering in Express and why it matters.",
    "How would you design validation and error handling for an Express route?",
    "What is the difference between authentication and authorization in an API?",
  ],
  mongodb: [
    "How would you model one-to-many data in MongoDB and when would you embed?",
    "Explain indexes in MongoDB and how they affect query performance.",
    "How would you prevent inconsistent writes in a MongoDB based workflow?",
  ],
  mongoose: [
    "How do Mongoose schemas, models, and middleware work together?",
    "When would you use select: false in a Mongoose schema?",
    "How would you validate nested documents in Mongoose?",
  ],
  redux: [
    "Explain the Redux data flow from dispatch to UI update.",
    "How do async thunks help manage API state in Redux Toolkit?",
    "How would you prevent stale or duplicated data in a Redux store?",
  ],
  css: [
    "How would you build a responsive layout that avoids content overlap?",
    "Explain the difference between flexbox and grid with practical examples.",
    "How would you keep CSS maintainable in a growing frontend project?",
  ],
  html: [
    "How do semantic HTML elements improve accessibility and maintainability?",
    "What accessibility checks would you perform before shipping a form?",
    "Explain how browser form validation works and where backend validation fits.",
  ],
  python: [
    "How would you handle exceptions and logging in a production Python service?",
    "Explain generators in Python and when they are useful.",
    "How would you profile and optimize a slow Python function?",
  ],
};

const DEFAULT_QUESTIONS = [
  "Tell me about a technical project you built and the hardest tradeoff you made.",
  "Describe a production bug you have debugged and how you found the root cause.",
  "How do you decide between a quick fix and a larger refactor?",
  "Explain how you would design a reliable API for a feature used by many clients.",
  "How do you test code that depends on external services?",
];

const findQuestionsForSkill = (skill) => {
  const normalized = normalizeSkill(skill).toLowerCase();

  return Object.entries(QUESTION_BANK).find(([key]) =>
    normalized.includes(key),
  )?.[1];
};

export const generateQuestions = (techStack = []) => {
  const normalizedTechStack = techStack.map(normalizeSkill).filter(Boolean);
  const selectedQuestions = [];

  normalizedTechStack.forEach((skill) => {
    const skillQuestions = findQuestionsForSkill(skill);

    if (skillQuestions) {
      selectedQuestions.push(skillQuestions[0]);
    } else {
      selectedQuestions.push(
        `Explain the most important concepts in ${skill} and where you have used it.`,
      );
    }
  });

  DEFAULT_QUESTIONS.forEach((question) => selectedQuestions.push(question));

  return [...new Set(selectedQuestions)].slice(0, 6).map((question) => ({
    question,
    answer: "",
    score: 0,
    feedback: "",
  }));
};

export const evaluateAnswer = (answer = "") => {
  const trimmedAnswer = String(answer).trim();
  const wordCount = trimmedAnswer.split(/\s+/).filter(Boolean).length;

  if (wordCount === 0) {
    return {
      score: 0,
      feedback: "No answer was provided for this question.",
    };
  }

  if (wordCount < 20) {
    return {
      score: 35,
      feedback:
        "The answer is too brief. Add reasoning, examples, and implementation details.",
    };
  }

  if (wordCount < 55) {
    return {
      score: 60,
      feedback:
        "The answer covers the basics but needs more depth and a clearer example.",
    };
  }

  if (wordCount < 100) {
    return {
      score: 78,
      feedback:
        "Good answer with useful detail. It could be stronger with tradeoffs or edge cases.",
    };
  }

  return {
    score: 90,
    feedback:
      "Strong answer with enough depth, structure, and practical explanation.",
  };
};
