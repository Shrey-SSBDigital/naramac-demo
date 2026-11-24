// Comprehensive Seed Data for NERAMAC Agarwood Supply Chain Traceability System (ASCTS)

const CLUSTERS = [
  {
    id: "GOLAGHAT_ASSAM",
    name: "Golaghat Cluster",
    district: "Golaghat",
    state: "Assam",
    center: [26.5182, 93.9723],
    baselineTarget: {
      registeredFarmers: 500,
      plantations: 600,
      matureTrees: 1700000,
      aggregationPoints: 10,
      cpcUnits: 10,
      fieldAgents: 20
    },
    currentStats: {
      activeFarmers: 486,
      activePlantations: 582,
      taggedTrees: 1684500,
      pologenBlocks: 340,
      harvestBatchesRecorded: 142,
      distillationRuns: 38
    }
  },
  {
    id: "KADAMTALA_TRIPURA",
    name: "Kadamtala Cluster",
    district: "North Tripura",
    state: "Tripura",
    center: [24.4612, 92.2045],
    baselineTarget: {
      registeredFarmers: 500,
      plantations: 600,
      matureTrees: 1700000,
      aggregationPoints: 10,
      cpcUnits: 10,
      fieldAgents: 20
    },
    currentStats: {
      activeFarmers: 462,
      activePlantations: 540,
      taggedTrees: 1612000,
      pologenBlocks: 310,
      harvestBatchesRecorded: 98,
      distillationRuns: 26
    }
  }
];

// Sample records across the 15-identity chain
const TRACEABILITY_CHAIN = {
  farmer: {
    id: "FRM-GH-0104",
    name: "Bhaben Saikia",
    fatherOrSpouse: "Late Hemanta Saikia",
    cluster: "Golaghat, Assam",
    village: "Dhekial Gaon, Golaghat",
    coordinates: [26.5182, 93.9723],
    geoAccuracy: "± 2.1 meters",
    onboardedDate: "2024-03-12",
    verifiedBy: "FA-ARUP-BORAH (NERAMAC Field Agent)",
    status: "ACTIVE",
    consentRecorded: true,
    producerGroup: "Golaghat Agar Growers Cooperative (GAGC)",
    photoHash: "7d4a2f8c5b9e1a3d6f0c8e2b4a7d9f1e3c5a7b9d0e2f4a6c8e0b2d4f6a8c0e2b"
  },
  plantation: {
    id: "PLT-GH-0104-A",
    farmerId: "FRM-GH-0104",
    name: "Saikia Heritage Agarwood Holding",
    location: "Plot No. 44, Dag 182, Dhekial Mouza",
    areaHectares: 2.45,
    tenureType: "Periodic Patta (Verified Land Title)",
    species: "Aquilaria malaccensis (Syn. Aquilaria agallocha)",
    boundaryVertices: 8,
    boundaryCoordinates: [
      [26.5195, 93.9715],
      [26.5210, 93.9730],
      [26.5205, 93.9755],
      [26.5188, 93.9750],
      [26.5180, 93.9732],
      [26.5195, 93.9715]
    ],
    totalStandingTrees: 1420,
    matureTreesCount: 940,
    youngPolygonTrees: 480,
    verificationStatus: "VERIFIED",
    verifiedByOfficer: "NO-NER-GUW-04 (NERAMAC Nodal Officer)"
  },
  pologen: {
    id: "PLG-GH-0104-B3",
    plantationId: "PLT-GH-0104-A",
    blockName: "Block 3 (Nursery Plantation 2021)",
    plantingYear: 2021,
    plantingAgeYears: 5.2,
    treeCount: 480,
    species: "Aquilaria malaccensis",
    plantingSource: "RFRI (Rain Forest Research Institute) Certified Nursery Jorhat",
    polygonAreaSqMeters: 4850,
    boundaryVerticesCount: 6,
    overlapStatus: "NO_OVERLAP_CLEARED",
    maturityStatus: "GROWING (< 7 YRS)",
    conversionTaskGenerated: false
  },
  treeMatured: {
    id: "TRE-GH-0104-0089",
    plantationId: "PLT-GH-0104-A",
    treeTagNumber: "AS-GLG-TAG-8941",
    tagType: "RFID + Barcoded High-UV Polycarbonate Seal",
    plantingYear: 2015,
    ageYears: 11.4,
    girthAtBreastHeightCm: 68.5,
    heightMeters: 14.2,
    coordinates: [26.5204, 93.9743],
    geoAccuracy: "± 1.4 meters",
    species: "Aquilaria malaccensis",
    speciesValidationBasis: "RFRI Botanical Anatomy Certificate #RFRI-BA-2023-11",
    status: "HARVESTED",
    tagPhotoHash: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b"
  },
  treeCompanion: {
    id: "TRE-GH-0104-0090",
    plantationId: "PLT-GH-0104-A",
    treeTagNumber: "AS-GLG-TAG-8942",
    tagType: "RFID + Barcoded High-UV Polycarbonate Seal",
    plantingYear: 2015,
    ageYears: 11.4,
    girthAtBreastHeightCm: 71.0,
    heightMeters: 15.0,
    coordinates: [26.5206, 93.9745],
    geoAccuracy: "± 1.2 meters",
    species: "Aquilaria malaccensis",
    status: "HARVESTED"
  },
  inoculation: {
    id: "INO-GH-2023-0182",
    treeIds: ["TRE-GH-0104-0089", "TRE-GH-0104-0090"],
    stage: "FIRST_INOCULATION",
    sequenceNumber: 1,
    method: "Drilling & Fungal Suspension Induction",
    methodParameters: {
      holesCount: 36,
      depthMm: 65,
      diameterMm: 12,
      spiralSpacingCm: 15,
      heightFromGroundCm: 45
    },
    compoundName: "BioOud-Fungus Inoculant Strain ASM-4",
    compoundType: "Endophytic Fungal Consortium (Fusarium & Acremonium)",
    supplier: "Assam Agri-Tech BioSolutions Ltd, Jorhat",
    supplierLicenceNo: "AGR/BIO/AS-2021/88",
    compoundBatchNo: "BAT-BIO-2023-094",
    manufacturingDate: "2023-02-10",
    expiryDate: "2024-02-10",
    quantityAppliedMlPerTree: 180,
    inoculationDate: "2023-04-18",
    fieldAgent: "FA-ARUP-BORAH",
    geoCoordinate: [26.5205, 93.9744],
    postInoculationPhotoHash: "3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c",
    expectedMaturationDate: "2026-04-18",
    status: "MATURED_AND_HARVESTED"
  },
  harvestAuthorisation: {
    id: "HAU-2026-DFO-GLG-0041",
    farmerId: "FRM-GH-0104",
    plantationId: "PLT-GH-0104-A",
    requestedTrees: ["TRE-GH-0104-0089", "TRE-GH-0104-0090"],
    applicationDate: "2026-06-10",
    estimatedWoodYieldKg: 180.0,
    reason: "Resin saturation complete post-3-year fungal induction; commercial harvest for CPC distillation",
    neramacVerifyingOfficer: "NO-NER-GUW-04",
    neramacVerificationDate: "2026-06-14",
    neramacVerificationSummary: "Trees age verified 11.4 yrs (> 7 yrs threshold). Inoculation history complete. No outstanding overlapping quota.",
    dfoDivision: "Golaghat Forest Division, Assam",
    dfoOfficialName: "Sri K. N. Sarma, IFS (Divisional Forest Officer)",
    dfoOrderNumber: "FD/GLG/AGAR/FELLING/2026/918",
    dfoDecisionDate: "2026-06-22",
    decision: "APPROVED",
    permittedTreesCount: 2,
    permittedQuantityKg: 200.0,
    validityStartDate: "2026-06-25",
    validityEndDate: "2026-08-25",
    signedOrderDocumentName: "DFO_Order_918_BhabenSaikia_Signed.pdf",
    signedOrderDocHash: "fa71b96a84d293f0b263b65ef319087cf29486c91a0c77607736f1b11cb3a890",
    makerCheckerOfficer: "Smt. P. Kalita (Checker - Senior Divisional Officer)",
    makerCheckerStatus: "VERIFIED_AND_LOCKED"
  },
  harvestBatch: {
    id: "HBT-GH-2026-0041",
    harvestAuthorisationId: "HAU-2026-DFO-GLG-0041",
    sourceTrees: ["TRE-GH-0104-0089", "TRE-GH-0104-0090"],
    harvestDate: "2026-07-04T08:30:00Z",
    fieldAgent: "FA-ARUP-BORAH",
    harvestLocation: [26.5204, 93.9743],
    fellingMethod: "Controlled Chainsaw & Manual Debarking",
    weighingDevice: "Avery Weigh-Tronix Mobile Digital Hook Scale #SC-8812",
    grossWeightKg: 196.4,
    tareWeightKg: 11.0,
    netWeightKg: 185.4,
    bagCount: 6,
    initialGradeAssessment: "High-Resin Heartwood (Grade 1 & Distillation Grade)",
    stumpPhotoHash: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
    weighmentPhotoHash: "f0e1d2c3b4a5968778695a4b3c2d1e0ff0e1d2c3b4a5968778695a4b3c2d1e0f",
    growerAcknowledgment: "Signed by Bhaben Saikia (Biometric Acknowledged)",
    status: "DISPATCHED_TO_AGGREGATOR"
  },
  movementFarmToAggregator: {
    id: "MOV-2026-0182",
    legType: "FARM_TO_AGGREGATION",
    sourceBatchId: "HBT-GH-2026-0041",
    sourceLocation: "Dhekial Gaon Plantation Gate, Golaghat",
    dispatchDateTime: "2026-07-04T11:00:00Z",
    dispatchWeightKg: 185.4,
    destinationFacility: "NERAMAC Aggregation Depot #4, Dergaon Road, Golaghat",
    transporterName: "North East Agro Logistics",
    vehicleNumber: "AS-05-C-7281",
    driverName: "Ranjit Das",
    transitPassPermitNo: "TP/GLG/2026/0441",
    receiptDateTime: "2026-07-04T14:15:00Z",
    receiptWeightKg: 184.8,
    weightVarianceKg: -0.6,
    variancePercentage: -0.32,
    toleranceLimitPercentage: 1.5,
    toleranceCheck: "PASSED (Variance 0.32% ≤ 1.5%)",
    receivingAggregator: "AG-DEPO-04-OPERATOR (B. Gogoi)",
    status: "COMPLETED"
  },
  aggregationConsignment: {
    id: "AGG-GH-2026-0018",
    aggregationPoint: "NERAMAC Aggregation Depot #4, Golaghat",
    cluster: "Golaghat, Assam",
    creationDate: "2026-07-06",
    contributingHarvestBatches: [
      { batchId: "HBT-GH-2026-0041", farmer: "Bhaben Saikia", contributedWeightKg: 184.8 },
      { batchId: "HBT-GH-2026-0039", farmer: "Deben Dutta", contributedWeightKg: 215.2 },
      { batchId: "HBT-GH-2026-0040", farmer: "Mridul Gogoi", contributedWeightKg: 220.0 }
    ],
    totalConsignmentWeightKg: 620.0,
    woodCategory: "Resinous Heartwood Chipping Grade",
    storageWarehouseBin: "BIN-C-04 (Climate Controlled 22°C)",
    status: "TRANSFERRED_TO_CPC"
  },
  distillationBatch: {
    id: "DST-CPC-2026-0007",
    cpcFacility: "NERAMAC Common Processing Centre #1, Golaghat Industrial Estate",
    aggregationConsignmentId: "AGG-GH-2026-0018",
    distillationMethod: "Steam & Hydro-Distillation (Stainless Steel 316 Still)",
    stillUnitId: "STILL-NER-03",
    distillationStartDate: "2026-07-08T06:00:00Z",
    distillationEndDate: "2026-07-12T18:00:00Z",
    totalRunHours: 108,
    operatorName: "Manash Barua (Master Distiller)",
    // Material Balance
    materialBalance: {
      rawWoodChargedKg: 620.0,
      pureOudOilProducedMl: 1480.0, // ~1,424 grams (Yield ~0.239%)
      hydrosolDistillationWaterLiters: 18.5,
      spentBiomassResidueKg: 570.2, // For agarwood incense / bakhoor
      unrecoverableMoistureLossKg: 31.38,
      yieldPercentage: 0.239,
      reconciliationStatus: "BALANCED (Within standard deviation ±0.05%)"
    },
    quarantineStatus: "RELEASED_POST_LAB_CLEARANCE"
  },
  labTest: {
    id: "LAB-NER-2026-0089",
    sampleDrawnFromBatchId: "DST-CPC-2026-0007",
    laboratoryName: "NERAMAC Regional Quality Testing Laboratory (NABL Accredited TC-8491)",
    testingOfficer: "Dr. Ananya Roy, PhD (Chief Phytochemist)",
    sampleDrawnDate: "2026-07-13",
    testReportReference: "LAB/AGAR/QC/2026/0582",
    testMethod: "GC-MS (Gas Chromatography - Mass Spectrometry) & Physico-Chemical Analysis",
    parametersTested: [
      { parameter: "Species Confirmation", result: "Aquilaria malaccensis (100% Monospecific)", specification: "Aquilaria malaccensis Lam.", status: "PASS" },
      { parameter: "Agarospirol Content", result: "18.42 %", specification: "Min 12.0 %", status: "PASS" },
      { parameter: "Jinkoh-eremol Content", result: "9.85 %", specification: "Min 6.0 %", status: "PASS" },
      { parameter: "Specific Gravity at 25°C", result: "0.9624", specification: "0.9500 - 0.9850", status: "PASS" },
      { parameter: "Refractive Index at 20°C", result: "1.5082", specification: "1.5020 - 1.5140", status: "PASS" },
      { parameter: "Optical Rotation", result: "+14.2°", specification: "+8.0° to +18.0°", status: "PASS" },
      { parameter: "Adulteration Screening (DOP, Mineral Oils, Synthetics)", result: "NIL DETECTED", specification: "Zero Tolerance (0%)", status: "PASS" }
    ],
    overallConclusion: "CONFORMS TO PURE NATURAL ASSAM OUD OIL SPECIFICATION (GRADE A+)",
    citesExportClearanceReady: true,
    releaseOrderNumber: "QC-REL-2026-0089",
    releaseDate: "2026-07-15",
    status: "RELEASED"
  },
  permit: {
    id: "PMT-CITES-2026-0041",
    permitType: "CITES Appendix II Export Clearance & Legal Sourcing Certificate",
    issuingAuthority: "Ministry of Environment, Forest and Climate Change (MoEFCC) / WCCB",
    referenceNumber: "CITES/IND/AGAR/2026/NER-041",
    holder: "North Eastern Regional Agricultural Marketing Corp Ltd (NERAMAC)",
    effectiveDate: "2026-07-16",
    expiryDate: "2027-01-15",
    permittedScope: "Up to 5.0 Litres Aquilaria malaccensis Pure Oil for International Consignment",
    status: "ACTIVE_VALID"
  },
  pack: {
    id: "PCK-AS-2026-0042",
    distillationBatchId: "DST-CPC-2026-0007",
    productName: "Heritage Assam Oud Oil (Pure Aquilaria malaccensis)",
    packType: "12 ml Crystal Flacon in Lacquered Wooden Gift Box",
    volumeMl: 12.0,
    packagingDate: "2026-07-18",
    facility: "NERAMAC Packaging & Serialization Unit, Guwahati",
    packagingOperator: "B. K. Deka",
    unitSerialNumber: "0042 / 120",
    qrCodeResolverUrl: "https://trace.neramac.gov.in/verify/PCK-AS-2026-0042",
    cryptographicDigitalSignature: "SHA256:8f4c2e1a9b3d5c7e0f2a4b6c8d0e1f3a5b7c9d1e2f4a6c8e0b2d4f6a8c0e2b4a",
    tamperEvidentSealId: "NER-TE-SEAL-88912",
    buyerFacingMaskingApplied: true, // Hides farmer GPS, private telephone, commercial factory costs
    status: "PACKED_AND_AUTHENTICATED"
  },
  exportBatch: {
    id: "EBT-NER-2026-0012",
    batchName: "Middle East Luxury Perfumery Export Batch #12",
    assembledDate: "2026-07-20",
    packCount: 120,
    totalVolumeLiters: 1.44,
    consignee: "Al-Majed Fragrance Holdings W.L.L., Dubai, UAE",
    destinationCountry: "United Arab Emirates",
    status: "ASSEMBLED_FOR_SHIPMENT"
  },
  exportLot: {
    id: "ELT-GAU-EXP-2026-003",
    exportBatchId: "EBT-NER-2026-0012",
    terminalDispatchDate: "2026-07-22",
    portOfDeparture: "Air Cargo Complex, Lokpriya Gopinath Bordoloi International Airport, Guwahati (GAU)",
    portOfEntry: "Dubai International Airport Cargo Terminal (DXB)",
    customsShippingBillNo: "SB/GAU/AIR/2026/89410",
    billOfLadingAirwayBill: "AWB-618-9941-2041",
    statutoryClearanceRefs: ["CITES/IND/AGAR/2026/NER-041", "DGFT/EXP/AGAR/2026/182"],
    consigneeBuyerName: "Al-Majed Fragrance Holdings W.L.L.",
    deliveryStatus: "DELIVERED_AND_VERIFIED",
    buyerVerificationTimestamp: "2026-07-25T16:40:00Z"
  }
};

// Additional sample inventory & transactions for rich demo exploration
const SAMPLE_PLANTATIONS = [
  {
    id: "PLT-GH-0104-A",
    farmer: "Bhaben Saikia",
    cluster: "Golaghat, Assam",
    name: "Saikia Heritage Agarwood Holding",
    areaHectares: 2.45,
    standingTrees: 1420,
    matureTrees: 940,
    youngTrees: 480,
    species: "Aquilaria malaccensis",
    status: "ACTIVE"
  },
  {
    id: "PLT-GH-0105-B",
    farmer: "Deben Dutta",
    cluster: "Golaghat, Assam",
    name: "Kaziranga Buffer Agroforestry Plantation",
    areaHectares: 3.10,
    standingTrees: 1850,
    matureTrees: 1210,
    youngTrees: 640,
    species: "Aquilaria malaccensis",
    status: "ACTIVE"
  },
  {
    id: "PLT-KT-0219-A",
    farmer: "Pradip Debbarma",
    cluster: "Kadamtala, Tripura",
    name: "Jampui Foothills Agar Grove",
    areaHectares: 1.95,
    standingTrees: 1180,
    matureTrees: 790,
    youngTrees: 390,
    species: "Aquilaria malaccensis",
    status: "ACTIVE"
  },
  {
    id: "PLT-KT-0220-B",
    farmer: "Subrata Nath",
    cluster: "Kadamtala, Tripura",
    name: "Dharmanagar Valley Agar Farm",
    areaHectares: 2.80,
    standingTrees: 1650,
    matureTrees: 1100,
    youngTrees: 550,
    species: "Aquilaria malaccensis",
    status: "ACTIVE"
  }
];

// System exception logs (as required in Section 3.3 Exception Handling)
const SYSTEM_EXCEPTIONS = [
  {
    id: "EXP-2026-0012",
    type: "AGE_RULE_MATURITY_TRIGGER",
    severity: "INFO",
    subjectId: "PLG-KT-0219-B1",
    cluster: "Kadamtala, Tripura",
    description: "Planting Block 1 reached 7.0 years maturity threshold. 45 trees require individual tagging and geo-pinning.",
    status: "PENDING_FIELD_ACTION",
    assignedTo: "FA-TRIPURA-GROUND-02",
    date: "2026-11-12"
  },
  {
    id: "EXP-2026-0008",
    type: "WEIGHT_VARIANCE_WARNING",
    severity: "MEDIUM",
    subjectId: "MOV-2026-0179",
    cluster: "Golaghat, Assam",
    description: "Dispatch weight 210.0 kg vs Receipt weight 206.5 kg (Variance -1.66% exceeded 1.5% tolerance). Reason: Sun drying moisture loss confirmed.",
    status: "RESOLVED_WITH_APPROVAL",
    resolvedBy: "NO-NER-GUW-04 (NERAMAC Officer)",
    date: "2026-10-28"
  },
  {
    id: "EXP-2026-0004",
    type: "POLYGON_OVERLAP_RESOLVED",
    severity: "HIGH",
    subjectId: "PLG-GH-0092-B2",
    cluster: "Golaghat, Assam",
    description: "Spatial overlap of 42 sq.m detected with reserve forest buffer. Ground boundary re-walked by GIS specialist and re-approved.",
    status: "RESOLVED",
    resolvedBy: "GIS-SPECIALIST-NERAMAC",
    date: "2026-09-15"
  }
];

module.exports = {
  CLUSTERS,
  TRACEABILITY_CHAIN,
  SAMPLE_PLANTATIONS,
  SYSTEM_EXCEPTIONS
};
