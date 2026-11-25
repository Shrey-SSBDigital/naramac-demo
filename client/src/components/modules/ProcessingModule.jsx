import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { Factory, Flame, Plus, Scale, Sparkles, AlertCircle, CheckCircle2, Layers, Trash2, Droplets, Package, Trees } from 'lucide-react';

export default function ProcessingModule() {
  const { distillations, createDistillationRun, aggregations, processingCentres } = useEnterprise();
  const [selectedDistill, setSelectedDistill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    cpcId: 'CPC-GLT-01',
    cpcName: 'NERAMAC Common Processing Centre, Golaghat',
    processingType: 'AGARWOOD_OIL', // 'AGARWOOD_OIL' | 'AGARWOOD_CHIPS' | 'BY_PRODUCTS'
    sourceBatchType: 'AGGREGATION_BATCH',
    sourceBatchId: aggregations[0]?.id || 'AGG-AS-2026-01',
    stillId: 'STILL-01 (Copper Hydro-Distillation Unit)',
    operatorName: 'Dr. P. J. Mahanta (Chief Distiller)',
    distillationMethod: 'Traditional Deg-Bhapka Style Hydro-Distillation',
    soakingPeriodDays: 14,
    temperatureCelsius: 102.5,
    inputWoodKg: 75.0,
    outputPureOudOilMl: 245.0,
    outputHydrosolLiters: 15.5,
    outputSpentBiomassKg: 57.2,
    outputChipsKg: 48.0,
    chipsGrade: 'Grade A Dark Resin Chips',
    outputRawWoodKg: 65.0,
    rawWoodGrade: 'Cleaned Resin-Rich Heartwood Logs',
    outputTrimmingsKg: 12.0,
    byProducts: []
  });

  // Custom By-Product Input State
  const [byProductInput, setByProductInput] = useState({
    name: '',
    quantity: '',
    unit: 'kg'
  });

  const handleAddByProduct = () => {
    if (!byProductInput.name.trim() || !byProductInput.quantity) return;
    setForm(prev => ({
      ...prev,
      byProducts: [
        ...(prev.byProducts || []),
        {
          id: `BP-${Date.now()}`,
          name: byProductInput.name.trim(),
          quantity: parseFloat(byProductInput.quantity) || 0,
          unit: byProductInput.unit
        }
      ]
    }));
    setByProductInput({ name: '', quantity: '', unit: 'kg' });
  };

  const handleRemoveByProduct = (bpId) => {
    setForm(prev => ({
      ...prev,
      byProducts: (prev.byProducts || []).filter(b => b.id !== bpId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Auto-include any typed-but-unadded by-product before submitting
    let finalByProducts = [...(form.byProducts || [])];
    if (byProductInput.name.trim() && byProductInput.quantity) {
      finalByProducts.push({
        id: `BP-${Date.now()}`,
        name: byProductInput.name.trim(),
        quantity: parseFloat(byProductInput.quantity) || 0,
        unit: byProductInput.unit
      });
    }
    createDistillationRun({
      ...form,
      byProducts: finalByProducts
    });
    setByProductInput({ name: '', quantity: '', unit: 'kg' });
    setForm(prev => ({ ...prev, byProducts: [] }));
    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Processing Run & Type',
      accessor: 'id',
      render: (d) => {
        const pType = d.processingType || 'AGARWOOD_OIL';
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 font-mono text-xs">{d.id}</span>
              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                pType === 'AGARWOOD_CHIPS'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : pType === 'RAW_WOOD'
                  ? 'bg-teal-100 text-teal-900 border-teal-300'
                  : pType === 'BY_PRODUCTS'
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}>
                {pType === 'AGARWOOD_CHIPS' ? 'CHIPS' : pType === 'RAW_WOOD' ? 'RAW WOOD' : pType === 'BY_PRODUCTS' ? 'BY-PRODUCTS' : 'OUD OIL'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">{d.chargeDate} → {d.completionDate}</div>
          </div>
        );
      }
    },
    {
      header: 'CPC & Processing Unit',
      accessor: 'stillId',
      render: (d) => (
        <div>
          <span className="font-bold text-slate-800">{d.stillId}</span>
          <div className="text-[11px] text-slate-500">{d.cpcName}</div>
        </div>
      )
    },
    {
      header: 'Source Material Charge',
      accessor: 'sourceBatchId',
      render: (d) => (
        <div>
          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            {d.sourceBatchId}
          </span>
          <div className="text-[11px] text-slate-500 font-semibold">{d.inputWoodKg} kg Wood Loaded</div>
        </div>
      )
    },
    {
      header: 'Output & By-Products',
      accessor: 'outputPureOudOilMl',
      render: (d) => {
        const pType = d.processingType || 'AGARWOOD_OIL';
        return (
          <div className="space-y-0.5">
            {pType === 'AGARWOOD_CHIPS' ? (
              <>
                <div className="font-black text-amber-900 text-xs">
                  {d.outputChipsKg} kg Graded Chips ({d.recoveryYieldPercent}%)
                </div>
                <div className="text-[11px] text-slate-500">
                  {d.chipsGrade || 'Grade A'} • Trimmings: {d.outputTrimmingsKg || 0} kg
                </div>
              </>
            ) : pType === 'RAW_WOOD' ? (
              <>
                <div className="font-black text-teal-900 text-xs">
                  {d.outputRawWoodKg} kg Cleaned Raw Wood ({d.recoveryYieldPercent}%)
                </div>
                <div className="text-[11px] text-slate-500">
                  {d.rawWoodGrade || 'Cleaned Heartwood'} • Bark/Waste: {d.outputTrimmingsKg || 0} kg
                </div>
              </>
            ) : pType === 'BY_PRODUCTS' ? (
              <div className="font-black text-purple-900 text-xs">
                {(d.byProducts || []).length} By-Product(s) Logged
              </div>
            ) : (
              <>
                <div className="font-black text-emerald-800 text-xs">
                  {d.outputPureOudOilMl} ml Pure Oud Oil ({d.recoveryYieldPercent}%)
                </div>
                <div className="text-[11px] text-slate-500">
                  Hydrosol: {d.outputHydrosolLiters}L • Spent: {d.outputSpentBiomassKg}kg
                </div>
              </>
            )}
            {(d.byProducts || []).length > 0 && (
              <div className="text-[10px] text-purple-800 font-semibold">
                By-Products: {d.byProducts.map(bp => `${bp.name} (${bp.quantity} ${bp.unit})`).join(', ')}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Balance Efficiency',
      accessor: 'massBalanceEfficiencyPercent',
      render: (d) => (
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
          {d.massBalanceEfficiencyPercent}% Balanced
        </span>
      )
    },
    {
      header: 'Lab Release',
      accessor: 'labReleaseStatus',
      render: (d) => <StatusBadge status={d.labReleaseStatus} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (d) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedDistill(d);
          }}
          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
        >
          Mass Balance
        </button>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>CPC Processing: Agarwood Oil, Chips &amp; By-Products</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 09
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Process raw wood into Pure Oud Oil, Graded Agarwood Chips, Cleaned Raw Wood, and custom Agarwood By-Products with full mass balance tracking.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
        >
          <Flame className="w-4 h-4" />
          <span>Log Processing Run</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={distillations}
        searchKey="id"
        searchPlaceholder="Search distillation runs by ID, still, or source batch..."
        onRowClick={(d) => setSelectedDistill(d)}
      />

      {/* Detail Modal with Full Mass Balance Audit */}
      {selectedDistill && (
        <Modal
          isOpen={!!selectedDistill}
          onClose={() => setSelectedDistill(null)}
          title={`Mass Balance Audit: ${selectedDistill.id}`}
          subtitle={`CPC Facility: ${selectedDistill.cpcName} • Still: ${selectedDistill.stillId}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            {/* Mass Balance Equation Breakdown Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Statutory Mass Balance Verification
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Input Wood</span>
                  <div className="text-sm font-black text-slate-900">{selectedDistill.inputWoodKg} kg</div>
                </div>
                {(selectedDistill.processingType || 'AGARWOOD_OIL') === 'AGARWOOD_CHIPS' ? (
                  <>
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                      <span className="text-[10px] text-amber-700 font-bold uppercase">Graded Chips</span>
                      <div className="text-sm font-black text-amber-900">{selectedDistill.outputChipsKg} kg</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                      <span className="text-[10px] text-slate-600 font-bold uppercase">Trimmings / Dust</span>
                      <div className="text-sm font-black text-slate-900">{selectedDistill.outputTrimmingsKg || 0} kg</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 font-bold uppercase">Grade</span>
                      <div className="text-xs font-black text-emerald-900 mt-0.5">{selectedDistill.chipsGrade || 'Grade A'}</div>
                    </div>
                  </>
                ) : (selectedDistill.processingType) === 'RAW_WOOD' ? (
                  <>
                    <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200">
                      <span className="text-[10px] text-teal-700 font-bold uppercase">Cleaned Raw Wood</span>
                      <div className="text-sm font-black text-teal-900">{selectedDistill.outputRawWoodKg} kg</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                      <span className="text-[10px] text-slate-600 font-bold uppercase">Bark / Trimmings</span>
                      <div className="text-sm font-black text-slate-900">{selectedDistill.outputTrimmingsKg || 0} kg</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 font-bold uppercase">Form / Grade</span>
                      <div className="text-xs font-black text-emerald-900 mt-0.5">{selectedDistill.rawWoodGrade || 'Cleaned Heartwood'}</div>
                    </div>
                  </>
                ) : (selectedDistill.processingType) === 'BY_PRODUCTS' ? (
                  <div className="col-span-3 p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-left">
                    <span className="text-[10px] text-purple-700 font-bold uppercase block">Produced By-Products</span>
                    <div className="text-xs font-black text-purple-950 mt-0.5">
                      {(selectedDistill.byProducts || []).length > 0
                        ? selectedDistill.byProducts.map(bp => `${bp.name}: ${bp.quantity} ${bp.unit}`).join(' • ')
                        : 'Custom by-products'}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 font-bold uppercase">Pure Oud Oil</span>
                      <div className="text-sm font-black text-emerald-900">{selectedDistill.outputPureOudOilMl} ml</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200">
                      <span className="text-[10px] text-teal-700 font-bold uppercase">Hydrosol Water</span>
                      <div className="text-sm font-black text-teal-900">{selectedDistill.outputHydrosolLiters} L</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                      <span className="text-[10px] text-amber-700 font-bold uppercase">Spent Biomass</span>
                      <div className="text-sm font-black text-amber-900">{selectedDistill.outputSpentBiomassKg} kg</div>
                    </div>
                  </>
                )}
              </div>

              {(selectedDistill.byProducts || []).length > 0 && (
                <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-purple-800 block">Added By-Products</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDistill.byProducts.map((bp, i) => (
                      <span key={bp.id || i} className="px-2 py-0.5 rounded bg-white border border-purple-200 text-[11px] font-bold text-purple-900">
                        {bp.name} — {bp.quantity} {bp.unit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-white font-mono text-[11px] text-slate-700 border border-slate-200">
                Calculated Process Loss: <strong>{selectedDistill.calculatedProcessLossKg} kg</strong> (Vaporized aroma fractions) • Mass Balance Efficiency: <strong>{selectedDistill.massBalanceEfficiencyPercent}%</strong>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs divide-y divide-slate-100">
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-semibold text-slate-500 w-1/3">Distillation Method</td>
                    <td className="px-3 py-2 font-bold text-slate-900">{selectedDistill.distillationMethod}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-semibold text-slate-500">Soaking Duration</td>
                    <td className="px-3 py-2 font-bold text-slate-900">{selectedDistill.soakingPeriodDays} Days in demineralized water</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-semibold text-slate-500">Total Run Duration</td>
                    <td className="px-3 py-2 font-bold text-slate-900">{selectedDistill.durationHours} Hours continuous steam/fire</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-semibold text-slate-500">Laboratory Sample Reference</td>
                    <td className="px-3 py-2 font-mono font-bold text-emerald-800">{selectedDistill.labSampleId}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDistill(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Log Processing Charge Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log CPC Processing Run"
        subtitle="Select Output Type (Agarwood Oil, Agarwood Chips, or By-Products) and record yields"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Processing Output Type Selector */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700">
              Select Processing Output Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setForm({
                  ...form,
                  processingType: 'AGARWOOD_OIL',
                  stillId: 'STILL-01 (Copper Hydro-Distillation Unit)'
                })}
                className={`p-2.5 rounded-xl border-2 text-left transition flex flex-col gap-1 ${
                  form.processingType === 'AGARWOOD_OIL'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold'
                }`}
              >
                <Droplets className={`w-4 h-4 ${form.processingType === 'AGARWOOD_OIL' ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>Agarwood Oil</span>
              </button>

              <button
                type="button"
                onClick={() => setForm({
                  ...form,
                  processingType: 'AGARWOOD_CHIPS',
                  stillId: 'CHIP-LINE-01 (Grading & Chipping Unit)'
                })}
                className={`p-2.5 rounded-xl border-2 text-left transition flex flex-col gap-1 ${
                  form.processingType === 'AGARWOOD_CHIPS'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-black'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold'
                }`}
              >
                <Package className={`w-4 h-4 ${form.processingType === 'AGARWOOD_CHIPS' ? 'text-amber-700' : 'text-slate-400'}`} />
                <span>Agarwood Chips</span>
              </button>

              <button
                type="button"
                onClick={() => setForm({
                  ...form,
                  processingType: 'RAW_WOOD',
                  stillId: 'RAW-SORT-01 (Heartwood Cleaning & Sorting)'
                })}
                className={`p-2.5 rounded-xl border-2 text-left transition flex flex-col gap-1 ${
                  form.processingType === 'RAW_WOOD'
                    ? 'border-teal-600 bg-teal-50 text-teal-950 font-black'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold'
                }`}
              >
                <Trees className={`w-4 h-4 ${form.processingType === 'RAW_WOOD' ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>Raw Wood</span>
              </button>

              <button
                type="button"
                onClick={() => setForm({
                  ...form,
                  processingType: 'BY_PRODUCTS',
                  stillId: 'BYP-UNIT-01 (By-Products Processing)'
                })}
                className={`p-2.5 rounded-xl border-2 text-left transition flex flex-col gap-1 ${
                  form.processingType === 'BY_PRODUCTS'
                    ? 'border-purple-600 bg-purple-50 text-purple-950 font-black'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold'
                }`}
              >
                <Layers className={`w-4 h-4 ${form.processingType === 'BY_PRODUCTS' ? 'text-purple-700' : 'text-slate-400'}`} />
                <span>By-Products</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Source Aggregation Batch *</label>
              <select
                value={form.sourceBatchId}
                onChange={(e) => setForm({ ...form, sourceBatchId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold bg-white"
              >
                {aggregations.map(a => (
                  <option key={a.id} value={a.id}>{a.id} ({a.totalWeightKg}kg, {a.depotName})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Processing Unit Assignment</label>
              <input
                type="text"
                value={form.stillId}
                onChange={(e) => setForm({ ...form, stillId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold bg-white"
              />
            </div>
          </div>

          {/* Input Weight */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Input Raw / Chipped Wood (kg) *</label>
            <input
              type="number"
              step="0.1"
              required
              value={form.inputWoodKg}
              onChange={(e) => setForm({ ...form, inputWoodKg: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg font-bold bg-white"
            />
          </div>

          {/* Fields for AGARWOOD_OIL */}
          {form.processingType === 'AGARWOOD_OIL' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Decanted Oud Oil (ml) *</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={form.outputPureOudOilMl}
                  onChange={(e) => setForm({ ...form, outputPureOudOilMl: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg font-bold text-emerald-800 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Hydrosol Water (Liters)</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.outputHydrosolLiters}
                  onChange={(e) => setForm({ ...form, outputHydrosolLiters: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Spent Wood Biomass (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.outputSpentBiomassKg}
                  onChange={(e) => setForm({ ...form, outputSpentBiomassKg: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
              </div>
            </div>
          )}

          {/* Fields for AGARWOOD_CHIPS */}
          {form.processingType === 'AGARWOOD_CHIPS' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Graded Agarwood Chips (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={form.outputChipsKg}
                  onChange={(e) => setForm({ ...form, outputChipsKg: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg font-bold text-amber-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Chip Quality Grade *</label>
                <select
                  value={form.chipsGrade}
                  onChange={(e) => setForm({ ...form, chipsGrade: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-semibold bg-white"
                >
                  <option value="Super Royal Black Chips">Super Royal Black Chips</option>
                  <option value="Grade A Dark Resin Chips">Grade A Dark Resin Chips</option>
                  <option value="Grade B Brown Chips">Grade B Brown Chips</option>
                  <option value="Bakhoor / Incense Chips">Bakhoor / Incense Chips</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Dust / Trimmings (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.outputTrimmingsKg}
                  onChange={(e) => setForm({ ...form, outputTrimmingsKg: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
              </div>
            </div>
          )}

          {/* Fields for RAW_WOOD */}
          {form.processingType === 'RAW_WOOD' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-teal-50/60 border border-teal-200 rounded-xl">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Cleaned Raw Wood (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={form.outputRawWoodKg}
                  onChange={(e) => setForm({ ...form, outputRawWoodKg: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg font-bold text-teal-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Raw Wood Form / Grade *</label>
                <select
                  value={form.rawWoodGrade}
                  onChange={(e) => setForm({ ...form, rawWoodGrade: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-semibold bg-white"
                >
                  <option value="Cleaned Resin-Rich Heartwood Logs">Cleaned Resin-Rich Heartwood Logs</option>
                  <option value="Grade A Raw Agarwood Blocks">Grade A Raw Agarwood Blocks</option>
                  <option value="Grade B Raw Agarwood Logs">Grade B Raw Agarwood Logs</option>
                  <option value="Sorted Raw Agarwood Timber">Sorted Raw Agarwood Timber</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Bark / Trim Waste (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.outputTrimmingsKg}
                  onChange={(e) => setForm({ ...form, outputTrimmingsKg: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
              </div>
            </div>
          )}

          {/* Custom By-Products Input Box (Always available, highlighted in BY_PRODUCTS mode) */}
          <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-purple-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-700" />
                <span>
                  {form.processingType === 'BY_PRODUCTS' ? 'Add Agarwood By-Products *' : 'Add By-Products (Optional)'}
                </span>
              </span>
              <span className="text-[10px] text-purple-700 font-semibold">
                e.g. Incense Powder, Dhoop, Spent Cake, Hydrosol
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="Enter by-product name (e.g. Agarwood Incense Dust)"
                value={byProductInput.name}
                onChange={(e) => setByProductInput({ ...byProductInput, name: e.target.value })}
                className="col-span-6 px-2.5 py-1.5 border border-purple-300 rounded-lg bg-white text-xs"
              />
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="Qty"
                value={byProductInput.quantity}
                onChange={(e) => setByProductInput({ ...byProductInput, quantity: e.target.value })}
                className="col-span-2 px-2 py-1.5 border border-purple-300 rounded-lg bg-white text-xs font-mono"
              />
              <select
                value={byProductInput.unit}
                onChange={(e) => setByProductInput({ ...byProductInput, unit: e.target.value })}
                className="col-span-2 px-2 py-1.5 border border-purple-300 rounded-lg bg-white text-xs font-bold"
              >
                <option value="kg">kg</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="packs">packs</option>
              </select>
              <button
                type="button"
                onClick={handleAddByProduct}
                className="col-span-2 px-2 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {(form.byProducts || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {form.byProducts.map(bp => (
                  <span
                    key={bp.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-purple-300 text-purple-950 font-bold text-[11px]"
                  >
                    <span>{bp.name}: {bp.quantity} {bp.unit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveByProduct(bp.id)}
                      className="text-rose-500 hover:text-rose-700"
                      title="Remove by-product"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
            >
              Commit Processing Run
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
