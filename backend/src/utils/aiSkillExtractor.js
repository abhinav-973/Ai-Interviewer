import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(
  process.env.HF_TOKEN
);

export const aiSkillExtractor = async (
  text
) => {

  const prompt = `
Extract all technical skills from this resume.

Return ONLY a JSON array.

Resume:
${text}
`;

  const response =
    await client.textGeneration({

      model:
        "mistralai/Mistral-7B-Instruct-v0.2",

      inputs: prompt,

      parameters: {
        max_new_tokens: 200,
      },
    });

  return response.generated_text;
};