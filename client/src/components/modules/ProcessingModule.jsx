import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { Factory, Flame, Plus, Scale, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ProcessingModule() {
  const { distillations, createDistillationRun, aggregations, processingCentres } = useEnterprise();
  const [selectedDistill, setSelectedDistill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    cpcId: 'CPC-GLT-01',
    cpcName: 'NERAMAC Common Processing Centre, Golaghat',
    sourceBatchType: 'AGGREGATION_BATCH',
    sourceBatchId: 'AGG-AS-2026-01',
    stillId: 'STILL-01 (Copper Hydro-Distillation Unit)',
    operatorName: 'Dr. P. J. Mahanta (Chief Distiller)',
    distillationMethod: 'Traditional Deg-Bhapka Style Hydro-Distillation',
    soakingPeriodDays: 14,
    temperatureCelsius: 102.5,
    inputWoodKg: 75.0,
    outputPureOudOilMl: 245.0,
    outputHydrosolLiters: 15.5,
    outputSpentBiomassKg: 57.2
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createDistillationRun(form);
    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Distillation Run ID',
      accessor: 'id',
      render: (d) => (
        <div>
          <span className="font-extrabold text-slate-900 font-mono text-xs">{d.id}</span>
          <div className="text-[10px] text-slate-500 font-mono">{d.chargeDate} → {d.completionDate}</div>
        </div>
      )
    },
    {
      header: 'CPC & Still Machine',
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
      header: 'Mass Balance Yields',
      accessor: 'outputPureOudOilMl',
      render: (d) => (
        <div>
          <div className="font-black text-emerald-800 text-xs">
            {d.outputPureOudOilMl} ml Pure Oud Oil ({d.recoveryYieldPercent}%)
          </div>
          <div className="text-[11px] text-slate-500">
            Hydrosol: {d.outputHydrosolLiters}L • Spent: {d.outputSpentBiomassKg}kg
          </div>
        </div>
      )
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
            <span>Processing & CPC Distillation Operations</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 09
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hydro-distillation and steam distillation mass balance: Wood in = Pure Oud Oil + Hydrosol + Spent Biomass + Process Loss.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
        >
          <Flame className="w-4 h-4" />
          <span>Log Distillation Run</span>
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
              </div>

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

      {/* Log Distillation Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log CPC Distillation Charge"
        subtitle="Calculates mass balance and generates digital Still Charge Certificate"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Source Aggregation Batch *</label>
              <select
                value={form.sourceBatchId}
                onChange={(e) => setForm({ ...form, sourceBatchId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              >
                {aggregations.map(a => (
                  <option key={a.id} value={a.id}>{a.id} ({a.totalWeightKg}kg, {a.depotName})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Still Unit Assignment</label>
              <input
                type="text"
                value={form.stillId}
                onChange={(e) => setForm({ ...form, stillId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Input Chipped Wood (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={form.inputWoodKg}
                onChange={(e) => setForm({ ...form, inputWoodKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Decanted Oud Oil (ml) *</label>
              <input
                type="number"
                step="1"
                required
                value={form.outputPureOudOilMl}
                onChange={(e) => setForm({ ...form, outputPureOudOilMl: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg font-bold text-emerald-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Hydrosol Floral Water (Liters)</label>
              <input
                type="number"
                step="0.5"
                value={form.outputHydrosolLiters}
                onChange={(e) => setForm({ ...form, outputHydrosolLiters: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Spent Wood Biomass (kg)</label>
              <input
                type="number"
                step="0.5"
                value={form.outputSpentBiomassKg}
                onChange={(e) => setForm({ ...form, outputSpentBiomassKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
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
              Commit Distillation Run
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
