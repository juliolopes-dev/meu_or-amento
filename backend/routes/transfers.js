const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const { authenticateToken, addTenantFilter } = require('../middleware/auth');

// Protect all routes with authentication and add tenant filter
router.use(authenticateToken);
router.use(addTenantFilter);

router.get('/', transferController.getAll);
router.get('/:id', transferController.getById);
router.post('/', transferController.create);
router.delete('/:id', transferController.delete);

module.exports = router;
