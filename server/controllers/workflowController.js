const crypto = require('crypto');

// 1. Farmer Action: Submit Harvest Authorisation Application
exports.farmerApplyHarvest = (req, res) => {
  const { farmerId = "FRM-GH-0104", treeCount = 2, estimatedKg = 180 } = req.body;
  const appId = `HAU-2026-APP-${Math.floor(1000 + Math.random() * 9000)}`;

  res.json({
    success: true,
    applicationId: appId,
    farmerId,
    treeCount,
    estimatedKg,
    status: "SUBMITTED_TO_NERAMAC",
    nextStep: "NERAMAC Verifying Officer will check inoculation history and forward to DFO",
    timestamp: new Date().toISOString()
  });
};

// 2. Field Agent Action: Log Inoculation with SHA-256 Photo Hash
exports.fieldAgentLogInoculation = (req, res) => {
  const { treeId = "TRE-GH-0104-0089", method = "Drilling & Fungal Suspension", compound = "BioOud Strain ASM-4" } = req.body;
  const inId = `INO-GH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const fakePhotoData = `INOCULATION-PHOTO-BUFFER-${treeId}-${Date.now()}`;
  const sha256Hash = crypto.createHash('sha256').update(fakePhotoData).digest('hex');

  res.json({
    success: true,
    inoculationId: inId,
    treeId,
    method,
    compound,
    deviceCaptured: "Rugged Tablet #AG-09",
    photoSha256Hash: sha256Hash,
    status: "LOGGED_TAMPER_EVIDENT",
    timestamp: new Date().toISOString()
  });
};

// 3. DFO Action: Statutory Scrutiny & Order Issuance
exports.dfoAuthorizeHarvest = (req, res) => {
  const { applicationId = "HAU-2026-DFO-GLG-0041", decision = "APPROVE", dfoRef = "FD/GLG/AGAR/2026/918" } = req.body;

  if (decision === "REJECT") {
    return res.json({
      success: true,
      applicationId,
      status: "REJECTED_BY_DFO",
      dfoRef,
      message: "Harvest refused due to sanctuary buffer proximity or quota exhaustion."
    });
  }

  const orderHash = crypto.createHash('sha256').update(`${applicationId}-${dfoRef}-${Date.now()}`).digest('hex');

  res.json({
    success: true,
    applicationId,
    status: "APPROVED_BY_DFO",
    dfoOrderNumber: dfoRef,
    permitId: `PMT-DFO-GLG-${Math.floor(100 + Math.random() * 900)}`,
    dfoDivision: "Golaghat Forest Division, Assam",
    signedOrderPdfHash: orderHash,
    makerCheckerVerified: true,
    statusNotice: "Statutory felling permit issued. Field agent authorized to record harvest batch."
  });
};

// 4. Aggregator Action: Intake Weighment & Tolerance Variance Check
exports.aggregatorCheckTolerance = (req, res) => {
  const { dispatchWeightKg = 185.4, receiptWeightKg = 184.8, toleranceLimitPct = 1.5 } = req.body;

  const d = parseFloat(dispatchWeightKg);
  const r = parseFloat(receiptWeightKg);
  const diff = parseFloat((r - d).toFixed(2));
  const pct = parseFloat(((diff / d) * 100).toFixed(2));
  const absPct = Math.abs(pct);
  const passed = absPct <= toleranceLimitPct;

  res.json({
    success: true,
    movementId: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    dispatchWeightKg: d,
    receiptWeightKg: r,
    varianceKg: diff,
    variancePercentage: pct,
    toleranceLimit: `${toleranceLimitPct}%`,
    status: passed ? "PASSED_WITHIN_TOLERANCE" : "EXCEPTION_ALERT_EXCEEDED",
    message: passed 
      ? `Transit variance (${absPct}%) is acceptable. Consignment pooled into Aggregation Lot.` 
      : `ALERT: Weight difference of ${absPct}% exceeds allowed ${toleranceLimitPct}%. Exception flagged for NERAMAC approval!`
  });
};

// 5. CPC Operator Action: Distillation Stills Mass Balance
exports.cpcDistillationRun = (req, res) => {
  const { woodChargedKg = 620.0 } = req.body;
  const wood = parseFloat(woodChargedKg);
  const oilYieldMl = parseFloat((wood * 2.387).toFixed(1)); // ~0.239% recovery
  const hydrosolL = parseFloat((wood * 0.0298).toFixed(1));
  const spentBiomassKg = parseFloat((wood * 0.919).toFixed(1));
  const moistureLossKg = parseFloat((wood - (spentBiomassKg + (oilYieldMl * 0.000962) + (hydrosolL * 1.0))).toFixed(2));

  res.json({
    success: true,
    distillationBatchId: `DST-CPC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    stillsUnit: "Still Unit #03 (SS-316)",
    woodChargedKg: wood,
    materialBalance: {
      pureOudOilProducedMl: oilYieldMl,
      hydrosolDistillationWaterLiters: hydrosolL,
      spentBiomassResidueKg: spentBiomassKg,
      processMoistureLossKg: moistureLossKg,
      oilYieldPercentage: 0.239,
      balanceReconciled: true
    },
    quarantineStatus: "QUARANTINED_AWAITING_LAB_RELEASE"
  });
};

// 6. Lab Officer Action: Quality Release & CITES Confirmation
exports.labQualityRelease = (req, res) => {
  const { batchId = "DST-CPC-2026-0007", agarospirol = 18.42 } = req.body;

  res.json({
    success: true,
    labTestId: `LAB-NER-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    sampleSource: batchId,
    gcmsPurityScore: "100% Pure Natural Assam Oud",
    agarospirolPercentage: `${agarospirol}%`,
    syntheticAdulteration: "0.0% (NIL DETECTED)",
    citesSpeciesConfirmed: "Aquilaria malaccensis Lam.",
    decision: "RELEASED_FOR_BOTTLING",
    certReference: "NABL-TC-8491/2026/0582"
  });
};

// 7. Packaging Action: Issue Cryptographic Serialized QR Pack
exports.packagingIssueQR = (req, res) => {
  const { batchId = "DST-CPC-2026-0007", packSizeMl = 12 } = req.body;
  const pckId = `PCK-AS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const resolver = `https://trace.neramac.gov.in/verify/${pckId}`;
  const cryptoSig = crypto.createHash('sha256').update(`${pckId}-${batchId}-${Date.now()}`).digest('hex');

  res.json({
    success: true,
    packId: pckId,
    productName: "Heritage Assam Oud Oil (Pure Aquilaria malaccensis)",
    volume: `${packSizeMl} ml`,
    resolverUrl: resolver,
    cryptographicDigitalSignature: cryptoSig,
    tamperEvidentSeal: `NER-SEAL-${Math.floor(10000 + Math.random() * 90000)}`,
    status: "SERIALIZED_AND_AUTHENTICATED"
  });
};
