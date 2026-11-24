import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import { QRCodeSVG } from 'qrcode.react';
import jsQR from 'jsqr';
import {
  QrCode,
  Search,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  GitFork,
  Trees,
  UserCheck,
  Flame,
  FlaskConical,
  PlaneTakeoff,
  Clock,
  Printer,
  Sparkles,
  Layers,
  MapPin,
  Camera,
  Upload,
  X,
  Smartphone,
  Copy,
  Check,
  ScanLine,
  Table
} from 'lucide-react';

export default function TraceabilityModule({ initialSearchQuery }) {
  const { resolveTraceability, finishedProducts, harvestBatches, farmers, trees, addToast } = useEnterprise();
  const [searchInput, setSearchInput] = useState(initialSearchQuery || 'PCK-NER-2026-001');
  const [traceResult, setTraceResult] = useState(null);
  const [isOfficerMode, setIsOfficerMode] = useState(false);

  // Live Camera & File QR Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const fileInputRef = useRef(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Check URL query parameters on mount (?batch=..., ?serial=..., ?id=..., ?q=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTarget = params.get('batch') || params.get('serial') || params.get('id') || params.get('code') || params.get('q');
      if (urlTarget) {
        setSearchInput(urlTarget);
        const res = resolveTraceability(urlTarget);
        if (res) setTraceResult(res);
      }
    }
  }, []);

  // Camera QR Scanner Lifecycle
  const startCamera = async () => {
    setScannerError('');
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        requestAnimationFrame(tickScanner);
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      setScannerError('Could not access live camera. You can upload an image file of the QR code or use a sample code below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsCameraActive(false);
  };

  const tickScanner = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });
        if (code && code.data) {
          handleDetectedCode(code.data);
          return;
        }
      }
    }
    animFrameRef.current = requestAnimationFrame(tickScanner);
  };

  const handleDetectedCode = (raw) => {
    stopCamera();
    let query = raw.trim();
    if (query.includes('/verify/')) {
      query = query.split('/verify/').pop().split('?')[0].split('#')[0];
    } else if (query.includes('batch=')) {
      query = query.split('batch=')[1].split('&')[0];
    } else if (query.includes('serial=')) {
      query = query.split('serial=')[1].split('&')[0];
    } else if (query.includes('id=')) {
      query = query.split('id=')[1].split('&')[0];
    } else if (query.startsWith('http')) {
      const parts = query.split('/');
      query = parts[parts.length - 1].split('?')[0];
    }
    setSearchInput(query);
    const res = resolveTraceability(query);
    setTraceResult(res);
    setIsScannerOpen(false);
    addToast?.(`QR Code Scanned: ${query}`, 'success');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleDetectedCode(code.data);
        } else {
          setScannerError('Could not decode a QR code from this image. Please ensure the QR code is clear and well-lit.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Name privacy masking helper
  const maskName = (name) => {
    if (!name) return 'R********d G****r';
    const parts = name.trim().split(' ');
    return parts.map(p => {
      if (p.length <= 2) return p;
      return p[0] + '*'.repeat(Math.max(1, p.length - 2)) + p[p.length - 1];
    }).join(' ');
  };

  // Auto-resolve on search or initial load
  useEffect(() => {
    if (searchInput) {
      const res = resolveTraceability(searchInput);
      setTraceResult(res);
    }
  }, [searchInput]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const res = resolveTraceability(searchInput.trim());
    setTraceResult(res);
  };

  const product = traceResult?.product;
  const aggBatch = traceResult?.aggBatch || traceResult?.aggregation;
  const distillation = traceResult?.distillation;
  const labTest = traceResult?.labTest;
  const exportBatch = traceResult?.exportBatch;

  // Resolve all contributing farmers (supports multi-grower aggregation pool)
  const resolvedFarmers = useMemo(() => {
    const list = traceResult?.farmers || (traceResult?.farmer ? [traceResult.farmer] : []);
    if (list.length > 1) return list;

    // Check if aggregation batch explicitly lists contributing farmers
    if (aggBatch?.parentDetails?.length > 1 && farmers?.length) {
      const collected = [];
      aggBatch.parentDetails.forEach(pd => {
        const found = farmers.find(f => f.name === pd.farmer || f.id === pd.farmerId);
        if (found && !collected.some(c => c.id === found.id)) {
          collected.push(found);
        }
      });
      if (collected.length > 1) return collected;
    }

    // Check if distillation lists multiple parent farmers
    if (distillation?.parentFarmers?.length > 1 && farmers?.length) {
      const collected = [];
      distillation.parentFarmers.forEach(pName => {
        const found = farmers.find(f => f.name === pName);
        if (found && !collected.some(c => c.id === found.id)) {
          collected.push(found);
        }
      });
      if (collected.length > 1) return collected;
    }

    return list;
  }, [traceResult, aggBatch, distillation, farmers]);

  const isMultiGrowerPool = resolvedFarmers.length > 1;

  // Resolve all contributing trees
  const resolvedTrees = useMemo(() => {
    const list = traceResult?.trees || (traceResult?.tree ? [traceResult.tree] : []);
    if (list.length > 1) return list;
    if (traceResult?.harvestBatches?.length > 1 && trees?.length) {
      const treeIds = traceResult.harvestBatches.map(b => b.treeId);
      const matched = trees.filter(t => treeIds.includes(t.id));
      if (matched.length > 1) return matched;
    }
    return list;
  }, [traceResult, trees]);

  return (
    <div className="space-y-6">
      {/* Title & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-700" />
              <span>Traceability & Dual-Perspective QR Verification Portal</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Module 16
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Scan or enter any product serial number, QR URL, or harvest batch ID for end-to-end forward and backward provenance.
            </p>
          </div>

          {/* Public / Officer Perspective Toggle */}
          <button
            onClick={() => setIsOfficerMode(!isOfficerMode)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-xs ${
              isOfficerMode
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
          >
            {isOfficerMode ? (
              <>
                <Unlock className="w-4 h-4 text-amber-700" />
                <span>Authorized Officer Mode (Unmasked PII)</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-emerald-700" />
                <span>Public Verifier Mode (Protected View)</span>
              </>
            )}
          </button>
        </div>

        {/* Search Input Box & Real Camera QR Scanner Button */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Serial Number (e.g. PCK-NER-2026-001) or Harvest Batch ID (e.g. HBT-AS-2026-001)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
          >
            Trace Provenance
          </button>
          <button
            type="button"
            onClick={() => {
              setIsScannerOpen(true);
              startCamera();
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-black rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Scan QR Code (Live Camera)</span>
          </button>
        </form>

        {/* Quick Sample Chips */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span className="font-bold text-slate-700">Quick Test Targets:</span>
          <button
            type="button"
            onClick={() => setSearchInput('PCK-NER-2026-001')}
            className="font-mono bg-slate-100 hover:bg-emerald-100 text-slate-800 px-2 py-0.5 rounded font-bold transition"
          >
            PCK-NER-2026-001 (Pooled Flacon)
          </button>
          <button
            type="button"
            onClick={() => setSearchInput('HBT-AS-2026-001')}
            className="font-mono bg-slate-100 hover:bg-emerald-100 text-slate-800 px-2 py-0.5 rounded font-bold transition"
          >
            HBT-AS-2026-001 (Bhaben Saikia Batch)
          </button>
          <button
            type="button"
            onClick={() => setSearchInput('HBT-AS-2026-002')}
            className="font-mono bg-slate-100 hover:bg-emerald-100 text-slate-800 px-2 py-0.5 rounded font-bold transition"
          >
            HBT-AS-2026-002 (Tarun Chandra Das Batch)
          </button>
          <button
            type="button"
            onClick={() => setSearchInput('FRM-AS-02')}
            className="font-mono bg-slate-100 hover:bg-emerald-100 text-slate-800 px-2 py-0.5 rounded font-bold transition"
          >
            FRM-AS-02 (Tarun Chandra Das)
          </button>
          <button
            type="button"
            onClick={() => setSearchInput('TRE-AS-007')}
            className="font-mono bg-slate-100 hover:bg-emerald-100 text-slate-800 px-2 py-0.5 rounded font-bold transition"
          >
            TRE-AS-007 (Tarun's Tree)
          </button>
        </div>
      </div>

      {/* Real Camera & File QR Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <ScanLine className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Real-Time QR Code Scanner</h3>
                  <p className="text-[11px] text-slate-500">Hold any product or batch QR code in front of the lens</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setIsScannerOpen(false);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport / Viewfinder */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-4/3 flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Scanning Target Box & Reticle */}
              {isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                    {/* Animated scanning laser line */}
                    <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce duration-1000" />
                    {/* Corner accents */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br" />
                  </div>
                </div>
              )}

              {scannerError && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <Camera className="w-8 h-8 text-amber-400" />
                  <p className="text-xs text-amber-200">{scannerError}</p>
                </div>
              )}
            </div>

            {/* Secondary Option: Upload QR Image file */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Upload QR Photo / Screenshot</span>
              </button>

              <button
                type="button"
                onClick={() => handleDetectedCode('PCK-NER-2026-001')}
                className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs transition"
              >
                Quick Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Traceability Result Presentation */}
      {traceResult ? (
        <div className="space-y-6">
          {/* Top Verification Authenticity Card */}
          <div className="bg-white border-2 border-emerald-500 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center p-2 flex-shrink-0">
                  <QRCodeSVG
                    value={typeof window !== 'undefined' ? `${window.location.origin}/traceability?batch=${product?.serialNumber || searchInput}` : `https://trace.neramac.gov.in/verify/${product?.serialNumber || searchInput}`}
                    size={56}
                    level="M"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Authoritative Provenance Verified
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">CITES App II</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                    {product ? product.productName : `Trace Target: ${searchInput}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Serial: <strong className="font-mono text-emerald-800">{product?.serialNumber || searchInput}</strong> • NABL COA: <strong className="font-mono text-slate-800">{labTest?.coaDocumentNumber || 'COA/NER/2026/0144'}</strong>
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs text-slate-500 font-semibold">Government Nodal Authority</div>
                <div className="font-extrabold text-slate-900 text-sm">NERAMAC ASCTS Central Registry</div>
                <div className="text-[10px] text-emerald-700 font-bold flex items-center sm:justify-end gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Unbroken 15-Identity Digital Graph</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Visual Lineage Graph (10 Stages Timeline) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <GitFork className="w-4 h-4 text-emerald-700" />
                <span>Complete Backward & Forward Lineage Graph</span>
              </h4>
              <span className="text-[11px] font-bold text-slate-500">
                10 Verified Value-Chain Milestones
              </span>
            </div>

            <div className="relative border-l-2 border-emerald-500/40 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8 py-2">
              {/* Node 1: Registered Farmer(s) & Land Tenure (Structured Table) */}
              <div className="relative">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs">
                  1
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                        FRM • {isMultiGrowerPool ? `Consolidated Multi-Grower Cluster Pool (${resolvedFarmers.length} Contributing Homestead Growers)` : 'Primary Registered Grower & Land Tenure Table'}
                      </span>
                      {isMultiGrowerPool && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                          Pooled Batch Consignment
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {isOfficerMode ? 'Verified Land Registry' : 'Protected Public View'}
                    </span>
                  </div>

                  {/* Clean Structured Table of Homestead Growers */}
                  <div className="overflow-x-auto rounded-xl border border-emerald-200/80 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-emerald-50/90 text-emerald-950 font-extrabold uppercase text-[10px] tracking-wider border-b border-emerald-200">
                        <tr>
                          <th className="px-3 py-2.5">#</th>
                          <th className="px-3 py-2.5">Homestead Grower</th>
                          <th className="px-3 py-2.5">Village / Location</th>
                          <th className="px-3 py-2.5">Revenue Title (Dag / Patta)</th>
                          <th className="px-3 py-2.5 text-right">Heartwood Contributed</th>
                          <th className="px-3 py-2.5 text-right">Pool Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100">
                        {resolvedFarmers.map((f, idx) => {
                          const batch = (traceResult?.harvestBatches || []).find(b => b.farmerId === f.id || b.farmerName === f.name);
                          const parentDetail = (aggBatch?.parentDetails || []).find(p => p.farmer === f.name || p.batchId === batch?.id);
                          const weight = parentDetail?.weightKg || batch?.netWeightKg || (idx === 0 ? 38.5 : 36.5);
                          const poolTotal = aggBatch?.totalWeightKg || 75.0;
                          const sharePct = poolTotal > 0 ? ((weight / poolTotal) * 100).toFixed(1) : (resolvedFarmers.length === 1 ? '100.0' : '50.0');

                          return (
                            <tr key={f.id || idx} className="hover:bg-emerald-50/40 transition">
                              <td className="px-3 py-2.5 font-bold text-slate-500">{idx + 1}</td>
                              <td className="px-3 py-2.5">
                                <span className="font-extrabold text-slate-900 block">
                                  {isOfficerMode ? f.name : maskName(f.name)}
                                </span>
                                <span className="text-[10px] font-mono text-emerald-800 font-semibold">{f.id}</span>
                              </td>
                              <td className="px-3 py-2.5 font-medium text-slate-700">
                                {f.village || `${f.district || 'Golaghat'}, ${f.state || 'Assam'}`}
                              </td>
                              <td className="px-3 py-2.5 font-mono font-bold text-slate-800">
                                {f.dagNumber || 'Dag 182, Patta 44'}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono font-black text-emerald-900">
                                {weight} kg
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[11px]">
                                  {sharePct}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Node 2: Point Geo-Pinned Tree(s) (Structured Table) */}
              <div className="relative">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs">
                  2
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                      TRE • Point Geo-Pinning & Age Rule Survey Table {resolvedTrees.length > 1 ? `(${resolvedTrees.length} Verified Trees)` : ''}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      RFID &amp; GPS Verified
                    </span>
                  </div>

                  {/* Clean Structured Table of Trees */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5">Tree Tag ID</th>
                          <th className="px-3 py-2.5">Species</th>
                          <th className="px-3 py-2.5">Planted Year & Age</th>
                          <th className="px-3 py-2.5">Girth (GBH)</th>
                          <th className="px-3 py-2.5">Homestead Plot</th>
                          <th className="px-3 py-2.5">Satellite Geo-Pin (Lat, Long)</th>
                          <th className="px-3 py-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {resolvedTrees.map((t, idx) => (
                          <tr key={t.id || idx} className="hover:bg-slate-50 transition">
                            <td className="px-3 py-2.5 font-mono font-extrabold text-emerald-900">{t.id}</td>
                            <td className="px-3 py-2.5 italic text-slate-700">{t.species || 'Aquilaria malaccensis'}</td>
                            <td className="px-3 py-2.5 font-bold text-slate-900">
                              {t.plantingYear ? `${t.plantingYear} (${t.ageYears} yrs)` : `${t.ageYears || 11} Years Old`}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-slate-700">{t.girthCm || t.gbhCm || 74} cm</td>
                            <td className="px-3 py-2.5 text-slate-600">{t.plantationName || t.plantationId || 'Homestead Parcel'}</td>
                            <td className="px-3 py-2.5 font-mono text-[11px] text-teal-800 font-bold">
                              {t.gpsLatitude?.toFixed ? `${t.gpsLatitude.toFixed(4)}° N, ${t.gpsLongitude?.toFixed(4)}° E` : `${t.gpsLatitude || 26.5208}, ${t.gpsLongitude || 93.9790}`}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {t.status || 'HARVESTED'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Node 3: Inoculation Record */}
              <div className="relative">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs">
                  3
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    INO • Biological Inoculation Intervention
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm">
                    AAU Fusarium solani Bio-Inoculum (Strain AS-44)
                  </div>
                  <div className="text-xs text-slate-600">
                    Supplier: <strong>Assam Agricultural University (AAU) Jorhat (Batch B-19)</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono break-all">
                    Camera Buffer Hash: sha256:b8c91a0f443b7e8d2e119934c568910fedba77218390
                  </div>
                </div>
              </div>

              {/* Node 4: DFO Harvest Sanction & Felling */}
              <div className="relative">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs">
                  4
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    HAU / PMT • DFO Tree Felling Sanction Order
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm font-mono">
                    Sanction Order: DFO/GLT/2026/HARV-184
                  </div>
                  <div className="text-xs text-slate-600">
                    Signatory: <strong>S. K. Bordoloi, IFS (DFO Golaghat Forest Division)</strong>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Harvested Cleaned Heartwood: <strong>38.5 kg</strong> • Batch: <strong className="font-mono text-emerald-800">HBT-AS-2026-001</strong>
                  </div>
                </div>
              </div>

              {/* Node 5: Custody Movement & Tolerance Check */}
              <div className="relative">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs">
                  5
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    MOV • Material Movement & Transit Pass Tolerance (≤ 1.5%)
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm font-mono">
                    Transit Pass: TP/FOR/GLT/2026/0892 (Carrier AS-05-C-4412)
                  </div>
                  <div className="text-xs text-slate-600">
                    Dispatch: <strong>75.20 kg</strong> → Receipt: <strong>75.05 kg</strong> (Variance: <strong className="text-emerald-700">-0.20% PASS</strong>)
                  </div>
                </div>
              </div>

              {/* Node 6: Depot Aggregation Pooling */}
              <div className="relative">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs">
                  6
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    AGG • Depot Consignment Pooling &amp; Backward Lineage
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm font-mono">
                    Batch: {aggBatch?.id || 'AGG-AS-2026-01'} ({aggBatch?.depotName || 'Golaghat Aggregation Depot'})
                  </div>
                  <div className="text-xs text-slate-600">
                    Pooled Batches: <strong>
                      {aggBatch?.parentDetails?.length
                        ? aggBatch.parentDetails.map(pd => `${pd.batchId} (${pd.farmer} • ${pd.weightKg}kg)`).join(' + ')
                        : 'HBT-AS-2026-001 (Bhaben Saikia • 38.5kg) + HBT-AS-2026-002 (Tarun Chandra Das • 36.5kg)'}
                    </strong> = {aggBatch?.totalWeightKg || 75.0} kg Distillation Charge
                  </div>
                </div>
              </div>

              {/* Node 7: CPC Hydro-Distillation & Mass Balance */}
              <div className="relative">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs">
                  7
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    DST • CPC Hydro-Distillation & Mass Balance
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm font-mono">
                    Distillation Run: DST-AS-2026-01 (NERAMAC CPC Golaghat Still #02)
                  </div>
                  <div className="text-xs text-slate-600 font-mono bg-white p-2 rounded border border-slate-200">
                    Input 75.0kg Wood = 245ml Pure Oud Oil + 18.5L Hydrosol + 68.2kg Spent Biomass (99.8% Balanced)
                  </div>
                </div>
              </div>

              {/* Node 8: NABL Quality Testing & GC-MS Profiling (Structured Table) */}
              <div className="relative">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs">
                  8
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                        LAB • NABL Accredited Chemical Profiling &amp; GC-MS Assay Table
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm font-mono">
                        Certificate of Analysis: {labTest?.coaDocumentNumber || 'COA/NER/2026/0144'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      ISO/IEC 17025 Certified
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-purple-200 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-purple-50 text-purple-950 font-extrabold uppercase text-[10px] tracking-wider border-b border-purple-200">
                        <tr>
                          <th className="px-3 py-2.5">Bioactive Compound / Parameter</th>
                          <th className="px-3 py-2.5">Observed Test Value</th>
                          <th className="px-3 py-2.5">Statutory Benchmark</th>
                          <th className="px-3 py-2.5">Testing Method</th>
                          <th className="px-3 py-2.5 text-right">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-100 font-mono text-xs">
                        <tr className="hover:bg-purple-50/30">
                          <td className="px-3 py-2 font-bold text-slate-900 font-sans">Agarospirol (Marker Sesquiterpene)</td>
                          <td className="px-3 py-2 font-extrabold text-emerald-800">{labTest?.agarospirolPct || '14.82'}%</td>
                          <td className="px-3 py-2 text-slate-600">&ge; 8.50%</td>
                          <td className="px-3 py-2 text-slate-500 font-sans">GC-MS (ISO 11024)</td>
                          <td className="px-3 py-2 text-right">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">PASS</span>
                          </td>
                        </tr>
                        <tr className="hover:bg-purple-50/30">
                          <td className="px-3 py-2 font-bold text-slate-900 font-sans">Jinkoh-eremol (Aroma Carrier)</td>
                          <td className="px-3 py-2 font-extrabold text-emerald-800">{labTest?.jinkohEremolPct || '6.24'}%</td>
                          <td className="px-3 py-2 text-slate-600">&ge; 4.00%</td>
                          <td className="px-3 py-2 text-slate-500 font-sans">GC-MS (ISO 11024)</td>
                          <td className="px-3 py-2 text-right">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">PASS</span>
                          </td>
                        </tr>
                        <tr className="hover:bg-purple-50/30">
                          <td className="px-3 py-2 font-bold text-slate-900 font-sans">Kusunol Content</td>
                          <td className="px-3 py-2 font-extrabold text-emerald-800">3.18%</td>
                          <td className="px-3 py-2 text-slate-600">&ge; 2.00%</td>
                          <td className="px-3 py-2 text-slate-500 font-sans">GC-MS (ISO 11024)</td>
                          <td className="px-3 py-2 text-right">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">PASS</span>
                          </td>
                        </tr>
                        <tr className="hover:bg-purple-50/30">
                          <td className="px-3 py-2 font-bold text-slate-900 font-sans">Synthetics &amp; Phthalates (DEP / DOP)</td>
                          <td className="px-3 py-2 font-extrabold text-emerald-800">0.00% (Nil)</td>
                          <td className="px-3 py-2 text-slate-600">Zero Tolerance</td>
                          <td className="px-3 py-2 text-slate-500 font-sans">GC-MS Headspace</td>
                          <td className="px-3 py-2 text-right">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">PURE PASS</span>
                          </td>
                        </tr>
                        <tr className="hover:bg-purple-50/30">
                          <td className="px-3 py-2 font-bold text-slate-900 font-sans">Refractive Index @ 20&deg;C</td>
                          <td className="px-3 py-2 font-extrabold text-slate-800">1.5082</td>
                          <td className="px-3 py-2 text-slate-600">1.5000 &ndash; 1.5150</td>
                          <td className="px-3 py-2 text-slate-500 font-sans">Abbe Refractometer</td>
                          <td className="px-3 py-2 text-right">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">PASS</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Node 9: Packaging & Laser QR Serialization */}
              <div className="relative">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs">
                  9
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    PCK • Serialized Finished Pack
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm font-mono">
                    Serial: {product?.serialNumber || searchInput}
                  </div>
                  <div className="text-xs text-slate-600">
                    Packaging: <strong>12ml Pure Oud Flacon with Tamper-Evident Seal</strong>
                  </div>
                </div>
              </div>

              {/* Node 10: Final Destination (Export / Domestic) */}
              <div className="relative">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs">
                  10
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    EBT / ELT • Final Commercial Destination
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {product?.destinationBuyer || 'Dubai Royal Fragrances LLC (Dubai, UAE)'}
                  </div>
                  <div className="text-xs text-slate-700 font-mono">
                    CITES Permit: {product?.citesPermitNo || 'CITES/IN/2026/EXP-441'} • Air Waybill: 098-88192410
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
          <p className="text-sm font-bold text-slate-700">No records matched query: "{searchInput}"</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try searching for sample serial numbers like <strong>PCK-NER-2026-001</strong>, <strong>PCK-NER-2026-013</strong>, or <strong>HBT-AS-2026-001</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
