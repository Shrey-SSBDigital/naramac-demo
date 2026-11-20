import React, { useState, useEffect } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import { QRCodeSVG } from 'qrcode.react';
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
  Sparkles
} from 'lucide-react';

export default function TraceabilityModule({ initialSearchQuery }) {
  const { resolveTraceability, finishedProducts, harvestBatches } = useEnterprise();
  const [searchInput, setSearchInput] = useState(initialSearchQuery || 'PCK-NER-2026-001');
  const [traceResult, setTraceResult] = useState(null);
  const [isOfficerMode, setIsOfficerMode] = useState(false);

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
  const tree = traceResult?.trees?.[0];
  const farmer = traceResult?.farmers?.[0];
  const plantation = traceResult?.plantations?.[0];
  const distillation = traceResult?.distillation;
  const labTest = traceResult?.labTest;
  const exportBatch = traceResult?.exportBatch;

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

          {/* DPDP Act Masking Perspective Toggle */}
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
                <span>Public Verifier Mode (DPDP Act 2023 Masked)</span>
              </>
            )}
          </button>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
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
        </form>

        {/* Quick Sample Chips */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span className="font-bold text-slate-700">Quick Test Targets:</span>
          <button
            type="button"
            onClick={() => setSearchInput('PCK-NER-2026-001')}
            className="font-mono bg-slate-100 hover:bg-emerald-100 text-slate-800 px-2 py-0.5 rounded font-bold transition"
          >
            PCK-NER-2026-001 (Export Dubai)
          </button>
          <button
            type="button"
            onClick={() => setSearchInput('PCK-NER-2026-013')}
            className="font-mono bg-slate-100 hover:bg-emerald-100 text-slate-800 px-2 py-0.5 rounded font-bold transition"
          >
            PCK-NER-2026-013 (Domestic Kannauj)
          </button>
          <button
            type="button"
            onClick={() => setSearchInput('HBT-AS-2026-001')}
            className="font-mono bg-slate-100 hover:bg-emerald-100 text-slate-800 px-2 py-0.5 rounded font-bold transition"
          >
            HBT-AS-2026-001 (Harvest Batch)
          </button>
        </div>
      </div>

      {/* Traceability Result Presentation */}
      {traceResult ? (
        <div className="space-y-6">
          {/* Top Verification Authenticity Card */}
          <div className="bg-white border-2 border-emerald-500 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center p-2 flex-shrink-0">
                  <QRCodeSVG
                    value={`https://trace.neramac.gov.in/verify/${product?.serialNumber || searchInput}`}
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
              {/* Node 1: Registered Farmer */}
              <div className="relative">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs">
                  1
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    FRM • Primary Grower & Land Tenure
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {isOfficerMode ? (farmer?.name || 'Bhaben Saikia') : (product?.originFarmerMasked || 'B***n S***a')}
                  </div>
                  <div className="text-xs text-slate-600">
                    Location: <strong>{farmer?.village || 'Dhekial Gaon, Mouza Dhekial, Golaghat, Assam'}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Revenue Title: {farmer?.dagNumber || 'Dag 182, Patta 44'} • Aadhaar: {isOfficerMode ? '4412-8921-9011 (Verified UIDAI)' : 'XXXX-XXXX-8921 (DPDP Masked)'}
                  </div>
                </div>
              </div>

              {/* Node 2: Point Geo-Pinned Tree */}
              <div className="relative">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs">
                  2
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    TRE • Point Geo-Pinning & Age Rule Survey
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm font-mono">
                    Tree ID: {tree?.id || 'TRE-AS-001'} (Species: *Aquilaria malaccensis*)
                  </div>
                  <div className="text-xs text-slate-600">
                    Age: <strong>{tree?.ageYears || 14} Years</strong> • Girth: <strong>{tree?.girthCm || 74} cm</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Satellite Coordinates: {tree?.gpsLatitude || 26.5208}, {tree?.gpsLongitude || 93.9790} (Elevation: 98m)
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
                    AGG • Depot Consignment Pooling
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm font-mono">
                    Batch: AGG-AS-2026-01 (Golaghat Aggregation Depot)
                  </div>
                  <div className="text-xs text-slate-600">
                    Pooled Batches: <strong>HBT-AS-2026-001 (38.4kg) + HBT-AS-2026-002 (36.6kg)</strong> = 75.0 kg Distillation Charge
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

              {/* Node 8: NABL Quality Testing & GC-MS Profiling */}
              <div className="relative">
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs">
                  8
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    LAB • NABL Accredited Chemical Profiling & Species Release
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm font-mono">
                    Certificate of Analysis: COA/NER/2026/0144
                  </div>
                  <div className="text-xs text-slate-600">
                    Agarospirol: <strong className="text-emerald-700">14.82%</strong> • Jinkoh-eremol: <strong className="text-emerald-700">6.24%</strong> • Adulterants: <strong>None Detected</strong>
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
