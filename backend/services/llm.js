const axios = require('axios');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

async function generateAssessment(language, topic) {
  const prompt = `You are an expert interviewer for software engineering. Generate an assessment for a candidate selecting to be interviewed on the language: "${language}" and topic: "${topic}".
  The assessment MUST contain exactly 8 questions: exactly 5 Multiple Choice Questions (MCQs) and exactly 3 descriptive questions.
  Respond ONLY with a valid JSON array of objects. No other text. Use this exact structure:
  [
    { "id": 1, "type": "mcq", "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A" },
    ...,
    { "id": 6, "type": "descriptive", "question": "..." }
  ]`;

  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false
    });
    
    // Attempt to parse the response
    const questions = JSON.parse(response.data.response);
    return questions;
  } catch (error) {
    console.error("Error communicating with Ollama:", error);
    throw new Error("Failed to generate assessment questions via LLM.");
  }
}

async function evaluateAnswers(language, topic, questions, answers) {
  const prompt = `You are an expert technical interviewer. Evaluate the candidate's answers based on the topic: "${topic}" in "${language}".
  Here are the questions and their answers:
  ${questions.map((q, i) => {
    let qText = `Q${i + 1} (${q.type}): ${q.question}`;
    if (q.type === 'mcq') {
       qText += `\nOptions: ${q.options.join(', ')}\nCorrect Answer: ${q.correctAnswer}`;
    }
    return `${qText}\nCandidate's Answer: ${answers[q.id] || "No answer provided"}`;
  }).join('\n\n')}

  Evaluate each answer. Respond ONLY with a valid JSON object matching exactly this structure:
  {
    "score": <number out of 100>,
    "feedback": "<string: general feedback on the whole assessment>",
    "improvements": ["<bullet point 1>", "<bullet point 2>"]
  }
  No other text.`;

  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false
    });
    
    const evaluation = JSON.parse(response.data.response);
    return evaluation;
  } catch (error) {
    console.error("Error communicating with Ollama in evaluate:", error);
    throw new Error("Failed to evaluate assessment via LLM.");
  }
}

module.exports = {
  generateAssessment,
  evaluateAnswers
};
