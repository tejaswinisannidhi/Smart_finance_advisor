// ============================================================
// routes/aiRoutes.js - AI Advisor Routes
// ============================================================

const express = require('express');
const router = express.Router();

const { getAdvice, getSavingsPrediction } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// All AI routes require authentication
router.use(protect);

// POST /api/ai/advice   - Get AI financial advice
router.post('/advice', getAdvice);

// GET  /api/ai/predict  - Get savings prediction & forecast
router.get('/predict', getSavingsPrediction);

module.exports = router;
