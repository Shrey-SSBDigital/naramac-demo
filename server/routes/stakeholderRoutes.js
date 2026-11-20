const express = require('express');
const router = express.Router();
const controller = require('../controllers/stakeholderController');

router.get('/', controller.getAllStakeholders);
router.get('/flow/overview', controller.getSupplyChainFlow);
router.get('/:roleId', controller.getStakeholderById);

module.exports = router;
