const express = require('express');
const db = require('../db');
const llmService = require('../services/llm');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to authenticate
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing authorization headers' });
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/generate', authenticate, async (req, res) => {
  const { language, topic } = req.body;
  if (!language || !topic) return res.status(400).json({ error: 'Language and topic are required' });

  try {
    const questions = await llmService.generateAssessment(language, topic);
    
    // Save generated assessment to DB
    const questionsJson = JSON.stringify(questions);
    db.run(
      'INSERT INTO assessments (user_id, language, topic, questions) VALUES (?, ?, ?, ?)',
      [req.user.userId, language, topic, questionsJson],
      function(err) {
        if (err) return res.status(500).json({ error: 'Database error while saving assessment' });
        res.json({ id: this.lastID, questions });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/evaluate/:id', authenticate, async (req, res) => {
  const { answers } = req.body;
  const assessmentId = req.params.id;

  db.get('SELECT * FROM assessments WHERE id = ? AND user_id = ?', [assessmentId, req.user.userId], async (err, assessment) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    
    try {
      const questions = JSON.parse(assessment.questions);
      const evaluation = await llmService.evaluateAnswers(assessment.language, assessment.topic, questions, answers);
      
      const answersJson = JSON.stringify(answers);
      const evalJson = JSON.stringify(evaluation);
      
      db.run(
        'UPDATE assessments SET answers = ?, evaluation = ? WHERE id = ?',
        [answersJson, evalJson, assessmentId],
        (updateErr) => {
          if (updateErr) return res.status(500).json({ error: 'Database error while updating evaluation' });
          res.json({ evaluation });
        }
      );
    } catch (llmErr) {
      res.status(500).json({ error: llmErr.message });
    }
  });
});

router.get('/report/:id', authenticate, (req, res) => {
  const assessmentId = req.params.id;
  db.get('SELECT * FROM assessments WHERE id = ? AND user_id = ?', [assessmentId, req.user.userId], (err, assessment) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    
    res.json({
      language: assessment.language,
      topic: assessment.topic,
      questions: JSON.parse(assessment.questions),
      answers: assessment.answers ? JSON.parse(assessment.answers) : null,
      evaluation: assessment.evaluation ? JSON.parse(assessment.evaluation) : null
    });
  });
});

module.exports = router;
