const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { authenticateToken, addTenantFilter } = require('../middleware/auth');

// Protect all routes
router.use(authenticateToken);
router.use(addTenantFilter);

router.get('/', budgetController.getAll);
router.get('/:id', budgetController.getById);
router.post('/', budgetController.create);
router.put('/:id', budgetController.update);
router.delete('/:id', budgetController.delete);

module.exports = router;
