import React, { useState, useMemo, useEffect } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import {
  Truck,
  Scale,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileText,
  ShieldCheck,
  Boxes,
  Factory,
  Clock,
  MapPin,
  UserCheck,
  FileCheck2,
  Printer,
  Download,
  Info,
  Building,
  User,
  Trees,
  Check
} from 'lucide-react';

export default function MovementModule({ mode = null }) {
  const {
    movements,
    createMovement,
    receiveMovement,
    harvestBatches,
    aggregations,
    activeRole,
    farmers,
    trees,
    permits,
    harvests,
    dispatchIntent,
    setDispatchIntent,
    addToast
  } = useEnterprise();

  const resolveTabFromMode = (m, role) => {
    if (m === 'FARM_TO_DEPOT' || m === 'DEPOT_GATE_CHECK') return 'FARM_TO_AGGREGATOR';
    if (m === 'DEPOT_TO_CPC' || m === 'CPC_GATE_CHECK') return 'AGGREGATOR_TO_DISTILLERY';
    if (m === 'GATE_RECEIPT') return 'RECON_QUEUE';
    if (role === 'FARMER' || role === 'FIELD_AGENT') return 'FARM_TO_AGGREGATOR';
    if (role === 'COLLECTION_OPERATOR') return 'AGGREGATOR_TO_DISTILLERY';
    return 'ALL';
  };

  // Active Tab: 'ALL' | 'FARM_TO_AGGREGATOR' | 'AGGREGATOR_TO_DISTILLERY' | 'RECON_QUEUE'
  const [activeTab, setActiveTab] = useState(() => resolveTabFromMode(mode, activeRole));

  useEffect(() => {
    setActiveTab(resolveTabFromMode(mode, activeRole));
  }, [mode, activeRole]);
  const [showRoleGuide, setShowRoleGuide] = useState(false);

  // Dedicated Modal States (Leg 1 and Leg 2 are completely separated)
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [isDepotModalOpen, setIsDepotModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [receiveTarget, setReceiveTarget] = useState(null);

  // Reconciliation form state
  const [receivedWeightInput, setReceivedWeightInput] = useState(42.0);
  const [reconcilingOfficer, setReconcilingOfficer] = useState('B. C. Kalita (Depot Superintendent)');
  const [reconNotes, setReconNotes] = useState('Natural moisture transpiration during transit within statutory 1.5% limit. Logs sound, tamper-evident seals intact.');

  // Form State for Leg 1: Farm -> Aggregator Depot (Strictly for Farmer & Field Agent)
  const [farmSelectionMode, setFarmSelectionMode] = useState('BY_BATCH'); // 'BY_BATCH' | 'BY_TREE'
  const [farmForm, setFarmForm] = useState({
    batchId: 'HBT-AS-2026-003',
    treeId: 'TRE-AS-001',
    plantingYear: 2014,
    treeAgeYears: 12,
    variety: 'Aquilaria malaccensis',
    fellingOrderNumber: 'DFO/GLT/2026/HARV-379',
    resinGrade: 'GRADE_A_DARK_RESIN',
    movementType: 'FARM_TO_AGGREGATOR',
    sourceType: 'Farmer Plot',
    sourceName: 'Bhaben Saikia Homestead (PLT-AS-01)',
    farmerName: 'Bhaben Saikia',
    farmerId: 'FRM-AS-01',
    dispatchCustodian: 'Bhaben Saikia (Registered Farmer)',
    destinationType: 'Aggregation Depot',
    destinationName: 'Golaghat Cluster Aggregation Depot',
    destinationFacilityId: 'DEPOT-GLT-01',
    receivingCustodian: 'B. C. Kalita (Depot Superintendent)',
    transitPassNumber: 'TP/FOR/GLT/2026/0920',
    vehicleNumber: 'AS-05-C-8812',
    driverName: 'Ramesh Gogoi',
    driverMobile: '+91 98640 22190',
    dispatchWeightKg: 42.00
  });

  // Form State for Leg 2: Aggregator Depot -> CPC Distillery (Strictly for Aggregator / Depot Superintendent)
  const [depotForm, setDepotForm] = useState({
    batchId: 'AGG-AS-2026-01',
    movementType: 'AGGREGATOR_TO_DISTILLERY',
    sourceType: 'Aggregation Depot',
    sourceName: 'Golaghat Cluster Aggregation Depot',
    farmerName: 'Consolidated Aggregation Lot',
    dispatchCustodian: 'B. C. Kalita (Depot Superintendent)',
    destinationType: 'Processing Centre (Distillery)',
    destinationName: 'NERAMAC Common Processing Centre (CPC Golaghat)',
    destinationFacilityId: 'CPC-GLT-01',
    receivingCustodian: 'Dr. P. J. Mahanta (Distillation Chemist)',
    transitPassNumber: 'TP/FOR/GLT/2026/9114',
    vehicleNumber: 'AS-05-C-4412',
    driverName: 'Ramesh Gogoi',
    driverMobile: '+91 94350 11220',
    dispatchWeightKg: 75.00,
    parentBatchIds: ['HBT-AS-2026-001', 'HBT-AS-2026-002'],
    resinGrade: 'GRADE_A_DARK_RESIN'
  });

  // Available Form II State Transit Passes (filtered strictly for transit passes)
  const availableTransitPasses = useMemo(() => {
    const list = [];
    const seen = new Set();

    (permits || []).forEach(p => {
      const pNum = p.permitNumber || p.number;
      const isTransit = (p.permitType?.toLowerCase().includes('transit') || pNum?.startsWith('TP/')) &&
        !pNum?.startsWith('DFO/') &&
        !p.permitType?.toLowerCase().includes('felling');
      if (isTransit && pNum && !seen.has(pNum)) {
        seen.add(pNum);
        list.push({
          permitNumber: pNum,
          batchId: p.batchId || null,
          treeId: p.treeId || null,
          status: p.status || 'ACTIVE',
          farmerName: p.beneficiaryName || null
        });
      }
    });

    (harvestBatches || []).forEach(b => {
      if (b.transitPassNumber && b.transitPassNumber.startsWith('TP/') && !seen.has(b.transitPassNumber)) {
        seen.add(b.transitPassNumber);
        list.push({
          permitNumber: b.transitPassNumber,
          batchId: b.id,
          treeId: b.treeId,
          status: 'ACTIVE',
          farmerName: b.farmerName
        });
      }
    });

    return list;
  }, [permits, harvestBatches]);

  // Open Modal Helpers
  const openFarmDispatchModal = (preferredBatchId, intentDetails = {}) => {
    const b = (preferredBatchId && harvestBatches.find(x => x.id === preferredBatchId)) ||
      harvestBatches.find(x => x.status === 'IN_STOCK' || x.status === 'READY_FOR_DISPATCH') ||
      harvestBatches[0];
    const t = trees?.find(x => x.id === b?.treeId);

    const matchingTP = availableTransitPasses.find(p => p.batchId === b?.id || p.treeId === b?.treeId);
    const linkedTransitPass = intentDetails.transitPassNumber || b?.transitPassNumber || matchingTP?.permitNumber || `TP/FOR/GLT/2026/${Math.floor(1000 + Math.random() * 9000)}`;

    const linkedFellingPermit = permits?.find(p =>
      (p.permitType?.toLowerCase().includes('felling') || p.permitNumber?.startsWith('DFO/')) &&
      (p.batchId === b?.id || p.treeId === b?.treeId || p.linkedEntities?.includes(b?.treeId) || p.beneficiaryFarmerId === b?.farmerId)
    );
    const linkedHarvest = harvests?.find(h => h.treeId === b?.treeId || h.id === b?.harvestAuthId);
    const dfoSanction = intentDetails.fellingOrderNumber || b?.fellingOrderNumber || linkedFellingPermit?.permitNumber || linkedHarvest?.dfoSanctionNumber || 'DFO/GLT/2026/HARV-404';

    setFarmForm({
      batchId: b ? b.id : (intentDetails.batchId || 'HBT-AS-2026-003'),
      treeId: b?.treeId || t?.id || intentDetails.treeId || 'TRE-AS-001',
      plantingYear: b?.plantingYear || t?.plantingYear || 2014,
      treeAgeYears: b?.treeAgeYears || t?.ageYears || 12,
      variety: t?.variety || 'Aquilaria malaccensis',
      fellingOrderNumber: dfoSanction,
      resinGrade: b?.resinGrade || 'GRADE_A_DARK_RESIN',
      movementType: 'FARM_TO_AGGREGATOR',
      sourceType: 'Farmer Plot',
      sourceName: `${b?.farmerName || 'Bhaben Saikia'} Homestead (${b?.plantationId || 'PLT-AS-01'})`,
      farmerName: b?.farmerName || 'Bhaben Saikia',
      farmerId: b?.farmerId || 'FRM-AS-01',
      dispatchCustodian: `${b?.farmerName || 'Bhaben Saikia'} (Registered Farmer)`,
      destinationType: 'Aggregation Depot',
      destinationName: 'Golaghat Cluster Aggregation Depot',
      destinationFacilityId: 'DEPOT-GLT-01',
      receivingCustodian: 'B. C. Kalita (Depot Superintendent)',
      transitPassNumber: linkedTransitPass,
      vehicleNumber: 'AS-05-C-8812',
      driverName: 'Ramesh Gogoi',
      driverMobile: '+91 98640 22190',
      dispatchWeightKg: b?.netWeightKg || 38.5
    });
    setIsFarmModalOpen(true);
  };

  const openDepotDispatchModal = (preferredLotId) => {
    const agg = (preferredLotId && aggregations.find(x => x.id === preferredLotId)) || aggregations[0];
    setDepotForm({
      batchId: agg ? agg.id : 'AGG-AS-2026-01',
      movementType: 'AGGREGATOR_TO_DISTILLERY',
      sourceType: 'Aggregation Depot',
      sourceName: agg?.depotName || 'Golaghat Cluster Aggregation Depot',
      farmerName: 'Consolidated Aggregation Lot',
      dispatchCustodian: 'B. C. Kalita (Depot Superintendent)',
      destinationType: 'Processing Centre (Distillery)',
      destinationName: 'NERAMAC Common Processing Centre (CPC Golaghat)',
      destinationFacilityId: 'CPC-GLT-01',
      receivingCustodian: 'Dr. P. J. Mahanta (Distillation Chemist)',
      transitPassNumber: `TP/FOR/GLT/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleNumber: 'AS-05-C-4412',
      driverName: 'Ramesh Gogoi',
      driverMobile: '+91 94350 11220',
      dispatchWeightKg: agg?.totalWeightKg || 75.00,
      parentBatchIds: agg?.parentBatchIds || ['HBT-AS-2026-001', 'HBT-AS-2026-002'],
      resinGrade: agg?.uniformResinGrade || 'GRADE_A_DARK_RESIN'
    });
    setIsDepotModalOpen(true);
  };

  // React to Cross-Module Dispatch Intents (e.g. from HarvestModule or AggregationModule)
  useEffect(() => {
    if (dispatchIntent) {
      if (dispatchIntent.type === 'FARM_TO_AGGREGATOR') {
        openFarmDispatchModal(dispatchIntent.batchId, dispatchIntent);
      } else if (dispatchIntent.type === 'AGGREGATOR_TO_DISTILLERY') {
        openDepotDispatchModal(dispatchIntent.batchId);
      }
      setDispatchIntent(null);
    }
  }, [dispatchIntent]);

  // Helper to extract complete tree provenance for any movement
  const getTreeInfoForMovement = (m) => {
    const matchedBatch = harvestBatches.find(b => b.id === m.batchId);
    const targetTreeId = m.treeId || matchedBatch?.treeId || 'TRE-AS-001';
    const targetTree = trees?.find(t => t.id === targetTreeId);
    const plantingYear = m.plantingYear || matchedBatch?.plantingYear || targetTree?.plantingYear || 2014;
    const treeAgeYears = m.treeAgeYears || matchedBatch?.treeAgeYears || targetTree?.ageYears || (2026 - plantingYear);
    return {
      treeId: targetTreeId,
      plantingYear,
      treeAgeYears,
      variety: targetTree?.variety || 'Aquilaria malaccensis',
      farmerName: m.farmerName || matchedBatch?.farmerName || targetTree?.farmerName || 'Registered Grower',
      batch: matchedBatch
    };
  };

  // Helper when selecting by Harvest Batch in Leg 1 Farm Dispatch
  const handleSelectBatch = (batchId) => {
    const b = harvestBatches.find(x => x.id === batchId);
    if (!b) return;
    const t = trees?.find(x => x.id === b.treeId);
    const matchingTP = availableTransitPasses.find(p => p.batchId === b.id || p.treeId === b.treeId);
    const linkedTransitPass = b.transitPassNumber || matchingTP?.permitNumber || `TP/FOR/GLT/2026/${Math.floor(1000 + Math.random() * 9000)}`;

    const linkedFellingPermit = permits?.find(p =>
      (p.permitType?.toLowerCase().includes('felling') || p.permitNumber?.startsWith('DFO/')) &&
      (p.batchId === b.id || p.treeId === b.treeId || p.linkedEntities?.includes(b.treeId) || p.beneficiaryFarmerId === b.farmerId)
    );
    const linkedHarvest = harvests?.find(h => h.treeId === b.treeId || h.id === b.harvestAuthId);
    const dfoSanction = b.fellingOrderNumber || linkedFellingPermit?.permitNumber || linkedHarvest?.dfoSanctionNumber || 'DFO/GLT/2026/HARV-404';

    setFarmForm(prev => ({
      ...prev,
      batchId: b.id,
      treeId: b.treeId || t?.id || 'TRE-AS-001',
      plantingYear: b.plantingYear || t?.plantingYear || 2014,
      treeAgeYears: b.treeAgeYears || t?.ageYears || 12,
      variety: t?.variety || 'Aquilaria malaccensis',
      farmerName: b.farmerName || t?.farmerName || 'Registered Grower',
      farmerId: b.farmerId || t?.farmerId || 'FRM-AS-01',
      sourceName: `${b.farmerName || t?.farmerName || 'Registered Grower'} Homestead (${b.plantationId || t?.plantationId || 'PLT-AS-01'})`,
      dispatchWeightKg: b.netWeightKg || 38.5,
      transitPassNumber: linkedTransitPass,
      fellingOrderNumber: dfoSanction,
      resinGrade: b.resinGrade || 'GRADE_A_DARK_RESIN'
    }));
  };

  // Helper when selecting by Tagged Tree in Leg 1 Farm Dispatch
  const handleSelectTree = (treeId) => {
    const t = trees?.find(x => x.id === treeId);
    if (!t) return;
    const matchingBatch = harvestBatches.find(b => b.treeId === treeId);
    const matchingTP = availableTransitPasses.find(p => p.treeId === treeId || (matchingBatch && p.batchId === matchingBatch.id));
    const linkedTransitPass = matchingBatch?.transitPassNumber || matchingTP?.permitNumber || `TP/FOR/GLT/2026/${Math.floor(1000 + Math.random() * 9000)}`;

    const linkedFellingPermit = permits?.find(p =>
      (p.permitType?.toLowerCase().includes('felling') || p.permitNumber?.startsWith('DFO/')) &&
      (p.treeId === treeId || (matchingBatch && p.batchId === matchingBatch.id))
    );
    const linkedHarvest = harvests?.find(h => h.treeId === treeId || (matchingBatch && h.id === matchingBatch.harvestAuthId));
    const dfoSanction = matchingBatch?.fellingOrderNumber || linkedFellingPermit?.permitNumber || linkedHarvest?.dfoSanctionNumber || 'DFO/GLT/2026/HARV-379';

    setFarmForm(prev => ({
      ...prev,
      treeId: t.id,
      batchId: matchingBatch ? matchingBatch.id : `HBT-AS-2026-${treeId.slice(-3)}`,
      plantingYear: t.plantingYear || 2014,
      treeAgeYears: t.ageYears || 12,
      variety: t.variety || 'Aquilaria malaccensis',
      farmerName: t.farmerName || 'Registered Grower',
      farmerId: t.farmerId || 'FRM-AS-01',
      sourceName: `${t.farmerName || 'Registered Grower'} Homestead (${t.plantationId || 'PLT-AS-01'})`,
      dispatchWeightKg: matchingBatch?.netWeightKg || 38.5,
      transitPassNumber: linkedTransitPass,
      fellingOrderNumber: dfoSanction,
      resinGrade: matchingBatch?.resinGrade || 'GRADE_A_DARK_RESIN'
    }));
  };

  // Submit Handlers for Dedicated Modals
  const handleFarmDispatchSubmit = (e) => {
    e.preventDefault();
    createMovement({
      ...farmForm,
      movementType: 'FARM_TO_AGGREGATOR'
    });
    setIsFarmModalOpen(false);
    addToast(`Consignment ${farmForm.batchId} dispatched from Farm to Aggregator Depot!`, 'success');
  };

  const handleDepotDispatchSubmit = (e) => {
    e.preventDefault();
    createMovement({
      ...depotForm,
      movementType: 'AGGREGATOR_TO_DISTILLERY'
    });
    setIsDepotModalOpen(false);
    addToast(`Aggregation Lot ${depotForm.batchId} dispatched to CPC Distillery!`, 'success');
  };

  // Filtered movements based on dedicated page mode (not role-wise)
  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const type = m.movementType || (m.destinationType?.includes('Processing') ? 'AGGREGATOR_TO_DISTILLERY' : 'FARM_TO_AGGREGATOR');
      if (mode === 'FARM_TO_DEPOT' || mode === 'DEPOT_GATE_CHECK') return type === 'FARM_TO_AGGREGATOR';
      if (mode === 'DEPOT_TO_CPC' || mode === 'CPC_GATE_CHECK') return type === 'AGGREGATOR_TO_DISTILLERY';
      if (mode === 'GATE_RECEIPT') return m.status === 'IN_TRANSIT';
      if (activeTab === 'FARM_TO_AGGREGATOR') return type === 'FARM_TO_AGGREGATOR';
      if (activeTab === 'AGGREGATOR_TO_DISTILLERY') return type === 'AGGREGATOR_TO_DISTILLERY';
      if (activeTab === 'RECON_QUEUE') return m.status === 'IN_TRANSIT';
      return true;
    });
  }, [movements, activeTab, mode]);

  // Counts for tabs
  const farmToDepotCount = movements.filter(m => (m.movementType || (!m.destinationType?.includes('Processing') ? 'FARM_TO_AGGREGATOR' : '')) === 'FARM_TO_AGGREGATOR').length;
  const depotToCpcCount = movements.filter(m => (m.movementType || (m.destinationType?.includes('Processing') ? 'AGGREGATOR_TO_DISTILLERY' : '')) === 'AGGREGATOR_TO_DISTILLERY').length;
  const pendingReconCount = movements.filter(m => m.status === 'IN_TRANSIT').length;

  const handleOpenReceiveModal = (m) => {
    setReceiveTarget(m);
    setReceivedWeightInput(m.dispatchWeightKg);
    setReconcilingOfficer(
      m.receivingCustodian || (m.destinationType?.includes('Processing') ? 'Dr. P. J. Mahanta (Distillation Chemist)' : 'B. C. Kalita (Depot Superintendent)')
    );
    setReconNotes('Physical weighbridge verification conducted. Logs inspected for natural moisture variance.');
    setIsReceiveModalOpen(true);
  };

  const handleReceiveSubmit = (e) => {
    e.preventDefault();
    if (!receiveTarget) return;
    receiveMovement(receiveTarget.id, receivedWeightInput, reconcilingOfficer, reconNotes);
    setIsReceiveModalOpen(false);
    setReceiveTarget(null);
  };

  const columns = [
    {
      header: 'Movement ID & Leg',
      accessor: 'id',
      render: (m) => {
        const isFarmToDepot = (m.movementType === 'FARM_TO_AGGREGATOR') || !m.destinationType?.includes('Processing');
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 font-mono text-xs">{m.id}</span>
              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                isFarmToDepot
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-cyan-50 text-cyan-800 border-cyan-200'
              }`}>
                {isFarmToDepot ? 'Leg 1: Farm → Depot' : 'Leg 2: Depot → CPC'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
              <span>Pass: {m.transitPassNumber}</span>
              {m.grnNumber && (
                <span className="text-emerald-700 font-bold">• GRN: {m.grnNumber}</span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Consignment Batches & Tree Provenance',
      accessor: 'batchId',
      render: (m) => {
        const info = getTreeInfoForMovement(m);
        const isFarmToDepot = (m.movementType === 'FARM_TO_AGGREGATOR') || !m.destinationType?.includes('Processing');
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                {m.batchId}
              </span>
              {isFarmToDepot && (
                <span className="font-mono text-[10px] font-bold text-emerald-950 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  🌲 {info.treeId}
                </span>
              )}
            </div>
            {isFarmToDepot ? (
              <div className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="text-emerald-700 font-semibold">
                  Planted {info.plantingYear} ({info.treeAgeYears} yrs)
                </span>
                {m.farmerName && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-slate-600">
                      <User className="w-2.5 h-2.5 text-slate-400" />
                      {m.farmerName}
                    </span>
                  </>
                )}
              </div>
            ) : (
              m.farmerName && (
                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <Boxes className="w-3 h-3 text-cyan-600" />
                  <span>{m.farmerName}</span>
                </div>
              )
            )}
          </div>
        );
      }
    },
    {
      header: 'Custody Transfer Route',
      accessor: 'sourceName',
      render: (m) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">{m.sourceName}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-black text-slate-900">{m.destinationName}</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Truck className="w-3 h-3 text-slate-400" />
            <span>{m.vehicleNumber} ({m.driverName || 'Designated Driver'}{m.driverMobile ? ` • ${m.driverMobile}` : ''})</span>
          </div>
        </div>
      )
    },
    {
      header: 'Weighment (Disp → Recv)',
      accessor: 'dispatchWeightKg',
      render: (m) => {
        const isPending = m.receivedWeightKg === null || m.receivedWeightKg === undefined;
        return (
          <div>
            <div className="font-black text-slate-900 text-xs">
              {m.dispatchWeightKg} kg → {isPending ? (
                <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  In Transit
                </span>
              ) : (
                <span className="text-emerald-800">{m.receivedWeightKg} kg</span>
              )}
            </div>
            {m.variancePercent !== null && m.variancePercent !== undefined && (
              <div className={`text-[10px] font-bold ${
                Math.abs(m.variancePercent) <= 1.5 ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                Variance: {m.variancePercent > 0 ? `+${m.variancePercent}` : m.variancePercent}% ({m.varianceKg > 0 ? `+${m.varianceKg}` : m.varianceKg} kg)
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Gate Tolerance (≤ ±1.5%)',
      accessor: 'toleranceStatus',
      render: (m) => {
        if (m.toleranceStatus === 'PENDING_WEIGHMENT' || m.status === 'IN_TRANSIT') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <Clock className="w-3 h-3" />
              <span>AWAITING GATE RECON</span>
            </span>
          );
        }
        return <StatusBadge status={m.toleranceStatus} />;
      }
    },
    {
      header: 'Reconciliation & GRN Action',
      accessor: 'id',
      render: (m) => {
        const isGateCheckPage = !mode || mode === 'DEPOT_GATE_CHECK' || mode === 'CPC_GATE_CHECK' || mode === 'GATE_RECEIPT';
        return (
          <div>
            {m.status === 'IN_TRANSIT' && isGateCheckPage ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenReceiveModal(m);
                }}
                className="px-3 py-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center gap-1.5 animate-pulse"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Verify Weight &amp; Receive</span>
              </button>
            ) : m.status === 'IN_TRANSIT' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-3 h-3" />
                <span>In Transit • Awaiting Gate Weighment</span>
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMovement(m);
                }}
                className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center gap-1"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>View GRN Slip</span>
              </button>
            )}
          </div>
        );
      }
    }
  ];

  // Calculation for live modal tolerance preview
  const liveVarianceKg = receiveTarget ? Number((receivedWeightInput - receiveTarget.dispatchWeightKg).toFixed(2)) : 0;
  const liveVariancePct = receiveTarget && receiveTarget.dispatchWeightKg > 0
    ? Number(((liveVarianceKg / receiveTarget.dispatchWeightKg) * 100).toFixed(2))
    : 0;
  const isLiveWithinTolerance = Math.abs(liveVariancePct) <= 1.5;

  return (
    <div className="space-y-5">
      {/* 1. Header Hero Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Phase 3: Chain of Custody & Transit Gate
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                /movement
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                Gate Tolerance ≤ ±1.5%
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-1">
              {mode === 'FARM_TO_DEPOT'
                ? '1. Farm → Cluster Aggregation Depot Dispatch'
                : mode === 'DEPOT_GATE_CHECK'
                ? '2. Depot Gate Weight Check (Farm → Depot Receipt)'
                : mode === 'DEPOT_TO_CPC'
                ? '3. Depot → CPC Distillery Dispatch'
                : mode === 'CPC_GATE_CHECK'
                ? '4. CPC Gate Weight Check (Depot → CPC Receipt)'
                : mode === 'GATE_RECEIPT'
                ? 'Gate Weighment & Receipt Reconciliation (≤ ±1.5%)'
                : 'Material Movement & Gate Weightage Reconciliation'}
            </h1>
            <p className="text-xs text-slate-500">
              {mode === 'FARM_TO_DEPOT'
                ? 'First-Mile Dispatch: Dispatch felled homestead agarwood batches with Form II e-TP to Regional Cluster Aggregation Depot.'
                : mode === 'DEPOT_GATE_CHECK'
                ? 'Depot Intake Gate: Verify incoming Farm → Depot consignments on calibrated weighbridge (≤ ±1.5% tolerance) and issue GRN.'
                : mode === 'DEPOT_TO_CPC'
                ? 'Mid-Mile Bulk Haulage: Dispatch pooled homogeneous aggregation lots from Cluster Depot to CPC Distillery.'
                : mode === 'CPC_GATE_CHECK'
                ? 'CPC Distillery Intake Gate: Verify incoming Depot → CPC bulk lots on weighbridge (≤ ±1.5% tolerance) before distillation.'
                : mode === 'GATE_RECEIPT'
                ? 'Verify incoming transit consignments on calibrated weighbridge (maximum ±1.5% variance threshold) and issue digital GRN.'
                : 'Statutory Custody Flow: Harvest Batch Creation → Farm to Aggregator → Aggregator to Distillery → Receipt & Weight Reconciliation (Gate Tolerance ≤ ±1.5%)'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!mode && (
              <button
                onClick={() => setShowRoleGuide(!showRoleGuide)}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5"
              >
                <Info className="w-4 h-4 text-emerald-600" />
                <span>{showRoleGuide ? 'Hide Protocol Guide' : 'Show Operational Matrix'}</span>
              </button>
            )}

            {/* Page-Mode Specific Action Button (Strictly Single Purpose) */}
            {activeRole !== 'NERAMAC_ADMIN' && (mode === 'FARM_TO_DEPOT' || (!mode && (activeRole === 'FARMER' || (activeRole !== 'COLLECTION_OPERATOR' && activeTab === 'FARM_TO_AGGREGATOR')))) && (
              <button
                onClick={() => openFarmDispatchModal()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                <span>Dispatch Farm Consignment (Farm → Aggregator Depot)</span>
              </button>
            )}

            {activeRole !== 'NERAMAC_ADMIN' && (mode === 'DEPOT_TO_CPC' || (!mode && (activeRole === 'COLLECTION_OPERATOR' || (activeRole !== 'FARMER' && activeRole !== 'FIELD_AGENT' && activeTab === 'AGGREGATOR_TO_DISTILLERY')))) && (
              <button
                onClick={() => openDepotDispatchModal()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Boxes className="w-4 h-4" />
                <span>Dispatch Lot to CPC Distillery (Depot → CPC)</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Statutory Flow Breadcrumb (only in combined mode) */}
        {!mode && (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">Flow Sequence:</span>
            
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-[11px]">
              <span className="font-mono font-bold text-emerald-800">13</span>
              <span>Harvest Batch Creation</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold text-[11px] shadow-xs">
              <span className="font-mono font-bold text-emerald-800">14</span>
              <span>Farm to Aggregator</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-100 border border-cyan-300 text-cyan-950 font-bold text-[11px] shadow-xs">
              <span className="font-mono font-bold text-cyan-800">15</span>
              <span>Aggregator to Distillery</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 font-extrabold text-[11px] shadow-xs">
              <Scale className="w-3.5 h-3.5 text-amber-800" />
              <span className="font-mono font-bold text-amber-800">16</span>
              <span>Receipt & Weight Recon (≤ ±1.5%)</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-[11px]">
              <span className="font-mono font-bold text-slate-800">17</span>
              <span>Processing / Distillation</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            Active Role: <span className="font-bold text-emerald-800">{activeRole}</span>
          </div>
        </div>
        )}

        {/* 3. Comprehensive Operational Custody & Responsibilities Matrix */}
        {showRoleGuide && (
          <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/60 to-cyan-50/70 p-4 rounded-xl border border-emerald-200 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
              <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Operational Governance: Who Sends, Who Records & Who Reconciles?</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                Statutory Compliance Matrix
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Box 1: Farm to Aggregator */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-900 flex items-center gap-1.5 text-xs">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>Leg 1: Farm to Aggregator (First-Mile Transit)</span>
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Step 14</span>
                </div>
                
                <div className="space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
                  <div>
                    <strong className="text-slate-900">Who sends? </strong>
                    The <span className="font-bold text-emerald-800">Registered Farmer / Grower (FARMER)</span> is the legal owner of the felled wood upon DFO approval.
                  </div>
                  <div>
                    <strong className="text-slate-900">Who records the dispatch? </strong>
                    The <span className="font-bold text-amber-800">NERAMAC Field Agent (FIELD_AGENT)</span> on-site at tree felling records the calibrated field scale net weight, verifies the tree trunk QR tag, stamps the stump with SHA-256 photo hash, binds the State Forest Transit Pass (Form II), and mints the initial dispatch transit manifest.
                  </div>
                  <div>
                    <strong className="text-slate-900">Transit Status: </strong>
                    Consignment is marked <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded">IN_TRANSIT</span> from farm homestead to the cluster depot.
                  </div>
                </div>
              </div>

              {/* Box 2: Receipt & Weightage Reconciliation */}
              <div className="bg-white p-3.5 rounded-xl border border-teal-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-teal-900 flex items-center gap-1.5 text-xs">
                    <Scale className="w-4 h-4 text-teal-600" />
                    <span>Leg 1 Gate: Receipt & Weightage Reconciliation</span>
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Step 16</span>
                </div>
                
                <div className="space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
                  <div>
                    <strong className="text-slate-900">Who performs it? </strong>
                    The <span className="font-bold text-teal-800">Collection Centre Operator (COLLECTION_OPERATOR)</span> (Depot Superintendent / Weighbridge Officer) at the Cluster Aggregation Depot gate.
                  </div>
                  <div>
                    <strong className="text-slate-900">How weighment is reconciled: </strong>
                    The carrier vehicle drives onto the certified digital weighbridge. Gross weight minus tare weight determines net received weight.
                  </div>
                  <div>
                    <strong className="text-slate-900">Gate Tolerance Threshold: </strong>
                    The system evaluates <span className="font-bold text-slate-900">Variance % = ((Received - Dispatched) / Dispatched) &times; 100</span>.
                    If <span className="font-black text-emerald-700">&le; &plusmn;1.5%</span> (statutory moisture evaporation allowance), the system issues a digital <strong className="text-emerald-900">Goods Receipt Note (GRN)</strong> and credits payment advice to the farmer.
                  </div>
                </div>
              </div>

              {/* Box 3: Aggregator to Distillery */}
              <div className="bg-white p-3.5 rounded-xl border border-cyan-200 shadow-xs space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-cyan-900 flex items-center gap-1.5 text-xs">
                    <Factory className="w-4 h-4 text-cyan-600" />
                    <span>Leg 2: Aggregator Depot to CPC Distillery (Mid-Mile Bulk Haulage)</span>
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">Step 15</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-600 leading-relaxed">
                  <div>
                    <strong className="text-slate-900">Who sends? </strong>
                    The <span className="font-bold text-teal-800">Collection Centre Operator</span> assembles multiple source farmer batches into a homogenous Aggregation Lot (AGG) and dispatches it under e-Transit Pass.
                  </div>
                  <div>
                    <strong className="text-slate-900">Who receives & reconciles? </strong>
                    The <span className="font-bold text-cyan-800">Processing Centre Operator (CPC_OPERATOR)</span> / Distillation Chemist verifies boiler gate weighbridge intake (&le; &plusmn;1.5% tolerance) before hydro-distillation still loading.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4 & 5. Combined Multi-Tab KPIs & Tabs (Hidden when page is dedicated to a single task mode) */}
      {!mode && (
      <>
      {/* 4. KPI Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Movements</span>
            <Truck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{movements.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across all cluster corridors</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Farm to Aggregator</span>
            <Trees className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-800 mt-1">{farmToDepotCount}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">First-mile farmer consignments</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-cyan-600 uppercase">Depot to Distillery</span>
            <Factory className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl font-black text-cyan-800 mt-1">{depotToCpcCount}</div>
          <div className="text-[10px] text-cyan-600 mt-0.5">Mid-mile aggregated lots</div>
        </div>

        <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-300 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-amber-900 uppercase flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-amber-700" />
              <span>Pending Gate Recon</span>
            </span>
            {pendingReconCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </div>
          <div className="text-xl font-black text-amber-950 mt-1">{pendingReconCount}</div>
          <div className="text-[10px] font-bold text-amber-800 mt-0.5">Awaiting weighbridge verification</div>
        </div>
      </div>

      {/* 5. Navigation Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-1.5 rounded-xl font-extrabold transition flex items-center gap-1.5 ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>All Consignments</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-white">
            {movements.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('FARM_TO_AGGREGATOR')}
          className={`px-3.5 py-1.5 rounded-xl font-extrabold transition flex items-center gap-1.5 ${
            activeTab === 'FARM_TO_AGGREGATOR'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Leg 1: Farm → Aggregator Depot</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-700 text-white">
            {farmToDepotCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('AGGREGATOR_TO_DISTILLERY')}
          className={`px-3.5 py-1.5 rounded-xl font-extrabold transition flex items-center gap-1.5 ${
            activeTab === 'AGGREGATOR_TO_DISTILLERY'
              ? 'bg-cyan-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-cyan-50 hover:text-cyan-900'
          }`}
        >
          <Factory className="w-3.5 h-3.5" />
          <span>Leg 2: Aggregator Depot → CPC Distillery</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-800 text-white">
            {depotToCpcCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('RECON_QUEUE')}
          className={`px-3.5 py-1.5 rounded-xl font-extrabold transition flex items-center gap-1.5 ${
            activeTab === 'RECON_QUEUE'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>⚖️ Receipt & Weight Recon Queue</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-700 text-white font-mono">
            {pendingReconCount}
          </span>
        </button>
      </div>
      </>
      )}

      {/* 6. Main Data Table */}
      <DataTable
        columns={columns}
        data={filteredMovements}
        searchKey="batchId"
        searchPlaceholder="Search movement by Batch ID, route, driver, or transit pass..."
        onRowClick={(m) => setSelectedMovement(m)}
      />

      {/* MODAL 1: Detail Modal / Statutory Goods Receipt Note (GRN) View */}
      {selectedMovement && (
        <Modal
          isOpen={!!selectedMovement}
          onClose={() => setSelectedMovement(null)}
          title={`Consignment Custody Audit: ${selectedMovement.id}`}
          subtitle={`Transit Pass: ${selectedMovement.transitPassNumber} • Status: ${selectedMovement.status}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Header / GRN Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/80 pb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Official Voucher</span>
                  <div className="font-mono font-black text-sm text-emerald-950">
                    {selectedMovement.grnNumber || `PENDING_GRN_${selectedMovement.id}`}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Gate Tolerance Result</span>
                  <div className="font-bold text-xs">
                    {selectedMovement.status === 'IN_TRANSIT' ? (
                      <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Awaiting Weighbridge Intake</span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded font-mono ${
                        Math.abs(selectedMovement.variancePercent || 0) <= 1.5
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        Variance: {selectedMovement.variancePercent}% ({selectedMovement.toleranceStatus})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600">
                <span><strong>Consignment Batch:</strong> {selectedMovement.batchId}</span>
                <span><strong>Carrier:</strong> {selectedMovement.vehicleNumber} ({selectedMovement.driverName || 'Authorized Driver'})</span>
              </div>
            </div>

            {/* Direct Tree & Harvest Batch Provenance Audit */}
            {(() => {
              const info = getTreeInfoForMovement(selectedMovement);
              const isFarmToDepot = (selectedMovement.movementType === 'FARM_TO_AGGREGATOR') || !selectedMovement.destinationType?.includes('Processing');
              if (!isFarmToDepot) return null;
              return (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <Trees className="w-4 h-4 text-emerald-700" />
                      <span>Direct Tree & Harvest Batch Provenance</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                      Statutory Chain of Custody
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white p-3 rounded-xl border border-emerald-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Origin Tree ID:</span>
                      <span className="font-mono font-extrabold text-emerald-900">{info.treeId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Planting Year & Age:</span>
                      <span className="font-bold text-slate-800">
                        {info.plantingYear} ({info.treeAgeYears} Years)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Tree Species:</span>
                      <span className="italic text-slate-700 font-medium">{info.variety}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Felling Sanction:</span>
                      <span className="font-mono font-bold text-slate-700">
                        {selectedMovement.fellingOrderNumber || info.batch?.fellingOrderNumber || 'DFO/GLT/2026/HARV-379'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-emerald-900 pt-1 px-1">
                    <span><strong>Grower:</strong> {selectedMovement.farmerName || info.farmerName}</span>
                    <span><strong>State Forest e-TP:</strong> <span className="font-mono font-bold">{selectedMovement.transitPassNumber}</span></span>
                    {info.batch?.resinGrade && (
                      <span><strong>Wood Grade:</strong> <span className="font-semibold">{info.batch.resinGrade}</span></span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Dual Custody Handoff Stamping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dispatch Stamp */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-black">1. Dispatch Custody Stamp</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">Origin Gate</span>
                </div>
                <div className="font-bold text-slate-900 text-xs">{selectedMovement.sourceName}</div>
                <div className="text-[11px] text-slate-600">
                  <span className="text-slate-400">Dispatcher: </span>
                  <span className="font-semibold">{selectedMovement.dispatchCustodian}</span>
                </div>
                {(selectedMovement.driverName || selectedMovement.driverMobile) && (
                  <div className="text-[11px] text-slate-600">
                    <span className="text-slate-400">Driver: </span>
                    <span className="font-semibold">
                      {selectedMovement.driverName || 'Designated Driver'}
                      {selectedMovement.driverMobile ? ` (${selectedMovement.driverMobile})` : ''}
                    </span>
                  </div>
                )}
                {selectedMovement.farmerName && (
                  <div className="text-[11px] text-emerald-800">
                    <span className="text-slate-400">Grower: </span>
                    <span className="font-bold">{selectedMovement.farmerName}</span>
                  </div>
                )}
                {selectedMovement.dispatchCoordinates && (
                  <div className="text-[10px] font-mono text-emerald-800 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>{selectedMovement.dispatchCoordinates[0].toFixed(4)}°N, {selectedMovement.dispatchCoordinates[1].toFixed(4)}°E</span>
                    </span>
                    <span>(&plusmn;{selectedMovement.dispatchAccuracyM || 1.1}m)</span>
                  </div>
                )}
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(selectedMovement.dispatchTimestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Receipt Stamp */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-black">2. Gate Intake & Weighbridge Stamp</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    selectedMovement.status === 'IN_TRANSIT' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedMovement.status === 'IN_TRANSIT' ? 'In Transit' : 'Reconciled'}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-xs">{selectedMovement.destinationName}</div>
                <div className="text-[11px] text-slate-600">
                  <span className="text-slate-400">Receiving Custodian: </span>
                  <span className="font-semibold">{selectedMovement.receivingCustodian || 'Depot Superintendent'}</span>
                </div>
                {selectedMovement.receiptCoordinates && (
                  <div className="text-[10px] font-mono text-emerald-800 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>{selectedMovement.receiptCoordinates[0].toFixed(4)}°N, {selectedMovement.receiptCoordinates[1].toFixed(4)}°E</span>
                    </span>
                    <span>(&plusmn;{selectedMovement.receiptAccuracyM || 1.0}m)</span>
                  </div>
                )}
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{selectedMovement.receiptTimestamp ? new Date(selectedMovement.receiptTimestamp).toLocaleString() : 'Pending Gate Arrival'}</span>
                </div>
              </div>
            </div>

            {/* Weighment Reconciliation Table */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <span className="font-black text-slate-800 block text-xs">Physical Weighment Reconciliation</span>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Certified Dispatch Scale</span>
                  <div className="text-base font-black text-slate-900 mt-0.5">{selectedMovement.dispatchWeightKg} kg</div>
                  <div className="text-[9px] text-slate-400">Calibrated Field Scale</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Depot Weighbridge</span>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {selectedMovement.receivedWeightKg !== null ? `${selectedMovement.receivedWeightKg} kg` : 'In Transit'}
                  </div>
                  <div className="text-[9px] text-slate-400">Gross Tare Differential</div>
                </div>

                <div className={`p-2.5 rounded-lg border ${
                  Math.abs(selectedMovement.variancePercent || 0) <= 1.5
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <span className="text-[10px] font-bold uppercase block">Net Variance (&le; &plusmn;1.5%)</span>
                  <div className="text-base font-black mt-0.5">
                    {selectedMovement.variancePercent !== null ? `${selectedMovement.variancePercent}%` : 'Pending'}
                  </div>
                  <div className="text-[9px] font-semibold">
                    {selectedMovement.varianceKg !== null ? `(${selectedMovement.varianceKg > 0 ? `+${selectedMovement.varianceKg}` : selectedMovement.varianceKg} kg)` : 'Under Transit'}
                  </div>
                </div>
              </div>

              {selectedMovement.notes && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                  <strong className="text-slate-900">Weighbridge Inspector Notes: </strong>
                  {selectedMovement.notes}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="text-[11px] text-slate-400 font-mono">
                Assam Forest Regulation 1891 • Form II e-TP Mandate
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addToast(`Goods Receipt Note ${selectedMovement.grnNumber || selectedMovement.id} sent to local printer spool`, 'info')}
                  className="px-3 py-2 border rounded-xl font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print GRN</span>
                </button>
                <button
                  onClick={() => setSelectedMovement(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black shadow-xs hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: Receipt & Weightage Reconciliation Form (Gate Intake) */}
      {receiveTarget && (
        <Modal
          isOpen={isReceiveModalOpen}
          onClose={() => {
            setIsReceiveModalOpen(false);
            setReceiveTarget(null);
          }}
          title="Gate Receipt & Weightage Reconciliation"
          subtitle={`Movement ID: ${receiveTarget.id} • Carrier: ${receiveTarget.vehicleNumber} • Driver: ${receiveTarget.driverName || 'Assigned Driver'}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleReceiveSubmit} className="space-y-4 text-xs">
            {/* Summary of Dispatched Cargo */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Consignment Batches</span>
                  <div className="font-mono font-black text-slate-900 text-xs">{receiveTarget.batchId}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">State Transit Pass</span>
                  <div className="font-mono font-bold text-slate-800 text-xs">{receiveTarget.transitPassNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Dispatch Location: </span>
                  <span className="font-bold text-slate-800">{receiveTarget.sourceName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Intake Destination: </span>
                  <span className="font-bold text-slate-900">{receiveTarget.destinationName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Sender Custodian: </span>
                  <span className="font-medium text-slate-700">{receiveTarget.dispatchCustodian}</span>
                </div>
                <div>
                  <span className="text-slate-400">Certified Dispatch Weight: </span>
                  <span className="font-black text-emerald-800">{receiveTarget.dispatchWeightKg} kg</span>
                </div>
              </div>
            </div>

            {/* Weighbridge Input */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-900">
                Calibrated Weighbridge Net Received Weight (kg) *
              </label>
              <input
                type="number"
                step="0.05"
                required
                value={receivedWeightInput}
                onChange={(e) => setReceivedWeightInput(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 border-2 border-emerald-500 rounded-xl text-lg font-black text-slate-900 focus:outline-emerald-600 font-mono"
              />
              <span className="text-[10px] text-slate-500">
                Net weight recorded from calibrated platform weighbridge (Gross truck weight minus tare weight).
              </span>

              {/* Quick Simulation Presets */}
              <div className="flex items-center gap-1.5 pt-1 text-[10px]">
                <span className="font-bold text-slate-500">Quick Test Presets:</span>
                <button
                  type="button"
                  onClick={() => setReceivedWeightInput(Number((receiveTarget.dispatchWeightKg - 0.15).toFixed(2)))}
                  className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold"
                >
                  -0.15 kg (Natural Moisture Loss, Pass)
                </button>
                <button
                  type="button"
                  onClick={() => setReceivedWeightInput(receiveTarget.dispatchWeightKg)}
                  className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold"
                >
                  Exact Match ({receiveTarget.dispatchWeightKg} kg)
                </button>
                <button
                  type="button"
                  onClick={() => setReceivedWeightInput(Number((receiveTarget.dispatchWeightKg - 1.20).toFixed(2)))}
                  className="px-2 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold"
                >
                  -1.20 kg (Exceeds 1.5% Hold)
                </button>
              </div>
            </div>

            {/* Dynamic Real-Time Tolerance Gauge */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              isLiveWithinTolerance
                ? 'bg-emerald-50/70 border-emerald-300'
                : 'bg-rose-50/80 border-rose-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-slate-700" />
                  <span>Gate Tolerance Calculation (&le; &plusmn;1.5% Maximum Limit)</span>
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isLiveWithinTolerance
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-rose-200 text-rose-900'
                }`}>
                  {isLiveWithinTolerance ? 'PASS: WITHIN TOLERANCE' : 'ALERT: TOLERANCE EXCEEDED'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block">Weight Variance</span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    {liveVarianceKg > 0 ? `+${liveVarianceKg}` : liveVarianceKg} kg
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Variance Percentage</span>
                  <span className={`font-mono font-black text-sm ${
                    isLiveWithinTolerance ? 'text-emerald-800' : 'text-rose-800'
                  }`}>
                    {liveVariancePct > 0 ? `+${liveVariancePct}` : liveVariancePct}%
                  </span>
                </div>
              </div>

              <div className="text-[11px] pt-1">
                {isLiveWithinTolerance ? (
                  <div className="flex items-start gap-1.5 text-emerald-900 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Moisture transpiration is within the legal 1.5% gate threshold. Confirming receipt will generate official Goods Receipt Note (GRN) and approve farmer procurement credit.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-1.5 text-rose-900 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Variance exceeds the statutory &plusmn;1.5% threshold! Accepting this consignment will mark it as TOLERANCE_EXCEEDED and hold it in quarantine for a joint survey with the DFO and Depot Superintendent.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Receiving Officer & Remarks */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Reconciling Officer Name & Designation *
                </label>
                <input
                  type="text"
                  required
                  value={reconcilingOfficer}
                  onChange={(e) => setReconcilingOfficer(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Weighbridge Audit Remarks & Physical Condition
                </label>
                <textarea
                  rows={2}
                  value={reconNotes}
                  onChange={(e) => setReconNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsReceiveModalOpen(false);
                  setReceiveTarget(null);
                }}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 text-white rounded-xl font-black shadow-xs transition flex items-center gap-1.5 ${
                  isLiveWithinTolerance
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-700 hover:bg-rose-800'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Confirm Weighment & Issue GRN</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Dedicated Leg 1 Modal - Farm to Aggregator Depot (Step 14) */}
      <Modal
        isOpen={isFarmModalOpen}
        onClose={() => setIsFarmModalOpen(false)}
        title="Dispatch Farm Consignment to Aggregator Depot (Flow Step 14)"
        subtitle="First-Mile Statutory Custody Transfer: Homestead Tree Felling to Regional Cluster Aggregation Depot"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleFarmDispatchSubmit} className="space-y-4 text-xs">
          {/* Statutory Step Indicator Banner */}
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-emerald-950 font-bold">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-black">
                14
              </span>
              <span className="text-xs">Corridor: Farmer Homestead → Cluster Aggregation Depot</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
              Form II e-TP Mandated
            </span>
          </div>

          {/* Consignment Selection with Direct Tree & Batch Linking */}
          <div className="p-3 bg-slate-50 border border-emerald-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-black text-slate-800">
                Target Consignment Linkage (Select Batch or Tree) *
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFarmSelectionMode('BY_BATCH')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    farmSelectionMode === 'BY_BATCH'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  By Harvest Batch
                </button>
                <button
                  type="button"
                  onClick={() => setFarmSelectionMode('BY_TREE')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    farmSelectionMode === 'BY_TREE'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  By Tagged Tree
                </button>
              </div>
            </div>

            {farmSelectionMode === 'BY_BATCH' ? (
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">
                  Choose felled & tagged harvest batch:
                </span>
                <select
                  value={farmForm.batchId}
                  onChange={(e) => handleSelectBatch(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold bg-white text-xs"
                >
                  {harvestBatches.map(b => {
                    const t = trees?.find(x => x.id === b.treeId);
                    const pYear = b.plantingYear || t?.plantingYear || 2014;
                    const age = b.treeAgeYears || t?.ageYears || 12;
                    return (
                      <option key={b.id} value={b.id}>
                        {b.id} • Tree: {b.treeId} (Planted {pYear}, {age} yrs) • {b.netWeightKg} kg • Grower: {b.farmerName}
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">
                  Choose registered homestead tree:
                </span>
                <select
                  value={farmForm.treeId || 'TRE-AS-001'}
                  onChange={(e) => handleSelectTree(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold bg-white text-xs"
                >
                  {(trees || []).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.id} • Grower: {t.farmerName || 'Bhaben Saikia'} • Planted {t.plantingYear || 2014} ({t.ageYears || 12} yrs) • {t.variety || 'Aquilaria'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Live Provenance Summary Seal */}
            <div className="p-2.5 bg-white rounded-lg border border-emerald-300 space-y-1.5 font-mono text-[11px] shadow-2xs">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-1 text-[10px]">
                <span className="font-sans font-black text-emerald-950 flex items-center gap-1">
                  <Trees className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Statutory Chain of Custody Seal</span>
                </span>
                <span className="text-emerald-950 font-black bg-emerald-100 px-2 py-0.5 rounded border border-emerald-400 shadow-2xs">
                  Form II Verified
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-600 block font-bold font-sans">Origin Tree:</span>
                  <span className="font-black text-emerald-950">{farmForm.treeId}</span>
                </div>
                <div>
                  <span className="text-slate-600 block font-bold font-sans">Planting Year:</span>
                  <span className="font-extrabold text-slate-900">{farmForm.plantingYear} ({farmForm.treeAgeYears} yrs)</span>
                </div>
                <div>
                  <span className="text-slate-600 block font-bold font-sans">Harvest Batch:</span>
                  <span className="font-black text-slate-900">{farmForm.batchId}</span>
                </div>
                <div>
                  <span className="text-slate-600 block font-bold font-sans">DFO Sanction:</span>
                  <span className="font-black text-teal-950">{farmForm.fellingOrderNumber || 'DFO/GLT/2026/HARV-379'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Source and Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Source Homestead Plot *</label>
              <input
                type="text"
                required
                value={farmForm.sourceName}
                onChange={(e) => setFarmForm({ ...farmForm, sourceName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Destination Cluster Aggregation Depot *</label>
              <select
                value={farmForm.destinationName}
                onChange={(e) => setFarmForm({ ...farmForm, destinationName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold bg-white"
              >
                <option value="Golaghat Cluster Aggregation Depot">Golaghat Cluster Aggregation Depot</option>
                <option value="Kadamtala Hub Aggregation Depot">Kadamtala Hub Aggregation Depot</option>
                <option value="Hojai Central Aggregation Depot">Hojai Central Aggregation Depot</option>
              </select>
            </div>
          </div>

          {/* Transit Pass and Vehicle Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                State Transit Pass (Form II e-TP) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={farmForm.transitPassNumber}
                  onChange={(e) => setFarmForm({ ...farmForm, transitPassNumber: e.target.value })}
                  className="w-full px-3 py-2 pr-20 border rounded-lg font-mono bg-white font-black text-emerald-950 text-xs border-emerald-400 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                  placeholder="TP/FOR/GLT/2026/..."
                />
                {farmForm.transitPassNumber?.startsWith('TP/') && (
                  <span className="absolute right-1.5 top-1.5 text-[9px] font-black uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                    Form II Active
                  </span>
                )}
              </div>

              {availableTransitPasses.length > 0 && (
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-bold shrink-0">Available e-TP:</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setFarmForm({ ...farmForm, transitPassNumber: e.target.value });
                      }
                    }}
                    value={farmForm.transitPassNumber}
                    className="w-full text-[10px] font-mono border border-slate-300 rounded px-1.5 py-0.5 bg-slate-50 text-slate-700 hover:bg-white truncate"
                    title="Select State Forest e-Transit Pass"
                  >
                    <option value="">Choose active e-TP...</option>
                    {farmForm.transitPassNumber && !availableTransitPasses.some(p => p.permitNumber === farmForm.transitPassNumber) && (
                      <option value={farmForm.transitPassNumber}>
                        {farmForm.transitPassNumber} {farmForm.batchId ? `• ${farmForm.batchId}` : ''}
                      </option>
                    )}
                    {availableTransitPasses.map(p => (
                      <option key={p.permitNumber} value={p.permitNumber}>
                        {p.permitNumber} {p.batchId ? `• ${p.batchId}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <span className="text-[10px] text-slate-500 block mt-1">
                Mandatory under Assam Forest Reg. 1891 for legal road transport
              </span>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Vehicle Registration *</label>
              <input
                type="text"
                required
                value={farmForm.vehicleNumber}
                onChange={(e) => setFarmForm({ ...farmForm, vehicleNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Field Net Scale (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={farmForm.dispatchWeightKg}
                onChange={(e) => setFarmForm({ ...farmForm, dispatchWeightKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg font-black bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Carrier Driver Name *</label>
              <input
                type="text"
                required
                value={farmForm.driverName}
                onChange={(e) => setFarmForm({ ...farmForm, driverName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Driver Mobile Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98640 00000"
                value={farmForm.driverMobile}
                onChange={(e) => setFarmForm({ ...farmForm, driverMobile: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Dispatching Custodian (Field Agent / Farmer)</label>
              <input
                type="text"
                value={farmForm.dispatchCustodian}
                onChange={(e) => setFarmForm({ ...farmForm, dispatchCustodian: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsFarmModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-xs transition flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              <span>Confirm Farm Consignment Dispatch</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Dedicated Leg 2 Modal - Aggregator Depot to CPC Distillery (Step 15) */}
      <Modal
        isOpen={isDepotModalOpen}
        onClose={() => setIsDepotModalOpen(false)}
        title="Dispatch Aggregated Lot to CPC Distillery (Flow Step 15)"
        subtitle="Mid-Mile Bulk Transit: Regional Aggregator Depot to NERAMAC Central Processing Centre"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleDepotDispatchSubmit} className="space-y-4 text-xs">
          {/* Statutory Step Indicator Banner */}
          <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-300 flex items-center justify-between text-cyan-950 font-bold">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-700 text-white flex items-center justify-center text-[10px] font-black">
                15
              </span>
              <span className="text-xs">Corridor: Aggregator Depot → Central Processing Centre (CPC Distillery)</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-200 text-cyan-900">
              Bulk Haulage Manifest
            </span>
          </div>

          {/* Aggregated Lot Selection */}
          <div className="p-3 bg-slate-50 border border-cyan-200 rounded-xl space-y-2.5">
            <label className="block text-[11px] font-black text-slate-800">
              Select Aggregated Lot for CPC Haulage *
            </label>
            <select
              value={depotForm.batchId}
              onChange={(e) => {
                const agg = aggregations.find(x => x.id === e.target.value);
                setDepotForm({
                  ...depotForm,
                  batchId: e.target.value,
                  dispatchWeightKg: agg?.totalWeightKg || 75.0,
                  sourceName: agg?.depotName || depotForm.sourceName,
                  parentBatchIds: agg?.parentBatchIds || depotForm.parentBatchIds,
                  resinGrade: agg?.uniformResinGrade || depotForm.resinGrade
                });
              }}
              className="w-full px-3 py-2 border rounded-lg font-mono font-bold bg-white text-xs"
            >
              {aggregations.map(a => (
                <option key={a.id} value={a.id}>
                  {a.id} • {a.totalWeightKg} kg • Grade: {(a.uniformResinGrade || 'GRADE_A_DARK_RESIN').replace(/_/g, ' ')} • Depot: {a.depotName}
                </option>
              ))}
            </select>

            {/* Live Aggregation Genealogy Box */}
            <div className="p-2.5 bg-white rounded-lg border border-cyan-200 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between border-b border-cyan-100 pb-1 text-[10px]">
                <span className="font-sans font-black text-cyan-950 flex items-center gap-1">
                  <Boxes className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Aggregated Lot Genealogy Manifest</span>
                </span>
                <span className="text-cyan-800 font-bold bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                  {depotForm.resinGrade?.replace(/_/g, ' ') || 'GRADE A'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-400 block font-sans">Origin Depot:</span>
                  <span className="font-bold text-cyan-900">{depotForm.sourceName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans">Total Batch Net Weight:</span>
                  <span className="font-bold text-slate-800">{depotForm.dispatchWeightKg} kg</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block font-sans">Constituent Harvest Batches:</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {(depotForm.parentBatchIds || ['HBT-AS-2026-001', 'HBT-AS-2026-002']).map(pId => (
                      <span key={pId} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 font-bold">
                        {pId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Source Depot & Destination Processing Centre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Source Aggregation Facility *</label>
              <input
                type="text"
                required
                value={depotForm.sourceName}
                onChange={(e) => setDepotForm({ ...depotForm, sourceName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Destination Central Processing Centre (Distillery) *</label>
              <select
                value={depotForm.destinationName}
                onChange={(e) => setDepotForm({ ...depotForm, destinationName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold bg-white"
              >
                <option value="NERAMAC Common Processing Centre (CPC Golaghat)">NERAMAC Common Processing Centre (CPC Golaghat)</option>
                <option value="NERAMAC Common Processing Centre (CPC Kadamtala)">NERAMAC Common Processing Centre (CPC Kadamtala)</option>
              </select>
            </div>
          </div>

          {/* Transit Pass and Vehicle Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Inter-Facility e-TP *</label>
              <input
                type="text"
                required
                value={depotForm.transitPassNumber}
                onChange={(e) => setDepotForm({ ...depotForm, transitPassNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Vehicle Registration *</label>
              <input
                type="text"
                required
                value={depotForm.vehicleNumber}
                onChange={(e) => setDepotForm({ ...depotForm, vehicleNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Depot Net Scale (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={depotForm.dispatchWeightKg}
                onChange={(e) => setDepotForm({ ...depotForm, dispatchWeightKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg font-black bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Carrier Driver Name *</label>
              <input
                type="text"
                required
                value={depotForm.driverName}
                onChange={(e) => setDepotForm({ ...depotForm, driverName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Driver Mobile Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 94350 00000"
                value={depotForm.driverMobile}
                onChange={(e) => setDepotForm({ ...depotForm, driverMobile: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Dispatching Custodian (Depot Superintendent)</label>
              <input
                type="text"
                value={depotForm.dispatchCustodian}
                onChange={(e) => setDepotForm({ ...depotForm, dispatchCustodian: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsDepotModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-black shadow-xs transition flex items-center gap-1.5"
            >
              <Boxes className="w-4 h-4" />
              <span>Confirm Aggregated Lot Dispatch to CPC</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
