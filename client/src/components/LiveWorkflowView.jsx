import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  UserCheck, 
  MapPin, 
  Layers, 
  Compass, 
  FileCheck2, 
  Scale, 
  Boxes, 
  Flame, 
  FlaskConical, 
  QrCode, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Camera, 
  Clock, 
  AlertTriangle,
  Award,
  Hash,
  Eye,
  EyeOff,
  RefreshCw,
  Cpu
} from 'lucide-react';

export default function LiveWorkflowView({ 
  currentStep, 
  onSelectStep, 
  workflowData, 
  onUpdateStepData, 
  onAdvanceStep, 
  completedSteps,
  onResetWorkflow,
  onLoadAllSteps,
  onOpenGeoStudio
}) {
  const [photoHashSimulated, setPhotoHashSimulated] = useState(false);
  const [qrOfficerMode, setQrOfficerMode] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  const showNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // RENDER STEP 1: Farmer Portal Registration
  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          Farmer Self-Registration & Homestead Declaration
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The grower registers on the NERAMAC portal. The Farmer ID is internal to NERAMAC and cryptographically isolated.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Grower Full Name:</label>
            <input 
              type="text" 
              value={workflowData.farmer?.fullName || "Bhaben Saikia"} 
              onChange={(e) => onUpdateStepData('farmer', { fullName: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Father's / Spouse Name:</label>
            <input 
              type="text" 
              value={workflowData.farmer?.fatherName || "Late Hemanta Saikia"} 
              onChange={(e) => onUpdateStepData('farmer', { fatherName: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Cluster Location:</label>
            <select 
              value={workflowData.farmer?.cluster || "Golaghat, Assam"}
              onChange={(e) => onUpdateStepData('farmer', { cluster: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Golaghat, Assam">Golaghat Cluster (Assam)</option>
              <option value="Kadamtala, Tripura">Kadamtala Cluster (North Tripura)</option>
            </select>
          </div>
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Village & Mouza:</label>
            <input 
              type="text" 
              value={workflowData.farmer?.village || "Dhekial Gaon, Mouza Dhekial"} 
              onChange={(e) => onUpdateStepData('farmer', { village: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Land Holding Reference (Dag / Patta):</label>
            <input 
              type="text" 
              value={workflowData.farmer?.dagNumber || "Dag 182, Patta 44"} 
              onChange={(e) => onUpdateStepData('farmer', { dagNumber: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Estimated Standing Trees:</label>
            <input 
              type="number" 
              value={workflowData.farmer?.estimatedTrees || 1420} 
              onChange={(e) => onUpdateStepData('farmer', { estimatedTrees: parseInt(e.target.value) })}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
          <input 
            type="checkbox" 
            checked={true} 
            readOnly 
            className="rounded text-emerald-500 mt-0.5"
          />
          <span>
            Grower Consent: I hereby register my agarwood plantation under the NERAMAC Traceability Scheme.
          </span>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Current Status: <span className="text-emerald-400 font-semibold">APPLICATION READY FOR SUBMISSION</span>
          </div>

          <button
            onClick={() => {
              showNotice("Farmer Application lodged! Forwarded to Field Agent for on-ground verification.");
              onAdvanceStep(1);
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold text-xs shadow-lg transition flex items-center gap-2"
          >
            <span>Submit Registration Application</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // RENDER STEP 2: Field Agent Verification & Geo-Pinning
  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Compass className="w-4 h-4 text-teal-400" />
          NERAMAC Field Agent Inspection & Homestead Geo-Pinning
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The assigned field agent visits the farmer in the field with an offline-capable mobile device. The agent verifies tenure, captures satellite coordinates of the homestead, and computes a camera-buffer SHA-256 photo hash.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
          <div>
            <span className="text-slate-600 block text-[10px] uppercase font-bold">Assigned Field Agent:</span>
            <span className="font-bold text-slate-900 text-sm">Sri Arup Borah (FA-ARUP-BORAH)</span>
          </div>
          <span className="px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 font-mono text-[11px] border border-teal-500/30">
            Device: Rugged Android #AG-09
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block">Homestead GPS Coordinates:</span>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-emerald-300 font-bold text-sm">26.5182° N, 93.9723° E</span>
            </div>
            <span className="text-slate-600 text-[11px] block">GNSS Positional Accuracy: ±2.1 meters (Within 5m tolerance)</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block">In-App Photographic Hash (SHA-256):</span>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-teal-400" />
              <span className="font-mono text-teal-300 text-[11px] truncate">7d4a2f8c5b9e1a3d6f0c8e2b4a7d...</span>
            </div>
            <span className="text-emerald-400 text-[11px] block">✓ Hashed in camera RAM prior to compression (anti-tamper)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Authoritative Identity Issued:</span>
            <span className="font-mono text-lg font-bold text-slate-900">FRM-GH-0104</span>
            <span className="text-slate-700 block text-[11px] mt-0.5">Root of Traceability Chain Established</span>
          </div>

          <button
            onClick={() => {
              showNotice("Farmer Verified! Authoritative ID FRM-GH-0104 issued.");
              onAdvanceStep(2);
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold text-xs shadow-lg transition flex items-center gap-2"
          >
            <span>Confirm & Proceed to Plantation Survey</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // RENDER STEP 3: Plantation Boundary & The 7-Year Age Rule
  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Plantation Boundary Walking & The 7-Year Age Rule
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          RFP Section 3.2: The field agent walks the plot boundary. Plantings <strong>below 7 years</strong> are registered collectively as a <strong>POLOGEN</strong>. Trees <strong>7 years or older</strong> are individually geo-pinned with individual <strong>Tree Identities (TRE)</strong>.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-slate-600 text-[10px] uppercase font-bold">Plantation Holding Identity:</span>
            <span className="font-mono text-base font-bold text-slate-900 block">PLT-GH-0104-A</span>
            <span className="text-slate-700 text-[11px]">Saikia Heritage Holding • 2.45 Hectares • 8 Boundary Vertices Captured</span>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] border border-emerald-500/30">
            0% Overlap Detected (Cleared)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Young Block (< 7 yrs) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-blue-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-300">POLOGEN Block (&lt; 7 Years)</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">PLG-GH-0104-B3</span>
            </div>
            <p className="text-slate-700 text-[11px]">
              Planted in 2021 (Age: 5.2 yrs). 480 trees managed collectively. Closed polygon of 4,850 m².
            </p>
            <span className="text-slate-600 text-[10px] block">Status: Traced collectively until 7-year maturity.</span>
          </div>

          {/* Mature Tree (>= 7 yrs) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300">Mature Tree Individual Pin (≥ 7 Years)</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">TRE-GH-0104-0089</span>
            </div>
            <p className="text-slate-700 text-[11px]">
              Planted in 2015 (Age: 11.4 yrs). Point GPS: 26.5204° N, 93.9743° E. Tag #AS-GLG-TAG-8941 affixed.
            </p>
            <span className="text-amber-400 text-[10px] block">Status: Individually tagged & eligible for inoculation.</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          {onOpenGeoStudio && (
            <button
              onClick={onOpenGeoStudio}
              type="button"
              className="px-3.5 py-2 rounded-xl bg-teal-950/60 hover:bg-teal-900/80 text-teal-300 border border-teal-500/50 font-bold text-xs transition flex items-center gap-2"
            >
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>Launch Interactive Geo-Tagging & POLOGEN Studio</span>
            </button>
          )}

          <button
            onClick={() => {
              showNotice("Plantation & Tree Identities recorded under the 7-year age rule!");
              onAdvanceStep(3);
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold text-xs shadow-lg transition flex items-center gap-2 ml-auto"
          >
            <span>Proceed to Inoculation Logging</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // RENDER STEP 4: Inoculation Event Logging
  const renderStep4 = () => (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-purple-400" />
          Menu-Driven Inoculation Capture & SHA-256 Photo
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Field agent logs the biological intervention on tree <strong>TRE-GH-0104-0089</strong> using controlled master menus. A post-operation photo is captured with an embedded SHA-256 hash.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Target Tree Identity:</label>
            <input 
              type="text" 
              value="TRE-GH-0104-0089 (Tag: AS-GLG-TAG-8941)" 
              readOnly 
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg p-2.5 text-emerald-400 font-mono font-bold"
            />
          </div>
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Inoculation Method:</label>
            <select className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500">
              <option>Drilling & Fungal Suspension Induction</option>
              <option>Mechanical Wounding & Aerobic Induction</option>
              <option>Formulated Kit-Based Inoculation</option>
            </select>
          </div>
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Inoculant Compound & Strain:</label>
            <input 
              type="text" 
              value="BioOud Fungal Strain ASM-4 (Fusarium consortium)" 
              readOnly 
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Compound Batch & Supplier:</label>
            <input 
              type="text" 
              value="Batch #BAT-BIO-2023-094 • Assam Agri-Tech BioSolutions Ltd" 
              readOnly 
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="font-bold text-slate-900 block">Post-Inoculation Tree Photo Capture:</span>
            <span className="font-mono text-purple-300 text-[11px] block">
              SHA-256: 3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c
            </span>
            <span className="text-slate-600 text-[10px]">Photo locked with device time & GPS coordinates.</span>
          </div>

          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-[11px]">
            INO-GH-2023-0182
          </span>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              showNotice("Inoculation Event registered and linked to tree history!");
              onAdvanceStep(4);
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold text-xs shadow-lg transition flex items-center gap-2"
          >
            <span>Proceed to Harvest Application</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // RENDER STEP 5: Farmer Applies for Harvest Authorisation
  const renderStep5 = () => (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-amber-400" />
          Grower Harvest Authorisation Application to DFO
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The farmer applies through the system to the <strong>Divisional Forest Officer (DFO)</strong> for felling sanction. The platform compiles verified tree age (11.4 yrs) and inoculation maturity (3 yrs) into a statutory verification file.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Applying Farmer:</label>
            <input 
              type="text" 
              value="Bhaben Saikia (FRM-GH-0104)" 
              readOnly 
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Target Forest Division:</label>
            <input 
              type="text" 
              value="Golaghat Forest Division, Assam" 
              readOnly 
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg p-2.5 text-amber-300 font-semibold"
            />
          </div>
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Trees Requested for Felling:</label>
            <input 
              type="text" 
              value="2 Trees (TRE-GH-0104-0089 & TRE-GH-0104-0090)" 
              readOnly 
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Estimated Wood Weight (kg):</label>
            <input 
              type="number" 
              value={180} 
              readOnly 
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
          <span className="font-bold text-slate-900 block">NERAMAC Pre-Submission Automated Checks:</span>
          <div className="text-[11px] text-emerald-400">✓ Tree Age &gt; 7.0 Years Confirmed (11.4 Yrs)</div>
          <div className="text-[11px] text-emerald-400">✓ Inoculation Maturation Period (36 Months) Complete</div>
          <div className="text-[11px] text-emerald-400">✓ No Active Conflicting Quota on Plantation Plot PLT-GH-0104-A</div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              showNotice("Application submitted! Docket forwarded to Divisional Forest Officer.");
              onAdvanceStep(5);
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold text-xs shadow-lg transition flex items-center gap-2"
          >
            <span>Submit to DFO for Statutory Decision</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // RENDER STEP 6: DFO & Maker-Checker Statutory Scrutiny
  const renderStep6 = () => (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-amber-400" />
          Divisional Forest Officer (DFO) Statutory Order & Maker-Checker
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          RFP Section 2.6: Harvest authorization is issued by the DFO under the State Forest Act, <strong>not by NERAMAC</strong>. A NERAMAC Maker-Checker officer verifies the signed DFO order against the application before field harvest can proceed.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-amber-300 block">DFO Statutory Sanction:</span>
            <div>DFO Officer: <span className="font-semibold text-slate-900">Sri K. N. Sarma, IFS (Golaghat)</span></div>
            <div>Order No: <span className="font-mono text-emerald-400">FD/GLG/AGAR/FELLING/2026/918</span></div>
            <div>Sanctioned Limit: <span className="font-semibold text-slate-900">Up to 200.0 kg from 2 trees</span></div>
            <div className="truncate text-slate-600 text-[10px]">PDF Order Hash: fa71b96a84d293f0b263b65ef319087...</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-teal-300 block">NERAMAC Maker-Checker Verification:</span>
            <div>Checker Officer: <span className="font-semibold text-slate-900">Smt. P. Kalita (Senior Officer)</span></div>
            <div>Scrutiny: <span className="text-emerald-400 font-semibold">MATCHES SIGNED DFO SEAL</span></div>
            <div>Statutory Permit ID: <span className="font-mono text-emerald-400">PMT-DFO-GLG-918</span></div>
            <span className="text-emerald-400 text-[10px] block">✓ Verified & Locked into Tamper-Evident Ledger</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              showNotice("DFO Statutory Order verified & active! Field harvest unlocked.");
              onAdvanceStep(6);
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold text-xs shadow-lg transition flex items-center gap-2"
          >
            <span>Activate Harvest Permit & Proceed to Felling</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // RENDER STEP 7: Harvest Batch Creation & Scale Weighing
  const renderStep7 = () => (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Scale className="w-4 h-4 text-rose-400" />
          Field Harvest Execution & Precision Weighment
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Field agent supervises felling of trees TRE-89 & TRE-90. Material is weighed on a certified digital scale, stump photos are hashed, and Harvest Batch label <strong>HBT-GH-2026-0041</strong> is printed.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-600 text-[10px] uppercase font-bold">Gross Scale Weight:</span>
            <span className="text-lg font-mono font-bold text-slate-900 block mt-0.5">196.4 kg</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-600 text-[10px] uppercase font-bold">Tare Weight (6 Bags):</span>
            <span className="text-lg font-mono font-bold text-slate-700 block mt-0.5">11.0 kg</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-emerald-500/40">
            <span className="text-emerald-400 text-[10px] uppercase font-bold">Net Harvested Wood:</span>
            <span className="text-lg font-mono font-bold text-emerald-400 block mt-0.5">185.4 kg</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="font-mono text-emerald-300 font-bold text-sm">HBT-GH-2026-0041</span>
            <span className="text-slate-600 block text-[11px]">Harvested from TRE-GH-0104-0089 & 0090 • High-Resin Heartwood</span>
          </div>
          <span className="px-3 py-1 rounded bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-300">
            Avery Hook Scale #SC-8812
          </span>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              showNotice("Harvest Batch created! Ready for transit to aggregation depot.");
              onAdvanceStep(7);
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold text-xs shadow-lg transition flex items-center gap-2"
          >
            <span>Dispatch to Aggregation Depot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // RENDER STEP 8: Movement & Tolerance Check
  const renderStep8 = () => (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Truck className="w-4 h-4 text-cyan-400" />
          Movement Custody Transfer & 1.5% Weight Tolerance Check
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          RFP Section 2.7: Paired dispatch and receipt. The aggregation depot operator weighs the consignment upon arrival. The system compares transit variance against the <strong>1.5% statutory tolerance</strong>.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-600 uppercase font-bold text-[10px]">Dispatch from Farm Gate:</span>
            <div className="font-mono text-sm font-bold text-slate-900">185.4 kg (Dispatch)</div>
            <div className="text-slate-700">Vehicle: AS-05-C-7281 • Transit Pass: TP/GLG/2026/0441</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-600 uppercase font-bold text-[10px]">Depot Gate Receipt:</span>
            <div className="font-mono text-sm font-bold text-emerald-400">184.8 kg (Arrival)</div>
            <div className="text-slate-700">Variance: -0.6 kg (-0.32% moisture adjustment)</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
          <div>
            <span className="text-emerald-400 font-bold text-sm block">Tolerance Check: PASSED</span>
            <span className="text-slate-700 text-[11px]">Variance (-0.32%) is well within approved 1.5% limit. Custody accepted into Depot #4.</span>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
            MOV-2026-0182
          </span>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              showNotice("Movement confirmed within tolerance! Ready for lot pooling.");
              onAdvanceStep(8);
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold text-xs shadow-lg transition flex items-center gap-2"
          >
            <span>Pool into Aggregation Lot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // RENDER STEP 9: Consignment Aggregation
  const renderStep9 = () => (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Boxes className="w-4 h-4 text-teal-400" />
          Depot Consignment Pooling & Parent-Child Genealogy
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The aggregator pools 3 verified harvest batches from registered Golaghat farms into a single 620 kg lot for the Common Processing Centre (CPC). The system maintains multi-parent genealogy.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-slate-600 text-[10px] uppercase font-bold">Aggregation Lot ID:</span>
            <span className="font-mono text-base font-bold text-slate-900 block">AGG-GH-2026-0018</span>
            <span className="text-slate-700 text-[11px]">Total Pooled Wood: 620.0 kg • Storage Bin: BIN-C-04</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[11px] border border-teal-500/30">
            3 Farm Batches Pooled
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-slate-600 font-semibold uppercase text-[10px]">Contributing Parent Batches:</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-slate-700 font-mono text-[11px]">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">HBT-GH-2026-0041: 184.8 kg (Bhaben Saikia)</div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">HBT-GH-2026-0039: 215.2 kg (Deben Dutta)</div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">HBT-GH-2026-0040: 220.0 kg (Mridul Gogoi)</div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              showNotice("Aggregation Lot formed! Ready for CPC hydro-distillation.");
              onAdvanceStep(9);
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold text-xs shadow-lg transition flex items-center gap-2"
          >
            <span>Transfer to CPC Distillation Stills</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // RENDER STEP 10: CPC Distillation & Mass Balance
  const renderStep10 = () => (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Flame className="w-4 h-4 text-purple-400" />
          CPC Hydro-Distillation & Mass Balance Reconciliation
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The 620 kg of wood is chipped and charged into Still #03 at Common Processing Centre #1. After 108 hours of steam extraction, exact material balance is logged. Crude oil is quarantined pending laboratory release.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-600 text-[10px] uppercase font-bold">Wood Charged:</span>
            <span className="text-base font-mono font-bold text-slate-900 block mt-0.5">620.0 kg</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-emerald-500/40">
            <span className="text-emerald-400 text-[10px] uppercase font-bold">Pure Oud Oil Extracted:</span>
            <span className="text-base font-mono font-bold text-emerald-400 block mt-0.5">1,480 ml</span>
            <span className="text-[10px] text-slate-600">(0.239% recovery)</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-600 text-[10px] uppercase font-bold">Hydrosol Water:</span>
            <span className="text-base font-mono font-bold text-cyan-300 block mt-0.5">18.5 Litres</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-600 text-[10px] uppercase font-bold">Spent Biomass Residue:</span>
            <span className="text-base font-mono font-bold text-amber-300 block mt-0.5">570.2 kg</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-purple-50 border border-purple-300 flex items-center justify-between">
          <div>
            <span className="font-mono text-purple-300 font-bold text-sm">DST-CPC-2026-0007</span>
            <span className="text-slate-700 block text-[11px]">Material Balance Reconciled • Currently in QUARANTINE pending lab tests</span>
          </div>
          <span className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
            QUARANTINED
          </span>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              showNotice("Distillation complete! Sealed sample sent to NABL lab.");
              onAdvanceStep(10);
            }}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-slate-900 font-bold text-xs shadow-lg transition flex items-center gap-2"
          >
            <span>Send Sample for Laboratory Release</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // RENDER STEP 11: NABL Laboratory Release
  const renderStep11 = () => (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-emerald-400" />
          NABL Laboratory GC-MS Testing & CITES Species Confirmation
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Accredited lab performs GC-MS chromatographic profiling, specific gravity, and wood-anatomy confirmation. Only released oil can be serialized and bottled.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-900 block">NERAMAC Regional Testing Laboratory (NABL TC-8491)</span>
            <span className="text-slate-600 text-[11px]">CoA Reference: LAB/AGAR/QC/2026/0582 • Analyst: Dr. Ananya Roy, PhD</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[11px] border border-emerald-500/30">
            LAB-NER-2026-0089
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-600 uppercase text-[10px] font-bold">Agarospirol Purity:</span>
            <span className="text-base font-bold text-emerald-400 block mt-0.5">18.42% (Grade A+)</span>
            <span className="text-[10px] text-slate-600">Min Benchmark: 12.0%</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-600 uppercase text-[10px] font-bold">Synthetic Adulteration:</span>
            <span className="text-base font-bold text-emerald-400 block mt-0.5">0.0% (NIL DETECTED)</span>
            <span className="text-[10px] text-slate-600">DOP, Mineral Oils: Zero</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-600 uppercase text-[10px] font-bold">CITES Species Check:</span>
            <span className="text-base font-bold text-emerald-400 block mt-0.5">100% Monospecific</span>
            <span className="text-[10px] text-slate-600">Aquilaria malaccensis Lam.</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
          <span className="font-bold text-emerald-300">Quarantine Status: LIFTED (OFFICIAL QUALITY RELEASE)</span>
          <span className="font-mono text-[10px] text-slate-700">Order: QC-REL-2026-0089</span>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              showNotice("Batch released! Sent to clean-room packaging.");
              onAdvanceStep(11);
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold text-xs shadow-lg transition flex items-center gap-2"
          >
            <span>Authorize Packaging & Serialization</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // RENDER STEP 12: Packaging & Tamper-Evident QR Code
  const renderStep12 = () => (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <QrCode className="w-4 h-4 text-emerald-400" />
          Finished Goods Packaging & Serialized Cryptographic QR Code
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The released oil is bottled into 12 ml crystal flacons. The system generates a serialized Pack ID (<strong>PCK-AS-2026-0042</strong>) with a cryptographically signed QR code resolving to the NERAMAC official trust domain.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-emerald-400">Pack Identity Issued:</span>
            <span className="font-mono text-xl font-bold text-slate-900 block">PCK-AS-2026-0042</span>
            <div className="text-slate-700">Heritage Assam Oud Oil (12 ml Flacon) • Serial: 0042 / 120</div>
            <div className="text-slate-700">Tamper Seal: <span className="font-mono text-emerald-300">NER-TE-SEAL-88912</span></div>
            <div className="font-mono text-[10px] text-teal-400 truncate max-w-md">
              Crypto Sig: SHA256:8f4c2e1a9b3d5c7e0f2a4b6c8d0e1f3a5b7c9d1e...
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl shadow-lg ring-2 ring-emerald-500/40">
            <QRCodeSVG value={typeof window !== 'undefined' ? `${window.location.origin}/traceability?batch=PCK-AS-2026-0042` : "https://trace.neramac.gov.in/verify/PCK-AS-2026-0042"} size={120} />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              showNotice("Pack sealed and QR generated! Ready for export lot assembly.");
              onAdvanceStep(12);
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold text-xs shadow-lg transition flex items-center gap-2"
          >
            <span>Consolidate into Export Shipment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // RENDER STEP 13: Export Shipment & Customs Clearance
  const renderStep13 = () => (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Truck className="w-4 h-4 text-violet-400" />
          Export Consignment & CITES Clearance Dispatch
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          120 flacons are assembled into commercial Export Batch <strong>EBT-NER-2026-0012</strong> and shipment lot <strong>ELT-GAU-EXP-2026-003</strong>. CITES Appendix II permits and customs airway bills are bound to the shipment.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-violet-300 block">International Consignment Details:</span>
            <div>Consignee: <span className="font-semibold text-slate-900">Al-Majed Fragrance Holdings, Dubai, UAE</span></div>
            <div>Airway Bill: <span className="font-mono text-emerald-400">AWB-618-9941-2041</span></div>
            <div>Customs Shipping Bill: <span className="font-mono text-slate-900">SB/GAU/AIR/2026/89410</span></div>
            <div>Departure: <span className="text-slate-700">Air Cargo Complex Guwahati (GAU)</span></div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-amber-300 block">Statutory Clearance Documentation:</span>
            <div>CITES Permit: <span className="font-mono text-emerald-400">CITES/IND/AGAR/2026/NER-041</span></div>
            <div>DGFT Export Authorization: <span className="font-mono text-slate-900">DGFT/EXP/AGAR/2026/182</span></div>
            <div>Phytosanitary Cert: <span className="text-emerald-400 font-semibold">PSC/NER/2026/041 (CLEARED)</span></div>
            <span className="text-emerald-400 text-[10px] block">✓ Complete Export File Verified by WCCB & Customs</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              showNotice("Export dispatched! Proceed to Buyer QR Verification.");
              onAdvanceStep(13);
            }}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-slate-900 font-bold text-xs shadow-lg transition flex items-center gap-2"
          >
            <span>Proceed to Buyer Smartphone QR Verification</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // RENDER STEP 14: Buyer QR Scan & Verified Provenance
  const renderStep14 = () => (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Buyer Smartphone Scan & Verified Provenance Claim
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The international buyer in Dubai scans the QR code on the bottle. The system returns the authentic provenance view while <strong>protecting personal grower phone and exact residential coordinates</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smartphone Frame */}
        <div className="bg-white border-2 border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center">
          <div className="w-20 h-3 bg-slate-200 rounded-full mb-4"></div>
          
          <div className="p-3 bg-white rounded-xl shadow ring-4 ring-emerald-500/20 mb-3">
            <QRCodeSVG value={typeof window !== 'undefined' ? `${window.location.origin}/traceability?batch=PCK-AS-2026-0042` : "https://trace.neramac.gov.in/verify/PCK-AS-2026-0042"} size={130} />
          </div>

          <span className="font-mono text-emerald-400 font-bold text-xs">PCK-AS-2026-0042</span>
          <span className="text-[10px] text-slate-600 mt-1">Heritage Assam Oud Oil (12ml)</span>

          <div className="w-full mt-4 pt-3 border-t border-slate-200 text-left text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Scan Status:</span>
              <span className="text-emerald-400 font-bold">AUTHENTICATED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">GI Origin:</span>
              <span className="text-slate-900">Assam, India</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Authority:</span>
              <span className="text-slate-900">NERAMAC Ltd</span>
            </div>
          </div>
        </div>

        {/* Provenance Certificate Display */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950/50 border border-emerald-500/40 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h4 className="text-base font-bold text-slate-900">Government Certified Provenance Certificate</h4>
              <span className="text-emerald-400 text-[11px]">Ministry of Development of North Eastern Region</span>
            </div>
            <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase text-[10px] border border-emerald-500/40">
              ✓ CITES Legal Origin
            </span>
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">Sustainable Cultivation Origin:</span>
                <span className="text-slate-700 text-[11px]">Registered Homestead Agroforest, Golaghat District, Assam (11.4 Years Cultivated)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">Statutory Forest Sanction:</span>
                <span className="text-slate-700 text-[11px]">Harvested legally under Divisional Forest Officer Order Ref: FD/GLG/2026/918</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <FlaskConical className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">NABL Accredited Purity Profile:</span>
                <span className="text-slate-700 text-[11px]">18.42% Agarospirol • 0% Synthetic Adulteration • Confirmed Monospecific Aquilaria malaccensis</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600">
            <strong className="text-slate-200">Privacy Protection Note:</strong> Smallholder farmer personal telephone numbers and precise cadastral home GPS coordinates are redacted to safeguard grower privacy while assuring 100% legal authenticity.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-slate-900 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Banner with Quick Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Interactive End-to-End Operational Workflow
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Step-by-step execution from Farmer Registration to Final Buyer QR Verification.
          </p>
        </div>

        {/* Demo Fast-forward & Reset Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onLoadAllSteps();
              showNotice("All 14 operational steps loaded and verified!");
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete All Steps</span>
          </button>

          <button
            onClick={() => {
              onResetWorkflow();
              showNotice("Workflow reset back to Step 1 (Farmer Registration)!");
            }}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 border border-slate-300 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Flow</span>
          </button>
        </div>
      </div>

      {/* Step Render Dispatcher */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
      {currentStep === 5 && renderStep5()}
      {currentStep === 6 && renderStep6()}
      {currentStep === 7 && renderStep7()}
      {currentStep === 8 && renderStep8()}
      {currentStep === 9 && renderStep9()}
      {currentStep === 10 && renderStep10()}
      {currentStep === 11 && renderStep11()}
      {currentStep === 12 && renderStep12()}
      {currentStep === 13 && renderStep13()}
      {currentStep === 14 && renderStep14()}

      {/* Bottom Step Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between text-xs">
        <button
          onClick={() => onSelectStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-semibold transition flex items-center gap-1.5 border border-slate-300 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </button>

        <span className="font-mono text-slate-600">
          Step {currentStep} of 14
        </span>

        <button
          onClick={() => onSelectStep(Math.min(14, currentStep + 1))}
          disabled={currentStep === 14}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-900 font-semibold transition flex items-center gap-1.5"
        >
          <span>Next Step</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
