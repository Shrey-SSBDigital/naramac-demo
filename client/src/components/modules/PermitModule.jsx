import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { FileBadge2, ShieldCheck, Plus, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';

export default function PermitModule() {
  const { permits, addPermit } = useEnterprise();
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    permitNumber: 'DFO/GLT/2026/HARV-215',
    permitType: 'DFO Tree Felling Sanction Order',
    issuingAuthority: 'Divisional Forest Officer, Golaghat Forest Division, Assam',
    officerName: 'S. K. Bordoloi, IFS',
    beneficiaryName: 'Bhaben Saikia',
    beneficiaryFarmerId: 'FRM-AS-01',
    expiryDate: '2026-04-15',
    quotaApprovedTrees: 4,
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
      render: (p) => (
        <div>
          <span className="font-bold text-slate-800">{p.permitType}</span>
          <div className="text-[11px] text-slate-500">{p.approvedSpecies}</div>
        </div>
      )
    },
    {
      header: 'Issuing Authority',
      accessor: 'issuingAuthority',
      render: (p) => (
        <div>
          <span className="font-semibold text-slate-700">{p.issuingAuthority}</span>
          <div className="text-[10px] text-slate-500 font-medium">{p.officerName}</div>
        </div>
      )
    },
    {
      header: 'Beneficiary Entity',
      accessor: 'beneficiaryName',
      render: (p) => (
        <div>
          <span className="font-bold text-emerald-800">{p.beneficiaryName}</span>
          <div className="text-[10px] text-slate-400 font-mono">{p.beneficiaryFarmerId}</div>
        </div>
      )
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

  return (
    <div className="space-y-5">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Statutory Permits & DFO Sanctions</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 06
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            DFO tree felling permissions, State Forest Transit Passes (Form II), and CITES Appendix II Export Authorizations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record Statutory Permit</span>
        </button>
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
          subtitle={selectedPermit.permitType}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Permit Type</span>
                <div className="font-extrabold text-slate-900">{selectedPermit.permitType}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Statutory Status</span>
                <div><StatusBadge status={selectedPermit.status} /></div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Issuing Authority</span>
                <div className="font-semibold text-slate-800">{selectedPermit.issuingAuthority}</div>
                <div className="text-[11px] text-slate-500">Signatory: {selectedPermit.officerName}</div>
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
                {selectedPermit.verificationHash}
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
