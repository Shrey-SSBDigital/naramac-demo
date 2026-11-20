const express = require('express');
const router = express.Router();
const controller = require('../controllers/traceabilityController');

router.get('/chain', controller.getFullChain);
router.get('/lookup/:queryId', controller.lookupIdentifier);

module.exports = router;
