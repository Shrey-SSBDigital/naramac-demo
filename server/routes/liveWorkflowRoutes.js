const express = require('express');
const router = express.Router();
const controller = require('../controllers/liveWorkflowController');

router.get('/state', controller.getWorkflowState);
router.post('/advance', controller.updateWorkflowStep);
router.post('/reset', controller.resetWorkflow);
router.post('/load-sample', controller.loadCompleteDemonstration);

module.exports = router;
