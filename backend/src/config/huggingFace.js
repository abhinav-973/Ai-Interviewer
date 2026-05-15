import { InferenceClient }
  from "@huggingface/inference";

export const client =
  new InferenceClient(
    process.env.HF_TOKEN
  );