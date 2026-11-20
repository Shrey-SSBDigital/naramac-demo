const express = require('express');
const router = express.Router();
const controller = require('../controllers/qrController');

router.get('/verify/:packId', controller.verifyPackQR);
router.get('/generate/:packId', controller.verifyPackQR);

module.exports = router;
