const express = require('express');
const router = express.Router();
const payableController = require('../controllers/payableController');
const { authenticateToken, addTenantFilter } = require('../middleware/auth');

router.use(authenticateToken);
router.use(addTenantFilter);

router.get('/', payableController.getAll);
router.post('/', payableController.create);
router.put('/:id', payableController.update);
router.delete('/:id', payableController.remove);
router.post('/:id/pay', payableController.pay);

module.exports = router;
