import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { UserPlus, MapPin, Eye, ShieldCheck, Check, Sparkles, Building, Trees } from 'lucide-react';

export default function FarmerModule() {
  const { farmers, addFarmer, plantations, trees, activeRole } = useEnterprise();
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [showAadhaarUnmasked, setShowAadhaarUnmasked] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    gender: 'Male',
    age: 45,
    phone: '',
    state: 'Assam',
    cluster: 'Golaghat Cluster',
    district: 'Golaghat',
    subdivision: 'Bokakhat',
    village: '',
    dagNumber: '',
    landAreaAcres: 2.5,
    treeCount: 200,
    coordinates: [26.5204, 93.9782]
  });

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.village) return;
    addFarmer(formData);
    setIsRegisterModalOpen(false);
    setFormData({
      name: '',
      fatherName: '',
      gender: 'Male',
      age: 45,
      phone: '',
      state: 'Assam',
      cluster: 'Golaghat Cluster',
      district: 'Golaghat',
      subdivision: 'Bokakhat',
      village: '',
      dagNumber: '',
      landAreaAcres: 2.5,
      treeCount: 200,
      coordinates: [26.5204, 93.9782]
    });
  };

  const columns = [
    {
      header: 'Farmer ID & Name',
      accessor: 'name',
      render: (f) => (
        <div>
          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
            <span>{f.name}</span>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
              {f.id}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            S/o {f.fatherName} • {f.village}
          </div>
        </div>
      )
    },
    {
      header: 'Cluster / District',
      accessor: 'cluster',
      render: (f) => (
        <div>
          <span className="font-bold text-slate-800">{f.cluster}</span>
          <div className="text-[11px] text-slate-500">{f.district}, {f.state}</div>
        </div>
      )
    },
    {
      header: 'Land Title (Dag / Patta)',
      accessor: 'dagNumber',
      render: (f) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-700">{f.dagNumber}</span>
          <div className="text-[11px] text-slate-500">{f.landAreaAcres} Acres</div>
        </div>
      )
    },
    {
      header: 'Tree Holding',
      accessor: 'treeCount',
      render: (f) => (
        <div>
          <span className="font-bold text-slate-900">{f.treeCount} Trees</span>
          <div className="text-[11px] text-emerald-700 font-semibold">Aquilaria malaccensis</div>
        </div>
      )
    },
    {
      header: 'DPDP Aadhaar',
      accessor: 'aadhaarMasked',
      render: (f) => (
        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {f.aadhaarMasked || 'XXXX-XXXX-8921'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (f) => <StatusBadge status={f.status} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (f) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFarmer(f);
          }}
          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
        >
          View Profile
        </button>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Module Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Farmer & Grower Management</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 02
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Primary producer registry, Dag/Patta tenure verification, and DPDP Act 2023 privacy compliant records.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Farmer</span>
        </button>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={farmers}
        searchKey="name"
        searchPlaceholder="Search farmer by name, village, or Dag number..."
        filterKey="cluster"
        filterOptions={[
          { value: 'Golaghat Cluster', label: 'Golaghat Cluster (Assam)' },
          { value: 'Kadamtala Cluster', label: 'Kadamtala Cluster (Tripura)' },
          { value: 'Hojai / Golaghat', label: 'Hojai Cluster' }
        ]}
        onRowClick={(f) => setSelectedFarmer(f)}
      />

      {/* Farmer Detail Profile Modal */}
      {selectedFarmer && (
        <Modal
          isOpen={!!selectedFarmer}
          onClose={() => setSelectedFarmer(null)}
          title={`Grower Profile: ${selectedFarmer.name}`}
          subtitle={`Registered Digital Farmer Identity: ${selectedFarmer.id}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Top Identity Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 font-semibold text-[10px] uppercase">Full Name</span>
                <div className="font-extrabold text-slate-900 text-sm">{selectedFarmer.name}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold text-[10px] uppercase">Father / Guardian</span>
                <div className="font-semibold text-slate-800">{selectedFarmer.fatherName}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold text-[10px] uppercase">Contact Number</span>
                <div className="font-mono text-slate-800">{selectedFarmer.phone}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold text-[10px] uppercase">State & Cluster</span>
                <div className="font-bold text-emerald-800">{selectedFarmer.state} ({selectedFarmer.cluster})</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold text-[10px] uppercase">District & Subdivision</span>
                <div className="text-slate-800">{selectedFarmer.district}, {selectedFarmer.subdivision}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold text-[10px] uppercase">Registration Date</span>
                <div className="font-mono text-slate-800">{selectedFarmer.registrationDate}</div>
              </div>
            </div>

            {/* Land Ownership & Dag/Patta */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-700" />
                <span>Statutory Land Ownership & Revenue Title</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Revenue Records</span>
                  <div className="font-bold text-slate-900">{selectedFarmer.dagNumber}</div>
                  <div className="text-[11px] text-slate-500">{selectedFarmer.village}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Plantation Holding</span>
                  <div className="font-bold text-slate-900">{selectedFarmer.landAreaAcres} Acres</div>
                  <div className="text-[11px] text-emerald-700 font-semibold">{selectedFarmer.treeCount} Agarwood Trees</div>
                </div>
              </div>
            </div>

            {/* DPDP Act 2023 Masking Toggle */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span className="font-extrabold text-amber-900">DPDP Act 2023 Privacy Masking</span>
                </div>
                <button
                  onClick={() => setShowAadhaarUnmasked(!showAadhaarUnmasked)}
                  className="text-[11px] font-bold text-amber-900 underline hover:text-amber-950"
                >
                  {showAadhaarUnmasked ? 'Mask Identity' : 'View Authorized Unmasked'}
                </button>
              </div>
              <p className="text-[11px] text-amber-800/90 leading-tight">
                In public QR verification scans, the grower personal phone and Aadhaar are strictly decoupled to safeguard privacy.
              </p>
              <div className="font-mono text-xs font-bold text-amber-950 bg-white/80 p-2 rounded border border-amber-200">
                Aadhaar Reference: {showAadhaarUnmasked ? '4412-8921-9011 (Verified UIDAI)' : selectedFarmer.aadhaarMasked}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedFarmer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Register Farmer Form Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Agarwood Grower"
        subtitle="Generates FRM Authoritative Digital Identity with DPDP protection"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Grower Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dhiren Kalita"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Father / Guardian Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Late Atul Kalita"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+91 94350..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Cluster / State</label>
              <select
                value={formData.cluster}
                onChange={(e) => setFormData({ ...formData, cluster: e.target.value, state: e.target.value.includes('Tripura') ? 'Tripura' : 'Assam' })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Golaghat Cluster">Golaghat Cluster (Assam)</option>
                <option value="Kadamtala Cluster">Kadamtala Cluster (Tripura)</option>
                <option value="Hojai / Golaghat">Hojai Cluster (Assam)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Estimated Trees</label>
              <input
                type="number"
                value={formData.treeCount}
                onChange={(e) => setFormData({ ...formData, treeCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Village & Mouza *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dhekial Gaon, Mouza Dhekial"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Dag & Patta Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dag 192, Patta 48"
                value={formData.dagNumber}
                onChange={(e) => setFormData({ ...formData, dagNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
            >
              Register Farmer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
