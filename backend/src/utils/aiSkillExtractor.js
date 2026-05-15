import { client } from "../config/huggingface.js";

export const aiSkillExtractor = async (text) => {
  const response = await client.chatCompletion({
    provider: "hf-inference",

    model: "HuggingFaceH4/zephyr-7b-beta",

    messages: [
      {
        role: "system",
        content: "You extract technical skills from resumes.",
      },

      {
        role: "user",
        content: `
Extract technical skills.

Return ONLY a valid JSON array.

Resume:
${text}
        `,
      },
    ],

    max_tokens: 300,
  });
  const result = response.choices[0].message.content;

  const cleaned = result
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
};
