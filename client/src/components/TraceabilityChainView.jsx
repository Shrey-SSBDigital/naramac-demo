import React, { useState } from 'react';
import { 
  GitCommit, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ExternalLink, 
  ShieldCheck, 
  Hash, 
  Scale, 
  MapPin, 
  FileText,
  Calendar,
  Layers,
  ChevronDown,
  Sparkles,
  Workflow
} from 'lucide-react';

export default function TraceabilityChainView({ chainData, translations }) {
  const [selectedId, setSelectedId] = useState('PCK-AS-2026-0042');
  const [searchQuery, setSearchQuery] = useState('');

  const c = chainData || {};

  // Standard ordered chain of 15 elements
  const chainSteps = [
    {
      code: "FRM",
      id: c.farmer?.id || "FRM-GH-0104",
      title: "Registered Farmer",
      entity: c.farmer?.name || "Bhaben Saikia",
      location: c.farmer?.village || "Golaghat, Assam",
      details: "Homestead geo-pinned. Consent recorded. Root identity.",
      badge: "ROOT",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      meta: { "GPS Accuracy": c.farmer?.geoAccuracy, "Producer Group": c.farmer?.producerGroup }
    },
    {
      code: "PLT",
      id: c.plantation?.id || "PLT-GH-0104-A",
      title: "Plantation Holding",
      entity: c.plantation?.name || "Saikia Heritage Holding",
      location: `${c.plantation?.areaHectares || 2.45} Hectares`,
      details: "Geo-referenced boundary with 8 vertices. Verified land title.",
      badge: "SPATIAL",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      meta: { "Total Trees": c.plantation?.totalStandingTrees, "Mature Trees": c.plantation?.matureTreesCount }
    },
    {
      code: "PLG",
      id: c.pologen?.id || "PLG-GH-0104-B3",
      title: "POLOGEN (< 7 yrs)",
      entity: c.pologen?.blockName || "Block 3 (Nursery Block)",
      location: "4,850 sq. meters",
      details: "Young trees traced collectively as closed polygon.",
      badge: "AGE RULE",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      meta: { "Planting Year": c.pologen?.plantingYear, "Tree Count": c.pologen?.treeCount }
    },
    {
      code: "TRE",
      id: c.treeMatured?.id || "TRE-GH-0104-0089",
      title: "Mature Tree (≥ 7 yrs)",
      entity: `Tag: ${c.treeMatured?.treeTagNumber || "AS-GLG-TAG-8941"}`,
      location: "26.5204° N, 93.9743° E",
      details: "Individually tagged with QR seal. Girth: 68.5cm, Height: 14.2m.",
      badge: "POINT PIN",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      meta: { "Age": `${c.treeMatured?.ageYears || 11.4} Years`, "Species": c.treeMatured?.species || "Aquilaria malaccensis" }
    },
    {
      code: "INO",
      id: c.inoculation?.id || "INO-GH-2023-0182",
      title: "Inoculation Event",
      entity: c.inoculation?.method || "Drilling & Fungal Suspension",
      location: "36 injection points",
      details: "BioOud-Fungus Inoculant Strain ASM-4 (Batch #BAT-BIO-2023-094).",
      badge: "INDUCTIONS",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      meta: { "Date": c.inoculation?.inoculationDate || "2023-04-18", "Photo Hash": (c.inoculation?.postInoculationPhotoHash ? c.inoculation.postInoculationPhotoHash.substring(0, 16) + '...' : "7d4a2f8c5b9e1a3d...") }
    },
    {
      code: "HAU",
      id: c.harvestAuthorisation?.id || "HAU-2026-DFO-GLG-0041",
      title: "DFO Harvest Authorisation",
      entity: `Order: ${c.harvestAuthorisation?.dfoOrderNumber || "FD/GLG/AGAR/2026/918"}`,
      location: "Golaghat Forest Division",
      details: "DFO approved felling order. Maker-Checker verified by NERAMAC.",
      badge: "STATUTORY",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      meta: { "Sanctioned Wt": `${c.harvestAuthorisation?.permittedQuantityKg || 190.0} kg`, "Officer": c.harvestAuthorisation?.dfoOfficialName || "Sri P. K. Baruah, IFS" }
    },
    {
      code: "HBT",
      id: c.harvestBatch?.id || "HBT-GH-2026-0041",
      title: "Harvest Batch (Field)",
      entity: `Net Wt: ${c.harvestBatch?.netWeightKg || 185.4} kg`,
      location: "6 Bags (Dergaon Scale)",
      details: "Weighed on digital certified scale. Stump photo SHA-256 hashed.",
      badge: "MATERIAL",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      meta: { "Harvest Date": "2026-07-04", "Field Agent": c.harvestBatch?.fieldAgent }
    },
    {
      code: "MOV",
      id: c.movementFarmToAggregator?.id || "MOV-2026-0182",
      title: "Farm to Depot Transit",
      entity: `Variance: ${c.movementFarmToAggregator?.variancePercentage || -0.32}%`,
      location: "Vehicle AS-05-C-7281",
      details: "Dispatch 185.4 kg -> Receipt 184.8 kg. Variance within 1.5% limit.",
      badge: "CUSTODY",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      meta: { "Transit Pass": c.movementFarmToAggregator?.transitPassPermitNo, "Tolerance": "PASSED (≤1.5%)" }
    },
    {
      code: "AGG",
      id: c.aggregationConsignment?.id || "AGG-GH-2026-0018",
      title: "Aggregation Depot Lot",
      entity: `Pooled Wt: ${c.aggregationConsignment?.totalConsignmentWeightKg || 620.0} kg`,
      location: "Depot #4, Golaghat",
      details: "Pooled from 3 registered farms. Parent-child links preserved.",
      badge: "GENEALOGY",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      meta: { "Contributing Batches": "3 Harvest Batches", "Storage Bin": c.aggregationConsignment?.storageWarehouseBin }
    },
    {
      code: "DST",
      id: c.distillationBatch?.id || "DST-CPC-2026-0007",
      title: "CPC Distillation Run",
      entity: `Oil Yield: 1,480 ml (0.239%)`,
      location: "CPC #1 Still-03",
      details: "Charged 620 kg wood -> 1,480 ml Oud Oil + 18.5L Hydrosol + 570 kg Spent residue.",
      badge: "MASS BALANCE",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      meta: { "Run Hours": "108 Hours", "Quarantine": "RELEASED" }
    },
    {
      code: "LAB",
      id: c.labTest?.id || "LAB-NER-2026-0089",
      title: "NABL Quality & Purity Test",
      entity: "NABL CoA Verified",
      location: "NABL Lab Guwahati",
      details: "Botanical species Aquilaria malaccensis confirmed. Certificate of Analysis verified.",
      badge: "VERIFIED",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      meta: { "Species": "Aquilaria malaccensis", "CoA Ref": c.labTest?.testReportReference }
    },
    {
      code: "PMT",
      id: c.permit?.id || "PMT-CITES-2026-0041",
      title: "Statutory CITES Clearance",
      entity: "CITES Appendix II",
      location: "MoEFCC / WCCB",
      details: "Legal non-detriment finding and international export certification.",
      badge: "COMPLIANCE",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      meta: { "Permit No": c.permit?.referenceNumber, "Validity": "Valid to 2027-01-15" }
    },
    {
      code: "PCK",
      id: c.pack?.id || "PCK-AS-2026-0042",
      title: "Finished Serialised Pack",
      entity: "12 ml Crystal Flacon",
      location: "Serial: 0042 / 120",
      details: "Cryptographically signed QR code resolving to NERAMAC official trust domain.",
      badge: "SCANNABLE QR",
      badgeColor: "bg-emerald-400 text-slate-950 font-bold",
      meta: { "Tamper Seal": c.pack?.tamperEvidentSealId, "Status": "AUTHENTICATED" }
    },
    {
      code: "EBT",
      id: c.exportBatch?.id || "EBT-NER-2026-0012",
      title: "Commercial Export Batch",
      entity: "120 Units (1.44 Litres)",
      location: "Consignee: Dubai, UAE",
      details: "Packed in climate-controlled international air shipment container.",
      badge: "COMMERCIAL",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      meta: { "Buyer": "Al-Majed Fragrance", "Country": "United Arab Emirates" }
    },
    {
      code: "ELT",
      id: c.exportLot?.id || "ELT-GAU-EXP-2026-003",
      title: "Terminal Export Consignment",
      entity: "Guwahati (GAU) -> Dubai (DXB)",
      location: "Airway Bill: AWB-618-9941",
      details: "Customs shipping bill cleared. Air cargo dispatched and verified.",
      badge: "DISPATCHED",
      badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
      meta: { "Shipping Bill": c.exportLot?.customsShippingBillNo, "Status": "DELIVERED" }
    }
  ];

  const foundIdx = chainSteps.findIndex(s => s.id === selectedId || s.code === selectedId);
  const currentIdx = foundIdx >= 0 ? foundIdx : 12; // default to PCK (Pack)
  const activeStep = chainSteps[currentIdx];

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    const found = chainSteps.find(s => 
      s.id.toLowerCase().includes(query) || 
      s.code.toLowerCase().includes(query) ||
      s.title.toLowerCase().includes(query) ||
      s.entity.toLowerCase().includes(query)
    );
    if (found) {
      setSelectedId(found.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Lookup */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Single Unbroken 15-Identity Traceability Chain
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Traversable backward and forward from any point without manual reconstruction. Section 3.2 compliance.
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search UID (e.g. PCK-AS-2026-0042, FRM-0104)"
                className="bg-white border border-slate-300 text-xs text-slate-900 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64 md:w-80"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
            >
              Lookup
            </button>
          </form>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 overflow-x-auto pb-1">
          <span className="text-[11px] font-medium text-slate-500 flex-shrink-0">Sample Jump:</span>
          <button
            onClick={() => setSelectedId('FRM-GH-0104')}
            className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200"
          >
            FRM-GH-0104 (Farmer Root)
          </button>
          <button
            onClick={() => setSelectedId('TRE-GH-0104-0089')}
            className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200"
          >
            TRE-GH-0104-0089 (Tree Pin)
          </button>
          <button
            onClick={() => setSelectedId('DST-CPC-2026-0007')}
            className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200"
          >
            DST-CPC-2026-0007 (CPC Still)
          </button>
          <button
            onClick={() => setSelectedId('PCK-AS-2026-0042')}
            className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 font-mono text-[11px] border border-emerald-300"
          >
            PCK-AS-2026-0042 (Final Pack QR)
          </button>
        </div>
      </div>

      {/* Selected Node Detailed Inspector */}
      <div className="bg-white border-2 border-emerald-600/30 rounded-2xl p-5 md:p-6 shadow-sm relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-emerald-700 text-white font-bold">
                {activeStep.code}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${activeStep.badgeColor}`}>
                {activeStep.badge}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Stage {currentIdx + 1} of 15
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              {activeStep.title}: <span className="text-emerald-400 font-mono">{activeStep.id}</span>
            </h3>
            <p className="text-sm text-slate-700 mt-1.5 max-w-2xl">
              {activeStep.details}
            </p>
          </div>

          {/* Upstream & Downstream Counts */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div className="text-center px-3 border-r border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block">Backward Ancestors</span>
              <span className="text-lg font-bold text-teal-400 font-mono">{currentIdx}</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-500 uppercase block">Forward Descendants</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">{14 - currentIdx}</span>
            </div>
          </div>
        </div>

        {/* Metadata pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200">
          {Object.entries(activeStep.meta).map(([k, v], idx) => (
            <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-medium">{k}</span>
              <span className="text-xs font-semibold text-slate-800 font-mono truncate block mt-0.5">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Horizontal Interactive Step-by-Step Flow */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Workflow className="w-4 h-4 text-emerald-400" />
          Click any step to traverse backward / forward:
        </h3>

        <div className="space-y-3">
          {chainSteps.map((step, idx) => {
            const isSelected = step.id === activeStep.id;
            const isAncestor = idx < currentIdx;
            const isDescendant = idx > currentIdx;

            return (
              <div
                key={step.code}
                onClick={() => setSelectedId(step.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                    : isAncestor
                    ? 'bg-white border-slate-200 hover:border-teal-500/60 hover:bg-slate-50'
                    : 'bg-white border-slate-200 hover:border-cyan-500/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                      isSelected
                        ? 'bg-emerald-700 text-white'
                        : isAncestor
                        ? 'bg-teal-50 text-teal-800 border border-teal-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        [{step.code}] {step.id}
                      </span>
                      <span className={`text-[10px] px-2 py-0.2 rounded-full border ${step.badgeColor}`}>
                        {step.badge}
                      </span>
                      {isAncestor && (
                        <span className="text-[10px] text-teal-400 flex items-center gap-0.5">
                          <ArrowLeft className="w-2.5 h-2.5" /> Ancestor
                        </span>
                      )}
                      {isDescendant && (
                        <span className="text-[10px] text-cyan-400 flex items-center gap-0.5">
                          <ArrowRight className="w-2.5 h-2.5" /> Descendant
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5">
                      {step.title} • <span className="text-slate-500">{step.entity}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                  <span className="hidden md:inline">{step.location}</span>
                  <span className={`${isSelected ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    {isSelected ? 'SELECTED TARGET' : 'INSPECT'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
