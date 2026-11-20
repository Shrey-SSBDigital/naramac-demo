const express = require('express');
const router = express.Router();
const { CLUSTERS, SAMPLE_PLANTATIONS, SYSTEM_EXCEPTIONS } = require('../data/seedData');

router.get('/overview', (req, res) => {
  res.json({
    success: true,
    nodalAgency: {
      name: "North Eastern Regional Agricultural Marketing Corporation Limited (NERAMAC)",
      type: "Government of India Enterprise under Ministry of DoNER",
      rfpReference: "NER/PROJECT/AGAR/RESEARCH AND DEVELOPMENT/06/31",
      headOffice: "Panjabari Road, Guwahati - 781022, Assam"
    },
    clusters: CLUSTERS,
    totalRegisteredFarmers: 948,
    totalPlantations: 1122,
    totalStandingTrees: 3296500,
    totalDistillationRuns: 64,
    totalCompletedPacks: 7680,
    activeExceptions: SYSTEM_EXCEPTIONS,
    plantationsList: SAMPLE_PLANTATIONS,
    gisMarkers: [
      { id: "M1", name: "Golaghat CPC #1", type: "CPC", coordinates: [26.5250, 93.9680], cluster: "Golaghat" },
      { id: "M2", name: "Dergaon Aggregation Depot #4", type: "AGGREGATION", coordinates: [26.5400, 93.9850], cluster: "Golaghat" },
      { id: "M3", name: "Saikia Heritage Plantation", type: "PLANTATION", coordinates: [26.5204, 93.9743], cluster: "Golaghat" },
      { id: "M4", name: "Kadamtala CPC #2", type: "CPC", coordinates: [24.4680, 92.2100], cluster: "Kadamtala" },
      { id: "M5", name: "Jampui Aggregation Depot #1", type: "AGGREGATION", coordinates: [24.4550, 92.1980], cluster: "Kadamtala" },
      { id: "M6", name: "Jampui Foothills Plantation", type: "PLANTATION", coordinates: [24.4630, 92.2070], cluster: "Kadamtala" }
    ]
  });
});

module.exports = router;
