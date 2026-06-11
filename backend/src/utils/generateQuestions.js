import axios from "axios";

export const generateQuestions = async (skills = []) => {
  try {
    const { data } = await axios.post("http://127.0.0.1:11434/api/chat", {
      model: "llama3:latest",
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
          content: `Skills: ${skills.join(", ")}`,
        },
      ],
      stream: false,
    });

    const questions = JSON.parse(data.message.content);

    return questions.map((question) => ({
      question,
      answer: "",
      score: 0,
      feedback: "",
    }));
  } catch (error) {
    console.error("Question generation failed:", error.message);
    return [];
  }
};
