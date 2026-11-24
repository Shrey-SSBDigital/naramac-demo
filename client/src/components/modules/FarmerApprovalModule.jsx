import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import { generateSyntheticFieldPhoto } from '../../utils/photoCaptureUtils';
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
  Plus
} from 'lucide-react';

export default function FarmerApprovalModule({ onNavigate }) {
  const {
    activeRole,
    setActiveRole,
    farmerApplications,
    approveFarmerApplication,
    rejectFarmerApplication,
    conductFieldInspection,
    addToast
  } = useEnterprise();

  const [selectedAppId, setSelectedAppId] = useState('APP-AS-2026-002');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [showSanctionModal, setShowSanctionModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('Verified with Circle Revenue Office. Complies with Assam Agarwood Policy 2020. Sanction approved.');

  const isAuthorized = activeRole === 'NERAMAC_ADMIN' || activeRole === 'FOREST_DEPT' || activeRole === 'SUPER_ADMIN';

  // Filter applications
  const filteredApps = farmerApplications.filter(app => {
    const matchesSearch =
      app.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.dagNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.village.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'ALL') return true;
    return app.status === filterStatus;
  });

  const selectedApp = farmerApplications.find(a => a.id === selectedAppId) || filteredApps[0] || farmerApplications[0];

  const handleCopySha = (hash) => {
    if (!hash) return;
    navigator.clipboard?.writeText(hash);
    setCopiedHash(true);
    addToast('Cryptographic SHA-256 buffer hash copied to clipboard', 'info');
    setTimeout(() => setCopiedHash(false), 2500);
  };

  const handleSimulateFieldInspection = (appId) => {
    conductFieldInspection(appId, {
      inspectorId: 'NERAMAC-FA-04',
      inspectorName: 'Dipankar Neog (Field Agent)',
      latMandalName: 'P. Bora (Circle Lat Mandal)',
      verifiedMatureTrees: selectedApp.matureTreesCount || 80,
      verifiedSaplings: selectedApp.saplingsCount || 200,
      pologenAreaAcres: selectedApp.landAreaAcres || 2.5,
      coordinates: [93.9412, 26.5410],
      photoSha256: '9a3ecbe5ed12ab4d8e11ba873c2f11161202b945e3b0c44298fc1c149afbf4c8',
      fieldRemarks: 'Boundary walk completed with Lat Mandal. Mature Aquilaria trees healthy and geo-pinned.'
    });
  };

  const handleConfirmSanction = () => {
    if (!selectedApp) return;
    approveFarmerApplication(selectedApp.id, {
      approvedBy: `${activeRole} Executive Officer`,
      remarks: approvalNotes
    });
    setShowSanctionModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Farmer Verification & Approval Portal
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              /farmers/approvals
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-1">
            NERAMAC & Forest Dept Farmer Approval Portal
          </h1>
          <p className="text-xs text-slate-500">
            Assam Agarwood Policy 2020 • Lat Mandal Revenue Verification & Cryptographic SHA-256 Photo Audit
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
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Switch to NERAMAC Admin to Sanction</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Sanctioning Authority: {activeRole}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Column Interface: Left Queue, Right Application Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Applications Queue (4 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            {/* Search and Filters */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search grower, application ID, or Dag..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition ${
                  filterStatus === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({farmerApplications.length})
              </button>
              <button
                onClick={() => setFilterStatus('PENDING_APPROVAL')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition ${
                  filterStatus === 'PENDING_APPROVAL'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Pending Admin Approval ({farmerApplications.filter(a => a.status !== 'APPROVED').length})
              </button>
              <button
                onClick={() => setFilterStatus('APPROVED')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition ${
                  filterStatus === 'APPROVED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Sanctioned ({farmerApplications.filter(a => a.status === 'APPROVED').length})
              </button>
            </div>
          </div>

          {/* List of Applications */}
          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredApps.map(app => {
              const isSelected = selectedApp?.id === app.id;
              const isApproved = app.status === 'APPROVED';

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition space-y-2 ${
                    isSelected
                      ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-slate-900">{app.id}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({app.submissionDate})</span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 mt-0.5">{app.farmerName}</h3>
                    </div>

                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-200 font-bold'
                      }`}
                    >
                      {isApproved ? 'SANCTIONED' : 'PENDING ADMIN APPROVAL'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{app.dagNumber}</span>
                    <span className="font-semibold text-slate-700">{app.estimatedTrees} trees ({app.landAreaAcres} ac)</span>
                  </div>

                  {app.inspectionReport && (
                    <div className="text-[10px] bg-slate-50 p-1.5 rounded text-slate-600 flex items-center justify-between font-mono">
                      <span>SHA: {app.inspectionReport.photoSha256.slice(0, 16)}...</span>
                      <span className="text-emerald-700 font-bold">✓ Lat Mandal</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Application Details & Verification Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedApp ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-5">
              {/* Application File Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {selectedApp.id}
                    </span>
                    <span className="text-xs text-slate-400">• Submitted {selectedApp.submissionDate}</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">
                    {selectedApp.farmerName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    S/o {selectedApp.fatherName} • {selectedApp.village}, {selectedApp.subdivision}, {selectedApp.cluster}
                  </p>
                </div>

                {/* Status Badge */}
                <div>
                  {selectedApp.status === 'APPROVED' ? (
                    <div className="text-right">
                      <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>SANCTIONED FRM ID: {selectedApp.approvalDetails?.sanctionedFarmerId}</span>
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Order: {selectedApp.approvalDetails?.sanctionOrderNo}
                      </div>
                    </div>
                  ) : (
                    <span className="px-3 py-1 bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-700" />
                      <span>Pending NERAMAC Admin Approval & Sanction</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Revenue Title & Farmer Profile Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Revenue Title</span>
                  <span className="font-bold text-slate-900">{selectedApp.dagNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Homestead Area</span>
                  <span className="font-bold text-slate-900">{selectedApp.landAreaAcres} Acres</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Home Coordinates (GPS)</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-emerald-950">
                    <MapPin className="w-3 h-3 text-emerald-700 flex-shrink-0" />
                    <span className="text-[11px]">
                      {selectedApp.latitude
                        ? `${Number(selectedApp.latitude).toFixed(4)}°N, ${Number(selectedApp.longitude).toFixed(4)}°E`
                        : '26.5204°N, 93.9782°E'}
                    </span>
                    {(selectedApp.latitude || selectedApp.coordinates) && (
                      <a
                        href={`https://www.google.com/maps?q=${selectedApp.latitude || (selectedApp.coordinates ? selectedApp.coordinates[0] : 26.5204)},${selectedApp.longitude || (selectedApp.coordinates ? selectedApp.coordinates[1] : 93.9782)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-800 hover:text-emerald-950 font-bold ml-0.5"
                        title="View on Google Maps"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Grower Verification</span>
                  <span className="font-mono font-bold text-emerald-800">Verified Producer</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Jamabandi Document</span>
                  <span className="font-mono text-emerald-700 font-semibold truncate block">{selectedApp.jamabandiDoc}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">DBT Bank Account</span>
                  <span className="font-bold text-slate-900">{selectedApp.bankName}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Declared Trees</span>
                  <span className="font-bold text-emerald-800">{selectedApp.estimatedTrees} ({selectedApp.saplingsCount} young / {selectedApp.matureTreesCount} mature)</span>
                </div>
              </div>

              {/* Administrative Document Verification & Direct Sanction Section */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Administrative Document Verification & Direct Sanction
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Direct Admin Sanction Gate
                  </span>
                </div>

                {/* 3 Verification Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Revenue Land Title</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Private homestead patta confirmed against Circle Land Records ({selectedApp.dagNumber}).
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Producer Credentials KYC</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Identity & residency verified. Producer credentials validated against local circle registry.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>DBT Bank Account</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {selectedApp.bankName} mandate active for direct procurement & incentive payments.
                    </p>
                  </div>
                </div>

                {/* Statutory Workflow Sequence Explanation */}
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>Statutory Farmer Onboarding & Subsequent Steps:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-emerald-800 font-medium">
                    <li><b>Direct Admin Sanction</b>: NERAMAC Admin verifies documents and issues official Farmer Identity (FRM ID).</li>
                    <li><b>Plot Registration</b>: Sanctioned farmer registers their plantation parcel/plot in the system.</li>
                    <li><b>Field Agent Ground Visit</b>: Field Agent visits the plot to walk POLOGEN (&lt; 7y saplings) and tag mature trees (≥ 7y).</li>
                    <li><b>Cultivation & Inoculation</b>: Field Agent records scientific cultivation and menu-driven inoculation events.</li>
                  </ol>
                </div>

                {/* If an inspection report exists (optional / post-visit), show it */}
                {selectedApp.inspectionReport && (
                  <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-900">Recorded Field Agent Inspection:</span>
                      <span className="font-mono text-[10px] text-teal-700">SHA: {selectedApp.inspectionReport.photoSha256?.slice(0, 16)}...</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div><b>Inspector:</b> {selectedApp.inspectionReport.inspectorName}</div>
                      <div><b>Lat Mandal:</b> {selectedApp.inspectionReport.latMandalName}</div>
                      <div><b>Mature Trees:</b> {selectedApp.inspectionReport.verifiedMatureTrees}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sanction Approval Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500">
                  Verification Governance: Approval assigns an official FRM ID and creates digital grower cards.
                </div>

                <div className="flex items-center gap-2">
                  {selectedApp.status !== 'APPROVED' ? (
                    <>
                      <button
                        onClick={() => {
                          rejectFarmerApplication(selectedApp.id, 'Discrepancy in revenue Dag title. Boundary re-survey ordered.');
                        }}
                        className="px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition"
                      >
                        Reject Application
                      </button>

                      <button
                        onClick={() => setShowSanctionModal(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Approve Farmer & Issue Official FRM ID</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      {onNavigate && (
                        <>
                          <button
                            onClick={() => onNavigate('/plantation')}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Plot / Plantation for this Farmer</span>
                          </button>
                          <button
                            onClick={() => onNavigate('/field-inspection')}
                            className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Field Inspection (POLOGEN & Trees)</span>
                          </button>
                          <button
                            onClick={() => onNavigate('/traceability')}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Traceability Registry</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
              Select an application from the queue to view verification details.
            </div>
          )}
        </div>
      </div>

      {/* Official Sanction Order Confirmation Modal */}
      {showSanctionModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 text-emerald-900 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="text-base font-black">Official Statutory Sanction Order</h3>
                <p className="text-xs text-slate-500">Govt. of India • Assam Agarwood (Aquilaria malaccensis) Policy 2020</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p>
                You are issuing an official sanction for <span className="font-bold text-slate-900">{selectedApp.farmerName}</span> based on the certified Lat Mandal revenue report and Field Agent forensic photo (SHA-256: <span className="font-mono text-emerald-700 font-semibold">{selectedApp.inspectionReport?.photoSha256.slice(0, 16)}...</span>).
              </p>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200">
                <div className="font-bold text-slate-800">Automated System Provisions on Sanction:</div>
                <ul className="text-slate-600 space-y-1 pl-4 list-disc">
                  <li>Assigns official State Grower ID (<span className="font-mono font-bold text-emerald-800">FRM-AS-XX</span>)</li>
                  <li>Auto-registers plantation parcel (<span className="font-mono text-slate-800">{selectedApp.plantationName}</span>)</li>
                  <li>Creates POLOGEN young sapling grove & geo-pinned mature trees</li>
                  <li>Mints digital QR identity card with secure grower identifier</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Executive Approval Sanction Order Remarks
                </label>
                <textarea
                  rows={2}
                  value={approvalNotes}
                  onChange={e => setApprovalNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSanctionModal(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSanction}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Official Sanction</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
