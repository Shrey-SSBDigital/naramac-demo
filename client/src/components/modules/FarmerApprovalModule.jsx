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
  Sparkles
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
              Maker-Checker Authority Portal
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              /farmers/approvals
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-1">
            NERAMAC & Forest Dept Maker-Checker Approval Portal
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

      {/* Main 2-Column Interface: Left Queue, Right Dossier */}
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
                onClick={() => setFilterStatus('FIELD_INSPECTED_PENDING_APPROVAL')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition ${
                  filterStatus === 'FIELD_INSPECTED_PENDING_APPROVAL'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Inspected ({farmerApplications.filter(a => a.status === 'FIELD_INSPECTED_PENDING_APPROVAL').length})
              </button>
              <button
                onClick={() => setFilterStatus('SUBMITTED_PENDING_INSPECTION')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition ${
                  filterStatus === 'SUBMITTED_PENDING_INSPECTION'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                Submitted ({farmerApplications.filter(a => a.status === 'SUBMITTED_PENDING_INSPECTION').length})
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
              const isInspected = app.status === 'FIELD_INSPECTED_PENDING_APPROVAL';
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
                          ? 'bg-emerald-100 text-emerald-800'
                          : isInspected
                          ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {isApproved ? 'SANCTIONED' : isInspected ? 'READY TO APPROVE' : 'AWAITING INSPECT'}
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

        {/* Right Column: Deep Verification Dossier & Action Sanction Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedApp ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-5">
              {/* Dossier Header */}
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
                  ) : selectedApp.status === 'FIELD_INSPECTED_PENDING_APPROVAL' ? (
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Ready for Executive Sanction</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-700" />
                      <span>Pending Field Agent Visit</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Revenue Title & DPDP Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Revenue Title</span>
                  <span className="font-bold text-slate-800">{selectedApp.dagNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Homestead Area</span>
                  <span className="font-bold text-slate-800">{selectedApp.landAreaAcres} Acres</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">DPDP Masked Aadhaar</span>
                  <span className="font-mono font-bold text-slate-800">{selectedApp.aadhaarMasked}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Jamabandi Document</span>
                  <span className="font-mono text-emerald-700 font-semibold truncate block">{selectedApp.jamabandiDoc}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">DBT Bank Account</span>
                  <span className="font-bold text-slate-800">{selectedApp.bankName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Declared Trees</span>
                  <span className="font-bold text-emerald-800">{selectedApp.estimatedTrees} ({selectedApp.saplingsCount} young / {selectedApp.matureTreesCount} mature)</span>
                </div>
              </div>

              {/* Field Agent & Lat Mandal Inspection Dossier */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Field Agent & Lat Mandal Inspection Verification
                    </h3>
                  </div>
                  {selectedApp.inspectionReport && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ✓ Revenue Boundary Verified
                    </span>
                  )}
                </div>

                {selectedApp.inspectionReport ? (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Field Inspector</span>
                          <span className="font-bold text-slate-800">{selectedApp.inspectionReport.inspectorName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Lat Mandal Officer</span>
                          <span className="font-bold text-slate-800">{selectedApp.inspectionReport.latMandalName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Inspection Date</span>
                          <span className="font-bold text-slate-800">{selectedApp.inspectionReport.inspectionDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Verified Mature Trees</span>
                          <span className="font-bold text-emerald-800">{selectedApp.inspectionReport.verifiedMatureTrees} Trees (≥7y)</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Verified Saplings</span>
                          <span className="font-bold text-teal-800">{selectedApp.inspectionReport.verifiedSaplings} Saplings (&lt;7y)</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">POLOGEN Walk Area</span>
                          <span className="font-bold text-slate-800">{selectedApp.inspectionReport.pologenAreaAcres} Acres</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 pt-1 border-t border-emerald-100">
                        <span className="font-bold text-slate-700">Inspector Remarks:</span> {selectedApp.inspectionReport.fieldRemarks}
                      </div>
                    </div>

                    {/* Stamped Watermarked Inspection Photo Preview with SHA-256 */}
                    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 text-white space-y-2">
                      <div className="p-3 bg-slate-950 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="font-bold text-emerald-400">On-Site Field Watermarked Inspection Asset</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">RTK GPS MSL ±1.1m</span>
                      </div>

                      <div className="px-3 pb-3">
                        <img
                          src={
                            selectedApp.inspectionReport.photoUrl ||
                            generateSyntheticFieldPhoto({
                              kind: 'FARMER_INSPECTION',
                              farmerName: selectedApp.farmerName,
                              farmerId: selectedApp.id,
                              plantationName: selectedApp.plantationName,
                              plantationId: 'PARCEL-01',
                              photoSha256: selectedApp.inspectionReport.photoSha256
                            })
                          }
                          alt="Forensic Field Inspection Watermark"
                          className="w-full h-56 object-cover rounded-lg border border-slate-700 shadow-inner"
                        />

                        {/* Cryptographic SHA-256 Digest Bar */}
                        <div className="mt-2.5 p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between gap-2 text-xs">
                          <div className="truncate font-mono text-[11px] text-emerald-300">
                            <span className="text-slate-400">SHA-256: </span>
                            {selectedApp.inspectionReport.photoSha256}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopySha(selectedApp.inspectionReport.photoSha256)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold flex items-center gap-1 flex-shrink-0 transition"
                          >
                            {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedHash ? 'COPIED' : 'COPY'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-900">Field Inspection Required Prior to Sanction</span>
                        <p className="text-amber-800 text-[11px] mt-0.5">
                          Under Assam Agarwood Policy 2020, homestead plantations must undergo an on-ground Lat Mandal verification and Field Agent POLOGEN boundary walk before official FRM ID issuance.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSimulateFieldInspection(selectedApp.id)}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Simulate Field Agent Inspection & SHA-256 Photo Attachment</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Sanction Maker-Checker Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500">
                  Maker-Checker Governance: Sanction assigns an official FRM ID and creates digital grower cards.
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
                        disabled={!selectedApp.inspectionReport}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Sanction & Issue Digital FRM ID</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onNavigate('/traceability')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <QrCode className="w-4 h-4 text-emerald-300" />
                      <span>View in Traceability Registry</span>
                    </button>
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
                  <li>Mints digital QR identity card with DPDP Act masked token</li>
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
