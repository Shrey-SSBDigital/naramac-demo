import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { FileBadge2, ShieldCheck, Plus, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';

export default function PermitModule() {
  const { permits, addPermit, trees, harvestBatches, harvests, farmers, activeRole } = useEnterprise();
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [linkMode, setLinkMode] = useState('BY_BATCH'); // 'BY_BATCH' | 'BY_TREE'

  const [form, setForm] = useState({
    permitNumber: 'DFO/GLT/2026/HARV-215',
    permitType: 'DFO Tree Felling Sanction Order',
    batchId: '',
    treeId: 'TRE-AS-001',
    plantingYear: 2014,
    treeAgeYears: 12,
    issuingAuthority: 'Divisional Forest Officer, Golaghat Forest Division, Assam',
    officerName: 'S. K. Bordoloi, IFS',
    beneficiaryName: 'Bhaben Saikia',
    beneficiaryFarmerId: 'FRM-AS-01',
    expiryDate: '2026-04-15',
    quotaApprovedTrees: 1,
    approvedSpecies: 'Aquilaria malaccensis'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addPermit(form);
    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Permit Number',
      accessor: 'permitNumber',
      render: (p) => (
        <div>
          <span className="font-extrabold text-slate-900 font-mono text-xs">{p.permitNumber}</span>
          <div className="text-[10px] text-slate-500 font-mono">Issued: {p.issueDate}</div>
        </div>
      )
    },
    {
      header: 'Permit Classification',
      accessor: 'permitType',
      render: (p) => {
        const type = p.permitType || (p.type === 'FELLING' ? 'DFO Tree Felling Sanction Order' : p.type || 'DFO Tree Felling Sanction Order');
        const species = p.approvedSpecies || 'Aquilaria malaccensis';
        return (
          <div>
            <span className="font-bold text-slate-800">{type}</span>
            <div className="text-[11px] text-slate-500">{species}</div>
          </div>
        );
      }
    },
    {
      header: 'Linked Tree & Harvest Batch',
      accessor: 'treeId',
      render: (p) => {
        const batch = harvestBatches.find(b => b.id === p.batchId || b.harvestAuthId === p.authorisationId || (p.linkedEntities && p.linkedEntities.includes(b.id)));
        const targetTreeId = p.treeId || batch?.treeId || (p.linkedEntities ? p.linkedEntities.find(e => typeof e === 'string' && e.startsWith('TRE-')) : null) || 'TRE-AS-001';
        const targetTree = trees.find(t => t.id === targetTreeId);
        const batchId = p.batchId || batch?.id || (p.linkedEntities ? p.linkedEntities.find(e => typeof e === 'string' && e.startsWith('HBT-')) : null);
        const plantingYear = p.plantingYear || batch?.plantingYear || targetTree?.plantingYear || 2014;
        const treeAge = p.treeAgeYears || batch?.treeAgeYears || targetTree?.ageYears || 12;

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono font-extrabold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-xs">
                🌲 {targetTreeId}
              </span>
              <span className="text-[10px] text-slate-600 font-semibold">
                (Planted {plantingYear} • {treeAge} yrs)
              </span>
            </div>
            {batchId ? (
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                <span>Batch:</span>
                <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded">{batchId}</span>
              </div>
            ) : (
              <div className="text-[9px] text-slate-400 font-mono">
                {p.authorisationId ? `Auth: ${p.authorisationId}` : 'Felling Sanction Block'}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Issuing Authority',
      accessor: 'issuingAuthority',
      render: (p) => {
        const auth = p.issuingAuthority || p.issuedBy || 'Divisional Forest Officer, Golaghat Forest Division, Assam';
        const officer = p.officerName || 'S. K. Bordoloi, IFS (DFO)';
        return (
          <div>
            <span className="font-semibold text-slate-700">{auth}</span>
            <div className="text-[10px] text-slate-500 font-medium">{officer}</div>
          </div>
        );
      }
    },
    {
      header: 'Beneficiary Entity',
      accessor: 'beneficiaryName',
      render: (p) => {
        const name = p.beneficiaryName || p.holderName || 'Registered Grower';
        const id = p.beneficiaryFarmerId || p.holderId || 'FRM-AS-01';
        return (
          <div>
            <span className="font-bold text-emerald-800">{name}</span>
            <div className="text-[10px] text-slate-400 font-mono">{id}</div>
          </div>
        );
      }
    },
    {
      header: 'Validity Expiry',
      accessor: 'expiryDate',
      render: (p) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          {p.expiryDate}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (p) => <StatusBadge status={p.status} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (p) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPermit(p);
          }}
          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
        >
          View Permit
        </button>
      )
    }
  ];

  const isDfoRole = activeRole === 'FOREST_DEPT';
  const isFarmerRole = activeRole === 'FARMER';
  const isCollectionRole = activeRole === 'COLLECTION_OPERATOR';
  const isAdminRole = activeRole === 'NERAMAC_ADMIN' || activeRole === 'SUPER_ADMIN';

  return (
    <div className="space-y-5">
      {/* Role-Specific Separation of Concerns Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl shadow-xs border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <FileBadge2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm">
                {isDfoRole && 'DFO Forest Authority • Statutory Certificates & Orders Registry'}
                {isFarmerRole && 'Farmer View • Issued Felling Orders & State Forest e-Transit Passes'}
                {isCollectionRole && 'Depot Intake • Transit Pass & Quota Verification'}
                {!isDfoRole && !isFarmerRole && !isCollectionRole && 'Statutory Permits, DFO Sanctions & CITES Certificates'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Persona: {activeRole}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              <strong>Workflow Distinction:</strong> Harvest Management handles physical field tasks (application, inspection, felling, weighing), whereas Permits &amp; DFO Orders serves as the official legal certificate repository (DFO Tree Felling Sanctions, State Forest e-TP Form II, and CITES export quotas).
            </p>
          </div>
        </div>

        {isDfoRole || isAdminRole ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Record Statutory Permit</span>
          </button>
        ) : null}
      </div>

      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Statutory Permits &amp; DFO Sanctions</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 06
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Assam Forest Dept
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official certificate repository: DFO Tree Felling Sanction Orders, State Forest Transit Passes (Form II), and CITES Appendix II Export Authorizations.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={permits}
        searchKey="permitNumber"
        searchPlaceholder="Search permit by number, authority, or beneficiary..."
        onRowClick={(p) => setSelectedPermit(p)}
      />

      {/* Detail Modal */}
      {selectedPermit && (
        <Modal
          isOpen={!!selectedPermit}
          onClose={() => setSelectedPermit(null)}
          title={`Permit Certificate: ${selectedPermit.permitNumber}`}
          subtitle={selectedPermit.permitType || (selectedPermit.type === 'FELLING' ? 'DFO Tree Felling Sanction Order' : selectedPermit.type || 'DFO Felling Sanction')}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Permit Type</span>
                <div className="font-extrabold text-slate-900">{selectedPermit.permitType || (selectedPermit.type === 'FELLING' ? 'DFO Tree Felling Sanction Order' : selectedPermit.type || 'DFO Felling Sanction')}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Statutory Status</span>
                <div><StatusBadge status={selectedPermit.status} /></div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Linked Tree & Age</span>
                <div className="font-mono font-bold text-emerald-800">
                  {selectedPermit.treeId || 'TRE-AS-001'} (Planted {selectedPermit.plantingYear || 2014} • {selectedPermit.treeAgeYears || 12} yrs)
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Linked Harvest Batch</span>
                <div className="font-mono font-bold text-slate-800">
                  {selectedPermit.batchId || selectedPermit.linkedEntities?.find(e => typeof e === 'string' && e.startsWith('HBT-')) || 'HBT-AS-2026-001'}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Issuing Authority</span>
                <div className="font-semibold text-slate-800">{selectedPermit.issuingAuthority || selectedPermit.issuedBy || 'Divisional Forest Officer, Assam'}</div>
                <div className="text-[11px] text-slate-500">Signatory: {selectedPermit.officerName || 'S. K. Bordoloi, IFS'}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Validity Timeline</span>
                <div className="font-mono text-slate-800 font-bold">{selectedPermit.issueDate} → {selectedPermit.expiryDate}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Statutory Verification Hash (MoEFCC & Forest Dept)
              </span>
              <div className="p-2.5 rounded-lg bg-slate-100 font-mono text-[11px] text-slate-700 break-all border border-slate-200">
                {selectedPermit.verificationHash || selectedPermit.documentHash || 'sha256:f12a8849102eacb920198421b8c09182374'}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPermit(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Record Permit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Statutory Permit"
        subtitle="Upload signed order reference issued by Forest Department or MoEFCC"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Quick Option to Select / Link to Harvest Batch & Tree */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-black text-emerald-950">
                Option: Link to Target Tree or Harvest Batch (Auto-Fill & Link)
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLinkMode('BY_BATCH')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    linkMode === 'BY_BATCH'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  By Harvest Batch
                </button>
                <button
                  type="button"
                  onClick={() => setLinkMode('BY_TREE')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    linkMode === 'BY_TREE'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  By Registered Tree
                </button>
              </div>
            </div>

            {linkMode === 'BY_BATCH' ? (
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">
                  Select Harvest Batch (For Transit Pass / Transport Permit):
                </span>
                <select
                  value={form.batchId || ''}
                  onChange={(e) => {
                    const selectedBatchId = e.target.value;
                    if (!selectedBatchId) {
                      setForm({ ...form, batchId: '', treeId: '' });
                      return;
                    }
                    const b = harvestBatches.find(x => x.id === selectedBatchId);
                    const t = trees.find(x => x.id === b?.treeId);
                    setForm({
                      ...form,
                      batchId: b.id,
                      treeId: b.treeId,
                      plantingYear: b.plantingYear || t?.plantingYear || 2014,
                      treeAgeYears: b.treeAgeYears || t?.ageYears || 12,
                      beneficiaryName: b.farmerName || form.beneficiaryName,
                      beneficiaryFarmerId: b.farmerId || form.beneficiaryFarmerId,
                      quotaApprovedTrees: 1,
                      quotaKg: b.netWeightKg || 38.5,
                      permitType: 'State Forest Transit Pass (Form II)',
                      permitNumber: b.transitPassNumber || `TP/FOR/GLT/2026/${Math.floor(1000 + Math.random() * 9000)}`
                    });
                  }}
                  className="w-full text-xs px-3 py-2 border rounded-lg font-mono font-bold bg-white"
                >
                  <option value="">-- Manual Entry / General Quota --</option>
                  {harvestBatches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.id} • Tree {b.treeId} (Planted {b.plantingYear || 2014}, {b.treeAgeYears || 12} yrs) • {b.farmerName} ({b.netWeightKg} kg)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">
                  Select Registered Tree (For Pre-Felling Sanction Order):
                </span>
                <select
                  value={form.treeId || ''}
                  onChange={(e) => {
                    const selectedTreeId = e.target.value;
                    if (!selectedTreeId) return;
                    const t = trees.find(x => x.id === selectedTreeId);
                    const matchingBatch = harvestBatches.find(b => b.treeId === selectedTreeId);
                    setForm({
                      ...form,
                      treeId: t.id,
                      batchId: matchingBatch ? matchingBatch.id : '',
                      plantingYear: t.plantingYear || 2014,
                      treeAgeYears: t.ageYears || 12,
                      beneficiaryName: t.farmerName || form.beneficiaryName,
                      beneficiaryFarmerId: t.farmerId || form.beneficiaryFarmerId,
                      quotaApprovedTrees: 1,
                      approvedSpecies: t.variety || 'Aquilaria malaccensis',
                      permitType: 'DFO Tree Felling Sanction Order',
                      permitNumber: `DFO/GLT/2026/HARV-${Math.floor(200 + Math.random() * 800)}`
                    });
                  }}
                  className="w-full text-xs px-3 py-2 border rounded-lg font-mono font-bold bg-white"
                >
                  <option value="">-- Select Registered Tree --</option>
                  {(trees || []).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.id} • Grower: {t.farmerName || 'Bhaben Saikia'} • Planted {t.plantingYear || 2014} ({t.ageYears || 12} yrs) • {t.variety || 'Aquilaria'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(form.treeId || form.batchId) && (
              <div className="p-2 bg-white rounded-lg border border-emerald-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                <div>
                  <span className="text-slate-400 block font-sans font-semibold">Linked Tree:</span>
                  <span className="font-bold text-emerald-800">{form.treeId || 'TRE-AS-001'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans font-semibold">Planting Year:</span>
                  <span className="font-bold text-blue-900">{form.plantingYear || 2014}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans font-semibold">Tree Age:</span>
                  <span className="font-bold text-emerald-900">{form.treeAgeYears || 12} Years</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans font-semibold">{form.batchId ? 'Harvest Batch:' : 'Species:'}</span>
                  <span className="font-bold text-slate-800 truncate block">{form.batchId || form.approvedSpecies || 'Aquilaria'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Permit Number *</label>
              <input
                type="text"
                required
                value={form.permitNumber}
                onChange={(e) => setForm({ ...form, permitNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Permit Classification</label>
              <select
                value={form.permitType}
                onChange={(e) => setForm({ ...form, permitType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold"
              >
                <option value="DFO Tree Felling Sanction Order">DFO Tree Felling Sanction Order</option>
                <option value="State Forest Transit Pass (Form II)">State Forest Transit Pass (Form II)</option>
                <option value="CITES Appendix II Export Certificate">CITES Appendix II Export Certificate</option>
                <option value="Pollution Control & CPC Processing NOC">Pollution Control & CPC Processing NOC</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Issuing Authority</label>
              <input
                type="text"
                value={form.issuingAuthority}
                onChange={(e) => setForm({ ...form, issuingAuthority: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Beneficiary Name</label>
              <input
                type="text"
                value={form.beneficiaryName}
                onChange={(e) => setForm({ ...form, beneficiaryName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Quota (Trees or Kg)</label>
              <input
                type="number"
                value={form.quotaApprovedTrees}
                onChange={(e) => setForm({ ...form, quotaApprovedTrees: parseInt(e.target.value) || 1 })}
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
              Record Permit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
