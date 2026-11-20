const express = require('express');
const router = express.Router();
const controller = require('../controllers/workflowController');

router.post('/farmer/apply-harvest', controller.farmerApplyHarvest);
router.post('/field-agent/log-inoculation', controller.fieldAgentLogInoculation);
router.post('/dfo/authorize-harvest', controller.dfoAuthorizeHarvest);
router.post('/aggregator/check-tolerance', controller.aggregatorCheckTolerance);
router.post('/cpc/distillation-run', controller.cpcDistillationRun);
router.post('/lab/quality-release', controller.labQualityRelease);
router.post('/packaging/issue-qr', controller.packagingIssueQR);

module.exports = router;
