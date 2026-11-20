const { TRACEABILITY_CHAIN } = require('../data/seedData');

exports.getFullChain = (req, res) => {
  try {
    res.json({
      success: true,
      chain: TRACEABILITY_CHAIN
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.lookupIdentifier = (req, res) => {
  try {
    const query = req.params.queryId.trim();
    const c = TRACEABILITY_CHAIN;

    const timeline = [
      { step: 1, type: "FRM", title: "Farmer / Grower", id: c.farmer.id, name: c.farmer.name, location: c.farmer.village },
      { step: 2, type: "PLT", title: "Plantation Holding", id: c.plantation.id, name: c.plantation.name, location: `${c.plantation.areaHectares} Ha` },
      { step: 3, type: "PLG", title: "POLOGEN (< 7 yrs)", id: c.pologen.id, name: c.pologen.blockName, location: `${c.pologen.treeCount} trees` },
      { step: 4, type: "TRE", title: "Mature Tree (≥ 7 yrs)", id: c.treeMatured.id, name: c.treeMatured.treeTagNumber, location: "26.5204 N, 93.9743 E" },
      { step: 5, type: "INO", title: "Inoculation Event", id: c.inoculation.id, name: c.inoculation.method, location: c.inoculation.compoundName },
      { step: 6, type: "HAU", title: "DFO Harvest Authorisation", id: c.harvestAuthorisation.id, name: c.harvestAuthorisation.dfoOrderNumber, location: c.harvestAuthorisation.dfoDivision },
      { step: 7, type: "HBT", title: "Harvest Batch", id: c.harvestBatch.id, name: `${c.harvestBatch.netWeightKg} kg`, location: "Field Harvested" },
      { step: 8, type: "MOV", title: "Movement Farm-to-Depot", id: c.movementFarmToAggregator.id, name: "Variance: -0.32%", location: "Vehicle AS-05-C-7281" },
      { step: 9, type: "AGG", title: "Aggregation Consignment", id: c.aggregationConsignment.id, name: `${c.aggregationConsignment.totalConsignmentWeightKg} kg`, location: c.aggregationConsignment.aggregationPoint },
      { step: 10, type: "DST", title: "Distillation Batch", id: c.distillationBatch.id, name: "1,480 ml Pure Oud", location: c.distillationBatch.cpcFacility },
      { step: 11, type: "LAB", title: "Laboratory GC-MS Test", id: c.labTest.id, name: "100% Monospecific", location: "NABL Accredited" },
      { step: 12, type: "PMT", title: "Statutory CITES Permit", id: c.permit.id, name: c.permit.referenceNumber, location: "Appendix II" },
      { step: 13, type: "PCK", title: "Pack & Serialized QR", id: c.pack.id, name: "12ml Crystal Flacon", location: c.pack.qrCodeResolverUrl },
      { step: 14, type: "EBT", title: "Export Commercial Batch", id: c.exportBatch.id, name: "120 Units (1.44 L)", location: "Dubai Consignment" },
      { step: 15, type: "ELT", title: "Export Lot Shipment", id: c.exportLot.id, name: c.exportLot.customsShippingBillNo, location: "Guwahati -> Dubai" }
    ];

    const matchIndex = timeline.findIndex(t => 
      t.id.toLowerCase() === query.toLowerCase() || 
      t.type.toLowerCase() === query.toLowerCase()
    );

    const activeNode = matchIndex >= 0 ? timeline[matchIndex] : timeline[12]; // default to Pack

    res.json({
      success: true,
      query,
      activeNode,
      backwardChain: matchIndex > 0 ? timeline.slice(0, matchIndex) : [],
      forwardChain: matchIndex >= 0 && matchIndex < timeline.length - 1 ? timeline.slice(matchIndex + 1) : [],
      fullChain: timeline
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
