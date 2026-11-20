import React from 'react';
import { 
  GitFork, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  Award
} from 'lucide-react';

export default function FullSupplyChainView({ onSelectRole }) {
  const steps = [
    { step: 1, roleId: "FARMER", title: "Farmer Onboarding", id: "FRM", action: "Homestead geo-pinned. Root of the digital chain." },
    { step: 2, roleId: "FIELD_AGENT", title: "Plantation Mapping", id: "PLT", action: "Plantation boundary mapped, 8 vertices captured, area computed." },
    { step: 3, roleId: "FIELD_AGENT", title: "POLOGEN (< 7 yrs) & Tree Tagging (≥ 7 yrs)", id: "PLG / TRE", action: "Age rule applied. Trees ≥ 7 yrs individually geo-pinned and tagged." },
    { step: 4, roleId: "FIELD_AGENT", title: "Menu-Driven Inoculation", id: "INO", action: "Fungal/chemical induction logged with on-device SHA-256 photo hash." },
    { step: 5, roleId: "DFO_FOREST_DEPT", title: "DFO Harvest Authorisation", id: "HAU / PMT", action: "Grower applies; NERAMAC verifies; DFO issues statutory felling order." },
    { step: 6, roleId: "FIELD_AGENT", title: "Harvest Batch Creation", id: "HBT", action: "Net weight recorded on certified scale; stump photos hashed." },
    { step: 7, roleId: "AGGREGATOR", title: "Movement: Farm to Aggregator", id: "MOV", action: "Paired dispatch & receipt; weighment variance checked against 1.5% limit." },
    { step: 8, roleId: "AGGREGATOR", title: "Consignment Aggregation", id: "AGG", action: "Multiple harvest batches pooled into depot lot; genealogy preserved." },
    { step: 9, roleId: "CPC_OPERATOR", title: "Movement: Depot to CPC Distillery", id: "MOV", action: "Transferred under transit pass and vehicle tamper seal to CPC." },
    { step: 10, roleId: "CPC_OPERATOR", title: "Distillation & Material Balance", id: "DST", action: "Hydro-distillation run; wood in vs pure oud oil, hydrosol & residue." },
    { step: 11, roleId: "LAB_OFFICER", title: "NABL Laboratory Testing", id: "LAB", action: "GC-MS purity tested (agarospirol %); CITES species confirmation." },
    { step: 12, roleId: "NERAMAC_ADMIN", title: "Statutory Permits Linkage", id: "PMT", action: "CITES export certificate and transit clearances bound to batch." },
    { step: 13, roleId: "PACKAGING_OFFICER", title: "Finished Goods & Serialized QR", id: "PCK", action: "12ml crystal bottles packaged; cryptographically signed QR printed." },
    { step: 14, roleId: "EXPORTER_LOGISTICS", title: "Export Batch Consolidation", id: "EBT / ELT", action: "Carton aggregation; customs shipping bill and Airway Bill linked." },
    { step: 15, roleId: "BUYER_PUBLIC", title: "Global Delivery & Buyer Scan", id: "PCK Scan", action: "Buyer scans QR; verified provenance displayed with DPDP Act masking." }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2.5">
          <GitFork className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            End-to-End 15-Step Agarwood Traceability Chain
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          The complete flow from registered plantation in Assam or Tripura to international buyer verification. Every step creates an immutable digital link across all stakeholders. Click any step to inspect that stakeholder's specific responsibilities.
        </p>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-750">
            <span className="text-emerald-400 font-bold block">1. Single Unbroken Chain</span>
            <span className="text-slate-400 text-[11px]">No identity is created without a parent link back to the originating grower.</span>
          </div>
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-750">
            <span className="text-teal-400 font-bold block">2. Strict Legal Separation</span>
            <span className="text-slate-400 text-[11px]">NERAMAC verifies technical data; DFO holds sole statutory felling authority.</span>
          </div>
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-750">
            <span className="text-cyan-400 font-bold block">3. DPDP Act Privacy</span>
            <span className="text-slate-400 text-[11px]">Public QR scans mask smallholder phone numbers and exact cadastral house coordinates.</span>
          </div>
        </div>
      </div>

      {/* Step by step cards */}
      <div className="space-y-2.5">
        {steps.map((s) => (
          <div
            key={s.step}
            className="bg-slate-850/80 border border-slate-800 hover:border-emerald-500/60 p-4 rounded-xl transition duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start md:items-center gap-3.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                #{s.step}
              </span>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{s.title}</h3>
                  <span className="font-mono text-[10px] px-2 py-0.2 rounded bg-slate-800 text-teal-300 border border-slate-700 font-semibold">
                    ID: {s.id}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">{s.action}</p>
              </div>
            </div>

            <button
              onClick={() => onSelectRole(s.roleId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition flex-shrink-0"
            >
              <span>View Stakeholder Duties</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
