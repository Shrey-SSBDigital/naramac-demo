import React, { useState, useMemo, useEffect } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { useAppRouter } from '../../router/useAppRouter';
import {
  Boxes,
  Plus,
  GitMerge,
  ArrowRight,
  CheckSquare,
  Square,
  Check,
  Scale,
  Building2,
  Sparkles,
  AlertCircle,
  Filter,
  CheckCircle2,
  Layers,
  TreePine,
  User,
  Info,
  Truck,
  Scissors
} from 'lucide-react';

export default function AggregationModule() {
  const { aggregations, createAggregation, splitHarvestBatch, harvestBatches, addToast, setDispatchIntent, activeRole } = useEnterprise();
  const { navigate } = useAppRouter();
  const [selectedAgg, setSelectedAgg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Split Harvest Batch Modal State
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splitSourceBatchId, setSplitSourceBatchId] = useState('');
  const [splitWeight1, setSplitWeight1] = useState(0);

  const activeBatchesForSplit = harvestBatches.filter(b => b.status !== 'SPLIT_INTO_SUBBATCHES' && !b.parentOfAggregation);
  const selectedSplitBatch = harvestBatches.find(b => b.id === splitSourceBatchId) || activeBatchesForSplit[0] || null;
  const splitWeight2 = selectedSplitBatch
    ? Math.max(0, Math.round(((selectedSplitBatch.netWeightKg || 0) - (parseFloat(splitWeight1) || 0)) * 10) / 10)
    : 0;

  const openSplitModal = (batch = null) => {
    const target = batch || activeBatchesForSplit[0];
    if (!target) {
      addToast('No unmerged harvest batch available to split', 'warning');
      return;
    }
    setSplitSourceBatchId(target.id);
    setSplitWeight1(Math.round(((target.netWeightKg || 0) / 2) * 10) / 10);
    setIsSplitModalOpen(true);
  };

  const handleSplitSubmit = (e) => {
    e.preventDefault();
    if (!selectedSplitBatch) return;
    const w1 = parseFloat(splitWeight1) || 0;
    const w2 = splitWeight2;
    if (w1 <= 0 || w2 <= 0) {
      addToast('Both split harvest batch weights must be greater than 0 kg', 'warning');
      return;
    }
    splitHarvestBatch(selectedSplitBatch.id, [w1, w2]);
    setIsSplitModalOpen(false);
  };

  // Filter options for Modal
  const [includeAllBatches, setIncludeAllBatches] = useState(false);
  const [depotFilter, setDepotFilter] = useState('ALL');

  // Selected batch IDs for aggregation
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);

  // Filter poolable batches (exclude already-split parent batches)
  const poolableBatches = useMemo(() => {
    return harvestBatches.filter(b => {
      if (b.status === 'SPLIT_INTO_SUBBATCHES') return false;
      if (includeAllBatches) return true;
      return (
        b.status === 'IN_STOCK' ||
        b.status === 'READY_FOR_DISPATCH' ||
        b.status === 'RECEIVED_AT_DEPOT' ||
        !b.parentOfAggregation
      );
    });
  }, [harvestBatches, includeAllBatches]);

  // When modal opens, auto-select fresh unaggregated batches as sensible initial selection
  useEffect(() => {
    if (isModalOpen) {
      const freshBatches = harvestBatches.filter(
        b => b.status === 'IN_STOCK' || !b.parentOfAggregation
      );
      if (freshBatches.length >= 2) {
        setSelectedBatchIds(freshBatches.slice(0, 2).map(b => b.id));
      } else if (freshBatches.length === 1) {
        setSelectedBatchIds([freshBatches[0].id]);
      } else if (harvestBatches.length > 0) {
        // Fallback for demo: show and select first 2
        setIncludeAllBatches(true);
        setSelectedBatchIds(harvestBatches.slice(0, 2).map(b => b.id));
      }
    }
  }, [isModalOpen, harvestBatches]);

  // Calculate selected batches details
  const selectedBatchObjects = useMemo(() => {
    return harvestBatches.filter(b => selectedBatchIds.includes(b.id));
  }, [harvestBatches, selectedBatchIds]);

  // Calculate total weight dynamically
  const calculatedTotalWeight = useMemo(() => {
    const sum = selectedBatchObjects.reduce((acc, b) => acc + (b.netWeightKg || 0), 0);
    return Math.round(sum * 10) / 10;
  }, [selectedBatchObjects]);

  // Detect resin grade uniformity or mixed grades
  const resinGradeAnalysis = useMemo(() => {
    if (selectedBatchObjects.length === 0) return { isUniform: true, dominantGrade: 'GRADE_A_DARK_RESIN' };
    const grades = selectedBatchObjects.map(b => b.resinGrade || 'GRADE_A_DARK_RESIN');
    const first = grades[0];
    const isUniform = grades.every(g => g === first);
    return { isUniform, dominantGrade: first, allGrades: Array.from(new Set(grades)) };
  }, [selectedBatchObjects]);

  const [form, setForm] = useState({
    cluster: 'Golaghat Cluster',
    depotName: 'Golaghat Cluster Aggregation Depot',
    depotId: 'DEPOT-GLT-01',
    uniformResinGrade: 'GRADE_A_DARK_RESIN',
    chippingSpecification: '2mm - 4mm Distillation Flakes',
    storageBay: 'Bay-3',
    destinationCPC: 'CPC-GLT-01 (NERAMAC CPC Bokakhat)',
    supervisor: 'B. C. Kalita (Depot Superintendent)'
  });

  // Keep uniformResinGrade synced with selected batches
  useEffect(() => {
    if (resinGradeAnalysis.dominantGrade) {
      setForm(prev => ({ ...prev, uniformResinGrade: resinGradeAnalysis.dominantGrade }));
    }
  }, [resinGradeAnalysis.dominantGrade]);

  // Toggle batch selection
  const toggleBatch = (batchId) => {
    setSelectedBatchIds(prev =>
      prev.includes(batchId) ? prev.filter(id => id !== batchId) : [...prev, batchId]
    );
  };

  // Select all visible batches
  const handleSelectAll = () => {
    const visibleIds = poolableBatches.map(b => b.id);
    setSelectedBatchIds(visibleIds);
  };

  // Clear all selections
  const handleClearAll = () => {
    setSelectedBatchIds([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedBatchIds.length === 0) {
      addToast('Please select at least 1 harvest batch to form an aggregation charge', 'warning');
      return;
    }

    createAggregation({
      ...form,
      parentBatchIds: selectedBatchIds,
      totalWeightKg: calculatedTotalWeight,
      parentDetails: selectedBatchObjects.map(b => ({
        batchId: b.id,
        farmer: b.farmerName || 'Registered Grower',
        weightKg: b.netWeightKg || 35.0,
        resinGrade: b.resinGrade || 'GRADE_A_DARK_RESIN'
      }))
    });

    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Aggregation Batch ID',
      accessor: 'id',
      render: (a) => (
        <div>
          <span className="font-extrabold text-slate-900 font-mono text-xs">{a.id}</span>
          <div className="text-[10px] text-slate-500 font-mono">{a.aggregationDate}</div>
        </div>
      )
    },
    {
      header: 'Depot Facility',
      accessor: 'depotName',
      render: (a) => (
        <div>
          <span className="font-bold text-slate-800">{a.depotName}</span>
          <div className="text-[11px] text-slate-500">{a.storageBay}</div>
        </div>
      )
    },
    {
      header: 'Genealogy Parents',
      accessor: 'parentBatchIds',
      render: (a) => (
        <div className="flex flex-wrap gap-1">
          {a.parentBatchIds.map(pId => (
            <span key={pId} className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              {pId}
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Total Weight',
      accessor: 'totalWeightKg',
      render: (a) => (
        <div>
          <span className="font-black text-slate-900">{a.totalWeightKg} kg</span>
          <div className="text-[10px] text-slate-500">{a.chippingSpecification}</div>
        </div>
      )
    },
    {
      header: 'Resin Classification',
      accessor: 'uniformResinGrade',
      render: (a) => (
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
          {(a.uniformResinGrade || 'GRADE_A_DARK_RESIN').replace(/_/g, ' ')}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (a) => <StatusBadge status={a.status} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (a) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAgg(a);
            }}
            className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
          >
            Genealogy
          </button>
          {a.status !== 'SPLIT_INTO_SUBLOTS' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openSplitModal(a);
              }}
              className="px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition flex items-center gap-1"
              title="Split this Lot into sub-lots"
            >
              <Scissors className="w-3 h-3 text-amber-700" />
              <span>Split</span>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDispatchIntent({ type: 'AGGREGATOR_TO_DISTILLERY', batchId: a.id });
              navigate('/movement/depot-to-cpc');
            }}
            className="px-2.5 py-1 text-xs font-bold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition flex items-center gap-1"
            title="Dispatch Lot to CPC Distillery (Step 15)"
          >
            <Truck className="w-3 h-3 text-cyan-600" />
            <span>Dispatch to CPC</span>
          </button>
        </div>
      )
    }
  ];

  const isDepotRole = activeRole === 'COLLECTION_OPERATOR';
  const isAdminRole = activeRole === 'NERAMAC_ADMIN';

  return (
    <div className="space-y-5">
      {/* Role-Specific Separation of Concerns Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl shadow-xs border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
            <GitMerge className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm">
                Depot Lot Management • Merge &amp; Split Lots
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Persona: {activeRole}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              <strong>Multi-Grower Lot Traceability:</strong> Merge multiple farmer harvest batches into a uniform Depot Lot, or Split a Depot Lot into smaller lots while maintaining 100% backward lineage.
            </p>
          </div>
        </div>

        {isDepotRole ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openSplitModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
            >
              <Scissors className="w-4 h-4" />
              <span>Split Harvest Batch</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
            >
              <GitMerge className="w-4 h-4" />
              <span>Merge Batches into Lot</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Depot Lot Management (Merge &amp; Split)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 08
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Merge multiple Harvest Batches (HBT) into uniform Depot Lots (LOT), or split existing Lots into sub-lots with intact genealogy.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={aggregations}
        searchKey="id"
        searchPlaceholder="Search aggregation batches by ID or facility..."
        onRowClick={(a) => setSelectedAgg(a)}
      />

      {/* Detail Modal with Parent Genealogy Breakdown */}
      {selectedAgg && (
        <Modal
          isOpen={!!selectedAgg}
          onClose={() => setSelectedAgg(null)}
          title={`Aggregation Genealogy: ${selectedAgg.id}`}
          subtitle={`Facility: ${selectedAgg.depotName} • Total Weight: ${selectedAgg.totalWeightKg} kg`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Parent Harvest Batches (Genealogy Intact)
              </span>
              <div className="mt-2 divide-y divide-slate-200">
                {selectedAgg.parentDetails?.map((parent, pIdx) => (
                  <div key={pIdx} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-emerald-900">{parent.batchId}</span>
                      <div className="text-[11px] text-slate-500">Farmer: {parent.farmer}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900">{parent.weightKg} kg</span>
                      <div className="text-[10px] text-slate-500">{parent.resinGrade}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Chipping Specification:</span>
                <span className="font-bold text-slate-900">{selectedAgg.chippingSpecification}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Destination Distillation CPC:</span>
                <span className="font-bold text-emerald-800">{selectedAgg.destinationCPC}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Depot Supervisor:</span>
                <span className="font-bold text-slate-800">{selectedAgg.supervisor}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const targetId = selectedAgg.id;
                  setSelectedAgg(null);
                  setDispatchIntent({ type: 'AGGREGATOR_TO_DISTILLERY', batchId: targetId });
                  navigate('/movement');
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Dispatch Lot to CPC Distillery (Step 15)</span>
              </button>

              <button
                onClick={() => setSelectedAgg(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Merge Batches into Lot Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Merge Harvest Batches into Depot Lot"
        subtitle="Select incoming harvest batches to combine into a uniform Depot Lot"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Facility & Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Select Aggregation Depot Facility *
              </label>
              <select
                value={form.depotName}
                onChange={(e) => setForm({ ...form, depotName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold bg-white text-slate-900"
              >
                <option value="Golaghat Cluster Aggregation Depot">Golaghat Cluster Aggregation Depot</option>
                <option value="Hojai Central Aggregation Depot">Hojai Central Aggregation Depot</option>
                <option value="Kadamtala Hub Aggregation Depot">Kadamtala Hub Aggregation Depot</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Destination CPC (Distillation Plant) *
              </label>
              <select
                value={form.destinationCPC}
                onChange={(e) => setForm({ ...form, destinationCPC: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold bg-white text-slate-900"
              >
                <option value="CPC-GLT-01 (NERAMAC CPC Bokakhat)">CPC-GLT-01 (NERAMAC CPC Bokakhat)</option>
                <option value="CPC-KDM-02 (NERAMAC CPC Kadamtala)">CPC-KDM-02 (NERAMAC CPC Kadamtala)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Chipping &amp; Flaking Specification
              </label>
              <select
                value={form.chippingSpecification}
                onChange={(e) => setForm({ ...form, chippingSpecification: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold bg-white text-slate-900"
              >
                <option value="2mm - 4mm Distillation Flakes">2mm - 4mm Distillation Flakes (Standard)</option>
                <option value="3mm - 6mm Coarse Chips">3mm - 6mm Coarse Chips</option>
                <option value="Mechanical Pulverized Mesh (1.5mm)">Mechanical Pulverized Mesh (1.5mm)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Depot Storage Bay &amp; Vault Allocation
              </label>
              <select
                value={form.storageBay}
                onChange={(e) => setForm({ ...form, storageBay: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold bg-white text-slate-900"
              >
                <option value="Bay-1 (Secure Wood Vault)">Bay-1 (Secure Wood Vault)</option>
                <option value="Bay-2 (Chipping Holding Area)">Bay-2 (Chipping Holding Area)</option>
                <option value="Bay-3 (Consignment Ready Staging)">Bay-3 (Consignment Ready Staging)</option>
              </select>
            </div>
          </div>

          {/* ── BATCH SELECTION SECTION ────────────────────────────────────────── */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Select Harvest Batches (HBT) to Pool into Lot
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {selectedBatchIds.length} of {poolableBatches.length} Selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Re-pooling toggle */}
            <div className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px]">
              <span className="text-slate-600 font-medium">
                Showing {poolableBatches.length} harvest batches available in depot ledger
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold select-none">
                <input
                  type="checkbox"
                  checked={includeAllBatches}
                  onChange={(e) => setIncludeAllBatches(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                />
                <span>Include already pooled batches (Demo Mode)</span>
              </label>
            </div>

            {/* Selectable Batches Table */}
            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200">
              {poolableBatches.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="font-semibold text-xs">No unaggregated harvest batches in current depot stock.</p>
                  <p className="text-[11px] mt-1">Check "Include already pooled batches" above to select from existing records.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 text-center w-10">Select</th>
                      <th className="px-3 py-2">Batch ID</th>
                      <th className="px-3 py-2">Tree Tag</th>
                      <th className="px-3 py-2">Homestead Grower</th>
                      <th className="px-3 py-2">Resin Grade</th>
                      <th className="px-3 py-2 text-right">Net Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {poolableBatches.map(batch => {
                      const isSelected = selectedBatchIds.includes(batch.id);
                      const isAlreadyPooled = !!batch.parentOfAggregation;

                      return (
                        <tr
                          key={batch.id}
                          onClick={() => toggleBatch(batch.id)}
                          className={`cursor-pointer transition ${
                            isSelected
                              ? 'bg-emerald-50/90 text-emerald-950 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-3 py-2 font-mono font-bold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <span>{batch.id}</span>
                              {isAlreadyPooled && (
                                <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 font-sans">
                                  pooled
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 font-mono text-emerald-800 font-bold">{batch.treeId}</td>
                          <td className="px-3 py-2 text-slate-800 font-medium">{batch.farmerName}</td>
                          <td className="px-3 py-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {(batch.resinGrade || 'GRADE_A').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-black text-slate-900">
                            {batch.netWeightKg} kg
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ── CONSOLIDATED CHARGE PREVIEW & SUMMARY HUD ─────────────────────── */}
          <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <div>
                <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">
                  Consolidated Aggregation Lot (Genealogy Lineage)
                </span>
                <div className="text-xs font-bold text-slate-200">
                  Target Batch: <span className="font-mono text-emerald-300">AGG-AS-2026-{String(aggregations.length + 1).padStart(2, '0')}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-black text-slate-400">Total Pooled Weight</span>
                <div className="text-base font-black text-emerald-400 font-mono">
                  {calculatedTotalWeight} kg
                </div>
              </div>
            </div>

            {/* Selected Batch Summary Chips */}
            <div>
              <span className="text-[10px] text-slate-400 font-bold block mb-1">
                Batches in this lot ({selectedBatchIds.length}):
              </span>
              {selectedBatchIds.length === 0 ? (
                <span className="text-[11px] text-amber-300 italic">
                  No harvest batches selected. Please check at least one batch above.
                </span>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {selectedBatchObjects.map(b => (
                    <span
                      key={b.id}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-emerald-500/50 text-[10px] font-mono text-emerald-200"
                    >
                      <strong className="text-white">{b.id}</strong>
                      <span className="text-emerald-400 font-bold">({b.netWeightKg}kg)</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Mixed Grade Advisory */}
            {!resinGradeAnalysis.isUniform && (
              <div className="flex items-center gap-2 p-2 bg-amber-900/60 border border-amber-600/50 rounded-lg text-amber-200 text-[10px]">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>
                  Notice: Selected batches contain multiple resin grades ({resinGradeAnalysis.allGrades.join(', ')}). Dominant grade will be assigned to distillation manifest.
                </span>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedBatchIds.length === 0}
              className={`px-4 py-2 rounded-xl font-extrabold text-white transition flex items-center gap-1.5 shadow-sm ${
                selectedBatchIds.length === 0
                  ? 'bg-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <GitMerge className="w-4 h-4" />
              <span>
                {selectedBatchIds.length === 0
                  ? 'Select Batches to Merge into Lot'
                  : `Merge into Lot (${selectedBatchIds.length} Batches • ${calculatedTotalWeight} kg)`}
              </span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Split Harvest Batch Modal */}
      <Modal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        title="Split Harvest Batch into Sub-Batches"
        subtitle="Divide a Harvest Batch into two smaller Harvest Batches while preserving full farmer, tree & e-TP genealogy"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSplitSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Source Harvest Batch to Split *</label>
            <select
              value={selectedSplitBatch?.id || ''}
              onChange={(e) => {
                const nextBatch = harvestBatches.find(b => b.id === e.target.value);
                setSplitSourceBatchId(e.target.value);
                if (nextBatch) {
                  setSplitWeight1(Math.round(((nextBatch.netWeightKg || 0) / 2) * 10) / 10);
                }
              }}
              className="w-full px-3 py-2 border rounded-lg font-mono font-bold bg-white"
            >
              {activeBatchesForSplit.map(b => (
                <option key={b.id} value={b.id}>{b.id} • {b.netWeightKg} kg • {b.farmerName}</option>
              ))}
            </select>
          </div>

          {selectedSplitBatch && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-600">Source Harvest Batch Weight:</span>
                <span className="font-mono font-black text-slate-900 text-sm">{selectedSplitBatch.netWeightKg} kg</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-white border border-amber-300 rounded-lg">
                  <label className="block text-[10px] font-extrabold text-amber-900 uppercase mb-1">
                    {selectedSplitBatch.id}-S1 (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={Math.max(0.1, (selectedSplitBatch.netWeightKg || 1) - 0.1)}
                    required
                    value={splitWeight1}
                    onChange={(e) => setSplitWeight1(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded font-mono font-bold text-slate-900"
                  />
                </div>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="block text-[10px] font-extrabold text-emerald-900 uppercase mb-1">
                    {selectedSplitBatch.id}-S2 (Auto Remainder)
                  </span>
                  <div className="px-2.5 py-1.5 font-mono font-black text-emerald-950 text-sm">
                    {splitWeight2} kg
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsSplitModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedSplitBatch || splitWeight2 <= 0}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-extrabold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Scissors className="w-4 h-4" />
              <span>Confirm Split Harvest Batch</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
