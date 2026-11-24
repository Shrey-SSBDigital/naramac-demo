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
  MOCK_PROCESSING_CENTRES,
  MOCK_FACILITIES,
  MOCK_FARMER_APPLICATIONS
} from '../data/mockEnterpriseData';

const EnterpriseContext = createContext(null);

const STORAGE_KEY = 'NERAMAC_ASCTS_DATA_V7';

export function EnterpriseProvider({ children }) {
  // Current Active User Role (starts as NERAMAC_ADMIN for rich overview)
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('NERAMAC_ACTIVE_ROLE') || 'NERAMAC_ADMIN';
  });

  // Global search query
  const [searchQuery, setSearchQuery] = useState('');

  // Cross-module dispatch intent (e.g. from HarvestModule batch -> Leg 1, or from AggregationModule lot -> Leg 2)
  const [dispatchIntent, setDispatchIntent] = useState(null);

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
  const [farmerApplications, setFarmerApplications] = useState(MOCK_FARMER_APPLICATIONS);
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


  // Load state from localStorage on mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.farmers) {
          const existingIds = new Set(parsed.farmers.map(f => f.id));
          const missingBaselines = MOCK_FARMERS.filter(bf => !existingIds.has(bf.id));
          setFarmers([...parsed.farmers, ...missingBaselines]);
        }
        if (parsed.farmerApplications) setFarmerApplications(parsed.farmerApplications);
        if (parsed.plantations) {
          const existingPltIds = new Set(parsed.plantations.map(p => p.id));
          const missingPlts = MOCK_PLANTATIONS.filter(bp => !existingPltIds.has(bp.id));
          setPlantations([...parsed.plantations, ...missingPlts]);
        }
        if (parsed.pologens) setPologens(parsed.pologens);
        if (parsed.trees) {
          const existingTreeIds = new Set(parsed.trees.map(t => t.id));
          const missingTrees = MOCK_TREES.filter(bt => !existingTreeIds.has(bt.id));
          setTrees([...parsed.trees, ...missingTrees]);
        }
        if (parsed.inoculations) setInoculations(parsed.inoculations);
        if (parsed.harvests) {
          const updatedHarvests = parsed.harvests.map(h => {
            if (h.id === 'HAU-2026-002') {
              return {
                ...h,
                farmerId: 'FRM-AS-02',
                farmerName: 'Tarun Chandra Das',
                treeId: 'TRE-AS-007',
                plantationId: 'PLT-AS-02',
                dfoSanctionNumber: 'DFO/GLT/2026/HARV-215'
              };
            }
            return h;
          });
          setHarvests(updatedHarvests);
        }
        if (parsed.harvestBatches) {
          const updatedBatches = parsed.harvestBatches.map(b => {
            if (b.id === 'HBT-AS-2026-002') {
              return {
                ...b,
                farmerId: 'FRM-AS-02',
                farmerName: 'Tarun Chandra Das',
                treeId: 'TRE-AS-007',
                plantationId: 'PLT-AS-02',
                fellingOrderNumber: 'DFO/GLT/2026/HARV-215'
              };
            }
            return b;
          });
          setHarvestBatches(updatedBatches);
        }
        if (parsed.permits) {
          const normalizedPermits = parsed.permits.map(p => ({
            ...p,
            permitType: p.permitType || (p.type === 'FELLING' ? 'DFO Tree Felling Sanction Order' : p.type || 'DFO Tree Felling Sanction Order'),
            issuingAuthority: p.issuingAuthority || p.issuedBy || 'Divisional Forest Officer, Golaghat Forest Division, Assam',
            officerName: p.officerName || 'S. K. Bordoloi, IFS (DFO Golaghat)',
            beneficiaryName: p.beneficiaryName || p.holderName || 'Bhaben Saikia',
            beneficiaryFarmerId: p.beneficiaryFarmerId || p.holderId || 'FRM-AS-01',
            approvedSpecies: p.approvedSpecies || 'Aquilaria malaccensis',
            verificationHash: p.verificationHash || p.documentHash || 'sha256:f12a8849102eacb920198421b8c09182374'
          }));
          setPermits(normalizedPermits);
        }
        if (parsed.movements) setMovements(parsed.movements);
        if (parsed.aggregations) {
          const updatedAggs = parsed.aggregations.map(a => {
            if (a.id === 'AGG-AS-2026-01' && a.parentDetails) {
              return {
                ...a,
                parentDetails: a.parentDetails.map(pd =>
                  pd.batchId === 'HBT-AS-2026-002' ? { ...pd, farmer: 'Tarun Chandra Das' } : pd
                )
              };
            }
            return a;
          });
          setAggregations(updatedAggs);
        }
        if (parsed.distillations) {
          const updatedDistills = parsed.distillations.map(d => {
            if (d.id === 'DST-AS-2026-01') {
              return {
                ...d,
                parentFarmers: ['Bhaben Saikia', 'Tarun Chandra Das']
              };
            }
            return d;
          });
          setDistillations(updatedDistills);
        }
        if (parsed.labTests) setLabTests(parsed.labTests);
        if (parsed.finishedProducts) {
          const updatedPacks = parsed.finishedProducts.map(p => {
            if (p.serialNumber === 'PCK-NER-2026-001' || p.serialNumber === 'PCK-NER-2026-013') {
              return {
                ...p,
                originFarmerMasked: 'B***n S***a (51.3%) + T***n C***a D*s (48.7%) [Pooled Homesteads]',
                originFarmerFull: 'Bhaben Saikia (Homestead Plot 182, Patta 44) + Tarun Chandra Das (Homestead Plot 245, Patta 61)',
                isPooledConsignment: true
              };
            }
            return p;
          });
          setFinishedProducts(updatedPacks);
        }
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
        farmerApplications,
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
    setFarmerApplications(MOCK_FARMER_APPLICATIONS);
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

  // Re-arm unharvested trees for a grower so the demo can be re-run indefinitely
  const rearmFarmerTrees = (farmerId) => {
    setTrees(prev => {
      const updated = prev.map(t => {
        if (!farmerId || t.farmerId === farmerId) {
          return { ...t, status: 'MATURE_GROWING' };
        }
        return t;
      });
      persistState({ trees: updated });
      return updated;
    });
    addToast(`Trees re-armed to MATURE_GROWING for repeat testing (${farmerId || 'All Growers'})`, 'success');
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

  // 0. Farmer Onboarding & Maker-Checker Workflow
  const submitFarmerApplication = (appData) => {
    const isTripura = appData.state === 'Tripura' || appData.cluster?.includes('Tripura');
    const prefix = isTripura ? 'APP-TR' : 'APP-AS';
    const id = `${prefix}-2026-${String(farmerApplications.length + 1).padStart(3, '0')}`;
    const saplingsCount = parseInt(appData.saplingsCount) || 0;
    const matureTreesCount = parseInt(appData.matureTreesCount) || 0;
    const estimatedTrees = saplingsCount + matureTreesCount || parseInt(appData.estimatedTrees) || 150;

    const newApp = {
      id,
      farmerName: appData.farmerName || 'Applicant Farmer',
      fatherName: appData.fatherName || 'Father Name',
      gender: appData.gender || 'Male',
      age: parseInt(appData.age) || 45,
      phone: appData.phone || '+91 94350 00000',
      state: isTripura ? 'Tripura' : 'Assam',
      cluster: appData.cluster || (isTripura ? 'Kadamtala Cluster' : 'Golaghat Cluster'),
      district: appData.district || (isTripura ? 'North Tripura' : 'Golaghat'),
      subdivision: appData.subdivision || 'Bokakhat',
      village: appData.village || 'Village Gaon',
      dagNumber: appData.dagNumber || 'Dag 100, Patta 25',
      landAreaAcres: parseFloat(appData.landAreaAcres) || 2.5,
      jamabandiDoc: appData.jamabandiDoc || 'Jamabandi_Uploaded.pdf',
      jamabandiHash: appData.jamabandiHash || `sha256:${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
      bankName: appData.bankName || 'State Bank of India',
      bankAccountNumber: appData.bankAccountNumber || 'XXXX-XXXX-8921',
      ifscCode: appData.ifscCode || 'SBIN0000083',
      estimatedTrees,
      saplingsCount,
      matureTreesCount,
      plantingYear: parseInt(appData.plantingYear) || 2020,
      plantationName: appData.plantationName || `${appData.farmerName}'s Agarwood Parcel`,
      status: 'SUBMITTED_PENDING_INSPECTION',
      submissionDate: new Date().toISOString().split('T')[0],
      inspectionReport: null,
      approvalDetails: null
    };

    const updated = [newApp, ...farmerApplications];
    setFarmerApplications(updated);
    persistState({ farmerApplications: updated });
    logAudit('FARMER_APPLICATION_SUBMITTED', 'Farmer Registration', `Submitted application ${id} for grower ${newApp.farmerName}`, id);
    addToast(`Farmer Registration Application ${id} submitted successfully!`);
    return newApp;
  };

  const conductFieldInspection = (appId, inspectionData) => {
    const appIndex = farmerApplications.findIndex(a => a.id === appId);
    if (appIndex === -1) return null;

    const existingApp = farmerApplications[appIndex];
    const updatedApp = {
      ...existingApp,
      status: 'FIELD_INSPECTED_PENDING_APPROVAL',
      inspectionReport: {
        inspected: true,
        inspectorId: inspectionData.inspectorId || 'NERAMAC-FA-04',
        inspectorName: inspectionData.inspectorName || 'Dipankar Neog (Field Agent)',
        inspectionDate: new Date().toISOString().split('T')[0],
        latMandalVerified: true,
        latMandalName: inspectionData.latMandalName || 'P. Bora (Circle Lat Mandal)',
        boundariesVerified: true,
        verifiedMatureTrees: parseInt(inspectionData.verifiedMatureTrees) || existingApp.matureTreesCount,
        verifiedSaplings: parseInt(inspectionData.verifiedSaplings) || existingApp.saplingsCount,
        pologenBoundaryWalked: true,
        pologenAreaAcres: parseFloat(inspectionData.pologenAreaAcres) || existingApp.landAreaAcres,
        coordinates: inspectionData.coordinates || [93.9782, 26.5204],
        photoSha256: inspectionData.photoSha256 || `sha256:${Math.random().toString(16).slice(2)}`,
        photoUrl: inspectionData.photoUrl || null,
        fieldRemarks: inspectionData.fieldRemarks || 'Boundaries and tree counts field verified with Lat Mandal. No reserve forest encroachment.'
      }
    };

    const updatedList = [...farmerApplications];
    updatedList[appIndex] = updatedApp;
    setFarmerApplications(updatedList);
    persistState({ farmerApplications: updatedList });
    logAudit('FIELD_INSPECTION_COMPLETED', 'Field GIS Studio', `Field Agent conducted Lat Mandal inspection for ${appId} with SHA-256 photo`, appId);
    addToast(`Field inspection report & SHA-256 photo attached to ${appId}`);
    return updatedApp;
  };

  const approveFarmerApplication = (appId, approvalData = {}) => {
    const app = farmerApplications.find(a => a.id === appId);
    if (!app) return null;

    const isTripura = app.state === 'Tripura' || app.cluster?.includes('Tripura');
    const farmerPrefix = isTripura ? 'FRM-TR' : 'FRM-AS';
    const farmerId = `${farmerPrefix}-${String(farmers.length + 1).padStart(2, '0')}`;

    // 1. Create official Farmer record
    const newFarmer = {
      id: farmerId,
      name: app.farmerName,
      fatherName: app.fatherName,
      gender: app.gender,
      age: app.age,
      phone: app.phone,
      state: app.state,
      cluster: app.cluster,
      district: app.district,
      subdivision: app.subdivision,
      village: app.village,
      dagNumber: app.dagNumber,
      landAreaAcres: app.landAreaAcres,
      treeCount: app.estimatedTrees,
      status: 'ACTIVE',
      registrationDate: new Date().toISOString().split('T')[0],
      verifiedBy: approvalData.approvedBy || 'NERAMAC-MD-01 (Managing Director)',
      coordinates: app.inspectionReport?.coordinates ? [app.inspectionReport.coordinates[1], app.inspectionReport.coordinates[0]] : [26.5204, 93.9782]
    };

    // 2. Create Plantation record
    const pltPrefix = isTripura ? 'PLT-TR' : 'PLT-AS';
    const pltId = `${pltPrefix}-${String(plantations.length + 1).padStart(2, '0')}`;
    const lat = app.inspectionReport?.coordinates ? app.inspectionReport.coordinates[1] : 26.5204;
    const lng = app.inspectionReport?.coordinates ? app.inspectionReport.coordinates[0] : 93.9782;

    const newPlantation = {
      id: pltId,
      farmerId,
      farmerName: app.farmerName,
      name: app.plantationName || `${app.farmerName} Agro-Parcel`,
      cluster: app.cluster,
      state: app.state,
      district: app.district,
      areaHectares: Number((app.landAreaAcres * 0.404686).toFixed(2)),
      soilType: 'Alluvial Red Loam',
      elevationMeters: 98,
      boundaryPolygon: [
        [lat - 0.001, lng - 0.001],
        [lat + 0.001, lng - 0.0008],
        [lat + 0.0008, lng + 0.0012],
        [lat - 0.0012, lng + 0.0009],
        [lat - 0.001, lng - 0.001]
      ],
      totalTrees: app.estimatedTrees,
      matureTrees: app.inspectionReport?.verifiedMatureTrees || app.matureTreesCount || 50,
      youngTrees: app.inspectionReport?.verifiedSaplings || app.saplingsCount || 100,
      geoVerified: true,
      inspectionDate: new Date().toISOString().split('T')[0]
    };

    // 3. Create POLOGEN (< 7 yrs) record if saplings present
    const saplingsNum = app.inspectionReport?.verifiedSaplings || app.saplingsCount;
    let newPologensList = [...pologens];
    if (saplingsNum > 0) {
      const plgId = `PLG-2026-${String(pologens.length + 1).padStart(3, '0')}`;
      const newPologen = {
        id: plgId,
        farmerId,
        farmerName: app.farmerName,
        plantationId: pltId,
        plantationName: newPlantation.name,
        name: `Sapling Grove (${app.farmerName})`,
        cluster: app.cluster,
        plantingYear: app.plantingYear || 2022,
        ageYears: Math.max(1, 2026 - (app.plantingYear || 2022)),
        saplingCount: saplingsNum,
        boundaryPolygon: newPlantation.boundaryPolygon,
        inspectionStatus: 'VERIFIED',
        lastAuditDate: new Date().toISOString().split('T')[0]
      };
      newPologensList = [newPologen, ...newPologensList];
    }

    // 4. Create initial mature tree record (≥ 7 yrs) if mature trees present
    const matureNum = app.inspectionReport?.verifiedMatureTrees || app.matureTreesCount;
    let newTreesList = [...trees];
    if (matureNum > 0) {
      const treeId = `TRE-${isTripura ? 'TR' : 'AS'}-${String(trees.length + 1).padStart(3, '0')}`;
      const newTree = {
        id: treeId,
        rfidTag: `TAG-AGY-${String(trees.length + 1).padStart(3, '0')}`,
        farmerId,
        farmerName: app.farmerName,
        plantationId: pltId,
        plantationName: newPlantation.name,
        cluster: app.cluster,
        variety: 'Aquilaria malaccensis',
        plantingYear: 2015,
        ageYears: 11,
        gbhCm: 68,
        heightMeters: 14.5,
        inoculationStatus: 'NOT_INOCULATED',
        healthStatus: 'HEALTHY',
        coordinates: [lat, lng],
        gpsLatitude: lat,
        gpsLongitude: lng,
        geoVerified: true,
        tagDate: new Date().toISOString().split('T')[0]
      };
      newTreesList = [newTree, ...newTreesList];
    }

    // 5. Update application status
    const sanctionOrderNo = `NERAMAC/ASCTS/REG/2026/${String(farmerApplications.length + 10).padStart(3, '0')}`;
    const dfoClearanceNo = `DFO/${app.district?.slice(0, 3).toUpperCase() || 'GLT'}/NOC/2026/${String(Math.floor(Math.random() * 80) + 20)}`;
    const updatedApp = {
      ...app,
      status: 'APPROVED',
      approvalDetails: {
        approvedBy: approvalData.approvedBy || 'NERAMAC-MD-01 (Managing Director)',
        approvalDate: new Date().toISOString().split('T')[0],
        sanctionedFarmerId: farmerId,
        sanctionOrderNo,
        dfoClearanceNo,
        remarks: approvalData.remarks || 'Sanctioned under Assam Agarwood Policy 2020. Digital QR grower card issued.'
      }
    };

    const updatedAppList = farmerApplications.map(a => a.id === appId ? updatedApp : a);
    const updatedFarmersList = [newFarmer, ...farmers];
    const updatedPlantationsList = [newPlantation, ...plantations];

    setFarmerApplications(updatedAppList);
    setFarmers(updatedFarmersList);
    setPlantations(updatedPlantationsList);
    setPologens(newPologensList);
    setTrees(newTreesList);

    persistState({
      farmerApplications: updatedAppList,
      farmers: updatedFarmersList,
      plantations: updatedPlantationsList,
      pologens: newPologensList,
      trees: newTreesList
    });

    logAudit('FARMER_SANCTIONED_MAKER_CHECKER', 'Farmer Approval', `Sanctioned Farmer ID ${farmerId} for ${app.farmerName} (Order: ${sanctionOrderNo})`, farmerId);
    addToast(`Farmer ${app.farmerName} officially SANCTIONED as ${farmerId} with Digital QR Card!`);
    return { application: updatedApp, farmer: newFarmer, plantation: newPlantation };
  };

  const rejectFarmerApplication = (appId, reason) => {
    const updated = farmerApplications.map(a => {
      if (a.id === appId) {
        return {
          ...a,
          status: 'REJECTED',
          approvalDetails: {
            approvedBy: 'NERAMAC Rejection Committee',
            approvalDate: new Date().toISOString().split('T')[0],
            remarks: reason || 'Application rejected due to revenue title discrepancies.'
          }
        };
      }
      return a;
    });
    setFarmerApplications(updated);
    persistState({ farmerApplications: updated });
    logAudit('FARMER_APPLICATION_REJECTED', 'Farmer Approval', `Application ${appId} rejected: ${reason}`, appId);
    addToast(`Application ${appId} rejected.`);
  };

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
      status: pologenData.status || (pologenData.overlapConflict ? 'DISPUTE_OVERLAP_HELD' : 'WALKED_VERIFIED'),
      overlapConflict: pologenData.overlapConflict || null
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
    if (newPologen.overlapConflict) {
      logAudit(
        'CADASTRAL_OVERLAP_FLAGGED',
        'Plantation & Forestry',
        `⚠ OVERLAP CONFLICT: POLOGEN ${id} intersects ${newPologen.overlapConflict.overlappingId} by ${newPologen.overlapConflict.overlapAreaSqM} m². Title clearance held; routed to DFO & Revenue Dispute Queue per Scenario (ii).`,
        id
      );
      addToast(`⚠ POLOGEN ${id} flagged with ${newPologen.overlapConflict.overlapAreaSqM} m² overlap! Routed to DFO Dispute Queue.`, 'warning');
    } else {
      logAudit('CREATE_POLOGEN', 'Plantation & Forestry', `Walked sapling boundary polygon ${id} (${saplingCount} saplings, <7 yrs, Clean 0.0% overlap) attached to Farmer ${newPologen.farmerName}`, id);
      addToast(`POLOGEN ${id} (${saplingCount} saplings, Clean Cadastral Boundary) recorded under Farmer ${newPologen.farmerName}`);
    }
    return newPologen;
  };

  const addTree = (treeData) => {
    const id = `TRE-AS-${String(trees.length + 1).padStart(3, '0')}`;
    const plantation = plantations.find(p => p.id === treeData.plantationId);
    const farmer = farmers.find(f => f.id === (treeData.farmerId || plantation?.farmerId));
    const lat = typeof treeData.gpsLatitude === 'number' ? treeData.gpsLatitude : (treeData.coordinates ? treeData.coordinates[0] : 26.5208);
    const lng = typeof treeData.gpsLongitude === 'number' ? treeData.gpsLongitude : (treeData.coordinates ? treeData.coordinates[1] : 93.9790);

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
      coordinates: [lat, lng],
      gpsLatitude: lat,
      gpsLongitude: lng,
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
    const targetType = inocData.targetType || 'TREE';
    const newInoc = {
      id,
      targetType,
      inoculationDate: new Date().toISOString().split('T')[0],
      status: 'MATURING',
      photoHash: `sha256:${Math.random().toString(16).slice(2)}`,
      ...inocData
    };
    const updatedInocs = [newInoc, ...inoculations];
    setInoculations(updatedInocs);

    let updatedTrees = trees;
    let updatedPologens = pologens;

    if (targetType === 'POLOGEN' && newInoc.pologenId) {
      updatedPologens = pologens.map(p =>
        p.id === newInoc.pologenId
          ? { ...p, inoculationStatus: 'INOCULATED', inoculatedTreeCount: newInoc.treeCount || p.saplingCount }
          : p
      );
      setPologens(updatedPologens);
    } else if (newInoc.treeId) {
      updatedTrees = trees.map(t =>
        t.id === newInoc.treeId ? { ...t, inoculationStatus: 'INOCULATED', status: 'INOCULATED' } : t
      );
      setTrees(updatedTrees);
    }

    persistState({ inoculations: updatedInocs, trees: updatedTrees, pologens: updatedPologens });
    const targetDesc = targetType === 'POLOGEN'
      ? `POLOGEN Block ${newInoc.pologenId} (${newInoc.treeCount || 'All'} saplings/trees)`
      : `Mature Tree ${newInoc.treeId}`;
    logAudit('LOG_INOCULATION', 'Cultivation & Inoculation', `Applied ${newInoc.method} on ${targetDesc}`, id);
    addToast(`Inoculation logged for ${targetDesc} with cryptographic hash verification`);
    return newInoc;
  };

  // 4. Harvest Management (Farmer/Field Agent Apply -> NERAMAC Verification -> DFO Approval -> Approved? Yes -> Authorisation ID / No -> Back to Harvest Application)
  const applyHarvest = (harvestData) => {
    const id = `HAU-2026-${String(harvests.length + 1).padStart(3, '0')}`;
    const windowText = harvestData.harvestWindowText || (harvestData.harvestWindowStart && harvestData.harvestWindowEnd ? `${harvestData.harvestWindowStart} – ${harvestData.harvestWindowEnd}` : 'Next 15 Days');
    const newHarvest = {
      id,
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'SUBMITTED_AWAITING_NERAMAC',
      makerCheckerApproved: false,
      applicantMode: harvestData.applicantMode || 'FIELD_AGENT',
      fieldAgent: harvestData.fieldAgent || 'NERAMAC-FA-04 (Dipankar Neog)',
      dfoDivision: harvestData.dfoDivision || 'DFO Golaghat Forest Division, Assam',
      targetAssetType: harvestData.targetAssetType || 'TREE',
      treeCount: harvestData.treeCount || 1,
      estimatedWeightKg: parseFloat(harvestData.estimatedWeightKg || harvestData.estimatedQuantity) || 38.0,
      estimatedQuantity: parseFloat(harvestData.estimatedQuantity || harvestData.estimatedWeightKg) || 38.0,
      quantityUnit: harvestData.quantityUnit || 'kg (Cleaned Heartwood)',
      harvestWindowStart: harvestData.harvestWindowStart || new Date().toISOString().split('T')[0],
      harvestWindowEnd: harvestData.harvestWindowEnd || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      harvestWindowText: windowText,
      reasonForHarvest: harvestData.reasonForHarvest || 'Resin maturity reached 24 months post-inoculation. Core drill test reveals dense oleoresin heartwood saturation.',
      inoculationHistory: harvestData.inoculationHistory || {
        eventId: 'INO-2024-032',
        date: '2024-01-15',
        method: 'Spiral Drill Inoculation',
        compound: 'Bio-Inoculant Formulation AS-9 (CSIR-NEIST licensed)',
        supplier: 'NERAMAC Approved Bio-Inputs Ltd.',
        verificationStatus: 'Verified by Field Agent (Dense dark oleoresin confirmed)'
      },
      statutoryPermissionRef: harvestData.statutoryPermissionRef || 'REV/GLT/PATTA-78/NOC-2025/112',
      photoSha256: harvestData.photoSha256 || '9a3ecbe5ed12ab4d8e11ba873c2f11161202b945e3b0c44298fc1c149afbf4c8',
      photoUrl: harvestData.photoUrl || null,
      ...harvestData
    };
    const updated = [newHarvest, ...harvests];
    setHarvests(updated);
    persistState({ harvests: updated });
    logAudit('APPLY_HARVEST', 'Harvest Management', `${newHarvest.applicantMode === 'FIELD_AGENT' ? 'Field Agent ' + newHarvest.fieldAgent + ' (on behalf of grower)' : 'Farmer ' + newHarvest.farmerName} submitted harvest application ${id} addressed to ${newHarvest.dfoDivision}`, id);
    addToast(`Harvest application ${id} addressed to ${newHarvest.dfoDivision} submitted. Awaiting NERAMAC field verification!`);
    return newHarvest;
  };

  const neramacVerifyHarvest = (harvestId, verificationData = {}) => {
    const harvest = harvests.find(h => h.id === harvestId);
    if (!harvest) return null;

    const updatedHarvests = harvests.map(h => {
      if (h.id === harvestId) {
        return {
          ...h,
          status: 'NERAMAC_VERIFIED_AWAITING_DFO',
          neramacVerifiedDate: new Date().toISOString().split('T')[0],
          neramacOfficerName: verificationData.officerName || 'NERAMAC-FA-04 (Dipankar Neog)',
          neramacVerificationNotes: verificationData.notes || 'On-site homestead origin & tree tag verified. Recommended for DFO felling sanction.',
          verifiedTreeConfirmed: true
        };
      }
      return h;
    });

    setHarvests(updatedHarvests);
    persistState({ harvests: updatedHarvests });
    logAudit('NERAMAC_HARVEST_VERIFIED', 'Harvest Management', `NERAMAC verified harvest application ${harvestId} for tree ${harvest.treeId}. Forwarded to DFO.`, harvestId);
    addToast(`NERAMAC verification completed for ${harvestId}. Forwarded to DFO for statutory approval!`);
    return updatedHarvests.find(h => h.id === harvestId);
  };

  const dfoApproveHarvest = (harvestId, approvalData = {}) => {
    const harvest = harvests.find(h => h.id === harvestId);
    if (!harvest) return null;

    const authId = approvalData.harvestAuthorisationId || `HA-AS-GLG-2026-${String(Math.floor(100 + Math.random() * 900))}`;
    const sanctionNo = approvalData.dfoSanctionNumber || `DFO/GLT/2026/HARV-${Math.floor(100 + Math.random() * 900)}`;
    const permitId = `PMT-DFO-2026-${String(permits.length + 1).padStart(3, '0')}`;

    const updatedHarvests = harvests.map(h => {
      if (h.id === harvestId) {
        return {
          ...h,
          harvestAuthorisationId: authId,
          dfoSanctionNumber: sanctionNo,
          dfoSanctionDate: new Date().toISOString().split('T')[0],
          dfoOfficerName: approvalData.dfoOfficerName || 'S. K. Bordoloi, IFS (DFO Golaghat)',
          approvedTreeIds: approvalData.approvedTreeIds || [harvest.treeId],
          approvedMaxWeightKg: parseFloat(approvalData.approvedMaxWeightKg) || harvest.estimatedWeightKg || 45.0,
          permitDoc: approvalData.permitDoc || `DFO_Felling_Permit_${harvestId}.pdf`,
          status: 'DFO_APPROVED_AWAITING_FELLING',
          makerCheckerApproved: true,
          dfoDecision: 'APPROVED',
          dfoRemarks: approvalData.remarks || 'Homestead revenue land verified. Statutory felling approved under Assam Agarwood Policy 2020.'
        };
      }
      return h;
    });

    // Auto-create official Permit record in permits state with standard schema
    const newPermit = {
      id: permitId,
      permitNumber: sanctionNo,
      authorisationId: authId,
      permitType: 'DFO Tree Felling Sanction Order',
      type: 'FELLING',
      issuingAuthority: harvest.dfoDivision || 'Divisional Forest Officer, Golaghat Forest Division, Assam',
      issuedBy: harvest.dfoDivision || 'Divisional Forest Officer, Golaghat Forest Division, Assam',
      officerName: approvalData.dfoOfficerName || 'S. K. Bordoloi, IFS (DFO Golaghat)',
      beneficiaryName: harvest.farmerName,
      beneficiaryFarmerId: harvest.farmerId,
      holderName: harvest.farmerName,
      holderId: harvest.farmerId,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: '2026-06-30',
      quotaApprovedTrees: harvest.treeCount || 1,
      approvedSpecies: 'Aquilaria malaccensis',
      status: 'ACTIVE',
      quotaKg: harvest.estimatedWeightKg || 45.0,
      usedKg: 0,
      verificationHash: `sha256:${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`,
      documentHash: `sha256:${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`,
      linkedEntities: [harvest.treeId, harvestId, authId]
    };
    const updatedPermits = [newPermit, ...permits];

    setHarvests(updatedHarvests);
    setPermits(updatedPermits);
    persistState({ harvests: updatedHarvests, permits: updatedPermits });

    logAudit('DFO_HARVEST_SANCTIONED', 'Permit & Harvest Management', `DFO issued Harvest Authorisation ${authId} for Tree ${harvest.treeId} (Order: ${sanctionNo})`, authId);
    addToast(`Harvest Authorisation ${authId} issued by DFO for Tree ${harvest.treeId}!`);
    return { harvest: updatedHarvests.find(h => h.id === harvestId), permit: newPermit };
  };

  const dfoRejectHarvest = (harvestId, rejectionData = {}) => {
    const harvest = harvests.find(h => h.id === harvestId);
    if (!harvest) return null;

    const reason = typeof rejectionData === 'string' ? rejectionData : (rejectionData.reason || 'Land Revenue Jamabandi discrepancy or insufficient homestead title proof.');

    const updatedHarvests = harvests.map(h => {
      if (h.id === harvestId) {
        return {
          ...h,
          status: 'DFO_REJECTED_RETURNED_TO_FARMER',
          dfoDecision: 'REJECTED_LOOP_BACK',
          rejectionReason: reason,
          rejectedDate: new Date().toISOString().split('T')[0],
          dfoOfficerName: rejectionData.dfoOfficerName || 'S. K. Bordoloi, IFS (DFO Golaghat)'
        };
      }
      return h;
    });

    setHarvests(updatedHarvests);
    persistState({ harvests: updatedHarvests });
    logAudit('DFO_HARVEST_REJECTED', 'Harvest Management', `DFO rejected harvest application ${harvestId} for tree ${harvest.treeId}. Returned to Farmer Application step. Reason: ${reason}`, harvestId);
    addToast(`DFO rejected application ${harvestId}. Looped back to Harvest Application for correction.`, 'error');
    return updatedHarvests.find(h => h.id === harvestId);
  };

  const resubmitHarvest = (harvestId, updatedData = {}) => {
    const updatedHarvests = harvests.map(h => {
      if (h.id === harvestId) {
        return {
          ...h,
          ...updatedData,
          status: 'SUBMITTED_AWAITING_NERAMAC',
          dfoDecision: null,
          resubmittedDate: new Date().toISOString().split('T')[0]
        };
      }
      return h;
    });

    setHarvests(updatedHarvests);
    persistState({ harvests: updatedHarvests });
    logAudit('RESUBMIT_HARVEST', 'Harvest Management', `Farmer resubmitted harvest application ${harvestId} after correcting deficiency`, harvestId);
    addToast(`Harvest application ${harvestId} resubmitted! Sent back to NERAMAC verification.`);
    return updatedHarvests.find(h => h.id === harvestId);
  };

  const fieldAgentConfirmAndFell = (harvestId, fellingData = {}) => {
    const harvest = harvests.find(h => h.id === harvestId);
    if (!harvest) return null;

    const batchId = `HBT-AS-2026-${String(harvestBatches.length + 1).padStart(3, '0')}`;
    const cleanedKg = parseFloat(fellingData.cleanedHeartwoodKg || fellingData.woodWeightKg || 38.5);
    const chipsKg = parseFloat(fellingData.sapwoodChipsKg || 12.0);
    const photoHash = fellingData.stumpPhotoSha256 || `sha256:${Math.random().toString(16).slice(2)}`;

    const updatedHarvests = harvests.map(h => {
      if (h.id === harvestId) {
        return {
          ...h,
          fellingDate: new Date().toISOString().split('T')[0],
          fieldAgent: fellingData.inspectorName || 'NERAMAC-FA-04 (Dipankar Neog)',
          treeQrVerified: true,
          freshWoodWeightKg: Number((cleanedKg * 1.1).toFixed(1)),
          cleanedHeartwoodKg: cleanedKg,
          sapwoodChipsKg: chipsKg,
          stumpPhotoHash: photoHash,
          stumpPhotoUrl: fellingData.stumpPhotoUrl || null,
          gpsCoordinates: fellingData.gpsCoordinates || [93.9782, 26.5204],
          batchGeneratedId: batchId,
          status: 'FELL_COMPLETED'
        };
      }
      return h;
    });

    const targetTree = trees.find(t => t.id === harvest.treeId);
    const newBatch = {
      id: batchId,
      harvestAuthId: harvestId,
      treeId: harvest.treeId,
      plantingYear: harvest.plantingYear || targetTree?.plantingYear || 2014,
      treeAgeYears: harvest.treeAgeYears || targetTree?.ageYears || 12,
      farmerId: harvest.farmerId,
      farmerName: harvest.farmerName,
      plantationId: harvest.plantationId,
      netWeightKg: cleanedKg,
      chipsWeightKg: chipsKg,
      resinGrade: fellingData.resinGrade || 'GRADE_A_DARK_RESIN',
      chippedStatus: 'RAW_LOGS',
      currentLocation: 'Harvest Site / Farm Gate',
      currentCustodian: 'FIELD_AGENT',
      status: 'READY_FOR_DISPATCH',
      parentOfAggregation: null,
      transitPassNumber: `TP/FOR/GLT/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      harvestTimestamp: new Date().toISOString(),
      stumpPhotoSha256: photoHash,
      portablePrinterTag: `BAR-${batchId}-QR`
    };

    const updatedBatches = [newBatch, ...harvestBatches];
    const updatedTrees = trees.map(t => t.id === harvest.treeId ? { ...t, status: 'HARVESTED' } : t);

    setHarvests(updatedHarvests);
    setHarvestBatches(updatedBatches);
    setTrees(updatedTrees);

    persistState({ harvests: updatedHarvests, harvestBatches: updatedBatches, trees: updatedTrees });
    logAudit('FELL_AND_CREATE_BATCH', 'Harvest Recording', `Field Agent confirmed tree ${harvest.treeId}, felling weighment ${cleanedKg}kg. Minted Harvest Batch ${batchId}`, batchId);
    addToast(`Tree ${harvest.treeId} felling confirmed! Harvest Batch ${batchId} generated (${cleanedKg} kg)`);
    return { batch: newBatch, harvest: updatedHarvests.find(h => h.id === harvestId) };
  };

  const approveHarvestAndFell = (harvestId, dfoSanctionNumber, woodWeightKg, resinGrade = 'GRADE_A_DARK_RESIN') => {
    dfoApproveHarvest(harvestId, { dfoSanctionNumber, approvedMaxWeightKg: woodWeightKg });
    return fieldAgentConfirmAndFell(harvestId, { cleanedHeartwoodKg: woodWeightKg, resinGrade });
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
    const matchedBatch = harvestBatches.find(b => b.id === dispatchData.batchId);
    const newMovement = {
      id,
      dispatchTimestamp: new Date().toISOString(),
      status: 'IN_TRANSIT',
      toleranceStatus: 'PENDING_WEIGHMENT',
      receivedWeightKg: null,
      varianceKg: null,
      variancePercent: null,
      receiptTimestamp: null,
      grnNumber: null,
      treeId: dispatchData.treeId || matchedBatch?.treeId || 'TRE-AS-001',
      plantingYear: dispatchData.plantingYear || matchedBatch?.plantingYear || 2014,
      treeAgeYears: dispatchData.treeAgeYears || matchedBatch?.treeAgeYears || 12,
      movementType: dispatchData.movementType || (dispatchData.destinationType?.includes('Processing') ? 'AGGREGATOR_TO_DISTILLERY' : 'FARM_TO_AGGREGATOR'),
      ...dispatchData
    };
    const updated = [newMovement, ...movements];
    setMovements(updated);

    // If dispatching a specific harvest batch, mark it IN_TRANSIT
    let updatedBatches = harvestBatches;
    if (dispatchData.batchId) {
      updatedBatches = harvestBatches.map(b => {
        if (dispatchData.batchId.includes(b.id)) {
          return {
            ...b,
            status: 'IN_TRANSIT',
            currentLocation: `In Transit to ${dispatchData.destinationName || 'Aggregation Depot'}`
          };
        }
        return b;
      });
      setHarvestBatches(updatedBatches);
    }

    persistState({ movements: updated, harvestBatches: updatedBatches });
    logAudit('DISPATCH_MATERIAL', 'Material Movement', `Dispatched consignment ${id} (${newMovement.movementType}) from ${newMovement.sourceName} to ${newMovement.destinationName}`, id);
    addToast(`Consignment ${id} dispatched in transit (${newMovement.dispatchWeightKg} kg)`);
    return newMovement;
  };

  const receiveMovement = (movementId, receivedWeightKg, receivingCustodian, grnNotes = '') => {
    const movement = movements.find(m => m.id === movementId);
    if (!movement) return;

    const recv = parseFloat(receivedWeightKg);
    const disp = parseFloat(movement.dispatchWeightKg);
    const diff = parseFloat((recv - disp).toFixed(2));
    const pct = parseFloat(((diff / disp) * 100).toFixed(2));
    const passed = Math.abs(pct) <= 1.5;
    const destCode = movement.destinationFacilityId || 'DEPOT-GLT';
    const grnId = `GRN-${destCode.replace('FAC-', '')}-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;

    const updated = movements.map(m => {
      if (m.id === movementId) {
        return {
          ...m,
          receivedWeightKg: recv,
          varianceKg: diff,
          variancePercent: pct,
          toleranceStatus: passed ? 'PASSED' : 'TOLERANCE_EXCEEDED',
          status: 'RECEIVED_VERIFIED',
          grnNumber: grnId,
          receivingCustodian: receivingCustodian || m.receivingCustodian || 'Depot Superintendent',
          receiptTimestamp: new Date().toISOString(),
          receiptCoordinates: m.destinationName?.includes('Golaghat') ? [26.5912, 93.6021] : [24.4640, 92.2150],
          notes: grnNotes || (passed
            ? `Gate tolerance verified (${pct}% variance within statutory ±1.5% moisture allowance). Issued Goods Receipt Note ${grnId}. Farmer procurement credit approved.`
            : `WARNING: Gate tolerance exceeded (${pct}% variance > ±1.5% limit). Consignment placed on statutory hold for joint survey.`)
        };
      }
      return m;
    });

    // If batch received at Depot, update Harvest Batch location to Depot stock
    let updatedBatches = harvestBatches;
    if (movement.batchId) {
      updatedBatches = harvestBatches.map(b => {
        if (movement.batchId.includes(b.id)) {
          return {
            ...b,
            currentLocation: movement.destinationName,
            currentCustodian: movement.destinationType?.includes('Processing') ? 'CPC_OPERATOR' : 'COLLECTION_OPERATOR',
            status: movement.destinationType?.includes('Processing') ? 'AT_CPC_DISTILLERY' : 'IN_STOCK'
          };
        }
        return b;
      });
      setHarvestBatches(updatedBatches);
    }

    setMovements(updated);
    persistState({ movements: updated, harvestBatches: updatedBatches });
    logAudit(
      'RECEIPT_AND_WEIGHT_RECONCILIATION',
      'Material Movement',
      `Gate weighment verified for ${movementId}: Received ${recv}kg vs Dispatched ${disp}kg. Variance: ${pct}% (${passed ? 'PASSED ≤ ±1.5%' : 'FLAGGED > ±1.5%'}). Generated GRN: ${grnId}`,
      movementId
    );
    addToast(
      passed
        ? `Gate Recon Complete: Consignment ${movementId} verified! GRN ${grnId} generated (${pct}% variance PASS)`
        : `Gate Recon Alert: Consignment ${movementId} flagged! Variance (${pct}%) exceeds ±1.5% tolerance`,
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
    const agg = aggregations.find(a => a.id === distill?.sourceBatchId);
    const contributingFarmers = agg?.parentDetails?.length
      ? [...new Set(agg.parentDetails.map(p => p.farmer))]
      : (distill?.parentFarmers?.length ? distill.parentFarmers : ['Bhaben Saikia']);

    const isPooled = contributingFarmers.length > 1;
    const originFarmerMasked = isPooled
      ? contributingFarmers.map(name => {
          const parts = name.trim().split(' ');
          return parts.map(p => p.length <= 2 ? p : p[0] + '*'.repeat(Math.max(1, p.length - 2)) + p[p.length - 1]).join(' ');
        }).join(' + ') + ` [Pooled Charge]`
      : `${contributingFarmers[0]} (Homestead Plot)`;
    const originFarmerFull = isPooled
      ? `Consolidated Pool: ${contributingFarmers.join(' + ')}`
      : contributingFarmers[0];

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
        originFarmerMasked,
        originFarmerFull,
        isPooledConsignment: isPooled,
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
      const treeIds = [...new Set(hbtBatches.map(b => b.treeId))];
      const matchedTrees = trees.filter(t => treeIds.includes(t.id));
      
      const farmerIds = [...new Set([...matchedTrees.map(t => t.farmerId), ...hbtBatches.map(b => b.farmerId)].filter(Boolean))];
      let matchedFarmers = farmers.filter(f => farmerIds.includes(f.id) || hbtBatches.some(b => b.farmerName === f.name));
      
      // Also look up contributing farmers from aggBatch.parentDetails
      if (aggBatch?.parentDetails) {
        aggBatch.parentDetails.forEach(pd => {
          const f = farmers.find(farm => farm.name === pd.farmer || farm.id === pd.farmerId);
          if (f && !matchedFarmers.some(mf => mf.id === f.id)) {
            matchedFarmers.push(f);
          }
        });
      }
      if (distillation?.parentFarmers) {
        distillation.parentFarmers.forEach(pName => {
          const f = farmers.find(farm => farm.name === pName);
          if (f && !matchedFarmers.some(mf => mf.id === f.id)) {
            matchedFarmers.push(f);
          }
        });
      }

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
        aggregation: aggBatch,
        harvestBatches: hbtBatches,
        harvestOps,
        trees: matchedTrees,
        tree: matchedTrees[0],
        farmers: matchedFarmers,
        farmer: matchedFarmers[0],
        plantations: matchedPlantations,
        plantation: matchedPlantations[0],
        inoculations: matchedInocs,
        movements: matchedMovements,
        exportBatch,
        shipmentLot,
        domesticSale
      };
    }

    // Check if query matches an aggregation batch ID
    const agg = aggregations.find(a => a.id.toUpperCase() === cleanQuery);
    if (agg) {
      const hbtBatches = harvestBatches.filter(h => agg.parentBatchIds.includes(h.id));
      const treeIds = [...new Set(hbtBatches.map(b => b.treeId))];
      const matchedTrees = trees.filter(t => treeIds.includes(t.id));
      const farmerIds = [...new Set([...matchedTrees.map(t => t.farmerId), ...hbtBatches.map(b => b.farmerId)].filter(Boolean))];
      let matchedFarmers = farmers.filter(f => farmerIds.includes(f.id) || hbtBatches.some(b => b.farmerName === f.name));
      if (agg.parentDetails) {
        agg.parentDetails.forEach(pd => {
          const f = farmers.find(farm => farm.name === pd.farmer || farm.id === pd.farmerId);
          if (f && !matchedFarmers.some(mf => mf.id === f.id)) {
            matchedFarmers.push(f);
          }
        });
      }
      const distill = distillations.find(d => d.sourceBatchId === agg.id);
      const lab = distill ? labTests.find(l => l.distillationRunId === distill.id) : null;
      const prods = distill ? finishedProducts.filter(p => p.distillationRunId === distill.id) : [];

      return {
        targetType: 'AGGREGATION_BATCH',
        aggBatch: agg,
        aggregation: agg,
        harvestBatches: hbtBatches,
        trees: matchedTrees,
        tree: matchedTrees[0],
        farmers: matchedFarmers,
        farmer: matchedFarmers[0],
        distillation: distill,
        labTest: lab,
        products: prods,
        product: prods[0]
      };
    }

    // Check if query matches a harvest batch ID
    const batch = harvestBatches.find(b => b.id.toUpperCase() === cleanQuery);
    if (batch) {
      const tree = trees.find(t => t.id === batch.treeId);
      const farmer = farmers.find(f => f.id === batch.farmerId) || farmers.find(f => f.name === batch.farmerName);
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
        harvestBatches: [batch],
        tree,
        trees: tree ? [tree] : [],
        farmer,
        farmers: farmer ? [farmer] : [],
        plantation,
        plantations: plantation ? [plantation] : [],
        harvestOp,
        inoculation: inoc,
        aggregation: agg,
        aggBatch: agg,
        distillation: distill,
        labTest: lab,
        products: prods,
        product: prods[0]
      };
    }

    // Check if query matches a tree ID (e.g. TRE-AS-001 or TRE-AS-007)
    const tree = trees.find(t => t.id.toUpperCase() === cleanQuery);
    if (tree) {
      const farmer = farmers.find(f => f.id === tree.farmerId) || farmers.find(f => f.name === tree.farmerName);
      const plantation = plantations.find(p => p.id === tree.plantationId);
      const hbtBatch = harvestBatches.find(b => b.treeId === tree.id);
      const inoc = inoculations.find(i => i.treeId === tree.id);
      const agg = hbtBatch ? aggregations.find(a => a.parentBatchIds.includes(hbtBatch.id)) : null;
      const distill = agg ? distillations.find(d => d.sourceBatchId === agg.id) : null;
      const lab = distill ? labTests.find(l => l.distillationRunId === distill.id) : null;
      const prods = distill ? finishedProducts.filter(p => p.distillationRunId === distill.id) : [];

      return {
        targetType: 'TREE',
        tree,
        trees: [tree],
        farmer,
        farmers: farmer ? [farmer] : [],
        plantation,
        plantations: plantation ? [plantation] : [],
        harvestBatch: hbtBatch,
        harvestBatches: hbtBatch ? [hbtBatch] : [],
        inoculation: inoc,
        aggregation: agg,
        aggBatch: agg,
        distillation: distill,
        labTest: lab,
        products: prods,
        product: prods[0]
      };
    }

    // Fallback: check farmer ID or Farmer Name (e.g. Tarun Chandra Das or Bhaben Saikia)
    const farmer = farmers.find(f => f.id.toUpperCase() === cleanQuery || f.name.toUpperCase().includes(cleanQuery));
    if (farmer) {
      const farmerPlantations = plantations.filter(p => p.farmerId === farmer.id);
      const farmerPologens = pologens.filter(p => p.farmerId === farmer.id);
      const farmerTrees = trees.filter(t => t.farmerId === farmer.id);
      const farmerBatches = harvestBatches.filter(b => b.farmerId === farmer.id || b.farmerName === farmer.name);
      const batchIds = farmerBatches.map(b => b.id);
      const agg = aggregations.find(a => a.parentBatchIds.some(pId => batchIds.includes(pId)));
      const distill = agg ? distillations.find(d => d.sourceBatchId === agg.id) : null;
      const lab = distill ? labTests.find(l => l.distillationRunId === distill.id) : null;
      const prods = distill ? finishedProducts.filter(p => p.distillationRunId === distill.id) : [];

      return {
        targetType: 'FARMER',
        farmer,
        farmers: [farmer],
        plantations: farmerPlantations,
        plantation: farmerPlantations[0],
        pologens: farmerPologens,
        trees: farmerTrees,
        tree: farmerTrees[0],
        harvestBatches: farmerBatches,
        harvestBatch: farmerBatches[0],
        aggregation: agg,
        aggBatch: agg,
        distillation: distill,
        labTest: lab,
        products: prods,
        product: prods[0]
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
        dispatchIntent,
        setDispatchIntent,
        toasts,
        addToast,
        resetToInitialData,
        rearmFarmerTrees,

        // Data entities
        farmers,
        farmerApplications,
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
        facilities: MOCK_FACILITIES,

        // System status
        isOfflineMode: false,
        isAirplaneMode: false,
        offlineQueue: [],

        // Actions
        submitFarmerApplication,
        conductFieldInspection,
        approveFarmerApplication,
        rejectFarmerApplication,
        addFarmer,
        addPlantation,
        addPologen,
        addTree,
        addInoculation,
        applyHarvest,
        neramacVerifyHarvest,
        dfoApproveHarvest,
        dfoRejectHarvest,
        resubmitHarvest,
        fieldAgentConfirmAndFell,
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
