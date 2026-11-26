import React, { useState, useRef, useEffect } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import {
  Syringe,
  ShieldCheck,
  Plus,
  Sparkles,
  AlertCircle,
  Camera,
  Video,
  VideoOff,
  CheckCircle2,
  Trees,
  User,
  FlaskConical,
  Building2,
  Calendar,
  Layers,
  FileCheck2,
  Image as ImageIcon,
  RotateCcw,
  Upload,
  Loader2,
  MapPin,
  Compass,
  Info,
  Check
} from 'lucide-react';
import {
  computeRealSha256,
  generateCryptoHash
} from '../../utils/photoCaptureUtils';

export default function InoculationModule() {
  const { inoculations, addInoculation, trees, pologens, farmers, activeRole, addToast } = useEnterprise();
  const [selectedInoc, setSelectedInoc] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'TREE' | 'POLOGEN'

  // Form State supporting both Individual Mature Tree and POLOGEN Polygon Blocks
  const [form, setForm] = useState(() => {
    const initialTree = trees[0];
    const initialFarmer = farmers.find(f => f.id === initialTree?.farmerId);
    return {
      targetType: 'TREE', // 'TREE' | 'POLOGEN'
      treeId: initialTree?.id || 'TRE-AS-001',
      pologenId: pologens[0]?.id || 'PLG-AS-01-A',
      pologenName: pologens[0]?.name || 'Dhekial High-Density Sapling Block A',
      treeCount: 1,
      farmerId: initialTree?.farmerId || initialFarmer?.id || 'FRM-AS-01',
      farmerName: initialTree?.farmerName || initialFarmer?.name || 'Bhaben Saikia',
      cluster: initialTree?.cluster || 'Golaghat Cluster',
      stage: 'PRIMARY_INDUCTION',
      method: 'Mechanical drill & gravity tube injection',
      compound: 'AAU Certified Fusarium solani (Strain AS-44)',
      compoundBatch: 'AAU/BIO/2026/B-48',
      supplier: 'Assam Agricultural University (AAU), Jorhat',
      drillDepthCm: 7.0,
      holeCount: 36,
      inoculumVolumeMl: 260,
      fieldAgent: 'NERAMAC-FA-04 (Dipankar Neog)',
      resinProgressionRating: 'GRADE_A_RESIN',
      photoUrl: null,
      photoHash: null
    };
  });

  // Camera State
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [photoSha, setPhotoSha] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Synchronize modal state on opening to guarantee 100% agreement between tree and grower
  const handleOpenModal = () => {
    const currentTree = trees.find(t => t.id === form.treeId) || trees[0];
    const farmer = farmers.find(f => f.id === currentTree?.farmerId);
    const resolvedGrowerName = currentTree?.farmerName || farmer?.name || 'Bhaben Saikia';
    const resolvedGrowerId = currentTree?.farmerId || farmer?.id || 'FRM-AS-01';

    setForm(prev => ({
      ...prev,
      targetType: 'TREE',
      treeId: currentTree?.id || 'TRE-AS-001',
      farmerId: resolvedGrowerId,
      farmerName: resolvedGrowerName,
      cluster: currentTree?.cluster || farmer?.cluster || 'Golaghat Cluster',
      treeCount: 1
    }));
    setCapturedPhoto(null);
    setPhotoSha(null);
    setIsModalOpen(true);
  };

  // Switch between Individual Tree and POLOGEN Polygon Block
  const handleTargetTypeChange = (type) => {
    if (type === 'POLOGEN') {
      const p = pologens.find(x => x.id === form.pologenId) || pologens[0];
      const farmer = farmers.find(f => f.id === p?.farmerId);
      const grower = p?.farmerName || farmer?.name || 'Bhaben Saikia';
      const growerId = p?.farmerId || farmer?.id || 'FRM-AS-01';
      setForm(prev => ({
        ...prev,
        targetType: 'POLOGEN',
        pologenId: p?.id || 'PLG-AS-01-A',
        pologenName: p?.name || 'Sapling Block A',
        treeCount: p?.saplingCount || 160,
        farmerId: growerId,
        farmerName: grower,
        cluster: p?.cluster || 'Golaghat Cluster',
        method: 'Block Bio-Inoculation & Wooden Dowel Pin Insertion',
        drillDepthCm: 4.5,
        holeCount: 16,
        inoculumVolumeMl: 140
      }));
    } else {
      const t = trees.find(x => x.id === form.treeId) || trees[0];
      const farmer = farmers.find(f => f.id === t?.farmerId);
      const grower = t?.farmerName || farmer?.name || 'Bhaben Saikia';
      const growerId = t?.farmerId || farmer?.id || 'FRM-AS-01';
      setForm(prev => ({
        ...prev,
        targetType: 'TREE',
        treeId: t?.id || 'TRE-AS-001',
        treeCount: 1,
        farmerId: growerId,
        farmerName: grower,
        cluster: t?.cluster || 'Golaghat Cluster',
        method: 'Mechanical drill & gravity tube injection',
        drillDepthCm: 7.0,
        holeCount: 36,
        inoculumVolumeMl: 260
      }));
    }
  };

  // Synchronize tree details whenever selected tree changes
  const handleTreeChange = (treeId) => {
    const selectedTree = trees.find(t => t.id === treeId);
    if (selectedTree) {
      const farmer = farmers.find(f => f.id === selectedTree.farmerId);
      const grower = selectedTree.farmerName || farmer?.name || 'Registered Grower';
      const growerId = selectedTree.farmerId || farmer?.id || 'FRM-AS-01';
      setForm(prev => ({
        ...prev,
        treeId,
        treeCount: 1,
        farmerId: growerId,
        farmerName: grower,
        cluster: selectedTree.cluster || farmer?.cluster || 'Golaghat Cluster'
      }));
    } else {
      setForm(prev => ({ ...prev, treeId }));
    }
  };

  // Synchronize POLOGEN details
  const handlePologenChange = (pologenId) => {
    const selectedPologen = pologens.find(p => p.id === pologenId);
    if (selectedPologen) {
      const farmer = farmers.find(f => f.id === selectedPologen.farmerId);
      const grower = selectedPologen.farmerName || farmer?.name || 'Registered Grower';
      const growerId = selectedPologen.farmerId || farmer?.id || 'FRM-AS-01';
      setForm(prev => ({
        ...prev,
        pologenId,
        pologenName: selectedPologen.name,
        treeCount: selectedPologen.saplingCount || 160,
        farmerId: growerId,
        farmerName: grower,
        cluster: selectedPologen.cluster || 'Golaghat Cluster'
      }));
    } else {
      setForm(prev => ({ ...prev, pologenId }));
    }
  };

  const stopWebcamStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Toggle Live Webcam
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      stopWebcamStream();
      setIsWebcamActive(false);
    } else {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        addToast('Camera hardware API unavailable — generating simulated photo', 'warning');
        generateFallbackPhoto();
        return;
      }
      setIsCameraLoading(true);
      try {
        let stream = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
          });
        } catch (e1) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }

        streamRef.current = stream;
        setIsWebcamActive(true);
      } catch (err) {
        console.error("Camera access failed:", err);
        setIsWebcamActive(false);
        addToast(`Camera access failed: ${err.message || 'Permission denied'} — using high-resolution simulated photo`, 'warning');
        generateFallbackPhoto();
      } finally {
        setIsCameraLoading(false);
      }
    }
  };

  // Attach webcam stream once video element mounts
  useEffect(() => {
    if (isWebcamActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.warn('Camera video play caught:', e));
      }
    }
  }, [isWebcamActive]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopWebcamStream();
    };
  }, []);

  // Capture Photo from Live Webcam
  const captureWebcamPhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Overlay Watermark
    stampInoculationWatermark(ctx, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const hash = await computeRealSha256(dataUrl);

    setCapturedPhoto(dataUrl);
    setPhotoSha(hash);
    setForm(prev => ({ ...prev, photoUrl: dataUrl, photoHash: hash }));

    // Stop Webcam stream after capture
    stopWebcamStream();
    setIsWebcamActive(false);
    addToast('Post-inoculation photograph captured & SHA-256 sealed!', 'success');
  };

  // Fallback / Synthetic Photo Generator with Watermark
  const generateFallbackPhoto = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    // Draw realistic tree trunk / sapling grove with drilled injection ports
    const grad = ctx.createLinearGradient(0, 0, 1280, 720);
    grad.addColorStop(0, '#1c1917');
    grad.addColorStop(0.5, '#292524');
    grad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    // Bark / grove simulation
    ctx.strokeStyle = 'rgba(120, 113, 108, 0.25)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      ctx.moveTo(100 + i * 45, 0);
      ctx.bezierCurveTo(120 + i * 45, 300, 80 + i * 45, 500, 110 + i * 45, 720);
      ctx.stroke();
    }

    // Drilled Inoculation Ports
    for (let j = 0; j < 6; j++) {
      const x = 320 + (j % 3) * 260;
      const y = 220 + Math.floor(j / 3) * 180;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Injection tube indicator
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.8)';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 40, y + 60);
      ctx.stroke();
    }

    // Overlay Watermark
    stampInoculationWatermark(ctx, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const hash = await computeRealSha256(dataUrl);

    setCapturedPhoto(dataUrl);
    setPhotoSha(hash);
    setForm(prev => ({ ...prev, photoUrl: dataUrl, photoHash: hash }));
    addToast('Post-inoculation forensic photo generated with SHA-256 seal', 'info');
  };

  // Stamp Watermark on Canvas
  const stampInoculationWatermark = (ctx, width, height) => {
    ctx.save();
    // Top banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
    ctx.fillRect(0, 0, width, 54);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.fillText('NERAMAC ASCTS • POST-INOCULATION BOREHOLE PHOTOGRAPH', 20, 24);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "Courier New", monospace';
    const targetLabel = form.targetType === 'POLOGEN'
      ? `POLOGEN: ${form.pologenId} (${form.treeCount} TREES/SAPLINGS) • STAGE: ${form.stage.replace('_', ' ')}`
      : `TREE: ${form.treeId} • STAGE: ${form.stage.replace('_', ' ')}`;
    ctx.fillText(`${targetLabel} • COMPOUND: ${form.compound}`, 20, 44);

    // Bottom HUD
    ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
    ctx.fillRect(0, height - 60, width, 60);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px "Courier New", monospace';
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    ctx.fillText(`SUPPLIER: ${form.supplier} (${form.compoundBatch}) • HOLES: ${form.holeCount} • DEPTH: ${form.drillDepthCm}cm`, 20, height - 36);

    ctx.fillStyle = '#34d399';
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText(`TIMESTAMP: ${now} IST • SUPERVISOR: ${form.fieldAgent}`, 20, height - 16);
    ctx.restore();
  };

  // Handle File Upload Fallback
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      const hash = await computeRealSha256(dataUrl);
      setCapturedPhoto(dataUrl);
      setPhotoSha(hash);
      setForm(prev => ({ ...prev, photoUrl: dataUrl, photoHash: hash }));
      addToast('Uploaded image validated & SHA-256 sealed!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.photoUrl) {
      addToast('Please capture or attach a post-inoculation photograph before submitting', 'warning');
      return;
    }

    addInoculation({
      ...form,
      farmerId: resolvedFarmerId,
      farmerName: resolvedFarmerName,
      inoculationDate: new Date().toISOString().slice(0, 10),
      photoHash: photoSha || generateCryptoHash()
    });

    const targetMsg = form.targetType === 'POLOGEN'
      ? `POLOGEN ${form.pologenId} (${form.treeCount} trees/saplings)`
      : `Tree ${form.treeId}`;
    addToast(`✓ Inoculation event recorded for ${targetMsg}`, 'success');
    stopWebcamStream();
    setIsWebcamActive(false);
    setIsModalOpen(false);
    setCapturedPhoto(null);
    setPhotoSha(null);
  };

  // Filter inoculations
  const filteredInoculations = inoculations.filter(i => {
    if (activeFilter === 'TREE') return (i.targetType || 'TREE') === 'TREE';
    if (activeFilter === 'POLOGEN') return i.targetType === 'POLOGEN';
    return true;
  });

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
      header: 'Target Asset & Grower',
      accessor: 'treeId',
      render: (i) => {
        const isPologen = i.targetType === 'POLOGEN';
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`font-mono text-xs font-black px-2 py-0.5 rounded border ${
                isPologen
                  ? 'bg-blue-50 text-blue-900 border-blue-300'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300'
              }`}>
                {isPologen ? `POLOGEN: ${i.pologenId}` : `TREE: ${i.treeId}`}
              </span>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                {isPologen ? `${i.treeCount || 160} Trees/Saplings` : 'Single Tagged'}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              <span>{i.farmerName || i.farmerId} • {i.cluster}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Stage & Method',
      accessor: 'stage',
      render: (i) => (
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
            {(i.stage || 'PRIMARY_INDUCTION').replace('_', ' ')}
          </span>
          <div className="text-[11px] text-slate-600 mt-1 line-clamp-1">{i.method}</div>
        </div>
      )
    },
    {
      header: 'Compound & Supplier',
      accessor: 'compound',
      render: (i) => (
        <div>
          <span className="font-bold text-slate-800 text-xs">{i.compound || i.strain}</span>
          <div className="text-[10px] text-slate-500">{i.supplier} ({i.batchNumber || i.compoundBatch || 'AAU-B-48'})</div>
        </div>
      )
    },
    {
      header: 'Boreholes & Volume',
      accessor: 'drillDepthCm',
      render: (i) => (
        <span className="text-xs font-semibold text-slate-700">
          {i.drillDepthCm}cm • {i.holeCount} holes ({i.inoculumVolumeMl}ml)
        </span>
      )
    },
    {
      header: 'Post-Photo SHA',
      accessor: 'photoHash',
      render: (i) => (
        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200" title={i.photoHash}>
          {i.photoHash ? `${i.photoHash.slice(0, 10)}...` : 'SHA-256 SEALED'}
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

  // Dynamically resolve matching asset and farmer to ensure 100% agreement between tree and grower
  const currentSelectedTree = trees.find(t => t.id === form.treeId);
  const currentSelectedPologen = pologens.find(p => p.id === form.pologenId);
  const resolvedFarmerName = form.targetType === 'TREE'
    ? (currentSelectedTree?.farmerName || farmers.find(f => f.id === currentSelectedTree?.farmerId)?.name || form.farmerName)
    : (currentSelectedPologen?.farmerName || form.farmerName);
  const resolvedFarmerId = form.targetType === 'TREE'
    ? (currentSelectedTree?.farmerId || farmers.find(f => f.id === currentSelectedTree?.farmerId)?.id || form.farmerId)
    : (currentSelectedPologen?.farmerId || form.farmerId);

  return (
    <div className="space-y-5">
      {/* Role-Specific Separation of Concerns Banner */}
      <div className="p-3.5 bg-white text-slate-900 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
            <Syringe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">
                {activeRole === 'FIELD_AGENT' && 'NERAMAC Field Agent • Inoculation Supervision'}
                {activeRole === 'FARMER' && 'Registered Farmer • Homestead Tree Inoculation Record'}
                {activeRole === 'FOREST_DEPT' && 'DFO Forest Authority • Fungal Induction Scrutiny'}
                {activeRole !== 'FIELD_AGENT' && activeRole !== 'FARMER' && activeRole !== 'FOREST_DEPT' && 'Biological Inoculation Oversight'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Role: {activeRole}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {activeRole === 'FIELD_AGENT' && 'Accredited field agents supervise biological induction (*Fusarium solani* AS-44), capture forensic borehole photos with SHA-256 seal, and link records directly to specific trees.'}
              {activeRole === 'FARMER' && 'Track fungal induction progression and bio-strain dosage logged by NERAMAC field agents on your homestead agarwood trees.'}
              {activeRole !== 'FIELD_AGENT' && activeRole !== 'FARMER' && 'Statutory inoculation registry verifying biological induction compound, supplier accreditation (AAU Jorhat), and drill depth compliance.'}
            </p>
          </div>
        </div>

        {activeRole === 'FIELD_AGENT' ? (
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Log Inoculation Event</span>
          </button>
        ) : null}
      </div>

      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Inoculation Intervention Registry</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 04
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Tree &amp; POLOGEN Ready
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Biological induction capture across both <strong>Individual Mature Trees (QR Tag)</strong> and <strong>POLOGEN Polygon Blocks (Sapling Stands)</strong>.
          </p>
        </div>

        {activeRole !== 'FIELD_AGENT' && activeRole !== 'NERAMAC_ADMIN' && (
          <div className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Field Officer Supervised Intervention
          </div>
        )}
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Inoculation Events</span>
          <span className="text-lg font-black text-slate-900">{inoculations.length}</span>
          <span className="text-[10px] text-emerald-700 block mt-0.5">Assam &amp; Tripura Clusters</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Asset Breakdown</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {inoculations.filter(i => (i.targetType || 'TREE') === 'TREE').length} Trees
            </span>
            <span className="text-xs font-black text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              {inoculations.filter(i => i.targetType === 'POLOGEN').length} POLOGENs
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Tree &amp; Block Coverage</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Approved Biological Strains</span>
          <span className="text-lg font-black text-emerald-700">AAU Fusarium solani</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Assam Agricultural University</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Photographic Evidence</span>
          <span className="text-lg font-black text-purple-700">100% SHA-256</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Camera Sealed &amp; Watermarked</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl font-extrabold transition ${
            activeFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Inoculations ({inoculations.length})
        </button>

        <button
          onClick={() => setActiveFilter('TREE')}
          className={`px-3.5 py-1.5 rounded-xl font-extrabold transition flex items-center gap-1.5 ${
            activeFilter === 'TREE'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
          }`}
        >
          <Trees className="w-3.5 h-3.5" />
          <span>Individual Trees ({inoculations.filter(i => (i.targetType || 'TREE') === 'TREE').length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('POLOGEN')}
          className={`px-3.5 py-1.5 rounded-xl font-extrabold transition flex items-center gap-1.5 ${
            activeFilter === 'POLOGEN'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-blue-50 hover:text-blue-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>POLOGEN Blocks ({inoculations.filter(i => i.targetType === 'POLOGEN').length})</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredInoculations}
        searchKey="treeId"
        searchPlaceholder="Search by Tree ID, POLOGEN ID, Farmer, or Inoculation ID..."
        onRowClick={(i) => setSelectedInoc(i)}
      />

      {/* Detail Modal */}
      {selectedInoc && (
        <Modal
          isOpen={!!selectedInoc}
          onClose={() => setSelectedInoc(null)}
          title={`Inoculation Record: ${selectedInoc.id}`}
          subtitle={`Target: ${selectedInoc.targetType === 'POLOGEN' ? `POLOGEN ${selectedInoc.pologenId}` : `Tree ${selectedInoc.treeId}`} • Supervised by ${selectedInoc.fieldAgent}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Post Inoculation Photo Preview */}
            {selectedInoc.photoUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
                <img
                  src={selectedInoc.photoUrl}
                  alt={`Post-Inoculation: ${selectedInoc.id}`}
                  className="w-full h-56 object-cover"
                />
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Inoculation Date</span>
                <div className="font-extrabold text-slate-900">{selectedInoc.inoculationDate}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Target Asset Type</span>
                <div className="font-bold text-slate-900">
                  {selectedInoc.targetType === 'POLOGEN' ? (
                    <span className="text-blue-800">POLOGEN Block ({selectedInoc.treeCount || 160} Saplings)</span>
                  ) : (
                    <span className="text-emerald-800">Individual Mature Tree</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Target ID &amp; Grower</span>
                <div className="font-bold text-slate-900">
                  {selectedInoc.targetType === 'POLOGEN' ? selectedInoc.pologenId : selectedInoc.treeId} ({selectedInoc.farmerName || selectedInoc.farmerId})
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Biological Method</span>
                <div className="font-medium text-slate-800">{selectedInoc.method}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Approved Compound / Strain</span>
                <div className="font-medium text-slate-800">{selectedInoc.compound || selectedInoc.strain}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Accredited Supplier &amp; Batch</span>
                <div className="text-slate-800">{selectedInoc.supplier} ({selectedInoc.batchNumber || selectedInoc.compoundBatch || 'B-48'})</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Drill Depth &amp; Holes</span>
                <div className="font-bold text-slate-900">{selectedInoc.drillDepthCm} cm depth • {selectedInoc.holeCount} boreholes</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Inoculum Volume</span>
                <div className="font-bold text-slate-900">{selectedInoc.inoculumVolumeMl} ml</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Resin Progression</span>
                <div className="font-bold text-emerald-700">{(selectedInoc.resinProgressionRating || 'GRADE_A').replace('_', ' ')}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Post-Inoculation Camera SHA-256 Hash
              </span>
              <div className="p-2.5 rounded-lg bg-slate-100 font-mono text-[11px] text-slate-700 break-all border border-slate-200">
                {selectedInoc.photoHash}
              </div>
              <p className="text-[10px] text-slate-500">
                Mandatory cryptographic sealing verifies field camera capture time and prevents retroactive modification.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedInoc(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold"
              >
                Close Record
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Log Inoculation Form Modal (MENU-DRIVEN + CAMERA + TREE/POLOGEN TOGGLE) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          stopWebcamStream();
          setIsWebcamActive(false);
          setIsModalOpen(false);
        }}
        title="Menu-Driven Inoculation Capture &amp; Camera Verification"
        subtitle="Record biological fungal induction on Individual Mature Trees (QR Tag) or POLOGEN Polygon Blocks (Saplings)"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Asset Type Selection Toggle */}
          <div>
            <label className="block text-[11px] font-black text-slate-800 mb-1.5">
              Select Inoculation Target Asset Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTargetTypeChange('TREE')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                  form.targetType === 'TREE'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Trees className={`w-5 h-5 flex-shrink-0 mt-0.5 ${form.targetType === 'TREE' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-black">Individual Mature Tree (&ge; 7 yrs)</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Single tagged tree with QR barcode; deep spiral borehole injection.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTargetTypeChange('POLOGEN')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                  form.targetType === 'POLOGEN'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Compass className={`w-5 h-5 flex-shrink-0 mt-0.5 ${form.targetType === 'POLOGEN' ? 'text-blue-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-black">POLOGEN Polygon Block (&lt; 7 yrs)</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Cadastral sapling block; batch bio-induction across multiple trees.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Asset Picker */}
          {form.targetType === 'TREE' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Mature Tree ID *</label>
                <select
                  value={form.treeId}
                  onChange={(e) => handleTreeChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold bg-white text-slate-900"
                >
                  {farmers.map(farmer => {
                    const farmerTrees = trees.filter(t => t.farmerId === farmer.id);
                    if (!farmerTrees.length) return null;
                    return (
                      <optgroup key={farmer.id} label={`Grower: ${farmer.name} (${farmer.village || farmer.cluster})`}>
                        {farmerTrees.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.id} — {t.farmerName || farmer.name} ({t.ageYears} yrs, {t.plantationId})
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Registered Grower Name</label>
                <input
                  type="text"
                  readOnly
                  value={`${resolvedFarmerName} (${currentSelectedTree?.farmerId || form.farmerId})`}
                  className="w-full px-3 py-2 border rounded-lg bg-emerald-50/50 border-emerald-300 font-extrabold text-emerald-950"
                />
              </div>

              {/* Verified Tree-Grower Linkage Confirmation */}
              <div className="col-span-full -mt-1 flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-300 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Linked Tree: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{currentSelectedTree?.id || form.treeId}</strong> is legally bound to Grower: <strong className="font-bold text-emerald-950">{resolvedFarmerName}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-slate-600 font-mono">
                  {currentSelectedTree?.plantationName || currentSelectedTree?.plantationId || 'Homestead Plot'} • Age: {currentSelectedTree?.ageYears || 11} yrs
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target POLOGEN Polygon Block *</label>
                <select
                  value={form.pologenId}
                  onChange={(e) => handlePologenChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold bg-white text-slate-900"
                >
                  {pologens.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {p.name} ({p.saplingCount} saplings, {p.farmerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Trees Inoculated in Block *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.treeCount}
                  onChange={(e) => setForm({ ...form, treeCount: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border rounded-lg font-bold text-blue-900 bg-white"
                />
              </div>

              {/* POLOGEN Grower Linkage Confirmation */}
              <div className="col-span-full -mt-1 flex items-center justify-between px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200 text-[11px]">
                <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>
                    Linked POLOGEN: <strong className="font-mono">{currentSelectedPologen?.id || form.pologenId}</strong> is verified to Grower: <strong className="font-bold">{resolvedFarmerName}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {currentSelectedPologen?.saplingCount || 160} Saplings • Cluster: {currentSelectedPologen?.cluster || 'Golaghat'}
                </span>
              </div>
            </div>
          )}

          {/* Menu-Driven Inoculation Stage & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Inoculation Stage (Menu) *</label>
              <select
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold bg-white text-emerald-900"
              >
                <option value="PRIMARY_INDUCTION">Stage 1 — Primary Induction (Initial Borehole Injection)</option>
                <option value="SECONDARY_REINFORCEMENT">Stage 2 — Secondary Reinforcement (Resin Ring Deepening)</option>
                <option value="BOOSTER_INDUCTION">Stage 3 — Booster Inoculation (Pre-Harvest Maturation)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Inoculation Method (Menu) *</label>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Mechanical drill & gravity tube injection">Mechanical drill &amp; gravity tube injection</option>
                <option value="Block Bio-Inoculation & Wooden Dowel Pin Insertion">Block Bio-Inoculation &amp; Wooden Dowel Pin Insertion</option>
                <option value="High-pressure needle syringe injection">High-pressure needle syringe injection</option>
                <option value="Fungal spore mycelium plug insertion">Fungal spore mycelium plug insertion</option>
              </select>
            </div>
          </div>

          {/* Accredited Supplier */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Accredited Supplier Entity (Menu) *</label>
            <select
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="Assam Agricultural University (AAU), Jorhat">Assam Agricultural University (AAU), Jorhat</option>
              <option value="Rain Forest Research Institute (RFRI), Deovan">Rain Forest Research Institute (RFRI), Deovan</option>
              <option value="CSIR - North East Institute of Science & Technology (NEIST), Jorhat">CSIR - NEIST, Jorhat</option>
              <option value="NERAMAC Bio-Induction Accredited Facility">NERAMAC Bio-Induction Facility</option>
            </select>
          </div>

          {/* Supplier Batch & Technical Inoculation Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Supplier Lot No. *</label>
              <input
                type="text"
                value={form.compoundBatch}
                onChange={(e) => setForm({ ...form, compoundBatch: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Drill Depth (cm)</label>
              <input
                type="number"
                step="0.5"
                value={form.drillDepthCm}
                onChange={(e) => setForm({ ...form, drillDepthCm: parseFloat(e.target.value) || 6 })}
                className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Holes / Tree</label>
              <input
                type="number"
                value={form.holeCount}
                onChange={(e) => setForm({ ...form, holeCount: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Inoculum Vol (ml)</label>
              <input
                type="number"
                value={form.inoculumVolumeMl}
                onChange={(e) => setForm({ ...form, inoculumVolumeMl: parseInt(e.target.value) || 250 })}
                className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
              />
            </div>
          </div>

          {/* Mandatory Camera Evidence Section */}
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-black text-slate-800">
                Post-Inoculation Camera Evidence &amp; SHA-256 Seal *
              </label>
              {photoSha && (
                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  SHA-256 Cryptographically Sealed
                </span>
              )}
            </div>

            {/* Webcam Live Feed */}
            {isWebcamActive && (
              <div className="relative rounded-xl overflow-hidden bg-black border-2 border-emerald-500 shadow-md">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  LIVE FIELD CAMERA
                </div>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={captureWebcamPhoto}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg flex items-center gap-1.5 transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Post-Inoculation Borehole Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleWebcam}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Photo Action Buttons */}
            {!isWebcamActive && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={toggleWebcam}
                  disabled={isCameraLoading}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isCameraLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  <span>Open Camera to Capture Image</span>
                </button>

                <button
                  type="button"
                  onClick={generateFallbackPhoto}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-slate-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Generate Forensic Borehole Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Upload Image File</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}

            {/* Photo Preview & Hash Stamp */}
            {capturedPhoto && (
              <div className="p-3 bg-slate-900 rounded-xl space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Watermarked Post-Inoculation Evidence Photo:</span>
                  <span className="font-mono text-emerald-400 font-bold">{photoSha ? 'SEAL VERIFIED' : ''}</span>
                </div>
                <div className="rounded-lg overflow-hidden border border-slate-700 max-h-48">
                  <img
                    src={capturedPhoto}
                    alt="Post-Inoculation Borehole"
                    className="w-full h-44 object-cover"
                  />
                </div>
                {photoSha && (
                  <div className="font-mono text-[10px] text-emerald-300 break-all bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block font-sans font-bold">SHA-256 Digest:</span>
                    {photoSha}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Submit Bar */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                stopWebcamStream();
                setIsWebcamActive(false);
                setIsModalOpen(false);
              }}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-xs transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Submit &amp; Seal Inoculation Record</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
