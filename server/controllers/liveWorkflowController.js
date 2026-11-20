const crypto = require('crypto');
const { TRACEABILITY_CHAIN } = require('../data/seedData');

// Initial default blank/in-progress workflow state
let currentWorkflowState = {
  activeStep: 1,
  completedSteps: [1], // Step 1 is ready
  data: {
    // Step 1: Farmer Registration
    farmer: {
      fullName: "Bhaben Saikia",
      fatherName: "Late Hemanta Saikia",
      mobile: "+91 94350 XXXXX",
      cluster: "Golaghat, Assam",
      village: "Dhekial Gaon, Mouza Dhekial",
      dagNumber: "Dag 182, Patta 44",
      estimatedTrees: 1420,
      consentGiven: true,
      applicationRef: "APP-FRM-2026-0104",
      status: "APPLICATION_SUBMITTED",
      submittedAt: "2026-04-10T09:30:00Z"
    },
    // Step 2: Field Agent Verification
    fieldVerification: {
      fieldAgentId: "FA-ARUP-BORAH",
      verified: true,
      homesteadGps: [26.5182, 93.9723],
      gpsAccuracyMeters: 2.1,
      deviceCaptured: "Rugged Android Tablet #AG-09",
      photoSha256: "7d4a2f8c5b9e1a3d6f0c8e2b4a7d9f1e3c5a7b9d0e2f4a6c8e0b2d4f6a8c0e2b",
      farmerIdIssued: "FRM-GH-0104",
      status: "GEO_PINNED_AND_VERIFIED",
      verifiedAt: "2026-04-12T11:15:00Z"
    },
    // Step 3: Plantation & Survey
    plantationSurvey: {
      plantationName: "Saikia Heritage Agarwood Holding",
      areaHectares: 2.45,
      boundaryVertices: 8,
      plantationId: "PLT-GH-0104-A",
      pologenBlock: {
        id: "PLG-GH-0104-B3",
        name: "Young Block 3 (< 7 yrs)",
        plantingYear: 2021,
        treeCount: 480,
        polygonAreaM2: 4850,
        status: "POLOGEN_REGISTERED"
      },
      matureTree: {
        id: "TRE-GH-0104-0089",
        tag: "AS-GLG-TAG-8941",
        ageYears: 11.4,
        girthCm: 68.5,
        heightM: 14.2,
        gps: [26.5204, 93.9743],
        tagPhotoSha256: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
        status: "MATURE_GEO_PINNED"
      }
    },
    // Step 4: Inoculation
    inoculation: {
      inoculationId: "INO-GH-2023-0182",
      targetTreeId: "TRE-GH-0104-0089",
      stage: "FIRST_INOCULATION",
      method: "Drilling & Fungal Suspension Induction",
      holesCount: 36,
      compound: "BioOud-Fungus Inoculant Strain ASM-4",
      compoundBatch: "BAT-BIO-2023-094",
      supplier: "Assam Agri-Tech BioSolutions Ltd, Jorhat",
      dateApplied: "2023-04-18",
      postOpPhotoSha256: "3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c",
      status: "INOCULATION_RECORDED"
    },
    // Step 5: Farmer Harvest Application
    harvestApplication: {
      applicationId: "HAU-2026-DFO-GLG-0041",
      farmerId: "FRM-GH-0104",
      selectedTrees: ["TRE-GH-0104-0089", "TRE-GH-0104-0090"],
      estimatedKg: 180.0,
      proposedDate: "2026-07-01",
      reason: "Post-3-year fungal induction resin maturity confirmed",
      status: "SUBMITTED_TO_DFO"
    },
    // Step 6: DFO & Maker-Checker Approval
    dfoSanction: {
      dfoDivision: "Golaghat Forest Division, Assam",
      dfoOfficer: "Sri K. N. Sarma, IFS",
      dfoOrderNumber: "FD/GLG/AGAR/FELLING/2026/918",
      sanctionedKg: 200.0,
      sanctionedTrees: 2,
      permitId: "PMT-DFO-GLG-918",
      signedOrderHash: "fa71b96a84d293f0b263b65ef319087cf29486c91a0c77607736f1b11cb3a890",
      makerCheckerVerifier: "Smt. P. Kalita (NERAMAC Senior Officer)",
      status: "DFO_APPROVED_AND_LOCKED"
    },
    // Step 7: Harvest Batch
    harvestBatch: {
      harvestBatchId: "HBT-GH-2026-0041",
      harvestDate: "2026-07-04",
      scaleModel: "Avery Digital Hook Scale SC-8812",
      grossWeightKg: 196.4,
      tareWeightKg: 11.0,
      netWeightKg: 185.4,
      bagCount: 6,
      stumpPhotoSha256: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
      status: "HARVEST_BATCH_CREATED"
    },
    // Step 8: Movement & Variance Check
    movement: {
      movementId: "MOV-2026-0182",
      sourceLocation: "Dhekial Farm Gate",
      destinationDepot: "NERAMAC Aggregation Depot #4, Dergaon",
      vehicleNumber: "AS-05-C-7281",
      transitPass: "TP/GLG/2026/0441",
      dispatchWeightKg: 185.4,
      receiptWeightKg: 184.8,
      varianceKg: -0.6,
      variancePct: -0.32,
      toleranceLimitPct: 1.5,
      tolerancePassed: true,
      status: "INTAKE_VERIFIED_WITHIN_TOLERANCE"
    },
    // Step 9: Depot Pooling
    aggregation: {
      aggregationId: "AGG-GH-2026-0018",
      depotName: "Depot #4, Golaghat",
      pooledBatchesCount: 3,
      totalWeightKg: 620.0,
      storageBin: "BIN-C-04",
      status: "POOLED_INTO_CONSIGNMENT"
    },
    // Step 10: CPC Distillation
    distillation: {
      distillationBatchId: "DST-CPC-2026-0007",
      cpcFacility: "CPC #1, Golaghat Industrial Estate",
      stillUnit: "Still #03 (Stainless Steel 316)",
      woodChargedKg: 620.0,
      pureOudOilProducedMl: 1480.0,
      oilRecoveryYieldPct: 0.239,
      hydrosolLiters: 18.5,
      spentBiomassKg: 570.2,
      moistureLossKg: 31.38,
      status: "DISTILLATION_COMPLETE_IN_QUARANTINE"
    },
    // Step 11: NABL Laboratory Release
    labTesting: {
      labTestId: "LAB-NER-2026-0089",
      labName: "NERAMAC Regional Testing Laboratory (NABL TC-8491)",
      testRef: "LAB/AGAR/QC/2026/0582",
      agarospirolPct: 18.42,
      jinkohEremolPct: 9.85,
      adulteration: "0.0% (NIL DETECTED)",
      citesSpeciesConfirmed: "Aquilaria malaccensis (100% Monospecific)",
      quarantineReleased: true,
      releaseOrderNo: "QC-REL-2026-0089",
      status: "RELEASED_FOR_BOTTLING"
    },
    // Step 12: Finished Packaging & QR
    packaging: {
      packId: "PCK-AS-2026-0042",
      productName: "Heritage Assam Oud Oil (Pure Aquilaria malaccensis)",
      volumeMl: 12.0,
      serialNumber: "0042 / 120",
      tamperSealId: "NER-TE-SEAL-88912",
      qrResolverUrl: "https://trace.neramac.gov.in/verify/PCK-AS-2026-0042",
      digitalSignatureSha256: "8f4c2e1a9b3d5c7e0f2a4b6c8d0e1f3a5b7c9d1e2f4a6c8e0b2d4f6a8c0e2b4a",
      status: "AUTHENTICATED_AND_LABELED"
    },
    // Step 13: Export Consignment
    exportShipment: {
      exportBatchId: "EBT-NER-2026-0012",
      exportLotId: "ELT-GAU-EXP-2026-003",
      consignee: "Al-Majed Fragrance Holdings W.L.L., Dubai, UAE",
      airwayBill: "AWB-618-9941-2041",
      customsShippingBill: "SB/GAU/AIR/2026/89410",
      citesPermitRef: "CITES/IND/AGAR/2026/NER-041",
      portOfDeparture: "Air Cargo Complex Guwahati (GAU)",
      portOfEntry: "Dubai International Airport (DXB)",
      status: "DISPATCHED_TO_INTERNATIONAL_BUYER"
    },
    // Step 14: Buyer Verification
    buyerVerification: {
      scannedAt: "2026-07-25T16:40:00Z",
      originConfirmed: "Golaghat Cluster, Assam, India",
      purityScore: "100% Pure Natural Assam Oud (18.42% Agarospirol)",
      citesCompliant: true,
      privacyMaskingApplied: true,
      status: "PROVENANCE_CONFIRMED"
    }
  }
};

// GET current workflow state
exports.getWorkflowState = (req, res) => {
  res.json({
    success: true,
    workflow: currentWorkflowState
  });
};

// Advance / update a specific step
exports.updateWorkflowStep = (req, res) => {
  const { stepNumber, stepData } = req.body;
  const step = parseInt(stepNumber);

  if (step >= 1 && step <= 14) {
    currentWorkflowState.activeStep = Math.min(step + 1, 14);
    if (!currentWorkflowState.completedSteps.includes(step)) {
      currentWorkflowState.completedSteps.push(step);
    }
    if (stepData) {
      // Merge stepData
      Object.assign(currentWorkflowState.data, stepData);
    }
  }

  res.json({
    success: true,
    workflow: currentWorkflowState,
    message: `Step ${step} executed successfully. Flow advanced to Step ${currentWorkflowState.activeStep}.`
  });
};

// Reset workflow to beginning
exports.resetWorkflow = (req, res) => {
  currentWorkflowState.activeStep = 1;
  currentWorkflowState.completedSteps = [1];
  res.json({
    success: true,
    workflow: currentWorkflowState,
    message: "Workflow reset to Step 1 (Farmer Registration)."
  });
};

// Pre-fill all steps for rapid demonstration
exports.loadCompleteDemonstration = (req, res) => {
  currentWorkflowState.activeStep = 14;
  currentWorkflowState.completedSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  res.json({
    success: true,
    workflow: currentWorkflowState,
    message: "Full end-to-end 14-stage workflow loaded and verified."
  });
};
