const express = require('express');
const router = express.Router();
const gisController = require('../controllers/gisController');

router.get('/registry', gisController.getRegistry);
router.post('/plantations', gisController.createPlantation);
router.post('/pologens', gisController.createPologen);
router.post('/trees', gisController.createTree);
router.get('/export', gisController.exportGeoJSON);
router.post('/reset', gisController.resetRegistry);

module.exports = router;
