const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authenticateToken, addTenantFilter } = require('../middleware/auth');

// Protect all routes with authentication and add tenant filter
router.use(authenticateToken);
router.use(addTenantFilter);

router.get('/', accountController.getAll);
router.get('/:id', accountController.getById);
router.post('/', accountController.create);
router.put('/:id', accountController.update);
router.delete('/:id', accountController.delete);

module.exports = router;
