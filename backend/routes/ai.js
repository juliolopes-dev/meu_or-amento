const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

// Protect all routes
router.use(authenticateToken);

router.post('/analyze', aiController.analyze);

module.exports = router;
