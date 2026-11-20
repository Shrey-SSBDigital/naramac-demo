const { TRACEABILITY_CHAIN } = require('../data/seedData');

exports.verifyPackQR = (req, res) => {
  try {
    const packId = req.params.packId;
    const viewType = (req.query.view || 'public').toLowerCase();
    const c = TRACEABILITY_CHAIN;

    if (viewType === 'officer') {
      // Unmasked officer inspection view
      return res.json({
        success: true,
        view: 'OFFICER_FULL_AUDIT',
        packId: c.pack.id,
        farmer: c.farmer,
        plantation: c.plantation,
        tree: c.treeMatured,
        inoculation: c.inoculation,
        dfoAuthorisation: c.harvestAuthorisation,
        harvestBatch: c.harvestBatch,
        aggregation: c.aggregationConsignment,
        distillation: c.distillationBatch,
        labTest: c.labTest,
        permit: c.permit,
        exportLot: c.exportLot
      });
    }

    // Public buyer view with DPDP Act masking
    res.json({
      success: true,
      view: 'PUBLIC_BUYER_PROVENANCE',
      packId: c.pack.id,
      product: c.pack.productName,
      volume: `${c.pack.volumeMl} ml`,
      origin: "Golaghat Cluster, Assam, India (Protected Geographical Indication)",
      species: "Aquilaria malaccensis Lam. (CITES Certified)",
      laboratoryResult: {
        purity: "100% Pure Natural Assam Oud",
        agarospirolContent: "18.42% (Grade A+)",
        adulteration: "0% (Nil detected)"
      },
      fellingLegalClearance: "Divisional Forest Officer Order No. FD/GLG/2026/918",
      citesPermitRef: c.permit.referenceNumber,
      nodalAuthority: "NERAMAC Ltd, Govt of India Enterprise",
      privacyNotice: "Grower personal telephone, residential cadastral survey numbers, and commercial factory costings masked per Digital Personal Data Protection Act, 2023."
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
