import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import Modal from '../common/Modal';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  MapPin,
  Trees,
  Search,
  ExternalLink,
  QrCode,
  Copy,
  Check,
  Eye,
  Filter,
  ArrowRight,
  Sparkles,
  Plus,
  X,
  AlertTriangle,
  Ban,
  Building2,
  Phone,
  LandPlot,
  CreditCard
} from 'lucide-react';

export default function FarmerApprovalModule({ onNavigate }) {
  const {
    activeRole,
    setActiveRole,
    farmerApplications,
    approveFarmerApplication,
    rejectFarmerApplication,
    addToast
  } = useEnterprise();

  // Filter and Search States
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals States
  const [selectedAppForDetails, setSelectedAppForDetails] = useState(null);
  const [selectedAppForApproval, setSelectedAppForApproval] = useState(null);
  const [selectedAppForRejection, setSelectedAppForRejection] = useState(null);

  // Form Inputs for Modals
  const [approvalNotes, setApprovalNotes] = useState('Verified with Circle Revenue Office. Complies with Assam Agarwood Policy 2020. Sanction approved.');
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);

  const isAuthorized = activeRole === 'NERAMAC_ADMIN' || activeRole === 'FOREST_DEPT' || activeRole === 'SUPER_ADMIN';

  // Exclude any applications marked as REJECTED
  const activeApplications = (farmerApplications || []).filter(app => app.status !== 'REJECTED');

  // Filtered applications based on tabs and search
  const filteredApps = activeApplications.filter(app => {
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (app.farmerName || '').toLowerCase().includes(term) ||
      (app.id || '').toLowerCase().includes(term) ||
      (app.dagNumber || '').toLowerCase().includes(term) ||
      (app.phone || '').toLowerCase().includes(term) ||
      (app.village || '').toLowerCase().includes(term) ||
      (app.cluster || '').toLowerCase().includes(term) ||
      (app.district || '').toLowerCase().includes(term);

    if (!matchesSearch) return false;
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PENDING_APPROVAL') return app.status !== 'APPROVED';
    if (filterStatus === 'APPROVED') return app.status === 'APPROVED';
    return true;
  });

  const pendingCount = activeApplications.filter(a => a.status !== 'APPROVED').length;
  const approvedCount = activeApplications.filter(a => a.status === 'APPROVED').length;

  // Handlers for View Details
  const handleOpenDetails = (app) => {
    setSelectedAppForDetails(app);
  };

  // Handlers for Approve Flow
  const handleOpenApproveModal = (app) => {
    setSelectedAppForApproval(app);
    setApprovalNotes('Verified with Circle Revenue Office. Complies with Assam Agarwood Policy 2020. Sanction approved.');
  };

  const handleConfirmApproval = () => {
    if (!selectedAppForApproval) return;
    const appId = selectedAppForApproval.id;
    approveFarmerApplication(appId, {
      approvedBy: `${activeRole} Executive Officer`,
      remarks: approvalNotes
    });

    // If details modal was open for this app, update its status
    if (selectedAppForDetails?.id === appId) {
      setSelectedAppForDetails(prev => prev ? { ...prev, status: 'APPROVED' } : null);
    }
    setSelectedAppForApproval(null);
  };

  // Handlers for Reject Flow
  const handleOpenRejectModal = (app) => {
    setSelectedAppForRejection(app);
    setRejectionRemarks('');
    setRejectionError('');
  };

  const handleConfirmRejection = () => {
    if (!selectedAppForRejection) return;
    if (!rejectionRemarks.trim()) {
      setRejectionError('Please provide remarks / reason for rejection.');
      return;
    }

    const appId = selectedAppForRejection.id;
    rejectFarmerApplication(appId, rejectionRemarks.trim());

    // Close rejection modal and details modal if viewing rejected app
    setSelectedAppForRejection(null);
    if (selectedAppForDetails?.id === appId) {
      setSelectedAppForDetails(null);
    }
  };

  const handleCopyHash = (hash) => {
    if (!hash) return;
    navigator.clipboard?.writeText(hash);
    setCopiedHash(true);
    addToast('Document hash copied to clipboard', 'info');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
              Farmer Verification & Approval Portal
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              /farmer/approvals
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-1">
            NERAMAC & Forest Dept Farmer Approval List
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Assam Agarwood Policy 2020 • Homestead Land Title Verification & Maker-Checker Sanctioning
          </p>
        </div>

        {/* Role perspective indicator */}
        <div className="flex items-center gap-2">
          {!isAuthorized ? (
            <button
              onClick={() => {
                setActiveRole('NERAMAC_ADMIN');
                addToast('Switched to NERAMAC Administrator perspective', 'info');
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Switch to NERAMAC Admin</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-xl text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Sanctioning Authority: {activeRole}</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Applications</span>
            <span className="text-2xl font-black text-slate-900">{activeApplications.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Pending Approval</span>
            <span className="text-2xl font-black text-amber-900">{pendingCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Sanctioned Growers</span>
            <span className="text-2xl font-black text-emerald-900">{approvedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls: Search & Tabs */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 text-xs font-bold overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterStatus === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Applications ({activeApplications.length})
            </button>
            <button
              onClick={() => setFilterStatus('PENDING_APPROVAL')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterStatus === 'PENDING_APPROVAL'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              Pending Approval ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('APPROVED')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterStatus === 'APPROVED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              Sanctioned ({approvedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search grower, ID, Dag, or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
            />
          </div>
        </div>

        {/* Applications Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Application ID</th>
                <th className="px-4 py-3">Grower Details</th>
                <th className="px-4 py-3">Cluster & State</th>
                <th className="px-4 py-3">Homestead Land</th>
                <th className="px-4 py-3">Home GPS Location</th>
                <th className="px-4 py-3">Declared Trees</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length > 0 ? (
                filteredApps.map(app => {
                  const isApproved = app.status === 'APPROVED';
                  const lat = app.latitude || (app.coordinates ? app.coordinates[0] : null);
                  const lng = app.longitude || (app.coordinates ? app.coordinates[1] : null);

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition">
                      {/* Application ID & Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-black text-slate-900 block">{app.id}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{app.submissionDate}</span>
                      </td>

                      {/* Grower & Contact */}
                      <td className="px-4 py-3.5">
                        <div className="font-black text-slate-900 text-xs">{app.farmerName}</div>
                        <div className="text-[11px] text-slate-500 font-medium">S/o {app.fatherName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{app.phone}</div>
                      </td>

                      {/* Cluster & District */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-800 block">{app.cluster}</span>
                        <span className="text-[11px] text-slate-500">{app.district}, {app.state}</span>
                      </td>

                      {/* Homestead Plot & Area */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{app.dagNumber}</span>
                        <span className="text-[11px] text-slate-500 font-semibold">{app.landAreaAcres} Acres</span>
                      </td>

                      {/* GPS Home Location */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {lat && lng ? (
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-950 font-bold">
                            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>
                              {Number(lat).toFixed(4)}°N, {Number(lng).toFixed(4)}°E
                            </span>
                            <a
                              href={`https://www.google.com/maps?q=${lat},${lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:text-emerald-950 p-0.5 rounded hover:bg-emerald-50 transition"
                              title="View Homestead on Google Maps"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Not geotagged</span>
                        )}
                        {app.gpsAccuracyMeters && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            Accuracy: {app.gpsAccuracyMeters}
                          </span>
                        )}
                      </td>

                      {/* Declared Trees */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-black text-emerald-900 block text-xs">
                          {app.estimatedTrees} Trees
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {app.matureTreesCount || 0} mature • {app.saplingsCount || 0} saplings
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isApproved ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-full text-[10px] font-black inline-flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>SANCTIONED</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-950 border border-amber-300 rounded-full text-[10px] font-black inline-flex items-center gap-1 shadow-2xs">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>PENDING APPROVAL</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(app)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-slate-200"
                            title="View Farmer Registration Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>View Details</span>
                          </button>

                          {/* Action Buttons for Pending Applications */}
                          {!isApproved && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenApproveModal(app)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                                title="Approve Farmer Application"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenRejectModal(app)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                title="Reject Farmer Application"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <span className="font-bold text-slate-600 text-sm">No applications found</span>
                      <span className="text-xs text-slate-400">
                        {searchQuery ? 'Try adjusting your search criteria.' : 'No farmer applications in this category.'}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VIEW FARMER DETAILS MODAL */}
      {selectedAppForDetails && (
        <Modal
          isOpen={!!selectedAppForDetails}
          onClose={() => setSelectedAppForDetails(null)}
          title={`Farmer Application Details: ${selectedAppForDetails.id}`}
          subtitle={`Submitted on ${selectedAppForDetails.submissionDate} • Assam Agarwood Policy 2020 Registration`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            {/* Header Status Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Applicant Grower</span>
                <h3 className="text-sm font-black text-slate-900">{selectedAppForDetails.farmerName}</h3>
                <span className="text-xs text-slate-500 font-medium">S/o {selectedAppForDetails.fatherName}</span>
              </div>
              <div className="text-right">
                {selectedAppForDetails.status === 'APPROVED' ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-950 border border-emerald-400 rounded-lg text-xs font-black inline-flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>SANCTIONED (ID: {selectedAppForDetails.approvalDetails?.sanctionedFarmerId || 'FRM-AS-XX'})</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-100 text-amber-950 border border-amber-400 rounded-lg text-xs font-black inline-flex items-center gap-1.5 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>PENDING ADMIN APPROVAL</span>
                  </span>
                )}
              </div>
            </div>

            {/* Grid of Farmer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Section 1: Personal & Contact Details */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs border-b border-slate-100 pb-1.5">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>Personal & Address Details</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Gender & Age:</span>
                    <span className="font-bold text-slate-900">{selectedAppForDetails.gender || 'Male'}, {selectedAppForDetails.age || 45} yrs</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Phone:</span>
                    <span className="font-bold font-mono text-slate-900">{selectedAppForDetails.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Village & Mouza:</span>
                    <span className="font-bold text-slate-900">{selectedAppForDetails.village}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Subdivision & District:</span>
                    <span className="font-bold text-slate-900">{selectedAppForDetails.subdivision}, {selectedAppForDetails.district}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Regional Cluster & State:</span>
                    <span className="font-bold text-emerald-900">{selectedAppForDetails.cluster}, {selectedAppForDetails.state}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Homestead Land & Revenue Title */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs border-b border-slate-100 pb-1.5">
                  <LandPlot className="w-4 h-4 text-emerald-700" />
                  <span>Homestead Plot & Revenue Title</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Dag & Patta Number:</span>
                    <span className="font-bold text-slate-900">{selectedAppForDetails.dagNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Homestead Area:</span>
                    <span className="font-bold text-slate-900">{selectedAppForDetails.landAreaAcres} Acres</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Jamabandi Document:</span>
                    <span className="font-mono font-bold text-emerald-800 truncate block">
                      {selectedAppForDetails.jamabandiDoc || 'Jamabandi_Uploaded.pdf'}
                    </span>
                    {selectedAppForDetails.jamabandiHash && (
                      <span className="text-[10px] text-slate-400 font-mono block truncate mt-0.5">
                        SHA: {selectedAppForDetails.jamabandiHash.slice(0, 24)}...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Geolocation Coordinates */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>Home Geolocation Coordinates (GPS)</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {selectedAppForDetails.gpsAccuracyMeters || '± 4.2m'}
                  </span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block">Latitude:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {selectedAppForDetails.latitude ? Number(selectedAppForDetails.latitude).toFixed(6) : '26.541012'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Longitude:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {selectedAppForDetails.longitude ? Number(selectedAppForDetails.longitude).toFixed(6) : '93.941235'}
                      </span>
                    </div>
                  </div>
                  <div className="pt-1">
                    <a
                      href={`https://www.google.com/maps?q=${selectedAppForDetails.latitude || 26.541012},${selectedAppForDetails.longitude || 93.941235}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded-lg border border-emerald-200 inline-flex items-center gap-1.5 transition text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Homestead on Google Maps</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Section 4: Declared Trees & DBT Bank */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs border-b border-slate-100 pb-1.5">
                  <Trees className="w-4 h-4 text-emerald-700" />
                  <span>Tree Inventory & DBT Account</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Total Declared Trees:</span>
                    <span className="font-black text-emerald-900 text-sm">{selectedAppForDetails.estimatedTrees}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Planting Year:</span>
                    <span className="font-bold text-slate-900">{selectedAppForDetails.plantingYear || 2021}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Mature Trees (≥7y):</span>
                    <span className="font-bold text-slate-900">{selectedAppForDetails.matureTreesCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Young Saplings (&lt;7y):</span>
                    <span className="font-bold text-slate-900">{selectedAppForDetails.saplingsCount || 0}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-100">
                    <span className="text-slate-500 block">DBT Bank Mandate:</span>
                    <span className="font-bold text-slate-900">
                      {selectedAppForDetails.bankName} ({selectedAppForDetails.bankAccountNumber || 'XXXX-XXXX-3829'}) • IFSC: {selectedAppForDetails.ifscCode || 'SBIN0000083'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* If Sanction Details Exist */}
            {selectedAppForDetails.approvalDetails && (
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs font-black text-emerald-950">
                  <span>Official Statutory Sanction Details</span>
                  <span className="text-[10px] font-mono">{selectedAppForDetails.approvalDetails.approvalDate}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-emerald-900">
                  <div><b>Sanctioned FRM ID:</b> {selectedAppForDetails.approvalDetails.sanctionedFarmerId}</div>
                  <div><b>Sanction Order:</b> {selectedAppForDetails.approvalDetails.sanctionOrderNo}</div>
                  <div><b>Approved By:</b> {selectedAppForDetails.approvalDetails.approvedBy}</div>
                  <div className="col-span-2 sm:col-span-3"><b>Remarks:</b> {selectedAppForDetails.approvalDetails.remarks}</div>
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedAppForDetails(null)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition text-xs"
              >
                Close
              </button>

              {selectedAppForDetails.status !== 'APPROVED' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedAppForDetails;
                      setSelectedAppForDetails(null);
                      handleOpenRejectModal(target);
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject Application</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedAppForDetails;
                      setSelectedAppForDetails(null);
                      handleOpenApproveModal(target);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow-xs transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Approve Farmer & Issue FRM ID</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: CONFIRM APPROVAL MODAL */}
      {selectedAppForApproval && (
        <Modal
          isOpen={!!selectedAppForApproval}
          onClose={() => setSelectedAppForApproval(null)}
          title="Confirm Farmer Registration Approval"
          subtitle="Govt. of India • Assam Agarwood Policy 2020 Statutory Sanction"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            {/* Applicant Summary */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-300 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black text-emerald-950">
                <span>{selectedAppForApproval.farmerName}</span>
                <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-300">
                  {selectedAppForApproval.id}
                </span>
              </div>
              <div className="text-[11px] text-emerald-900 grid grid-cols-2 gap-1.5 pt-1 border-t border-emerald-200">
                <div><b>Homestead Plot:</b> {selectedAppForApproval.dagNumber}</div>
                <div><b>Homestead Area:</b> {selectedAppForApproval.landAreaAcres} Acres</div>
                <div><b>Cluster:</b> {selectedAppForApproval.cluster}</div>
                <div><b>Declared Trees:</b> {selectedAppForApproval.estimatedTrees} trees</div>
              </div>
            </div>

            {/* Automated Provisions Notice */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block text-[11px]">System Provisions Upon Sanction:</span>
              <ul className="text-slate-600 space-y-1 pl-4 list-disc text-[11px]">
                <li>Issues official State Grower ID (<span className="font-mono font-bold text-emerald-800">FRM-AS-XX</span>)</li>
                <li>Registers plantation parcel in the digital traceability ledger</li>
                <li>Generates POLOGEN sapling block & tags mature trees</li>
                <li>Mints digital QR identity card for farm-gate dispatch</li>
              </ul>
            </div>

            {/* Approval Remarks Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Executive Sanction Remarks *
              </label>
              <textarea
                rows={2}
                value={approvalNotes}
                onChange={e => setApprovalNotes(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                placeholder="Enter executive approval remarks..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedAppForApproval(null)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Issue Farmer ID</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: REJECT REMARKS MODAL */}
      {selectedAppForRejection && (
        <Modal
          isOpen={!!selectedAppForRejection}
          onClose={() => setSelectedAppForRejection(null)}
          title="Reject Farmer Registration Application"
          subtitle="Administrative Review & Application Removal"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            {/* Warning Banner */}
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black block text-xs">Confirm Application Rejection</span>
                <p className="text-[11px] text-rose-800 mt-0.5">
                  You are rejecting application <strong className="font-mono">{selectedAppForRejection.id}</strong> for <strong>{selectedAppForRejection.farmerName}</strong>. 
                  This application will be removed from the active approval list.
                </p>
              </div>
            </div>

            {/* Remarks Input */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Rejection Remarks / Reason *
              </label>
              <textarea
                rows={3}
                value={rejectionRemarks}
                onChange={e => {
                  setRejectionRemarks(e.target.value);
                  if (rejectionError) setRejectionError('');
                }}
                className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 bg-white ${
                  rejectionError ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
                placeholder="Specify the reason for rejection (e.g. Land revenue Jamabandi discrepancy, boundary mismatch, non-homestead land, etc.)..."
                autoFocus
              />
              {rejectionError ? (
                <span className="text-[11px] text-rose-600 font-bold block mt-1">
                  {rejectionError}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 block mt-1">
                  Rejection reason will be recorded in the administrative audit log.
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedAppForRejection(null)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Ban className="w-4 h-4" />
                <span>Confirm Rejection & Remove</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
