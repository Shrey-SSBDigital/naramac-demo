const express = require('express');
const router = express.Router();
const { MANDATORY_IDENTIFIERS } = require('../data/stakeholdersData');
const { TRACEABILITY_CHAIN } = require('../data/seedData');

// GET all 15 identifier schemas with active registry counts
router.get('/', (req, res) => {
  const c = TRACEABILITY_CHAIN;

  const identifiersWithInstances = MANDATORY_IDENTIFIERS.map(item => {
    let sampleInstanceId = null;
    let sampleStatus = "ACTIVE";

    switch(item.code) {
      case "FRM": sampleInstanceId = c.farmer.id; break;
      case "PLT": sampleInstanceId = c.plantation.id; break;
      case "PLG": sampleInstanceId = c.pologen.id; break;
      case "TRE": sampleInstanceId = c.treeMatured.id; break;
      case "INO": sampleInstanceId = c.inoculation.id; break;
      case "HAU": sampleInstanceId = c.harvestAuthorisation.id; break;
      case "HBT": sampleInstanceId = c.harvestBatch.id; break;
      case "MOV": sampleInstanceId = c.movementFarmToAggregator.id; break;
      case "AGG": sampleInstanceId = c.aggregationConsignment.id; break;
      case "DST": sampleInstanceId = c.distillationBatch.id; break;
      case "LAB": sampleInstanceId = c.labTest.id; break;
      case "PMT": sampleInstanceId = c.permit.id; break;
      case "PCK": sampleInstanceId = c.pack.id; break;
      case "EBT": sampleInstanceId = c.exportBatch.id; break;
      case "ELT": sampleInstanceId = c.exportLot.id; break;
      default: sampleInstanceId = "N/A";
    }

    return {
      ...item,
      activeCount: Math.floor(Math.random() * 50) + 12,
      sampleInstanceId,
      sampleStatus
    };
  });

  res.json({
    success: true,
    totalMandatoryCount: 15,
    mandatoryIdentifiers: identifiersWithInstances
  });
});

module.exports = router;
