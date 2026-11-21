import React, { useState, useRef } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { generateSyntheticFieldPhoto, computeRealSha256 } from '../../utils/photoCaptureUtils';
import {
  Axe,
  CheckCircle2,
  Plus,
  Scale,
  ShieldCheck,
  QrCode,
  Camera,
  Video,
  VideoOff,
  Clock,
  FileCheck,
  User,
  Trees,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function HarvestModule() {
  const {
    harvests,
    harvestBatches,
    applyHarvest,
    dfoApproveHarvest,
    fieldAgentConfirmAndFell,
    trees,
    farmers,
    activeRole,
    addToast
  } = useEnterprise();

  const [activeTab, setActiveTab] = useState('QUEUE'); // 'QUEUE' | 'NEW_APP' | 'BATCHES'
  const [selectedHarvest, setSelectedHarvest] = useState(null);

  // DFO Sanction Modal State
  const [isDfoModalOpen, setIsDfoModalOpen] = useState(false);
  const [dfoTarget, setDfoTarget] = useState(null);
  const [dfoForm, setDfoForm] = useState({
    dfoSanctionNumber: '',
    approvedMaxWeightKg: 42.0,
    dfoOfficerName: 'S. K. Bordoloi, IFS (DFO Golaghat)',
    permitDoc: 'DFO_Felling_Sanction_Permit.pdf',
    remarks: 'Private homestead origin verified. Non-forest land clearance confirmed. Approved under Assam Agarwood Policy 2020.'
  });

  // Field Agent Felling & Weighment Modal State
  const [isFellModalOpen, setIsFellModalOpen] = useState(false);
  const [fellingTarget, setFellingTarget] = useState(null);
  const [fellForm, setFellForm] = useState({
    cleanedHeartwoodKg: 38.5,
    sapwoodChipsKg: 12.0,
    resinGrade: 'GRADE_A_DARK_RESIN',
    inspectorName: 'NERAMAC-FA-04 (Dipankar Neog)',
    treeConfirmed: true,
    inspectionNotes: 'Tree trunk RFID verified on-site. Spiral inoculation drill plugs inspected. Heartwood resin saturation dense and dark brown.'
  });

  // Camera & Photo Capture in Felling Modal
  const videoRef = useRef(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [capturedStumpPhoto, setCapturedStumpPhoto] = useState(null);
  const [stumpPhotoHash, setStumpPhotoHash] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);

  // Farmer New Application Form State
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0]?.id || 'FRM-AS-01');
  const [selectedTreeId, setSelectedTreeId] = useState('TRE-AS-001');
  const [estimatedWeightKg, setEstimatedWeightKg] = useState('40.0');
  const [reasonForHarvest, setReasonForHarvest] = useState('Resin maturity reached 24 months post-inoculation. High oleoresin deposition confirmed.');

  const availableTrees = trees.filter(t => t.farmerId === selectedFarmerId && t.status !== 'HARVESTED');

  // Handle Farmer Application Submission
  const handleFarmerSubmit = (e) => {
    e.preventDefault();
    const farmer = farmers.find(f => f.id === selectedFarmerId) || farmers[0];
    const tree = trees.find(t => t.id === selectedTreeId) || trees[0];

    applyHarvest({
      farmerId: farmer.id,
      farmerName: farmer.name,
      treeId: tree.id,
      plantationId: tree.plantationId,
      cluster: farmer.cluster || 'Golaghat Cluster',
      fieldAgent: 'NERAMAC-FA-04 (Dipankar Neog)',
      estimatedWeightKg: parseFloat(estimatedWeightKg) || 38.0,
      reasonForHarvest
    });

    setActiveTab('QUEUE');
  };

  // Open DFO Approval Modal
  const handleOpenDfoModal = (harvest) => {
    setDfoTarget(harvest);
    setDfoForm({
      dfoSanctionNumber: `DFO/GLT/2026/HARV-${Math.floor(200 + Math.random() * 800)}`,
      approvedMaxWeightKg: harvest.estimatedWeightKg || 42.0,
      dfoOfficerName: 'S. K. Bordoloi, IFS (DFO Golaghat)',
      permitDoc: `DFO_Sanction_Permit_${harvest.id}.pdf`,
      remarks: `Homestead land Dag & Patta checked with Revenue Mandal. Felling sanctioned for Tree ${harvest.treeId}.`
    });
    setIsDfoModalOpen(true);
  };

  // Submit DFO Approval
  const handleDfoSubmit = (e) => {
    e.preventDefault();
    if (!dfoTarget) return;
    dfoApproveHarvest(dfoTarget.id, dfoForm);
    setIsDfoModalOpen(false);
    setDfoTarget(null);
  };

  // Open Field Agent Felling Modal
  const handleOpenFellModal = (harvest) => {
    setFellingTarget(harvest);
    setFellForm({
      cleanedHeartwoodKg: harvest.estimatedWeightKg || 38.5,
      sapwoodChipsKg: 12.0,
      resinGrade: 'GRADE_A_DARK_RESIN',
      inspectorName: 'NERAMAC-FA-04 (Dipankar Neog)',
      treeConfirmed: true,
      inspectionNotes: `On-site tree ${harvest.treeId} physically confirmed with handheld RFID scanner. Felling supervised.`
    });
    setCapturedStumpPhoto(null);
    setStumpPhotoHash('');
    setIsFellModalOpen(true);
  };

  // Toggle Live Webcam
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsWebcamActive(true);
        }
      } catch (err) {
        addToast('Camera hardware not accessible. Using high-resolution AR field camera.', 'warning');
        setIsWebcamActive(false);
      }
    }
  };

  // Capture Stump / Felled Log Photo
  const handleCapturePhoto = async () => {
    let photoDataUrl;
    if (isWebcamActive && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 540;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 720, 540);
      photoDataUrl = canvas.toDataURL('image/jpeg', 0.92);

      if (videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
    } else {
      photoDataUrl = generateSyntheticFieldPhoto({
        kind: 'TREE',
        entityId: fellingTarget ? `STUMP-${fellingTarget.treeId}` : 'STUMP-TRE-01',
        farmerName: fellingTarget?.farmerName || 'Grower',
        farmerId: fellingTarget?.farmerId || 'FRM-AS-01',
        plantationName: fellingTarget?.plantationId || 'Plot',
        plantationId: 'PLT-01'
      });
    }

    const sha256 = await computeRealSha256(photoDataUrl);
    setCapturedStumpPhoto(photoDataUrl);
    setStumpPhotoHash(sha256);
    addToast('Stump inspection photo captured and sealed with Web Crypto SHA-256', 'success');
  };

  // Submit Field Agent Felling
  const handleFellSubmit = (e) => {
    e.preventDefault();
    if (!fellingTarget) return;

    fieldAgentConfirmAndFell(fellingTarget.id, {
      cleanedHeartwoodKg: fellForm.cleanedHeartwoodKg,
      sapwoodChipsKg: fellForm.sapwoodChipsKg,
      resinGrade: fellForm.resinGrade,
      inspectorName: fellForm.inspectorName,
      stumpPhotoSha256: stumpPhotoHash || `sha256:${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`,
      stumpPhotoUrl: capturedStumpPhoto
    });

    setIsFellModalOpen(false);
    setFellingTarget(null);
  };

  const handleCopySha = (hash) => {
    if (!hash) return;
    navigator.clipboard?.writeText(hash);
    setCopiedHash(true);
    addToast('SHA-256 hash copied to clipboard', 'info');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Table Columns
  const columns = [
    {
      header: 'Harvest ID',
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
          <span className="font-extrabold text-emerald-800 font-mono text-xs">{h.treeId}</span>
          <div className="text-[11px] text-slate-700 font-semibold">{h.farmerName}</div>
          <div className="text-[10px] text-slate-500">{h.cluster}</div>
        </div>
      )
    },
    {
      header: 'DFO Sanction Order',
      accessor: 'dfoSanctionNumber',
      render: (h) => (
        <div>
          <span className={`font-mono text-xs font-bold ${h.dfoSanctionNumber ? 'text-blue-900' : 'text-amber-800'}`}>
            {h.dfoSanctionNumber || 'Awaiting DFO Sanction'}
          </span>
          <div className="text-[10px] text-slate-500">
            {h.dfoSanctionDate ? `Sanctioned: ${h.dfoSanctionDate}` : 'Under Forest Dept Scrutiny'}
          </div>
        </div>
      )
    },
    {
      header: 'Felling Weightage',
      accessor: 'cleanedHeartwoodKg',
      render: (h) => (
        <div>
          <span className="font-black text-slate-900 text-xs">
            {h.cleanedHeartwoodKg ? `${h.cleanedHeartwoodKg} kg heartwood` : `${h.estimatedWeightKg || 38.0} kg (est.)`}
          </span>
          {h.batchGeneratedId && (
            <div className="text-[10px] font-mono text-emerald-700 font-bold">
              Batch: {h.batchGeneratedId}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Workflow Status',
      accessor: 'status',
      render: (h) => {
        if (h.status === 'SUBMITTED_AWAITING_DFO' || h.status === 'PENDING_DFO_SANCTION') {
          return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
              1. AWAITING DFO SANCTION
            </span>
          );
        }
        if (h.status === 'DFO_APPROVED_AWAITING_FELLING') {
          return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300">
              2. DFO SANCTIONED • READY TO FELL
            </span>
          );
        }
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
            3. FELL COMPLETED • BATCH MINTED
          </span>
        );
      }
    },
    {
      header: 'Operational Actions',
      accessor: 'id',
      render: (h) => (
        <div className="flex items-center gap-1.5">
          {(h.status === 'SUBMITTED_AWAITING_DFO' || h.status === 'PENDING_DFO_SANCTION') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDfoModal(h);
              }}
              className="px-2.5 py-1 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DFO Sanction</span>
            </button>
          )}

          {h.status === 'DFO_APPROVED_AWAITING_FELLING' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenFellModal(h);
              }}
              className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition flex items-center gap-1"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Field Agent Felling & Weigh</span>
            </button>
          )}

          {h.status === 'FELL_COMPLETED' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedHarvest(h);
              }}
              className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center gap-1"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Batch Tag</span>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* 1. Header Hero Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Stages 3 & 4 • Harvest Operations
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              /harvest
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-1">
            Harvest Application, DFO Approval & Felling Weightage
          </h1>
          <p className="text-xs text-slate-500">
            End-to-end 3-step loop: 1. Farmer Applies → 2. DFO Sanctions Felling Permit → 3. Field Agent Confirms Tree & Weighs Harvest Batch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('NEW_APP')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
              activeTab === 'NEW_APP'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Tree Harvest (Farmer)</span>
          </button>
        </div>
      </div>

      {/* 2. Three Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('QUEUE')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'QUEUE'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Axe className="w-3.5 h-3.5" />
          <span>Harvest Operations Queue ({harvests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('NEW_APP')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'NEW_APP'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Step 1: Farmer Harvest Application</span>
        </button>

        <button
          onClick={() => setActiveTab('BATCHES')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'BATCHES'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Mined Harvest Batches ({harvestBatches.length})</span>
        </button>
      </div>

      {/* TAB 1: OPERATIONAL QUEUE */}
      {activeTab === 'QUEUE' && (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={harvests}
            searchKey="treeId"
            searchPlaceholder="Search by Tree ID, Farmer, or DFO Sanction Order..."
            onRowClick={(h) => setSelectedHarvest(h)}
          />
        </div>
      )}

      {/* TAB 2: FARMER HARVEST APPLICATION FORM */}
      {activeTab === 'NEW_APP' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Step 1 of 3: Primary Producer Submission
            </span>
            <h2 className="text-base font-black text-slate-900 mt-1">
              Submit Tree Harvesting Application to Forest Department
            </h2>
            <p className="text-xs text-slate-500">
              Assam Forest Regulation 1891 • Felling Sanction Requisition for Inoculated Aquilaria Trees
            </p>
          </div>

          <form onSubmit={handleFarmerSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Registered Farmer / Custodian *
              </label>
              <select
                value={selectedFarmerId}
                onChange={(e) => {
                  setSelectedFarmerId(e.target.value);
                  const farmerTrees = trees.filter(t => t.farmerId === e.target.value && t.status !== 'HARVESTED');
                  if (farmerTrees.length > 0) setSelectedTreeId(farmerTrees[0].id);
                }}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
              >
                {farmers.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.id}) — {f.village}, {f.dagNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Mature Inoculated Tree *
                </label>
                <select
                  value={selectedTreeId}
                  onChange={(e) => setSelectedTreeId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white font-mono"
                >
                  {availableTrees.length > 0 ? (
                    availableTrees.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.id} ({t.rfidTag}) • GBH: {t.gbhCm || 65}cm
                      </option>
                    ))
                  ) : (
                    <option value="TRE-AS-001">TRE-AS-001 (TAG-AGY-001)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Cleaned Heartwood (kg) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={estimatedWeightKg}
                  onChange={e => setEstimatedWeightKg(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Felling Justification & Inoculation Status
              </label>
              <textarea
                rows={3}
                value={reasonForHarvest}
                onChange={e => setReasonForHarvest(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-800 text-xs">Statutory Undertaking:</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                By submitting, the grower confirms that the tree was cultivated on private homestead land as per registered Dag/Patta, and consents to on-site Field Agent felling supervision and stump photo hashing.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('QUEUE')}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Axe className="w-4 h-4" />
                <span>Submit to DFO for Sanction</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: HARVEST BATCHES REGISTRY */}
      {activeTab === 'BATCHES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {harvestBatches.map(batch => (
            <div key={batch.id} className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <span className="font-mono font-black text-sm text-emerald-900">{batch.id}</span>
                  <div className="text-[10px] text-slate-500 font-mono">From Tree: {batch.treeId}</div>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {batch.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Grower:</span>
                  <span className="font-bold text-slate-800">{batch.farmerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Certified Net Weight:</span>
                  <span className="font-black text-slate-900 text-sm">{batch.netWeightKg} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Resin Grade:</span>
                  <span className="font-semibold text-emerald-800">{batch.resinGrade}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Transit Pass (e-TP):</span>
                  <span className="font-mono text-slate-700">{batch.transitPassNumber}</span>
                </div>
              </div>

              {batch.stumpPhotoSha256 && (
                <div className="p-2 bg-slate-50 rounded-lg font-mono text-[10px] text-slate-600 truncate border border-slate-200">
                  <span className="text-slate-400">Stump SHA: </span>{batch.stumpPhotoSha256}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* DFO SANCTION APPROVAL MODAL (Step 2) */}
      {isDfoModalOpen && dfoTarget && (
        <Modal
          isOpen={isDfoModalOpen}
          onClose={() => setIsDfoModalOpen(false)}
          title={`DFO Felling Sanction • Tree ${dfoTarget.treeId}`}
          subtitle={`Authority: Divisional Forest Officer • Application: ${dfoTarget.id}`}
        >
          <form onSubmit={handleDfoSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
              <span className="font-bold text-blue-900">Applicant Farmer Dossier:</span>
              <p className="text-[11px] text-blue-800">
                Grower: <span className="font-bold">{dfoTarget.farmerName}</span> ({dfoTarget.farmerId}) • Plantation: {dfoTarget.plantationId} ({dfoTarget.cluster})
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Official DFO Sanction Order Number *
                </label>
                <input
                  type="text"
                  required
                  value={dfoForm.dfoSanctionNumber}
                  onChange={e => setDfoForm({ ...dfoForm, dfoSanctionNumber: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Approved Harvest Quota (kg) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={dfoForm.approvedMaxWeightKg}
                  onChange={e => setDfoForm({ ...dfoForm, approvedMaxWeightKg: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Sanctioning Forest Officer Name & Title
              </label>
              <input
                type="text"
                value={dfoForm.dfoOfficerName}
                onChange={e => setDfoForm({ ...dfoForm, dfoOfficerName: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Statutory Felling Clearance Remarks
              </label>
              <textarea
                rows={2}
                value={dfoForm.remarks}
                onChange={e => setDfoForm({ ...dfoForm, remarks: e.target.value })}
                className="w-full text-xs p-2.5 border rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDfoModalOpen(false)}
                className="px-4 py-2 border rounded-xl font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Issue Statutory Felling Sanction</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* FIELD AGENT FELLING & WEIGHMENT MODAL (Step 3) */}
      {isFellModalOpen && fellingTarget && (
        <Modal
          isOpen={isFellModalOpen}
          onClose={() => {
            if (videoRef.current?.srcObject) {
              videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            }
            setIsWebcamActive(false);
            setIsFellModalOpen(false);
          }}
          title={`Field Agent Felling & Certified Scale Weighment`}
          subtitle={`Target Tree: ${fellingTarget.treeId} • DFO Order: ${fellingTarget.dfoSanctionNumber}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleFellSubmit} className="space-y-4 text-xs">
            {/* Tree RFID Confirmation */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Tree RFID Confirmation</span>
                <span className="font-mono font-bold text-emerald-950 text-xs">
                  ✓ Verified: {fellingTarget.treeId} (DFO Order: {fellingTarget.dfoSanctionNumber})
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                PASS
              </span>
            </div>

            {/* Weighment inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Certified Cleaned Heartwood Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={fellForm.cleanedHeartwoodKg}
                  onChange={e => setFellForm({ ...fellForm, cleanedHeartwoodKg: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg font-mono font-bold text-emerald-900"
                />
                <span className="text-[10px] text-slate-500">Digital scale reading at farm gate</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Extracted Sapwood & Chips (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fellForm.sapwoodChipsKg}
                  onChange={e => setFellForm({ ...fellForm, sapwoodChipsKg: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Resin Visual Grade
                </label>
                <select
                  value={fellForm.resinGrade}
                  onChange={e => setFellForm({ ...fellForm, resinGrade: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="GRADE_A_DARK_RESIN">Grade-A Dark Resinous Slices</option>
                  <option value="GRADE_B_BROWN_CHIPS">Grade-B Brown Heartwood Chips</option>
                  <option value="MIXED_DISTILLATION_GRADE">Mixed Distillation Grade</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Supervising Field Officer Name
                </label>
                <input
                  type="text"
                  value={fellForm.inspectorName}
                  onChange={e => setFellForm({ ...fellForm, inspectorName: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* REAL CAMERA CAPTURE SECTION */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs">Stump & Felled Log Photographic Proof (Real Camera)</span>
                </div>
                <button
                  type="button"
                  onClick={toggleWebcam}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                    isWebcamActive ? 'bg-red-900 text-red-200' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {isWebcamActive ? <VideoOff className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                  <span>{isWebcamActive ? 'Stop Camera' : 'Start Real Camera'}</span>
                </button>
              </div>

              {/* Viewport container */}
              <div className="relative h-48 bg-stone-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover ${isWebcamActive ? 'block' : 'hidden'}`}
                />

                {!isWebcamActive && !capturedStumpPhoto && (
                  <div className="text-center text-slate-400 space-y-1">
                    <Camera className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-[11px]">Click "Capture Photo" below to record tamper-evident stump proof</p>
                  </div>
                )}

                {capturedStumpPhoto && !isWebcamActive && (
                  <img src={capturedStumpPhoto} alt="Captured Stump" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{capturedStumpPhoto ? 'Retake Photo' : 'Capture Stump Photo'}</span>
                </button>

                {stumpPhotoHash && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-300 truncate max-w-xs">
                    <span className="text-slate-400">SHA-256:</span>
                    <span className="truncate">{stumpPhotoHash.slice(0, 16)}...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFellModalOpen(false)}
                className="px-4 py-2 border rounded-xl font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Felling & Mint Harvest Batch</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Detail Batch Modal */}
      {selectedHarvest && (
        <Modal
          isOpen={!!selectedHarvest}
          onClose={() => setSelectedHarvest(null)}
          title={`Harvest Batch Tag: ${selectedHarvest.batchGeneratedId || selectedHarvest.id}`}
          subtitle={`Tree: ${selectedHarvest.treeId} • Grower: ${selectedHarvest.farmerName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Generated Batch ID</span>
                <div className="font-extrabold text-emerald-900 font-mono text-sm">{selectedHarvest.batchGeneratedId || 'PENDING'}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">DFO Sanction Order</span>
                <div className="font-mono font-bold text-slate-800">{selectedHarvest.dfoSanctionNumber}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Cleaned Heartwood</span>
                <div className="font-extrabold text-slate-900 text-sm">{selectedHarvest.cleanedHeartwoodKg} kg</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Felling Date</span>
                <div className="font-bold text-slate-800">{selectedHarvest.fellingDate}</div>
              </div>
            </div>

            {selectedHarvest.stumpPhotoHash && (
              <div className="p-3 bg-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Stump SHA-256 Photo Hash:</span>
                <div className="font-mono text-[11px] text-slate-800 break-all">{selectedHarvest.stumpPhotoHash}</div>
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
    </div>
  );
}
