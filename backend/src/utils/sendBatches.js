export function chunkQuestions(questions, batchSize = 5) {
  const chunks = [];

  for (let i = 0; i < questions.length; i += batchSize) {
    chunks.push(questions.slice(i, i + batchSize));
  }

  return chunks;
}