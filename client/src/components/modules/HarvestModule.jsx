import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { Axe, CheckCircle2, Plus, Scale, ShieldCheck, QrCode } from 'lucide-react';

export default function HarvestModule() {
  const { harvests, harvestBatches, applyHarvest, approveHarvestAndFell, trees, farmers, activeRole } = useEnterprise();
  const [selectedHarvest, setSelectedHarvest] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isFellModalOpen, setIsFellModalOpen] = useState(false);
  const [fellingTarget, setFellingTarget] = useState(null);

  // Apply form
  const [applyForm, setApplyForm] = useState({
    treeId: 'TRE-AS-009',
    farmerId: 'FRM-AS-01',
    farmerName: 'Bhaben Saikia',
    plantationId: 'PLT-AS-01',
    cluster: 'Golaghat Cluster',
    fieldAgent: 'NERAMAC-FA-04 (Dipankar Neog)'
  });

  // Felling form
  const [fellForm, setFellForm] = useState({
    dfoSanctionNumber: 'DFO/GLT/2026/HARV-210',
    woodWeightKg: 38.0,
    resinGrade: 'GRADE_A_DARK_RESIN'
  });

  const handleApplySubmit = (e) => {
    e.preventDefault();
    applyHarvest(applyForm);
    setIsApplyModalOpen(false);
  };

  const handleFellSubmit = (e) => {
    e.preventDefault();
    if (!fellingTarget) return;
    approveHarvestAndFell(fellingTarget.id, fellForm.dfoSanctionNumber, fellForm.woodWeightKg, fellForm.resinGrade);
    setIsFellModalOpen(false);
    setFellingTarget(null);
  };

  const columns = [
    {
      header: 'Harvest Auth ID',
      accessor: 'id',
      render: (h) => (
        <div>
          <span className="font-extrabold text-slate-900 font-mono text-xs">{h.id}</span>
          <div className="text-[10px] text-slate-500 font-mono">{h.applicationDate}</div>
        </div>
      )
    },
    {
      header: 'Target Tree & Grower',
      accessor: 'treeId',
      render: (h) => (
        <div>
          <span className="font-extrabold text-emerald-800 font-mono">{h.treeId}</span>
          <div className="text-[11px] text-slate-500">{h.farmerName} ({h.cluster})</div>
        </div>
      )
    },
    {
      header: 'DFO Sanction Order',
      accessor: 'dfoSanctionNumber',
      render: (h) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-800">{h.dfoSanctionNumber || 'PENDING_SANCTION'}</span>
          <div className="text-[10px] text-slate-500">{h.dfoSanctionDate ? `Sanctioned: ${h.dfoSanctionDate}` : 'Under DFO Scrutiny'}</div>
        </div>
      )
    },
    {
      header: 'Cleaned Heartwood',
      accessor: 'cleanedHeartwoodKg',
      render: (h) => (
        <div>
          <span className="font-extrabold text-slate-900">
            {h.cleanedHeartwoodKg ? `${h.cleanedHeartwoodKg} kg` : '—'}
          </span>
          {h.batchGeneratedId && (
            <div className="text-[10px] font-mono text-emerald-700 font-bold">{h.batchGeneratedId}</div>
          )}
        </div>
      )
    },
    {
      header: 'Maker-Checker Review',
      accessor: 'makerCheckerApproved',
      render: (h) => (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          h.makerCheckerApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {h.makerCheckerApproved ? 'Verified' : 'Pending Review'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (h) => <StatusBadge status={h.status} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (h) => (
        <div className="flex items-center gap-1.5">
          {h.status !== 'FELL_COMPLETED' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFellingTarget(h);
                setIsFellModalOpen(true);
              }}
              className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition"
            >
              Fell & Weigh
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedHarvest(h);
              }}
              className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
            >
              Batch Tag
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Harvest Applications & Felling Supervision</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 05
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            DFO felling sanction verification, field inspection notes, stump photo hashing, and digital scale weighment tags.
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Harvest Application</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={harvests}
        searchKey="treeId"
        searchPlaceholder="Search by Tree ID, Harvest ID, or DFO permit..."
        onRowClick={(h) => setSelectedHarvest(h)}
      />

      {/* Harvest Detail & Batch Tag Modal */}
      {selectedHarvest && (
        <Modal
          isOpen={!!selectedHarvest}
          onClose={() => setSelectedHarvest(null)}
          title={`Harvest Batch Tag: ${selectedHarvest.batchGeneratedId || selectedHarvest.id}`}
          subtitle={`Tree: ${selectedHarvest.treeId} • DFO Sanction: ${selectedHarvest.dfoSanctionNumber}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Harvest Batch ID</span>
                <div className="font-extrabold text-emerald-900 font-mono text-sm">{selectedHarvest.batchGeneratedId || 'PENDING'}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Felling Date</span>
                <div className="font-bold text-slate-900">{selectedHarvest.fellingDate || 'Not yet felled'}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Certified Net Weight</span>
                <div className="font-extrabold text-slate-900 text-sm">
                  {selectedHarvest.cleanedHeartwoodKg ? `${selectedHarvest.cleanedHeartwoodKg} kg` : 'Pending Scale'}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Supervising Officer</span>
                <div className="font-medium text-slate-800">{selectedHarvest.fieldAgent}</div>
              </div>
            </div>

            {selectedHarvest.stumpPhotoHash && (
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Stump Verification SHA-256 Photo Hash
                </span>
                <div className="p-2.5 rounded-lg bg-slate-100 font-mono text-[11px] text-slate-700 break-all border border-slate-200">
                  {selectedHarvest.stumpPhotoHash}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedHarvest(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Harvest Application Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Harvest Sanction Application"
        subtitle="Forwarded to Divisional Forest Officer (DFO) under State Forest Rules"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Inoculated Tree *</label>
            <select
              value={applyForm.treeId}
              onChange={(e) => setApplyForm({ ...applyForm, treeId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
            >
              {trees.slice(0, 15).map(t => (
                <option key={t.id} value={t.id}>{t.id} ({t.ageYears} yrs, {t.plantationId})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Registered Grower Name</label>
              <input
                type="text"
                value={applyForm.farmerName}
                onChange={(e) => setApplyForm({ ...applyForm, farmerName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Cluster / Region</label>
              <select
                value={applyForm.cluster}
                onChange={(e) => setApplyForm({ ...applyForm, cluster: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Golaghat Cluster">Golaghat Cluster (Assam)</option>
                <option value="Kadamtala Cluster">Kadamtala Cluster (Tripura)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>

      {/* Fell & Weigh Modal */}
      {fellingTarget && (
        <Modal
          isOpen={isFellModalOpen}
          onClose={() => {
            setIsFellModalOpen(false);
            setFellingTarget(null);
          }}
          title={`Supervise Felling & Weighing: ${fellingTarget.treeId}`}
          subtitle="Field Agent scale calibration and portable tag printer generation"
        >
          <form onSubmit={handleFellSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">DFO Statutory Sanction Order No. *</label>
              <input
                type="text"
                required
                value={fellForm.dfoSanctionNumber}
                onChange={(e) => setFellForm({ ...fellForm, dfoSanctionNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Cleaned Heartwood Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={fellForm.woodWeightKg}
                  onChange={(e) => setFellForm({ ...fellForm, woodWeightKg: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Resin Classification</label>
                <select
                  value={fellForm.resinGrade}
                  onChange={(e) => setFellForm({ ...fellForm, resinGrade: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-semibold"
                >
                  <option value="GRADE_A_DARK_RESIN">Grade A (Dark Resinous / Sinkable)</option>
                  <option value="GRADE_B_MEDIUM_RESIN">Grade B (Medium Brown Distillation Grade)</option>
                  <option value="GRADE_C_LIGHT_WOOD">Grade C (Low Resin Wood Chips)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFellModalOpen(false)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
              >
                Confirm Felling & Generate Batch
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
