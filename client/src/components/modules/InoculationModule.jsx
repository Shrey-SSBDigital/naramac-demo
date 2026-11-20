import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { Syringe, ShieldCheck, Plus, Sparkles, AlertCircle } from 'lucide-react';

export default function InoculationModule() {
  const { inoculations, addInoculation, trees } = useEnterprise();
  const [selectedInoc, setSelectedInoc] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    treeId: 'TRE-AS-008',
    farmerId: 'FRM-AS-01',
    cluster: 'Golaghat Cluster',
    method: 'Biological Fungal Inoculum',
    compoundBrand: 'NERAMAC-BioOud-F1',
    strain: 'Fusarium solani (Strain AS-44)',
    supplier: 'Assam Agricultural University (AAU) Jorhat',
    batchNumber: 'AAU/BIO/2026/B-48',
    drillDepthCm: 7.0,
    holeCount: 34,
    inoculumVolumeMl: 260,
    fieldAgent: 'NERAMAC-FA-04 (Dipankar Neog)',
    resinProgressionRating: 'GRADE_A_RESIN'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addInoculation(form);
    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Inoculation ID',
      accessor: 'id',
      render: (i) => (
        <div>
          <span className="font-extrabold text-slate-900 font-mono text-xs">{i.id}</span>
          <div className="text-[10px] text-slate-500 font-mono">{i.inoculationDate}</div>
        </div>
      )
    },
    {
      header: 'Target Tree & Grower',
      accessor: 'treeId',
      render: (i) => (
        <div>
          <span className="font-extrabold text-emerald-800 font-mono">{i.treeId}</span>
          <div className="text-[11px] text-slate-500">{i.farmerId} • {i.cluster}</div>
        </div>
      )
    },
    {
      header: 'Method & Bio-Strain',
      accessor: 'method',
      render: (i) => (
        <div>
          <span className="font-bold text-slate-800">{i.method}</span>
          <div className="text-[11px] text-slate-500">{i.strain}</div>
        </div>
      )
    },
    {
      header: 'Supplier & Compound Batch',
      accessor: 'supplier',
      render: (i) => (
        <div>
          <span className="font-medium text-slate-700">{i.supplier}</span>
          <div className="text-[10px] text-slate-400 font-mono">{i.batchNumber}</div>
        </div>
      )
    },
    {
      header: 'Drill Depth & Vol',
      accessor: 'drillDepthCm',
      render: (i) => (
        <span className="text-xs font-semibold text-slate-700">
          {i.drillDepthCm}cm • {i.holeCount} holes ({i.inoculumVolumeMl}ml)
        </span>
      )
    },
    {
      header: 'Resin Rating',
      accessor: 'resinProgressionRating',
      render: (i) => (
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
          {i.resinProgressionRating.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (i) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedInoc(i);
          }}
          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
        >
          View Log
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
            <span>Cultivation & Inoculation Intervention Registry</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 04
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Logging biological fungal inductions (*Fusarium solani*, *Aspergillus niger*) with on-device SHA photo verification.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Log Inoculation Event</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={inoculations}
        searchKey="treeId"
        searchPlaceholder="Search by Tree ID or Inoculation ID..."
        onRowClick={(i) => setSelectedInoc(i)}
      />

      {/* Detail Modal */}
      {selectedInoc && (
        <Modal
          isOpen={!!selectedInoc}
          onClose={() => setSelectedInoc(null)}
          title={`Inoculation Record: ${selectedInoc.id}`}
          subtitle={`Target Tree: ${selectedInoc.treeId} • Supervised by ${selectedInoc.fieldAgent}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Inoculation Date</span>
                <div className="font-extrabold text-slate-900">{selectedInoc.inoculationDate}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Biological Method</span>
                <div className="font-bold text-emerald-900">{selectedInoc.method}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Approved Strain</span>
                <div className="font-semibold text-slate-800">{selectedInoc.strain}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Nodal Supplier & Batch</span>
                <div className="text-slate-800">{selectedInoc.supplier} ({selectedInoc.batchNumber})</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                In-App Camera SHA-256 Photo Hash
              </span>
              <div className="p-2.5 rounded-lg bg-slate-100 font-mono text-[11px] text-slate-700 break-all border border-slate-200">
                {selectedInoc.photoHash}
              </div>
              <p className="text-[10px] text-slate-500">
                RFP Section 3.2 requirement: On-device SHA-256 hashing prevents retroactive modification of inoculation dates.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedInoc(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Log Inoculation Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Inoculation Event"
        subtitle="Mandatory biological intervention record for agarwood resin induction"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Tree ID *</label>
              <select
                value={form.treeId}
                onChange={(e) => setForm({ ...form, treeId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              >
                {trees.slice(0, 20).map(t => (
                  <option key={t.id} value={t.id}>{t.id} ({t.ageYears} yrs, {t.plantationId})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Inoculation Method</label>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Biological Fungal Inoculum">Biological Fungal Inoculum</option>
                <option value="Bio-Chemical Induced Stress">Bio-Chemical Induced Stress</option>
                <option value="Mechanical Drill Induction">Mechanical Drill Induction</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Supplier Entity</label>
              <input
                type="text"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Supplier Batch No.</label>
              <input
                type="text"
                value={form.batchNumber}
                onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Drill Depth (cm)</label>
              <input
                type="number"
                step="0.5"
                value={form.drillDepthCm}
                onChange={(e) => setForm({ ...form, drillDepthCm: parseFloat(e.target.value) || 6 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Hole Count</label>
              <input
                type="number"
                value={form.holeCount}
                onChange={(e) => setForm({ ...form, holeCount: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Inoculum Vol (ml)</label>
              <input
                type="number"
                value={form.inoculumVolumeMl}
                onChange={(e) => setForm({ ...form, inoculumVolumeMl: parseInt(e.target.value) || 250 })}
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
              Record Inoculation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
