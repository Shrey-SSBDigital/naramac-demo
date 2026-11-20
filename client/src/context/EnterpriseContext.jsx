import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  USER_ROLES,
  MOCK_FARMERS,
  MOCK_PLANTATIONS,
  MOCK_POLOGENS,
  MOCK_TREES,
  MOCK_INOCULATIONS,
  MOCK_HARVESTS,
  MOCK_HARVEST_BATCHES,
  MOCK_PERMITS,
  MOCK_MOVEMENTS,
  MOCK_AGGREGATIONS,
  MOCK_DISTILLATIONS,
  MOCK_LAB_TESTS,
  MOCK_FINISHED_PRODUCTS,
  MOCK_EXPORT_BATCHES,
  MOCK_SHIPMENT_LOTS,
  MOCK_DOMESTIC_SALES,
  MOCK_INVENTORY,
  MOCK_AUDIT_LOGS,
  MOCK_COLLECTION_CENTRES,
  MOCK_PROCESSING_CENTRES
} from '../data/mockEnterpriseData';

const EnterpriseContext = createContext(null);

const STORAGE_KEY = 'NERAMAC_ASCTS_DATA_V2';

export function EnterpriseProvider({ children }) {
  // Current Active User Role (starts as NERAMAC_ADMIN for rich overview)
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('NERAMAC_ACTIVE_ROLE') || 'NERAMAC_ADMIN';
  });

  // Global search query
  const [searchQuery, setSearchQuery] = useState('');

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Main state with localStorage hydration
  const [farmers, setFarmers] = useState(MOCK_FARMERS);
  const [plantations, setPlantations] = useState(MOCK_PLANTATIONS);
  const [pologens, setPologens] = useState(MOCK_POLOGENS);
  const [trees, setTrees] = useState(MOCK_TREES);
  const [inoculations, setInoculations] = useState(MOCK_INOCULATIONS);
  const [harvests, setHarvests] = useState(MOCK_HARVESTS);
  const [harvestBatches, setHarvestBatches] = useState(MOCK_HARVEST_BATCHES);
  const [permits, setPermits] = useState(MOCK_PERMITS);
  const [movements, setMovements] = useState(MOCK_MOVEMENTS);
  const [aggregations, setAggregations] = useState(MOCK_AGGREGATIONS);
  const [distillations, setDistillations] = useState(MOCK_DISTILLATIONS);
  const [labTests, setLabTests] = useState(MOCK_LAB_TESTS);
  const [finishedProducts, setFinishedProducts] = useState(MOCK_FINISHED_PRODUCTS);
  const [exportBatches, setExportBatches] = useState(MOCK_EXPORT_BATCHES);
  const [shipmentLots, setShipmentLots] = useState(MOCK_SHIPMENT_LOTS);
  const [domesticSales, setDomesticSales] = useState(MOCK_DOMESTIC_SALES);
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [auditLogs, setAuditLogs] = useState(MOCK_AUDIT_LOGS);

  // Load from localStorage on mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.farmers) setFarmers(parsed.farmers);
        if (parsed.plantations) setPlantations(parsed.plantations);
        if (parsed.pologens) setPologens(parsed.pologens);
        if (parsed.trees) setTrees(parsed.trees);
        if (parsed.inoculations) setInoculations(parsed.inoculations);
        if (parsed.harvests) setHarvests(parsed.harvests);
        if (parsed.harvestBatches) setHarvestBatches(parsed.harvestBatches);
        if (parsed.permits) setPermits(parsed.permits);
        if (parsed.movements) setMovements(parsed.movements);
        if (parsed.aggregations) setAggregations(parsed.aggregations);
        if (parsed.distillations) setDistillations(parsed.distillations);
        if (parsed.labTests) setLabTests(parsed.labTests);
        if (parsed.finishedProducts) setFinishedProducts(parsed.finishedProducts);
        if (parsed.exportBatches) setExportBatches(parsed.exportBatches);
        if (parsed.shipmentLots) setShipmentLots(parsed.shipmentLots);
        if (parsed.domesticSales) setDomesticSales(parsed.domesticSales);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      }
    } catch (e) {
      console.warn('Failed to parse saved state:', e);
    }
  }, []);

  // Save to localStorage when state updates
  const persistState = (partialUpdate = {}) => {
    try {
      const current = {
        farmers,
        plantations,
        pologens,
        trees,
        inoculations,
        harvests,
        harvestBatches,
        permits,
        movements,
        aggregations,
        distillations,
        labTests,
        finishedProducts,
        exportBatches,
        shipmentLots,
        domesticSales,
        inventory,
        auditLogs,
        ...partialUpdate
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  const handleSetRole = (roleId) => {
    setActiveRole(roleId);
    localStorage.setItem('NERAMAC_ACTIVE_ROLE', roleId);
    addToast(`Switched perspective to: ${USER_ROLES.find(r => r.id === roleId)?.name || roleId}`, 'info');
  };

  // Reset to original seed data
  const resetToInitialData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFarmers(MOCK_FARMERS);
    setPlantations(MOCK_PLANTATIONS);
    setPologens(MOCK_POLOGENS);
    setTrees(MOCK_TREES);
    setInoculations(MOCK_INOCULATIONS);
    setHarvests(MOCK_HARVESTS);
    setHarvestBatches(MOCK_HARVEST_BATCHES);
    setPermits(MOCK_PERMITS);
    setMovements(MOCK_MOVEMENTS);
    setAggregations(MOCK_AGGREGATIONS);
    setDistillations(MOCK_DISTILLATIONS);
    setLabTests(MOCK_LAB_TESTS);
    setFinishedProducts(MOCK_FINISHED_PRODUCTS);
    setExportBatches(MOCK_EXPORT_BATCHES);
    setShipmentLots(MOCK_SHIPMENT_LOTS);
    setDomesticSales(MOCK_DOMESTIC_SALES);
    setInventory(MOCK_INVENTORY);
    setAuditLogs(MOCK_AUDIT_LOGS);
    addToast('Demo database restored to default initial state', 'info');
  };

  // Helper to record an audit log event
  const logAudit = (action, module, details, entityId) => {
    const roleObj = USER_ROLES.find(r => r.id === activeRole);
    const newLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      action,
      module,
      actorRole: activeRole,
      actorName: roleObj?.name || activeRole,
      entityId,
      details,
      hashSignature: `sha256:${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    persistState({ auditLogs: updated });
  };

  // --- Actions ---

  // 1. Farmer Management
  const addFarmer = (farmerData) => {
    const id = `FRM-AS-${String(farmers.length + 1).padStart(2, '0')}`;
    const newFarmer = {
      id,
      ...farmerData,
      status: 'ACTIVE',
      registrationDate: new Date().toISOString().split('T')[0],
      verifiedBy: 'NERAMAC Field Officer'
    };
    const updated = [newFarmer, ...farmers];
    setFarmers(updated);
    persistState({ farmers: updated });
    logAudit('CREATE_FARMER', 'Farmer Management', `Registered grower ${newFarmer.name} (${id})`, id);
    addToast(`Farmer ${newFarmer.name} registered successfully with ID ${id}`);
    return newFarmer;
  };

  // 2. Plantation, POLOGEN & Tree Management (Strictly attached to Farmer)
  const addPlantation = (plantationData) => {
    const cluster = plantationData.cluster || 'Golaghat Cluster';
    const isTripura = cluster.includes('Tripura');
    const prefix = isTripura ? 'PLT-TR' : 'PLT-AS';
    const id = `${prefix}-${String(plantations.length + 1).padStart(2, '0')}`;
    const farmer = farmers.find(f => f.id === plantationData.farmerId);

    const newPlantation = {
      id,
      farmerId: plantationData.farmerId,
      farmerName: farmer ? farmer.name : 'Registered Farmer',
      name: plantationData.name || `Plantation Parcel ${id}`,
      cluster,
      state: isTripura ? 'Tripura' : 'Assam',
      district: plantationData.district || (isTripura ? 'North Tripura' : 'Golaghat'),
      areaHectares: parseFloat(plantationData.areaHectares) || 1.25,
      soilType: plantationData.soilType || 'Alluvial Loam',
      elevationMeters: parseInt(plantationData.elevationMeters) || 96,
      boundaryPolygon: plantationData.boundaryPolygon || [
        [26.5204, 93.9782],
        [26.5218, 93.9795],
        [26.5212, 93.9815],
        [26.5195, 93.9808],
        [26.5204, 93.9782]
      ],
      totalTrees: (parseInt(plantationData.matureTrees) || 0) + (parseInt(plantationData.youngTrees) || 0),
      matureTrees: parseInt(plantationData.matureTrees) || 0,
      youngTrees: parseInt(plantationData.youngTrees) || 0,
      geoVerified: true,
      inspectionDate: new Date().toISOString().split('T')[0]
    };

    const updated = [newPlantation, ...plantations];
    setPlantations(updated);
    persistState({ plantations: updated });
    logAudit('CREATE_PLANTATION', 'Plantation Management', `Attached plantation ${newPlantation.name} (${id}) to Farmer ${newPlantation.farmerName} (${newPlantation.farmerId})`, id);
    addToast(`Plantation ${id} attached to Farmer ${newPlantation.farmerName}`);
    return newPlantation;
  };

  const addPologen = (pologenData) => {
    const id = `PLG-2026-${String(pologens.length + 1).padStart(3, '0')}`;
    const farmer = farmers.find(f => f.id === pologenData.farmerId);
    const plantation = plantations.find(p => p.id === pologenData.plantationId);

    const saplingCount = parseInt(pologenData.saplingCount) || 120;
    const newPologen = {
      id,
      farmerId: pologenData.farmerId,
      farmerName: farmer ? farmer.name : (plantation?.farmerName || 'Registered Farmer'),
      plantationId: pologenData.plantationId,
      plantationName: plantation ? plantation.name : 'Primary Plantation',
      name: pologenData.name || `Sapling Block ${id}`,
      cluster: plantation?.cluster || farmer?.cluster || 'Golaghat Cluster',
      plantingYear: parseInt(pologenData.plantingYear) || (new Date().getFullYear() - 3),
      ageYears: parseFloat(pologenData.ageYears) || 3.5,
      saplingCount,
      boundaryPolygon: pologenData.boundaryPolygon || [
        [26.5205, 93.9784],
        [26.5213, 93.9790],
        [26.5210, 93.9802],
        [26.5201, 93.9798],
        [26.5205, 93.9784]
      ],
      areaSquareMeters: parseInt(pologenData.areaSquareMeters) || 5200,
      perimeterMeters: parseInt(pologenData.perimeterMeters) || 310,
      walkedVerticesCount: 5,
      species: 'Aquilaria malaccensis',
      fieldAgent: pologenData.fieldAgent || 'NERAMAC Field Officer',
      walkedDate: new Date().toISOString().split('T')[0],
      status: 'WALKED_VERIFIED'
    };

    const updatedPologens = [newPologen, ...pologens];
    setPologens(updatedPologens);

    // Update plantation young trees count
    const updatedPlantations = plantations.map(p => {
      if (p.id === newPologen.plantationId) {
        const newYoung = (p.youngTrees || 0) + saplingCount;
        return {
          ...p,
          youngTrees: newYoung,
          totalTrees: (p.matureTrees || 0) + newYoung
        };
      }
      return p;
    });
    setPlantations(updatedPlantations);

    persistState({ pologens: updatedPologens, plantations: updatedPlantations });
    logAudit('CREATE_POLOGEN', 'Plantation & Forestry', `Walked sapling boundary polygon ${id} (${saplingCount} saplings, <7 yrs) attached to Farmer ${newPologen.farmerName}`, id);
    addToast(`POLOGEN ${id} (${saplingCount} saplings) recorded under Farmer ${newPologen.farmerName}`);
    return newPologen;
  };

  const addTree = (treeData) => {
    const id = `TRE-AS-${String(trees.length + 1).padStart(3, '0')}`;
    const plantation = plantations.find(p => p.id === treeData.plantationId);
    const farmer = farmers.find(f => f.id === (treeData.farmerId || plantation?.farmerId));

    const newTree = {
      id,
      farmerId: farmer?.id || plantation?.farmerId || 'FRM-AS-01',
      farmerName: farmer?.name || plantation?.farmerName || 'Bhaben Saikia',
      plantationId: treeData.plantationId,
      plantationName: plantation ? plantation.name : 'Primary Plantation',
      cluster: plantation?.cluster || 'Golaghat Cluster',
      species: 'Aquilaria malaccensis',
      citesAppendix: 'Appendix II',
      taggedDate: new Date().toISOString().split('T')[0],
      photoHash: `sha256:${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`,
      qrTagCode: `TAG-AGY-${id}`,
      status: 'MATURE_GROWING',
      inoculationStatus: 'NOT_INOCULATED',
      ...treeData
    };
    const updated = [newTree, ...trees];
    setTrees(updated);

    // Update plantation mature trees count
    const updatedPlantations = plantations.map(p => {
      if (p.id === newTree.plantationId) {
        const newMature = (p.matureTrees || 0) + 1;
        return {
          ...p,
          matureTrees: newMature,
          totalTrees: newMature + (p.youngTrees || 0)
        };
      }
      return p;
    });
    setPlantations(updatedPlantations);

    persistState({ trees: updated, plantations: updatedPlantations });
    logAudit('REGISTER_TREE', 'Plantation & Trees', `Geo-tagged mature tree ${id} (≥7 yrs) attached to Farmer ${newTree.farmerName} in ${newTree.plantationId}`, id);
    addToast(`Tree ${id} pinned and attached to Farmer ${newTree.farmerName}`);
    return newTree;
  };

  // 3. Cultivation & Inoculation
  const addInoculation = (inocData) => {
    const id = `INO-2026-${String(inoculations.length + 1).padStart(3, '0')}`;
    const newInoc = {
      id,
      inoculationDate: new Date().toISOString().split('T')[0],
      status: 'MATURING',
      photoHash: `sha256:${Math.random().toString(16).slice(2)}`,
      ...inocData
    };
    const updatedInocs = [newInoc, ...inoculations];
    setInoculations(updatedInocs);

    // Update tree status
    const updatedTrees = trees.map(t => t.id === newInoc.treeId ? { ...t, inoculationStatus: 'INOCULATED', status: 'INOCULATED' } : t);
    setTrees(updatedTrees);

    persistState({ inoculations: updatedInocs, trees: updatedTrees });
    logAudit('LOG_INOCULATION', 'Cultivation & Inoculation', `Applied ${newInoc.method} on tree ${newInoc.treeId}`, id);
    addToast(`Inoculation logged for Tree ${newInoc.treeId} with hash verification`);
    return newInoc;
  };

  // 4. Harvest Management
  const applyHarvest = (harvestData) => {
    const id = `HAU-2026-${String(harvests.length + 1).padStart(3, '0')}`;
    const newHarvest = {
      id,
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'PENDING_DFO_SANCTION',
      makerCheckerApproved: false,
      ...harvestData
    };
    const updated = [newHarvest, ...harvests];
    setHarvests(updated);
    persistState({ harvests: updated });
    logAudit('APPLY_HARVEST', 'Harvest Management', `Submitted harvest application ${id} for tree ${newHarvest.treeId}`, id);
    addToast(`Harvest application ${id} submitted for DFO sanction`);
    return newHarvest;
  };

  const approveHarvestAndFell = (harvestId, dfoSanctionNumber, woodWeightKg, resinGrade = 'GRADE_A_DARK_RESIN') => {
    const harvest = harvests.find(h => h.id === harvestId);
    if (!harvest) return;

    const batchId = `HBT-AS-2026-${String(harvestBatches.length + 1).padStart(3, '0')}`;
    const updatedHarvests = harvests.map(h => {
      if (h.id === harvestId) {
        return {
          ...h,
          dfoSanctionNumber,
          dfoSanctionDate: new Date().toISOString().split('T')[0],
          fellingDate: new Date().toISOString().split('T')[0],
          makerCheckerApproved: true,
          checkerOfficer: 'NERAMAC Admin (Verified)',
          freshWoodWeightKg: parseFloat(woodWeightKg) * 1.1,
          cleanedHeartwoodKg: parseFloat(woodWeightKg),
          stumpPhotoHash: `sha256:${Math.random().toString(16).slice(2)}`,
          batchGeneratedId: batchId,
          status: 'FELL_COMPLETED'
        };
      }
      return h;
    });

    const newBatch = {
      id: batchId,
      harvestAuthId: harvestId,
      treeId: harvest.treeId,
      farmerId: harvest.farmerId,
      farmerName: harvest.farmerName,
      plantationId: harvest.plantationId,
      netWeightKg: parseFloat(woodWeightKg),
      resinGrade,
      chippedStatus: 'RAW_LOGS',
      currentLocation: 'Harvest Site / Farm Gate',
      currentCustodian: 'FIELD_AGENT',
      status: 'READY_FOR_DISPATCH',
      parentOfAggregation: null,
      transitPassNumber: `TP/FOR/GLT/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      harvestTimestamp: new Date().toISOString(),
      portablePrinterTag: `BAR-${batchId}-QR`
    };

    const updatedBatches = [newBatch, ...harvestBatches];

    // Update tree status
    const updatedTrees = trees.map(t => t.id === harvest.treeId ? { ...t, status: 'HARVESTED' } : t);

    setHarvests(updatedHarvests);
    setHarvestBatches(updatedBatches);
    setTrees(updatedTrees);

    persistState({ harvests: updatedHarvests, harvestBatches: updatedBatches, trees: updatedTrees });
    logAudit('FELL_AND_CREATE_BATCH', 'Harvest Management', `Felled tree ${harvest.treeId} & generated ${batchId} (${woodWeightKg} kg)`, batchId);
    addToast(`Felling approved. Harvest Batch ${batchId} generated (${woodWeightKg} kg)`);
  };

  // 5. Permit Management
  const addPermit = (permitData) => {
    const id = `PMT-${Date.now().toString().slice(-4)}`;
    const newPermit = {
      id,
      issueDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      sanctionedFileUrl: '/permits/sanctioned_order.pdf',
      verificationHash: `sha256:${Math.random().toString(16).slice(2)}`,
      ...permitData
    };
    const updated = [newPermit, ...permits];
    setPermits(updated);
    persistState({ permits: updated });
    logAudit('CREATE_PERMIT', 'Permit Management', `Issued statutory permit ${newPermit.permitNumber}`, id);
    addToast(`Permit ${newPermit.permitNumber} created and recorded`);
    return newPermit;
  };

  // 6. Material Movement & Tolerance Check
  const createMovement = (dispatchData) => {
    const id = `MOV-2026-${String(movements.length + 1).padStart(3, '0')}`;
    const newMovement = {
      id,
      dispatchTimestamp: new Date().toISOString(),
      status: 'IN_TRANSIT',
      toleranceStatus: 'PENDING_WEIGHMENT',
      receivedWeightKg: null,
      varianceKg: null,
      variancePercent: null,
      receiptTimestamp: null,
      ...dispatchData
    };
    const updated = [newMovement, ...movements];
    setMovements(updated);
    persistState({ movements: updated });
    logAudit('DISPATCH_MATERIAL', 'Material Movement', `Dispatched consignment ${id} from ${newMovement.sourceName}`, id);
    addToast(`Movement record ${id} dispatched in transit`);
    return newMovement;
  };

  const receiveMovement = (movementId, receivedWeightKg, receivingCustodian) => {
    const movement = movements.find(m => m.id === movementId);
    if (!movement) return;

    const recv = parseFloat(receivedWeightKg);
    const disp = parseFloat(movement.dispatchWeightKg);
    const diff = parseFloat((recv - disp).toFixed(2));
    const pct = parseFloat(((diff / disp) * 100).toFixed(2));
    const passed = Math.abs(pct) <= 1.5;

    const updated = movements.map(m => {
      if (m.id === movementId) {
        return {
          ...m,
          receivedWeightKg: recv,
          varianceKg: diff,
          variancePercent: pct,
          toleranceStatus: passed ? 'PASSED' : 'TOLERANCE_EXCEEDED',
          status: 'RECEIVED_VERIFIED',
          receivingCustodian,
          receiptTimestamp: new Date().toISOString(),
          notes: passed
            ? `Variance ${pct}% is within statutory 1.5% gate tolerance.`
            : `WARNING: Variance ${pct}% exceeds maximum permitted 1.5% limit!`
        };
      }
      return m;
    });

    setMovements(updated);
    persistState({ movements: updated });
    logAudit(
      'RECEIVE_MATERIAL',
      'Material Movement',
      `Received consignment ${movementId}: ${recv}kg (Variance: ${pct}%, ${passed ? 'PASSED' : 'FLAGGED'})`,
      movementId
    );
    addToast(
      `Received ${movementId}: ${recv} kg. Tolerance status: ${passed ? 'PASSED (≤1.5%)' : 'FLAGGED (>1.5%)'}`,
      passed ? 'success' : 'warning'
    );
  };

  // 7. Aggregation Management
  const createAggregation = (aggregationData) => {
    const id = `AGG-AS-2026-${String(aggregations.length + 1).padStart(2, '0')}`;
    const newAgg = {
      id,
      aggregationDate: new Date().toISOString().split('T')[0],
      status: 'READY_FOR_DISTILLATION',
      ...aggregationData
    };
    const updated = [newAgg, ...aggregations];

    // Mark parent harvest batches as aggregated
    const updatedBatches = harvestBatches.map(b => {
      if (newAgg.parentBatchIds.includes(b.id)) {
        return { ...b, status: 'AGGREGATED', parentOfAggregation: id };
      }
      return b;
    });

    setAggregations(updated);
    setHarvestBatches(updatedBatches);
    persistState({ aggregations: updated, harvestBatches: updatedBatches });
    logAudit('CREATE_AGGREGATION', 'Aggregation Management', `Pooled ${newAgg.parentBatchIds.length} batches into ${id} (${newAgg.totalWeightKg} kg)`, id);
    addToast(`Aggregation Batch ${id} created with full parent genealogy preserved`);
    return newAgg;
  };

  // 8. Processing & Distillation
  const createDistillationRun = (runData) => {
    const id = `DST-AS-2026-${String(distillations.length + 1).padStart(2, '0')}`;
    const woodIn = parseFloat(runData.inputWoodKg);
    const oilMl = parseFloat(runData.outputPureOudOilMl);
    const oilKg = parseFloat((oilMl * 0.00096).toFixed(3));
    const hydroL = parseFloat(runData.outputHydrosolLiters);
    const spentKg = parseFloat(runData.outputSpentBiomassKg);
    const lossKg = parseFloat((woodIn - (oilKg + spentKg)).toFixed(3));
    const yieldPct = parseFloat(((oilKg / woodIn) * 100).toFixed(3));

    const newRun = {
      id,
      chargeDate: new Date().toISOString().split('T')[0],
      completionDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      durationHours: 240,
      outputPureOudOilKg: oilKg,
      calculatedProcessLossKg: Math.max(0, lossKg),
      massBalanceEfficiencyPercent: 99.7,
      recoveryYieldPercent: yieldPct,
      labReleaseStatus: 'PENDING_RELEASE',
      finishedPacksGenerated: 0,
      status: 'IN_LAB_TESTING',
      ...runData
    };

    const updated = [newRun, ...distillations];
    setDistillations(updated);
    persistState({ distillations: updated });
    logAudit('CREATE_DISTILLATION', 'Processing & Distillation', `Logged hydro-distillation charge ${id}: ${woodIn}kg wood -> ${oilMl}ml oil`, id);
    addToast(`Distillation Run ${id} logged. Mass balance calculated successfully.`);
    return newRun;
  };

  // 9. Laboratory & Quality Release
  const submitLabSampleAndTest = (testData) => {
    const id = `LAB-2026-GCMS-${String(labTests.length + 1).padStart(2, '0')}`;
    const newTest = {
      id,
      sampleCode: `SMP-${Date.now().toString().slice(-4)}`,
      testDate: new Date().toISOString().split('T')[0],
      nablAccreditationNo: 'NABL/TC-8891/2026',
      botanicalConfirmation: 'Aquilaria malaccensis (Confirmed CITES App II)',
      mineralOilSyntheticAdulterants: 'NOT_DETECTED',
      diethylPhthalateDEP: 'NOT_DETECTED',
      heavyMetalsPPM: { Lead: '< 0.05', Cadmium: '< 0.01', Arsenic: '< 0.02' },
      coaDocumentUrl: `/coa/COA_${id}.pdf`,
      verificationHash: `sha256:${Math.random().toString(16).slice(2)}`,
      ...testData
    };

    const updated = [newTest, ...labTests];
    setLabTests(updated);

    // If released, update distillation run
    if (newTest.qualityDecision === 'RELEASED_FOR_COMMERCIAL_USE') {
      const updatedDistills = distillations.map(d => {
        if (d.id === newTest.distillationRunId) {
          return { ...d, labSampleId: id, labReleaseStatus: 'RELEASED', status: 'COMPLETED_PACKAGED' };
        }
        return d;
      });
      setDistillations(updatedDistills);
      persistState({ labTests: updated, distillations: updatedDistills });
    } else {
      persistState({ labTests: updated });
    }

    logAudit('LAB_ANALYSIS_COMPLETED', 'Laboratory & Quality', `Completed GC-MS analysis ${id} for run ${newTest.distillationRunId}`, id);
    addToast(`Lab Sample ${id} tested and Certificate of Analysis generated`);
    return newTest;
  };

  const approveQualityRelease = (testId) => {
    const updated = labTests.map(t => {
      if (t.id === testId) {
        return {
          ...t,
          qualityDecision: 'RELEASED_FOR_COMMERCIAL_USE',
          releaseDate: new Date().toISOString().split('T')[0],
          authorizedBy: 'NERAMAC Quality Assurance Director'
        };
      }
      return t;
    });

    const test = labTests.find(t => t.id === testId);
    if (test) {
      const updatedDistills = distillations.map(d => {
        if (d.id === test.distillationRunId) {
          return { ...d, labReleaseStatus: 'RELEASED' };
        }
        return d;
      });
      setDistillations(updatedDistills);
      persistState({ labTests: updated, distillations: updatedDistills });
    } else {
      persistState({ labTests: updated });
    }

    setLabTests(updated);
    logAudit('QUALITY_RELEASE_GRANTED', 'Laboratory & Quality', `Quality Director signed off commercial release for test ${testId}`, testId);
    addToast(`Quality Release approved for test ${testId}`);
  };

  // 10. Finished Product Packaging
  const packageFinishedProducts = (distillationRunId, flaconCount = 10, volumeMl = 12.0) => {
    const distill = distillations.find(d => d.id === distillationRunId);
    const startIdx = finishedProducts.length + 1;
    const newPacks = [];

    for (let i = 0; i < flaconCount; i++) {
      const sNo = `PCK-NER-2026-${String(startIdx + i).padStart(3, '0')}`;
      newPacks.push({
        serialNumber: sNo,
        productName: `NERAMAC Imperial Assam Pure Oud Flacon (${volumeMl}ml)`,
        distillationRunId,
        labCoaNumber: distill?.labSampleId ? `COA/NER/2026/${distill.labSampleId}` : 'COA/NER/2026/0144',
        volumeMl,
        grade: 'Royal Grade Assam Oud',
        packagingDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 10 * 365 * 86400000).toISOString().split('T')[0],
        originCluster: 'Golaghat Cluster (Assam)',
        originFarmerMasked: 'B***n S***a (Homestead Plot 182)',
        originFarmerFull: distill?.parentFarmers?.[0] || 'Bhaben Saikia',
        citesSpecies: 'Aquilaria malaccensis',
        citesPermitNo: 'CITES/IN/2026/EXP-441',
        qrCodeString: `https://trace.neramac.gov.in/verify/${sNo}`,
        channel: 'INVENTORY',
        exportBatchId: null,
        shipmentLotId: null,
        status: 'IN_VAULT_STOCK',
        mrpInr: 28500
      });
    }

    const updatedPacks = [...newPacks, ...finishedProducts];
    const updatedDistills = distillations.map(d => {
      if (d.id === distillationRunId) {
        return { ...d, finishedPacksGenerated: (d.finishedPacksGenerated || 0) + flaconCount };
      }
      return d;
    });

    setFinishedProducts(updatedPacks);
    setDistillations(updatedDistills);
    persistState({ finishedProducts: updatedPacks, distillations: updatedDistills });
    logAudit('FINISHED_PACKAGING', 'Finished Products', `Bottled & serialized ${flaconCount} flacons from run ${distillationRunId}`, distillationRunId);
    addToast(`Successfully bottled and generated ${flaconCount} serialized flacons with QR codes`);
  };

  // 11. Export Batch & Shipment Lot
  const createExportBatch = (exportData) => {
    const id = `EBT-2026-${String(exportBatches.length + 1).padStart(2, '0')}`;
    const newBatch = {
      id,
      creationDate: new Date().toISOString().split('T')[0],
      exportStatus: 'CLEARED_FOR_DEPARTURE',
      inspectionPassed: true,
      ...exportData
    };

    // Update finished products status
    const updatedPacks = finishedProducts.map(p => {
      if (newBatch.packSerialNumbers.includes(p.serialNumber)) {
        return {
          ...p,
          channel: 'EXPORT',
          exportBatchId: id,
          destinationBuyer: newBatch.consigneeName,
          status: 'DISPATCHED_EXPORT'
        };
      }
      return p;
    });

    const updated = [newBatch, ...exportBatches];
    setExportBatches(updated);
    setFinishedProducts(updatedPacks);
    persistState({ exportBatches: updated, finishedProducts: updatedPacks });
    logAudit('CREATE_EXPORT_BATCH', 'Export Management', `Created export consignment ${id} to ${newBatch.destinationCountry}`, id);
    addToast(`Export Batch ${id} created for ${newBatch.consigneeName}`);
    return newBatch;
  };

  const createShipmentLot = (shipmentData) => {
    const id = `ELT-2026-${String(shipmentLots.length + 1).padStart(3, '0')}`;
    const newLot = {
      id,
      dispatchDate: new Date().toISOString().split('T')[0],
      trackingStatus: 'MANIFEST_FILED',
      tamperSealNumbers: [`NER-SEAL-${Math.floor(8000 + Math.random() * 1000)}`],
      ...shipmentData
    };
    const updated = [newLot, ...shipmentLots];
    setShipmentLots(updated);
    persistState({ shipmentLots: updated });
    logAudit('DISPATCH_SHIPMENT_LOT', 'Shipment & Dispatch', `Created terminal shipment lot ${id} with AWB ${newLot.airWaybillNumber}`, id);
    addToast(`Shipment Lot ${id} created and dispatched to cargo port`);
    return newLot;
  };

  // 12. Domestic Sales
  const createDomesticSale = (saleData) => {
    const id = `DOM-2026-${String(domesticSales.length + 1).padStart(2, '0')}`;
    const newSale = {
      id,
      orderDate: new Date().toISOString().split('T')[0],
      invoiceNumber: `INV/NER/DOM/2026/${Math.floor(100 + Math.random() * 900)}`,
      paymentStatus: 'PAID_FULL',
      deliveryStatus: 'IN_TRANSIT',
      ...saleData
    };

    // Update product packs
    const updatedPacks = finishedProducts.map(p => {
      if (newSale.packSerialNumbers.includes(p.serialNumber)) {
        return {
          ...p,
          channel: 'DOMESTIC',
          domesticSaleId: id,
          destinationBuyer: newSale.buyerName,
          status: 'SOLD_DOMESTIC'
        };
      }
      return p;
    });

    const updated = [newSale, ...domesticSales];
    setDomesticSales(updated);
    setFinishedProducts(updatedPacks);
    persistState({ domesticSales: updated, finishedProducts: updatedPacks });
    logAudit('DOMESTIC_SALE_CREATED', 'Domestic Sales', `Invoiced ${newSale.quantityFlacons} flacons to ${newSale.buyerName}`, id);
    addToast(`Domestic sale ${id} recorded. Invoice generated.`);
    return newSale;
  };

  // Global Forward & Backward Traceability Graph Resolver
  const resolveTraceability = (query) => {
    if (!query) return null;
    const cleanQuery = query.trim().toUpperCase();

    // Check if query matches a finished product serial number
    const product = finishedProducts.find(p => p.serialNumber.toUpperCase() === cleanQuery);
    if (product) {
      const distillation = distillations.find(d => d.id === product.distillationRunId);
      const labTest = labTests.find(l => l.distillationRunId === product.distillationRunId);
      const aggBatch = aggregations.find(a => a.id === distillation?.sourceBatchId);
      const hbtBatches = harvestBatches.filter(h => {
        if (aggBatch) return aggBatch.parentBatchIds.includes(h.id);
        return distillation?.parentHarvestBatches?.includes(h.id);
      });
      const harvestIds = hbtBatches.map(b => b.harvestAuthId);
      const harvestOps = harvests.filter(h => harvestIds.includes(h.id));
      const treeIds = hbtBatches.map(b => b.treeId);
      const matchedTrees = trees.filter(t => treeIds.includes(t.id));
      const farmerIds = [...new Set(matchedTrees.map(t => t.farmerId))];
      const matchedFarmers = farmers.filter(f => farmerIds.includes(f.id));
      const matchedPlantations = plantations.filter(p => matchedFarmers.some(f => f.id === p.farmerId));
      const matchedInocs = inoculations.filter(i => treeIds.includes(i.treeId));
      const matchedMovements = movements.filter(m => m.batchId?.includes(product.exportBatchId) || m.batchId?.includes('AGG-AS-2026-01'));
      const exportBatch = exportBatches.find(e => e.id === product.exportBatchId);
      const shipmentLot = shipmentLots.find(s => s.exportBatchId === product.exportBatchId);
      const domesticSale = domesticSales.find(d => d.id === product.domesticSaleId);

      return {
        targetType: 'FINISHED_PRODUCT',
        product,
        distillation,
        labTest,
        aggBatch,
        harvestBatches: hbtBatches,
        harvestOps,
        trees: matchedTrees,
        farmers: matchedFarmers,
        plantations: matchedPlantations,
        inoculations: matchedInocs,
        movements: matchedMovements,
        exportBatch,
        shipmentLot,
        domesticSale
      };
    }

    // Check if query matches a harvest batch ID
    const batch = harvestBatches.find(b => b.id.toUpperCase() === cleanQuery);
    if (batch) {
      const tree = trees.find(t => t.id === batch.treeId);
      const farmer = farmers.find(f => f.id === batch.farmerId);
      const plantation = plantations.find(p => p.id === batch.plantationId);
      const harvestOp = harvests.find(h => h.id === batch.harvestAuthId);
      const inoc = inoculations.find(i => i.treeId === batch.treeId);
      const agg = aggregations.find(a => a.parentBatchIds.includes(batch.id));
      const distill = distillations.find(d => d.sourceBatchId === agg?.id || d.parentHarvestBatches?.includes(batch.id));
      const lab = labTests.find(l => l.distillationRunId === distill?.id);
      const prods = finishedProducts.filter(p => p.distillationRunId === distill?.id);

      return {
        targetType: 'HARVEST_BATCH',
        harvestBatch: batch,
        tree,
        farmer,
        plantation,
        harvestOp,
        inoculation: inoc,
        aggregation: agg,
        distillation: distill,
        labTest: lab,
        products: prods
      };
    }

    // Fallback: check farmer ID
    const farmer = farmers.find(f => f.id.toUpperCase() === cleanQuery);
    if (farmer) {
      const farmerPlantations = plantations.filter(p => p.farmerId === farmer.id);
      const farmerPologens = pologens.filter(p => p.farmerId === farmer.id);
      const farmerTrees = trees.filter(t => t.farmerId === farmer.id);
      const farmerBatches = harvestBatches.filter(b => b.farmerId === farmer.id);
      return {
        targetType: 'FARMER',
        farmer,
        plantations: farmerPlantations,
        pologens: farmerPologens,
        trees: farmerTrees,
        harvestBatches: farmerBatches
      };
    }

    return null;
  };

  return (
    <EnterpriseContext.Provider
      value={{
        activeRole,
        setActiveRole: handleSetRole,
        searchQuery,
        setSearchQuery,
        toasts,
        addToast,
        resetToInitialData,

        // Data entities
        farmers,
        plantations,
        pologens,
        trees,
        inoculations,
        harvests,
        harvestBatches,
        permits,
        movements,
        aggregations,
        distillations,
        labTests,
        finishedProducts,
        exportBatches,
        shipmentLots,
        domesticSales,
        inventory,
        auditLogs,
        collectionCentres: MOCK_COLLECTION_CENTRES,
        processingCentres: MOCK_PROCESSING_CENTRES,

        // Actions
        addFarmer,
        addPlantation,
        addPologen,
        addTree,
        addInoculation,
        applyHarvest,
        approveHarvestAndFell,
        addPermit,
        createMovement,
        receiveMovement,
        createAggregation,
        createDistillationRun,
        submitLabSampleAndTest,
        approveQualityRelease,
        packageFinishedProducts,
        createExportBatch,
        createShipmentLot,
        createDomesticSale,
        logAudit,
        resolveTraceability
      }}
    >
      {children}
    </EnterpriseContext.Provider>
  );
}

export function useEnterprise() {
  const context = useContext(EnterpriseContext);
  if (!context) {
    throw new Error('useEnterprise must be used within an EnterpriseProvider');
  }
  return context;
}
