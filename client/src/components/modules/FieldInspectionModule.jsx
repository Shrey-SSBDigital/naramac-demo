import React, { useState, useRef, useEffect } from 'react';
import {
  Users, Sprout, TreePine, Camera, Check, ChevronRight, ChevronLeft,
  MapPin, Footprints, AlertTriangle, CheckCircle2, X, Download,
  Video, VideoOff, ShieldCheck, Image as ImageIcon, RefreshCw,
  ArrowRight, Wifi, WifiOff, Info
} from 'lucide-react';
import { useEnterprise } from '../../context/EnterpriseContext';
import {
  generateSyntheticFieldPhoto,
  stampWatermarkOnCanvas,
  generateCryptoHash,
  computeRealSha256
} from '../../utils/photoCaptureUtils';

const STEPS = [
  { id: 1, label: 'Select Farmer', icon: Users },
  { id: 2, label: 'Choose Asset Type', icon: Sprout },
  { id: 3, label: 'Geo-Tag on Map', icon: MapPin },
  { id: 4, label: 'Capture Image', icon: Camera },
  { id: 5, label: 'Review & Submit', icon: Check }
];

const GPS_SAMPLE = {
  GOLAGHAT: { lat: 26.5138, lng: 93.9633, label: 'Golaghat, Assam' },
  KADAMTALA: { lat: 24.4629, lng: 92.2068, label: 'Kadamtala, Tripura' }
};

export default function FieldInspectionModule({ onNavigateToGisStudio }) {
  const {
    farmers,
    pologens,
    trees,
    addPologen: enterpriseAddPologen,
    addTree: enterpriseAddTree,
    addToast
  } = useEnterprise();

  // ── Wizard State ───────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0]?.id || '');
  const [assetType, setAssetType] = useState(null); // 'POLOGEN' | 'TREE'
  const [cluster, setCluster] = useState('GOLAGHAT');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [isGpsLocked, setIsGpsLocked] = useState(false);
  const [isAcquiring, setIsAcquiring] = useState(false);

  // POLOGEN form
  const [pologenForm, setPologenForm] = useState({
    name: '',
    saplingCount: 250,
    plantingYear: 2023
  });

  // Tree form
  const [treeForm, setTreeForm] = useState({
    rfidTag: 'AS-GLG-TAG-',
    ageYears: 10.5,
    gbhCm: 62.0,
    heightM: 11.0,
    treeStatus: 'VERIFIED_HEALTHY'
  });

  // Camera
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [photoHash, setPhotoHash] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [cameraHash, setCameraHash] = useState(() => generateCryptoHash());
  const videoRef = useRef(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (text, tone = 'success') => {
    setToast({ text, tone });
    setTimeout(() => setToast(null), 5000);
  };

  const selectedFarmer = farmers.find(f => f.id === selectedFarmerId) || farmers[0];
  const farmerPologens = pologens.filter(p => p.farmerId === selectedFarmerId);
  const farmerTrees = trees.filter(t => t.farmerId === selectedFarmerId);

  // ── GPS Acquire ────────────────────────────────────────────────────────────
  const acquireGPS = () => {
    setIsAcquiring(true);
    setIsGpsLocked(false);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
          setIsGpsLocked(true);
          setIsAcquiring(false);
          showToast(`GPS locked: ${pos.coords.latitude.toFixed(5)}°N, ${pos.coords.longitude.toFixed(5)}°E (±${pos.coords.accuracy.toFixed(1)}m)`, 'success');
        },
        () => {
          // Fallback to cluster sample
          const sample = GPS_SAMPLE[cluster];
          setGpsCoords({ lat: sample.lat + (Math.random() - 0.5) * 0.001, lng: sample.lng + (Math.random() - 0.5) * 0.001, accuracy: 1.4 });
          setIsGpsLocked(true);
          setIsAcquiring(false);
          showToast('Real GPS unavailable — using high-precision simulated RTK coordinates', 'warning');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      const sample = GPS_SAMPLE[cluster];
      setGpsCoords({ lat: sample.lat, lng: sample.lng, accuracy: 1.2 });
      setIsGpsLocked(true);
      setIsAcquiring(false);
    }
  };

  // ── Camera ─────────────────────────────────────────────────────────────────
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
      } catch {
        showToast('Camera not accessible — using AR simulation mode', 'warning');
      }
    }
  };

  const handleSnapPhoto = async () => {
    const hash = generateCryptoHash();
    let photoDataUrl;

    if (isWebcamActive && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 720; canvas.height = 540;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 720, 540);
      stampWatermarkOnCanvas(ctx, 720, 540, {
        kind: assetType,
        entityId: `DRAFT-${assetType === 'POLOGEN' ? 'PLG' : 'TRE'}`,
        farmerName: selectedFarmer?.name,
        farmerId: selectedFarmer?.id,
        plantationName: 'Field Capture',
        plantationId: 'DRAFT',
        rfidTag: assetType === 'TREE' ? treeForm.rfidTag : undefined,
        ageYears: assetType === 'TREE' ? treeForm.ageYears : undefined,
        gbhCm: assetType === 'TREE' ? treeForm.gbhCm : undefined,
        saplingCount: assetType === 'POLOGEN' ? pologenForm.saplingCount : undefined,
        plantingYear: assetType === 'POLOGEN' ? pologenForm.plantingYear : undefined,
        coordinates: gpsCoords ? [gpsCoords.lng, gpsCoords.lat] : [93.9633, 26.5138],
        photoSha256: hash
      });
      photoDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
    } else {
      photoDataUrl = generateSyntheticFieldPhoto({
        kind: assetType,
        entityId: `DRAFT-${assetType === 'POLOGEN' ? 'PLG' : 'TRE'}-${Date.now()}`,
        farmerName: selectedFarmer?.name,
        farmerId: selectedFarmer?.id,
        plantationName: 'Field Capture',
        plantationId: 'DRAFT',
        rfidTag: assetType === 'TREE' ? treeForm.rfidTag : undefined,
        ageYears: assetType === 'TREE' ? treeForm.ageYears : undefined,
        gbhCm: assetType === 'TREE' ? treeForm.gbhCm : undefined,
        saplingCount: assetType === 'POLOGEN' ? pologenForm.saplingCount : undefined,
        plantingYear: assetType === 'POLOGEN' ? pologenForm.plantingYear : undefined,
        coordinates: gpsCoords ? [gpsCoords.lng, gpsCoords.lat] : [93.9633, 26.5138],
        photoSha256: hash
      });
    }

    const realHash = await computeRealSha256(photoDataUrl);
    setCapturedPhoto(photoDataUrl);
    setPhotoHash(realHash);
    setShowCamera(false);
    showToast(`✓ ${assetType === 'POLOGEN' ? 'Sapling grove' : 'Tree trunk'} photo sealed with Web Crypto SHA-256`, 'success');
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!gpsCoords || !capturedPhoto) return;
    if (assetType === 'POLOGEN') {
      enterpriseAddPologen({
        farmerId: selectedFarmer.id,
        farmerName: selectedFarmer.name,
        plantationId: `PLT-FIELD-${selectedFarmer.id}`,
        plantationName: `${selectedFarmer.name}'s Plantation`,
        name: pologenForm.name.trim() || `${selectedFarmer.name} Sapling Block ${new Date().getFullYear()}`,
        plantingYear: Number(pologenForm.plantingYear),
        ageYears: +(2026.5 - Number(pologenForm.plantingYear)).toFixed(1),
        saplingCount: Number(pologenForm.saplingCount),
        boundaryPolygon: [[gpsCoords.lat, gpsCoords.lng],[gpsCoords.lat + 0.0005, gpsCoords.lng],[gpsCoords.lat + 0.0005, gpsCoords.lng + 0.0005],[gpsCoords.lat, gpsCoords.lng + 0.0005],[gpsCoords.lat, gpsCoords.lng]],
        areaSquareMeters: 2500,
        perimeterMeters: 200,
        photoUrl: capturedPhoto,
        photoSha256: photoHash
      });
    } else {
      enterpriseAddTree({
        farmerId: selectedFarmer.id,
        farmerName: selectedFarmer.name,
        plantationId: `PLT-FIELD-${selectedFarmer.id}`,
        plantationName: `${selectedFarmer.name}'s Plantation`,
        qrTagCode: treeForm.rfidTag,
        ageYears: Number(treeForm.ageYears),
        girthCm: Number(treeForm.gbhCm),
        heightMeters: Number(treeForm.heightM),
        gpsLatitude: gpsCoords.lat,
        gpsLongitude: gpsCoords.lng,
        photoHash: `sha256:${photoHash}`,
        photoUrl: capturedPhoto
      });
    }
    setStep(5);
    showToast(`✓ ${assetType === 'POLOGEN' ? 'POLOGEN block' : 'Tree'} submitted for Farmer ${selectedFarmer.name}`, 'success');
  };

  const resetWizard = () => {
    setStep(1);
    setAssetType(null);
    setGpsCoords(null);
    setIsGpsLocked(false);
    setCapturedPhoto(null);
    setPhotoHash(null);
    setPologenForm({ name: '', saplingCount: 250, plantingYear: 2023 });
    setTreeForm({ rfidTag: 'AS-GLG-TAG-', ageYears: 10.5, gbhCm: 62.0, heightM: 11.0, treeStatus: 'VERIFIED_HEALTHY' });
  };

  const canProceed = () => {
    if (step === 1) return !!selectedFarmerId;
    if (step === 2) return !!assetType;
    if (step === 3) return isGpsLocked;
    if (step === 4) return !!capturedPhoto;
    return false;
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-3xl mx-auto">

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Footprints className="w-5 h-5 text-emerald-700" />
            Field Inspection — Geo-Tag & Capture
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Field Agent on-site: select farmer → choose POLOGEN or Tree → lock GPS → capture field photo → submit
          </p>
        </div>
        {onNavigateToGisStudio && (
          <button
            type="button"
            onClick={onNavigateToGisStudio}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 border border-emerald-200 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition whitespace-nowrap"
          >
            Open Full GIS Studio <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 shadow-xs ${
          toast.tone === 'error' ? 'bg-rose-50 border-rose-300 text-rose-900'
          : toast.tone === 'warning' ? 'bg-amber-50 border-amber-300 text-amber-900'
          : 'bg-emerald-50 border-emerald-300 text-emerald-900'
        }`}>
          <div className="flex items-center gap-2">
            {toast.tone === 'error'
              ? <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              : <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            }
            <span>{toast.text}</span>
          </div>
          <button onClick={() => setToast(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Progress Steps */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs px-4 py-3">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <React.Fragment key={s.id}>
                <div className={`flex flex-col items-center gap-1 flex-1 min-w-0 ${active ? 'opacity-100' : done ? 'opacity-80' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    done ? 'bg-emerald-600 text-white'
                    : active ? 'bg-emerald-700 text-white ring-2 ring-emerald-300'
                    : 'bg-slate-100 text-slate-500'
                  }`}>
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] font-semibold text-center leading-tight hidden sm:block ${active ? 'text-emerald-800' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 mt-[-12px] sm:mt-[-20px] rounded ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── STEP 1: Select Farmer ─────────────────────────────────────────── */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            Step 1 — Select Farmer for Inspection
          </h2>
          <p className="text-xs text-slate-500">Choose the farmer whose plantation you are visiting today.</p>

          <div className="space-y-3">
            {farmers.map(f => {
              const selected = f.id === selectedFarmerId;
              const fPologens = pologens.filter(p => p.farmerId === f.id);
              const fTrees = trees.filter(t => t.farmerId === f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFarmerId(f.id)}
                  className={`w-full text-left p-3.5 rounded-xl border-2 transition ${
                    selected ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                        selected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {f.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 text-sm truncate">{f.name}</div>
                        <div className="text-xs text-slate-500 truncate">{f.village}, {f.district}</div>
                        <div className="text-[11px] font-mono text-slate-400">{f.id}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-[10px] flex-shrink-0">
                      <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">{fPologens.length} POLOGEN</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">{fTrees.length} Trees</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Cluster selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Inspection Cluster</label>
            <div className="flex gap-2">
              {Object.entries(GPS_SAMPLE).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCluster(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    cluster === key ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Choose Asset Type ─────────────────────────────────────── */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-700" />
            Step 2 — What are you tagging for <span className="text-emerald-700">{selectedFarmer?.name}</span>?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* POLOGEN */}
            <button
              type="button"
              onClick={() => setAssetType('POLOGEN')}
              className={`p-5 rounded-2xl border-2 text-left transition space-y-3 ${
                assetType === 'POLOGEN' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/40'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                assetType === 'POLOGEN' ? 'bg-teal-500 text-white' : 'bg-teal-100 text-teal-700'
              }`}>
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-sm">POLOGEN Block</div>
                <div className="text-xs text-slate-500 mt-0.5">Young sapling area &lt; 7 years</div>
                <div className="text-[11px] text-teal-700 font-semibold mt-1.5">Walk the boundary perimeter → GPS polygon</div>
              </div>
              <div className="flex flex-wrap gap-1 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">Polygon GPS</span>
                <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">Sapling Count</span>
                <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">Photo + SHA-256</span>
              </div>
              {assetType === 'POLOGEN' && (
                <div className="flex items-center gap-1 text-xs font-bold text-teal-700">
                  <Check className="w-4 h-4" /> Selected
                </div>
              )}
            </button>

            {/* TREE */}
            <button
              type="button"
              onClick={() => setAssetType('TREE')}
              className={`p-5 rounded-2xl border-2 text-left transition space-y-3 ${
                assetType === 'TREE' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                assetType === 'TREE' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'
              }`}>
                <TreePine className="w-6 h-6" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-sm">Individual Tree</div>
                <div className="text-xs text-slate-500 mt-0.5">Mature agarwood tree ≥ 7 years</div>
                <div className="text-[11px] text-amber-700 font-semibold mt-1.5">Stand at the tree → single GPS point pin</div>
              </div>
              <div className="flex flex-wrap gap-1 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">GPS Point</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">RFID Tag</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">Trunk Photo</span>
              </div>
              {assetType === 'TREE' && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-700">
                  <Check className="w-4 h-4" /> Selected
                </div>
              )}
            </button>
          </div>

          {/* Existing assets for context */}
          {(farmerPologens.length > 0 || farmerTrees.length > 0) && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-xs space-y-1.5">
              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                Already registered for {selectedFarmer?.name}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {farmerPologens.map(p => (
                  <span key={p.id} className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono font-bold">{p.id}</span>
                ))}
                {farmerTrees.map(t => (
                  <span key={t.id} className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono font-bold">{t.id}</span>
                ))}
              </div>
            </div>
          )}

          {/* Asset-specific form */}
          {assetType === 'POLOGEN' && (
            <div className="border border-teal-200 bg-teal-50/60 rounded-xl p-3.5 space-y-3">
              <div className="font-bold text-teal-800 text-xs uppercase tracking-wider">POLOGEN Block Details</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Block Name</label>
                  <input
                    type="text"
                    value={pologenForm.name}
                    onChange={e => setPologenForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Nahorjan Block A"
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Sapling Count *</label>
                  <input
                    type="number"
                    value={pologenForm.saplingCount}
                    onChange={e => setPologenForm(p => ({ ...p, saplingCount: e.target.value }))}
                    className="w-full text-xs border border-teal-300 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Planting Year *</label>
                  <input
                    type="number"
                    value={pologenForm.plantingYear}
                    onChange={e => setPologenForm(p => ({ ...p, plantingYear: e.target.value }))}
                    className="w-full text-xs border border-teal-300 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {assetType === 'TREE' && (
            <div className="border border-amber-200 bg-amber-50/60 rounded-xl p-3.5 space-y-3">
              <div className="font-bold text-amber-800 text-xs uppercase tracking-wider">Tree Details</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">RFID Nail Tag *</label>
                  <input
                    type="text"
                    value={treeForm.rfidTag}
                    onChange={e => setTreeForm(p => ({ ...p, rfidTag: e.target.value }))}
                    className="w-full text-xs border border-amber-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-amber-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Age (years)</label>
                  <input
                    type="number" step="0.1"
                    value={treeForm.ageYears}
                    onChange={e => setTreeForm(p => ({ ...p, ageYears: e.target.value }))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">GBH (cm)</label>
                  <input
                    type="number" step="0.5"
                    value={treeForm.gbhCm}
                    onChange={e => setTreeForm(p => ({ ...p, gbhCm: e.target.value }))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Height (m)</label>
                  <input
                    type="number" step="0.1"
                    value={treeForm.heightM}
                    onChange={e => setTreeForm(p => ({ ...p, heightM: e.target.value }))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tree Status</label>
                <select
                  value={treeForm.treeStatus}
                  onChange={e => setTreeForm(p => ({ ...p, treeStatus: e.target.value }))}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5"
                >
                  <option value="VERIFIED_HEALTHY">Verified Healthy</option>
                  <option value="INOCULATED">Inoculated</option>
                  <option value="HARVEST_AUTHORIZED">Harvest Authorized</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: GPS Geo-Tag ───────────────────────────────────────────── */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            Step 3 — GPS Geo-Tag
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              assetType === 'POLOGEN' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {assetType === 'POLOGEN' ? 'Walk POLOGEN boundary' : 'Stand at tree & lock point'}
            </span>
          </h2>

          <p className="text-xs text-slate-500">
            {assetType === 'POLOGEN'
              ? 'Walk around the perimeter of the sapling block, then lock GPS. For this demo, the system captures the centroid and derives a polygon automatically.'
              : 'Stand directly at the base of the tree and press "Lock GPS Position" to capture its exact location.'}
          </p>

          {/* GPS Acquire Card */}
          <div className={`rounded-2xl border-2 p-5 text-center space-y-4 ${
            isGpsLocked ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'
          }`}>
            {isGpsLocked && gpsCoords ? (
              <>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  <span className="font-extrabold text-emerald-800 text-base">GPS Locked</span>
                </div>
                <div className="bg-white rounded-xl border border-emerald-200 p-3 text-xs font-mono space-y-1 text-left">
                  <div className="text-slate-700"><span className="font-bold text-slate-500">LAT:</span> {gpsCoords.lat.toFixed(6)}° N</div>
                  <div className="text-slate-700"><span className="font-bold text-slate-500">LNG:</span> {gpsCoords.lng.toFixed(6)}° E</div>
                  <div className="text-emerald-700"><span className="font-bold text-slate-500">ACC:</span> ±{gpsCoords.accuracy.toFixed(1)} m (RTK Grade)</div>
                  <div className="text-slate-500"><span className="font-bold">Cluster:</span> {GPS_SAMPLE[cluster]?.label}</div>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsGpsLocked(false); setGpsCoords(null); acquireGPS(); }}
                  className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 mx-auto"
                >
                  <RefreshCw className="w-3 h-3" /> Re-acquire GPS
                </button>
              </>
            ) : (
              <>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                  isAcquiring ? 'bg-emerald-100 animate-pulse' : 'bg-slate-200'
                }`}>
                  <MapPin className={`w-8 h-8 ${isAcquiring ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
                <div className="text-sm font-bold text-slate-700">
                  {isAcquiring ? 'Acquiring GPS signal...' : 'GPS not locked'}
                </div>
                <button
                  type="button"
                  onClick={acquireGPS}
                  disabled={isAcquiring}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-extrabold text-sm disabled:opacity-60 transition mx-auto block"
                >
                  {isAcquiring ? 'Acquiring...' : assetType === 'POLOGEN' ? 'Lock POLOGEN GPS' : 'Lock Tree GPS Position'}
                </button>
              </>
            )}
          </div>

          {/* Simulated mini-map visual */}
          <div className="relative h-32 bg-gradient-to-b from-emerald-900 to-emerald-950 rounded-xl overflow-hidden border border-emerald-700">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,.1) 20px, rgba(255,255,255,.1) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,.1) 20px, rgba(255,255,255,.1) 21px)'
            }} />
            {isGpsLocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {assetType === 'POLOGEN' ? (
                    <div className="w-20 h-16 border-2 border-dashed border-teal-400 rounded-lg bg-teal-500/20 flex items-center justify-center">
                      <Sprout className="w-5 h-5 text-teal-300" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 bg-amber-400 rounded-full ring-4 ring-amber-400/30 flex items-center justify-center" />
                  )}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap">
                    {gpsCoords?.lat.toFixed(4)}°N, {gpsCoords?.lng.toFixed(4)}°E
                  </div>
                </div>
              </div>
            )}
            {!isGpsLocked && (
              <div className="absolute inset-0 flex items-center justify-center text-emerald-500 text-xs font-mono opacity-60">
                Lock GPS to preview position
              </div>
            )}
            <div className="absolute top-2 left-2 bg-black/60 text-emerald-400 text-[9px] font-mono px-2 py-0.5 rounded">
              {GPS_SAMPLE[cluster]?.label}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: Capture Image ─────────────────────────────────────────── */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-700" />
            Step 4 — Capture Field Photograph
          </h2>
          <p className="text-xs text-slate-500">
            Photograph the {assetType === 'POLOGEN' ? 'sapling grove' : 'tree trunk with RFID tag'}. The image will be watermarked with farmer details, GPS, and sealed with a Web Crypto SHA-256 hash.
          </p>

          {capturedPhoto ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md">
                <img src={capturedPhoto} alt="Field capture" className="w-full max-h-72 object-cover" />
                <div className="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> SHA-256 Sealed
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs font-mono text-emerald-800 break-all">
                <span className="font-bold text-emerald-900">SHA-256: </span>{photoHash}
              </div>
              <button
                type="button"
                onClick={() => { setCapturedPhoto(null); setPhotoHash(null); setShowCamera(true); setTimeout(() => toggleWebcam(), 300); }}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Re-take photo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setShowCamera(true); setTimeout(() => toggleWebcam(), 300); }}
              className="w-full py-10 border-2 border-dashed border-emerald-400 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <div className="font-extrabold text-emerald-800 text-sm">Open Field Camera</div>
                <div className="text-xs text-slate-500 mt-0.5">Real device camera or AR simulation with SHA-256 seal</div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* ── STEP 5: Review & Success ──────────────────────────────────────── */}
      {step === 5 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
            <h2 className="text-lg font-black text-slate-900">Successfully Submitted!</h2>
            <p className="text-sm text-slate-500">
              {assetType === 'POLOGEN' ? 'POLOGEN block' : 'Mature tree'} has been geo-tagged and attached to <strong>{selectedFarmer?.name}</strong>.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-2">
            <div className="font-bold text-slate-800">Submission Summary</div>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-slate-500">Farmer:</span> <span className="font-bold">{selectedFarmer?.name}</span></div>
              <div><span className="text-slate-500">Type:</span> <span className="font-bold">{assetType === 'POLOGEN' ? 'POLOGEN Block' : 'Individual Tree'}</span></div>
              <div><span className="text-slate-500">GPS:</span> <span className="font-mono">{gpsCoords?.lat.toFixed(5)}, {gpsCoords?.lng.toFixed(5)}</span></div>
              <div><span className="text-slate-500">Photo:</span> <span className="font-bold text-emerald-700">SHA-256 Sealed</span></div>
              {assetType === 'POLOGEN' && <div><span className="text-slate-500">Saplings:</span> <span className="font-bold">{pologenForm.saplingCount}</span></div>}
              {assetType === 'TREE' && <div><span className="text-slate-500">RFID Tag:</span> <span className="font-mono font-bold">{treeForm.rfidTag}</span></div>}
            </div>
          </div>

          {capturedPhoto && (
            <div className="relative rounded-xl overflow-hidden border border-emerald-200 h-32">
              <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetWizard}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition"
            >
              Tag Another Asset
            </button>
            {onNavigateToGisStudio && (
              <button
                type="button"
                onClick={onNavigateToGisStudio}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-4 h-4" /> View on GIS Map
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Navigation Buttons ────────────────────────────────────────────── */}
      {step < 5 && (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => step === 1 ? null : setStep(s => s - 1)}
            disabled={step === 1}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs disabled:opacity-30 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-extrabold text-xs disabled:opacity-40 flex items-center gap-1.5 transition"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed()}
              className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-extrabold text-xs disabled:opacity-40 flex items-center gap-1.5 transition"
            >
              <Check className="w-4 h-4" /> Submit & Save
            </button>
          )}
        </div>
      )}

      {/* ── Camera Modal ──────────────────────────────────────────────────── */}
      {showCamera && (
        <div className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-emerald-400 font-bold">
                  {assetType === 'POLOGEN' ? 'POLOGEN NURSERY FIELD CAMERA' : 'TREE TRUNK AR CAMERA'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => { if (videoRef.current?.srcObject) { videoRef.current.srcObject.getTracks().forEach(t => t.stop()); videoRef.current.srcObject = null; } setIsWebcamActive(false); setShowCamera(false); }}
                className="text-slate-400 hover:text-white font-bold px-2 py-0.5"
              >
                ✕ Close
              </button>
            </div>

            {/* Viewfinder */}
            <div className="relative h-72 bg-stone-950 overflow-hidden flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted
                className={`absolute inset-0 w-full h-full object-cover ${isWebcamActive ? 'block z-0' : 'hidden'}`} />
              {!isWebcamActive && (
                <div className="absolute inset-0 flex items-center justify-center z-0">
                  {assetType === 'POLOGEN' ? (
                    <div className="w-full h-full bg-gradient-to-b from-teal-950 via-emerald-950 to-stone-900 flex items-end justify-center pb-8 gap-6">
                      <div className="w-8 h-24 bg-emerald-600 rounded-t-full shadow-lg" />
                      <div className="w-10 h-32 bg-emerald-500 rounded-t-full shadow-lg" />
                      <div className="w-9 h-28 bg-teal-500 rounded-t-full shadow-lg" />
                      <div className="w-11 h-36 bg-emerald-600 rounded-t-full shadow-lg" />
                      <div className="w-8 h-20 bg-emerald-700 rounded-t-full shadow-lg" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-stone-900 via-stone-950 to-emerald-950 flex items-center justify-center">
                      <div className="w-28 h-full bg-[#3b2212] border-x-4 border-[#24150b] shadow-2xl relative">
                        <div className="absolute top-16 left-4 w-4 h-5 rounded-full bg-black border border-amber-600/80" />
                        <div className="absolute top-36 right-5 w-4 h-6 rounded-full bg-black border border-amber-600/80" />
                        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow">
                          #{treeForm.rfidTag}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Reticle */}
              <div className="relative z-10 w-52 h-52 border-2 border-emerald-400/40 rounded-2xl flex items-center justify-center pointer-events-none">
                <div className="w-7 h-7 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0" />
                <div className="w-7 h-7 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0" />
                <div className="w-7 h-7 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0" />
                <div className="w-7 h-7 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0" />
                <div className="w-3 h-3 bg-emerald-400/80 rounded-full" />
              </div>
              {/* HUD */}
              <div className="absolute top-2 left-2 bg-black/80 p-2 rounded-lg font-mono text-[9px] text-emerald-300 space-y-0.5 border border-emerald-500/30 z-20">
                <div>GROWER: {selectedFarmer?.name} ({selectedFarmer?.id})</div>
                {gpsCoords && <div>GPS: {gpsCoords.lat.toFixed(5)}°N, {gpsCoords.lng.toFixed(5)}°E</div>}
              </div>
              <div className="absolute bottom-2 left-2 bg-black/80 p-2 rounded-lg font-mono text-[9px] text-teal-300 space-y-0.5 border border-teal-500/30 z-20">
                <div>SHA-256: {cameraHash.slice(0, 24)}...</div>
                <div className="text-emerald-400">STATUS: FORENSIC STAMP READY</div>
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={toggleWebcam}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
                  isWebcamActive ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isWebcamActive ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                <span>{isWebcamActive ? 'Disable Webcam' : 'Use Real Camera'}</span>
              </button>
              <button
                type="button"
                onClick={handleSnapPhoto}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Stamped Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
