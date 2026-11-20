import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Award, 
  CheckCircle, 
  FileText, 
  Sparkles, 
  ExternalLink,
  Info,
  Layers,
  FlaskConical,
  Eye,
  EyeOff,
  MapPin,
  Calendar,
  CheckCircle2,
  TreePine,
  Scale,
  Flame,
  Truck,
  Copy,
  Check
} from 'lucide-react';

export default function QRVerificationPortal({ chainData, translations }) {
  const [activeTab, setActiveTab] = useState('PROVENANCE'); // 'PROVENANCE' | 'TIMELINE' | 'LAB_COA' | 'OFFICER'
  const [copiedLink, setCopiedLink] = useState(false);
  const packId = "PCK-AS-2026-0042";

  // Compute live verification URL based on current host
  const [resolverUrl, setResolverUrl] = useState(`http://localhost:5000/verify/${packId}`);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setResolverUrl(`${window.location.origin}/verify/${packId}`);
    }
  }, [packId]);

  const copyResolverUrl = () => {
    navigator.clipboard.writeText(resolverUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const c = chainData || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Authentic QR Verification & Traceability Portal
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              RFP Section 2.3 & 3.2: Scannable serialized QR code resolving genuine provenance from plantation to consumer flacon with statutory DPDP Act privacy masking.
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex flex-wrap items-center bg-slate-950 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('PROVENANCE')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'PROVENANCE'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-600 hover:text-white'
              }`}
            >
              Provenance Certificate
            </button>
            <button
              onClick={() => setActiveTab('TIMELINE')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'TIMELINE'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-600 hover:text-white'
              }`}
            >
              Full Traceability Chain
            </button>
            <button
              onClick={() => setActiveTab('LAB_COA')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'LAB_COA'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-600 hover:text-white'
              }`}
            >
              NABL GC-MS Certificate
            </button>
            <button
              onClick={() => setActiveTab('OFFICER')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'OFFICER'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-600 hover:text-white'
              }`}
            >
              Officer Audit (Unmasked)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Physical QR Badge & Scan Card (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center justify-between space-y-4">
          <div className="w-full flex flex-col items-center">
            {/* Government Seal Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 text-[11px] font-semibold mb-3">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>NERAMAC Certified GI Provenance</span>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl shadow-2xl ring-4 ring-emerald-500/30 relative group">
              <QRCodeSVG
                value={resolverUrl}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="mt-4 font-mono text-xs text-slate-700 w-full">
              <span className="text-slate-600 block text-[10px] uppercase font-bold">Serialised Pack ID:</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{packId}</span>
            </div>

            <p className="text-[11px] text-slate-600 mt-2 max-w-xs leading-relaxed">
              Scan with your smartphone camera to load authentic provenance details on your mobile screen.
            </p>

            {/* Copy / Direct URL link */}
            <div className="mt-3 w-full">
              <button
                onClick={copyResolverUrl}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-700 font-mono text-[11px] transition flex items-center justify-center gap-2 truncate"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Link Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span className="truncate">{resolverUrl}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Product Physical Packaging Specs */}
          <div className="w-full pt-4 border-t border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Product:</span>
              <span className="text-slate-800 font-medium">Assam Oud Oil (12 ml)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Grade Benchmark:</span>
              <span className="text-emerald-400 font-bold">Grade A+ (Premium Pure)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tamper Seal ID:</span>
              <span className="font-mono text-emerald-800">NER-TE-SEAL-88912</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Packaging Date:</span>
              <span className="text-slate-200">2026-07-18</span>
            </div>
          </div>
        </div>

        {/* Right Column: Traceability Details View (8 Cols) */}
        <div className="lg:col-span-8">
          {/* TAB 1: PROVENANCE CERTIFICATE (PUBLIC BUYER) */}
          {activeTab === 'PROVENANCE' && (
            <div className="bg-white border-2 border-emerald-600/30 rounded-2xl p-6 shadow-sm space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Official Certificate of Traceability & Origin
                    </h3>
                    <span className="text-xs text-emerald-400 font-medium">
                      North Eastern Regional Agricultural Marketing Corporation Ltd (Govt of India Enterprise)
                    </span>
                  </div>
                </div>

                <span className="text-[11px] px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-800 border border-emerald-500/40 font-bold uppercase">
                  ✓ Verified Authentic
                </span>
              </div>

              {/* Core Claims Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <TreePine className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">Botanical Species:</span>
                  </div>
                  <p className="text-emerald-800 font-mono font-bold text-sm">Aquilaria malaccensis Lam.</p>
                  <span className="text-slate-600 text-[11px] block">CITES Appendix II Certified Monospecific Agarwood</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">Geographical Origin:</span>
                  </div>
                  <p className="text-slate-900 font-bold text-sm">Golaghat Cluster, Assam, India</p>
                  <span className="text-slate-600 text-[11px] block">Protected Geographical Indication (GI) Zone</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white">Statutory Felling Sanction:</span>
                  </div>
                  <p className="text-amber-800 font-mono font-bold text-sm">FD/GLG/AGAR/FELLING/2026/918</p>
                  <span className="text-slate-600 text-[11px] block">Issued by Divisional Forest Officer (DFO), Assam</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-teal-400" />
                    <span className="font-bold text-white">NABL GC-MS Purity:</span>
                  </div>
                  <p className="text-teal-800 font-bold text-sm">18.42% Agarospirol (0% Adulteration)</p>
                  <span className="text-slate-600 text-[11px] block">NABL Accredited Chemical Profiling Passed</span>
                </div>
              </div>

              {/* Source Farmer Provenance (with DPDP Masking) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] text-slate-600 uppercase font-bold block">
                  Smallholder Grower & Plantation Provenance:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Registered Grower:</span>
                    <span className="font-bold text-white">Bhaben Saikia</span>
                    <span className="text-[10px] font-mono text-emerald-400 block">ID: FRM-GH-0104</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Homestead Village:</span>
                    <span className="font-bold text-white">Dhekial Gaon, Golaghat</span>
                    <span className="text-[10px] text-slate-600 block">Assam Agroforestry Belt</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Tree Inoculation:</span>
                    <span className="font-bold text-white">BioOud Fungal ASM-4</span>
                    <span className="text-[10px] text-slate-600 block">11.4 Yr Mature Tree</span>
                  </div>
                </div>
              </div>

              {/* DPDP Act 2023 Statutory Privacy Protection Notice */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
                <Lock className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] leading-relaxed">
                  <strong className="text-slate-200">Statutory DPDP Act 2023 Privacy Notice:</strong> In compliance with the Digital Personal Data Protection Act, 2023, farmer residential telephone numbers, exact cadastral parcel coordinates, and factory commercial conversion costs are masked to prevent smallholder exploitation while ensuring 100% legal traceability.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: UNBROKEN 15-IDENTITY JOURNEY TIMELINE */}
          {activeTab === 'TIMELINE' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Source-to-Flacon Traceability Timeline (RFP Section 3.2)
                </h3>
                <span className="text-slate-500 font-mono text-[11px]">Pack Serial: {packId}</span>
              </div>

              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-300">
                {/* 1. Farmer Registration */}
                <div className="relative flex items-start gap-3 pl-8">
                  <span className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex-shrink-0" />
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 w-full space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">[FRM-GH-0104] Farmer Homestead Registration</span>
                      <span className="font-mono text-emerald-400 text-[10px]">2026-04-12</span>
                    </div>
                    <p className="text-slate-700 text-[11px]">
                      Bhaben Saikia registered at Dhekial Gaon, Golaghat. Geo-pinned by NERAMAC Field Agent Arup Borah.
                    </p>
                  </div>
                </div>

                {/* 2. Plantation & Tree */}
                <div className="relative flex items-start gap-3 pl-8">
                  <span className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-teal-500 border-2 border-slate-900 flex-shrink-0" />
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 w-full space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">[TRE-GH-0104-0089] Mature Tree Point Geo-Pinning</span>
                      <span className="font-mono text-teal-400 text-[10px]">Tag: AS-GLG-TAG-8941</span>
                    </div>
                    <p className="text-slate-700 text-[11px]">
                      Planted in 2015 (Age: 11.4 yrs). GPS: 26.5204° N, 93.9743° E. GBH: 64.5 cm. In-app photo SHA-256 hashed.
                    </p>
                  </div>
                </div>

                {/* 3. Inoculation */}
                <div className="relative flex items-start gap-3 pl-8">
                  <span className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-slate-900 flex-shrink-0" />
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 w-full space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">[INO-GH-2023-0182] Artificial Inoculation Event</span>
                      <span className="font-mono text-purple-400 text-[10px]">Batch: BIO-TRICHO-B9</span>
                    </div>
                    <p className="text-slate-700 text-[11px]">
                      Drilling and fungal induction using BioOud strain consortium. 36 induction points sealed.
                    </p>
                  </div>
                </div>

                {/* 4. DFO Sanction & Harvest */}
                <div className="relative flex items-start gap-3 pl-8">
                  <span className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-slate-900 flex-shrink-0" />
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 w-full space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">[HAU/HBT] DFO Felling Sanction & Certified Weighment</span>
                      <span className="font-mono text-amber-400 text-[10px]">Order: FD/GLG/2026/918</span>
                    </div>
                    <p className="text-slate-700 text-[11px]">
                      DFO approved with NERAMAC Maker-Checker verification. Harvest batch net weight: 185.4 kg on calibrated scale.
                    </p>
                  </div>
                </div>

                {/* 5. Transit & Distillation */}
                <div className="relative flex items-start gap-3 pl-8">
                  <span className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-slate-900 flex-shrink-0" />
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 w-full space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">[MOV/DST] Aggregation & CPC Hydro-Distillation</span>
                      <span className="font-mono text-blue-400 text-[10px]">Variance: -0.32% (≤1.5%)</span>
                    </div>
                    <p className="text-slate-700 text-[11px]">
                      Pooled at Depot #4, charged in Still-03 at Golaghat CPC. Mass balance: 620 kg wood produced 1,480 ml pure oil.
                    </p>
                  </div>
                </div>

                {/* 6. Packaging & QR */}
                <div className="relative flex items-start gap-3 pl-8">
                  <span className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 flex-shrink-0" />
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-400 w-full space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-emerald-800">[PCK] Finished Serialization & Tamper Seal</span>
                      <span className="font-mono text-emerald-400 text-[10px]">{packId}</span>
                    </div>
                    <p className="text-slate-700 text-[11px]">
                      12 ml flacon filled, sealed with UV hologram #NER-TE-SEAL-88912, and cryptographically verified.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NABL LAB GC-MS QUALITY CERTIFICATE */}
          {activeTab === 'LAB_COA' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-400" />
                    NABL Certificate of Analysis (CoA)
                  </h3>
                  <span className="text-[11px] text-slate-600">
                    Testing Report Ref: CoA-NABL-2026-0941 • Central Quality Lab, Guwahati
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-500/30">
                  PASSED / RELEASED
                </span>
              </div>

              {/* Chemical GC-MS Profiling Table */}
              <div className="bg-slate-950 rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Test Parameter / Compound</th>
                      <th className="p-3">Method / Instrument</th>
                      <th className="p-3">Acceptance Benchmark</th>
                      <th className="p-3">Observed Result</th>
                      <th className="p-3">Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-700">
                    <tr>
                      <td className="p-3 font-semibold text-white">Agarospirol Content</td>
                      <td className="p-3 font-mono text-slate-600">GC-MS (FID)</td>
                      <td className="p-3">≥ 12.0%</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">18.42%</td>
                      <td className="p-3 text-emerald-400 font-bold">✓ PASSED (Grade A+)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Jinkoh-eremol Content</td>
                      <td className="p-3 font-mono text-slate-600">GC-MS</td>
                      <td className="p-3">≥ 6.0%</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">9.85%</td>
                      <td className="p-3 text-emerald-400 font-bold">✓ PASSED</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Specific Gravity @ 30°C</td>
                      <td className="p-3 font-mono text-slate-600">Pycnometer</td>
                      <td className="p-3">0.960 – 0.995</td>
                      <td className="p-3 font-mono text-white">0.982</td>
                      <td className="p-3 text-emerald-400 font-bold">✓ PASSED</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Adulteration Screening (DOP)</td>
                      <td className="p-3 font-mono text-slate-600">GC-MS Screening</td>
                      <td className="p-3">0.0% (Zero tolerance)</td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">0.00% (Nil detected)</td>
                      <td className="p-3 text-emerald-400 font-bold">✓ 100% PURE</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">CITES Species Confirmation</td>
                      <td className="p-3 font-mono text-slate-600">Wood Anatomy / DNA</td>
                      <td className="p-3">Aquilaria malaccensis</td>
                      <td className="p-3 font-mono text-teal-800">Aquilaria malaccensis Lam.</td>
                      <td className="p-3 text-emerald-400 font-bold">✓ CERTIFIED</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                <span>Authorized Signatory: Dr. R. K. Borpujari, Quality Analyst</span>
                <span className="font-mono text-slate-700">NABL Accreditation #TC-8891</span>
              </div>
            </div>
          )}

          {/* TAB 4: INTERNAL AUTHORIZED OFFICER AUDIT VIEW */}
          {activeTab === 'OFFICER' && (
            <div className="bg-white border-2 border-amber-400 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                    <Unlock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Authorized Full Chain Audit Record
                    </h3>
                    <span className="text-xs text-amber-400 font-medium">
                      NERAMAC Officer, DFO & Customs Vigilance Level (Unmasked)
                    </span>
                  </div>
                </div>

                <span className="text-[11px] px-2.5 py-1 rounded bg-amber-500/20 text-amber-800 border border-amber-500/40 font-bold uppercase">
                  Unmasked Operational Ledger
                </span>
              </div>

              {/* Unmasked Details */}
              <div className="space-y-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">
                    1. Origin Farmer & Unmasked GPS Homestead Coordinates
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>Farmer Name: <span className="font-semibold text-white">Bhaben Saikia (FRM-GH-0104)</span></div>
                    <div>Cadastral Survey: <span className="font-semibold text-white">Dag 182, Patta 44</span></div>
                    <div>Homestead Coordinates: <span className="font-mono text-emerald-400">26.5182° N, 93.9723° E</span></div>
                    <div>GNSS Positional Accuracy: <span className="font-mono text-slate-700">±2.1 meters (Within 5m tolerance)</span></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">
                    2. In-App Hardware Camera Buffer Photographic Hash
                  </span>
                  <div className="space-y-1 text-slate-700">
                    <div>Photo SHA-256 Hash: <span className="font-mono text-[10px] text-teal-400 break-all">7d4a2f8c5b9e1a3d6f0c8e2b4a7d9f1e3c5a7b9d0e2f4a6c8e0b2d4f6a8c0e2b</span></div>
                    <span className="text-slate-600 text-[10px] block">Captured directly in Android camera hardware memory buffer. Pre-existing gallery uploads strictly blocked.</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">
                    3. Statutory DFO Sanction & Maker-Checker Digital Validation
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>DFO Sanction Order: <span className="font-mono text-white">FD/GLG/AGAR/FELLING/2026/918</span></div>
                    <div>Transit Permit No: <span className="font-mono text-white">TP-FD-GLG-2026-0812</span></div>
                    <div>Maker Sign-Off: <span className="text-white">Sri K. N. Sarma, IFS (DFO Golaghat)</span></div>
                    <div>Checker Validation: <span className="text-emerald-400 font-bold">VERIFIED by Smt. P. Kalita (NERAMAC)</span></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">
                    4. Calibrated Weighbridge & Distillation Mass Balance
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>Field Harvest Net Wt: <span className="font-mono text-white">185.4 kg (Scale SC-8812)</span></div>
                    <div>Depot Intake Net Wt: <span className="font-mono text-white">184.8 kg (Variance: -0.32% ≤ 1.5%)</span></div>
                    <div>Distillation Mass Balance: <span className="font-mono text-emerald-400">620 kg wood -&gt; 1,480 ml pure oil (0.239%)</span></div>
                    <div>Hydrosol / Spent Residue: <span className="font-mono text-slate-700">18.5 L Hydrosol + 570 kg Spent Biomass</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
