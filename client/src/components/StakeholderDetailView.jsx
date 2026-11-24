import React, { useState } from 'react';
import { 
  Sprout, 
  Compass, 
  ShieldCheck, 
  FileCheck2, 
  Boxes, 
  Flame, 
  FlaskConical, 
  QrCode, 
  Truck, 
  ShieldAlert, 
  ScanLine,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Layers,
  FileText,
  Workflow,
  Sparkles,
  Play,
  CheckCircle2,
  Lock,
  Cpu
} from 'lucide-react';

const ICON_MAP = {
  Sprout,
  Compass,
  ShieldCheck,
  FileCheck2,
  Boxes,
  Flame,
  FlaskConical,
  QrCode,
  Truck,
  ShieldAlert,
  ScanLine
};

export default function StakeholderDetailView({
  stakeholder,
  allStakeholders,
  stepNumber,
  totalSteps,
  onNavigateRole
}) {
  const [activeTab, setActiveTab] = useState('duties'); // 'duties' | 'others' | 'simulator'
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!stakeholder) return null;

  const IconComp = ICON_MAP[stakeholder.icon] || ShieldCheck;

  // Previous and next stakeholders in the supply chain order
  const currentIdx = allStakeholders.findIndex(s => s.id === stakeholder.id);
  const prevStakeholder = currentIdx > 0 ? allStakeholders[currentIdx - 1] : null;
  const nextStakeholder = currentIdx < allStakeholders.length - 1 ? allStakeholders[currentIdx + 1] : null;

  // Handler for role-specific live simulation
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationResult(null);

    // Call backend or simulate instant responsive execution
    setTimeout(() => {
      setIsSimulating(false);
      switch(stakeholder.id) {
        case 'FARMER':
          setSimulationResult({
            title: "Harvest Authorisation Application Lodged",
            idGenerated: "HAU-2026-APP-0941",
            status: "SUBMITTED_TO_NERAMAC",
            details: "Application submitted for 2 mature trees (TRE-89 & TRE-90) on Saikia Heritage Plantation. Forwarded to NERAMAC verifying officer.",
            badge: "LODGED"
          });
          break;
        case 'FIELD_AGENT':
          setSimulationResult({
            title: "Menu-Driven Inoculation Captured with Photo Hash",
            idGenerated: "INO-GH-2026-0814",
            status: "CRYPTOGRAPHICALLY_SEALED",
            details: "Fungal induction logged on Tree #89. Device SHA-256 photo hash: 3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c. GPS point locked at 26.5204° N, 93.9743° E.",
            badge: "SHA-256 VERIFIED"
          });
          break;
        case 'NERAMAC_ADMIN':
          setSimulationResult({
            title: "Maker-Checker Verification & Quota Sanction",
            idGenerated: "VER-NER-2026-0041",
            status: "VERIFIED_AND_FORWARDED",
            details: "Inoculation history (3 yrs duration) verified against tree age (11.4 yrs). Summary compiled and forwarded to DFO Golaghat.",
            badge: "MAKER-CHECKER OK"
          });
          break;
        case 'DFO_FOREST_DEPT':
          setSimulationResult({
            title: "DFO Statutory Felling Order Issued",
            idGenerated: "PMT-DFO-GLG-918",
            status: "STATUTORY_APPROVED",
            details: "Divisional Forest Officer, Golaghat granted felling permission under State Forest Act. Order Ref: FD/GLG/AGAR/2026/918. Signed Order Hash attached.",
            badge: "LEGAL ORDER ACTIVE"
          });
          break;
        case 'AGGREGATOR':
          setSimulationResult({
            title: "Depot Intake Weighment & Tolerance Evaluation",
            idGenerated: "MOV-2026-0182",
            status: "PASSED (≤ 1.5% TOLERANCE)",
            details: "Dispatch Wt: 185.4 kg -> Receipt Wt: 184.8 kg. Variance: -0.32% (-0.6 kg). Within statutory tolerance limit. Added to Aggregation Lot #AGG-GH-2026-0018.",
            badge: "TOLERANCE PASSED"
          });
          break;
        case 'CPC_OPERATOR':
          setSimulationResult({
            title: "CPC Distillation Run & Mass Balance Reconciled",
            idGenerated: "DST-CPC-2026-0007",
            status: "EXTRACTED_AND_BALANCED",
            details: "Charged 620.0 kg wood into Still-03 (108 hrs run). Yield: 1,480 ml pure Oud oil (0.239% recovery) + 18.5 L Hydrosol + 570 kg Spent Biomass. Placed under Quarantine pending lab release.",
            badge: "MASS BALANCE OK"
          });
          break;
        case 'LAB_OFFICER':
          setSimulationResult({
            title: "NABL GC-MS Purity & CITES Species Certificate",
            idGenerated: "LAB-NER-2026-0089",
            status: "OFFICIAL_QUALITY_RELEASE",
            details: "GC-MS confirmed Aquilaria malaccensis (100% Monospecific). Agarospirol: 18.42% (Grade A+), Zero adulteration. Quarantine lifted; released for bottling.",
            badge: "RELEASED"
          });
          break;
        case 'PACKAGING_OFFICER':
          setSimulationResult({
            title: "Tamper-Evident Serialized QR Code Generated",
            idGenerated: "PCK-AS-2026-0042",
            status: "CRYPTOGRAPHICALLY_SIGNED",
            details: "12 ml crystal flacon sealed. Unique scannable QR code resolving to https://trace.neramac.gov.in/verify/PCK-AS-2026-0042 with tamper seal NER-TE-SEAL-88912.",
            badge: "AUTHENTICATED"
          });
          break;
        case 'EXPORTER_LOGISTICS':
          setSimulationResult({
            title: "Export Lot Consolidated with CITES Clearance",
            idGenerated: "ELT-GAU-EXP-2026-003",
            status: "DISPATCHED_TO_CUSTOMS",
            details: "120 packs consolidated. Airway Bill AWB-618-9941 dispatched via Air Cargo Complex Guwahati to Dubai International Airport. CITES permit linked.",
            badge: "CUSTOMS CLEARED"
          });
          break;
        case 'AUDITOR':
          setSimulationResult({
            title: "Full 15-Identity Chain Integrity Audit Complete",
            idGenerated: "AUD-NER-2026-091",
            status: "CHAIN_INTEGRITY_VERIFIED",
            details: "Zero broken links. All 15 identities verified from Farmer (FRM-GH-0104) to Export Lot (ELT-003). All SHA-256 photograph hashes match original camera buffer records.",
            badge: "AUDIT PASSED"
          });
          break;
        case 'BUYER_PUBLIC':
          setSimulationResult({
            title: "Smartphone QR Provenance Verification",
            idGenerated: "PCK-AS-2026-0042",
            status: "GENUINE_NERAMAC_CERTIFIED",
            details: "Consumer scan verified authentic Assam Oud Oil. Origin: Golaghat, Assam. CITES Appendix II certified. Complete legal origin provenance verified.",
            badge: "PROVENANCE CONFIRMED"
          });
          break;
        default:
          setSimulationResult({
            title: "Operational Action Recorded",
            idGenerated: "REC-2026-001",
            status: "COMPLETED",
            details: "Transaction validated and linked into immutable audit ledger.",
            badge: "SUCCESS"
          });
      }
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* 1. Supply Chain Step Breadcrumb Flow Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            Step {stepNumber} of {totalSteps}
          </span>
          <span className="text-slate-600 font-medium">Supply Chain Custody Position:</span>
        </div>

        {/* Visual 3-node mini sequence */}
        <div className="flex items-center gap-2 text-[11px]">
          {prevStakeholder ? (
            <button
              onClick={() => onNavigateRole(prevStakeholder.id)}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700"
            >
              <ArrowLeft className="w-3 h-3 text-slate-600" />
              <span className="truncate max-w-[120px]">{prevStakeholder.roleName.split('/')[0]}</span>
            </button>
          ) : (
            <span className="text-slate-600 italic px-2">Chain Root</span>
          )}

          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />

          <span className="font-bold text-slate-900 bg-emerald-600 px-3 py-1 rounded-lg shadow-sm">
            {stakeholder.roleName}
          </span>

          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />

          {nextStakeholder ? (
            <button
              onClick={() => onNavigateRole(nextStakeholder.id)}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700"
            >
              <span className="truncate max-w-[120px]">{nextStakeholder.roleName.split('/')[0]}</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
            </button>
          ) : (
            <span className="text-slate-600 italic px-2">Terminal Verification</span>
          )}
        </div>
      </div>

      {/* 2. Stakeholder Profile Hero Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner flex-shrink-0">
              <IconComp className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                  {stakeholder.category}
                </span>
                <span className="text-xs text-slate-600">
                  📍 {stakeholder.clusterPresence.join(' & ')}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {stakeholder.roleName}
              </h1>
              <p className="text-xs md:text-sm text-slate-700 mt-1 max-w-3xl leading-relaxed">
                {stakeholder.description}
              </p>
            </div>
          </div>

          {/* Quick tab switcher inside stakeholder detail */}
          <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 text-xs flex-shrink-0">
            <button
              onClick={() => setActiveTab('duties')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'duties'
                  ? 'bg-emerald-600 text-slate-900 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Responsibilities & Duties
            </button>
            <button
              onClick={() => setActiveTab('others')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'others'
                  ? 'bg-emerald-600 text-slate-900 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Other Stakeholders ({allStakeholders.length - 1})
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'simulator'
                  ? 'bg-emerald-600 text-slate-900 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Action Simulator
            </button>
          </div>
        </div>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB A: DETAILED RESPONSIBILITIES */}
      {activeTab === 'duties' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Core Operational Responsibilities */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Primary Operational Duties & Actions
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Specific tasks this stakeholder is legally and procedurally responsible for performing in the field or office:
                </p>

                <ul className="space-y-2.5 text-xs text-slate-200">
                  {stakeholder.coreDuties.map((duty, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{duty}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: IDs Handled + Statutory Limits */}
            <div className="space-y-6">
              {/* Card 2: Digital Identities Managed */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Mandatory Digital Identifiers Managed
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Identifiers governed, issued, or acknowledged by this role per RFP Section 3.2:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {stakeholder.mandatoryIdentitiesHandled.map((idObj, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[11px] flex items-center justify-center">
                          {idObj.code}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-900 block leading-tight text-[11px]">
                            {idObj.name}
                          </span>
                          <span className="text-[10px] text-slate-600">Action: {idObj.action}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Statutory Authority & Regulatory Limit */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Statutory Authority & Regulatory Limit
                  </h3>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {stakeholder.regulatoryBoundary}
                </p>
              </div>
            </div>
          </div>

          {/* Upstream & Downstream Custody Flow Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
              <Workflow className="w-4 h-4 text-emerald-400" />
              Custody Handoff & Dependency Chain
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Upstream */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block mb-2">
                  ↑ Upstream Inputs (Received from):
                </span>
                <ul className="space-y-2 text-xs text-slate-700">
                  {stakeholder.upstreamDependencies.map((u, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-emerald-400 font-mono">[{u.fromRole}]:</span>
                      <span>{u.item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Downstream */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2">
                  ↓ Downstream Handoffs (Delivered to):
                </span>
                <ul className="space-y-2 text-xs text-slate-700">
                  {stakeholder.downstreamHandoffs.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-cyan-400 font-mono">[{d.toRole}]:</span>
                      <span>{d.item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: OTHER STAKEHOLDERS' RESPONSIBILITIES */}
      {activeTab === 'others' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Workflow className="w-4 h-4 text-emerald-400" />
              Responsibilities of Other Stakeholders in Connection with {stakeholder.roleName}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Shows the exact duty and interaction of each other participant in the supply chain relative to this role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {allStakeholders.filter(s => s.id !== stakeholder.id).map(other => {
              const OtherIcon = ICON_MAP[other.icon] || ShieldCheck;
              const reciprocalText = other.relationshipWithOthers[stakeholder.id] || "Interacts through the unified digital custody chain.";

              return (
                <div key={other.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-emerald-400">
                          <OtherIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{other.roleName}</h4>
                          <span className="text-[10px] text-slate-600">{other.category}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onNavigateRole(other.id)}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-slate-900 transition font-medium"
                      >
                        Switch Role →
                      </button>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 my-2">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide block mb-0.5">
                        Their Responsibility to {stakeholder.roleName}:
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        "{reciprocalText}"
                      </p>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">General Core Task: </span>
                      {other.coreDuties[0]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB C: LIVE ACTION SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-900">
                Live Action Simulator for: {stakeholder.roleName}
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Demonstrate this stakeholder's actual operational action in the NERAMAC Traceability System. Click to generate real transaction and cryptographic verification records.
            </p>
          </div>

          {/* Action Trigger Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Designated Operational Event
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                {stakeholder.id === 'FARMER' && "Submit Harvest Authorisation Application to DFO"}
                {stakeholder.id === 'FIELD_AGENT' && "Capture Menu-Driven Inoculation with In-App Photo Hash"}
                {stakeholder.id === 'NERAMAC_ADMIN' && "Execute Maker-Checker Verification on DFO Felling Order"}
                {stakeholder.id === 'DFO_FOREST_DEPT' && "Issue Statutory Harvest Order & Transit Clearance"}
                {stakeholder.id === 'AGGREGATOR' && "Perform Gate Weighment & Enforce 1.5% Variance Limit"}
                {stakeholder.id === 'CPC_OPERATOR' && "Execute Hydro-Distillation Run & Material Balance Calculation"}
                {stakeholder.id === 'LAB_OFFICER' && "Conduct GC-MS Purity Test & CITES Species Confirmation"}
                {stakeholder.id === 'PACKAGING_OFFICER' && "Generate Cryptographically Serialized QR Code for Pack"}
                {stakeholder.id === 'EXPORTER_LOGISTICS' && "Assemble Terminal Export Lot for Air Cargo Guwahati"}
                {stakeholder.id === 'AUDITOR' && "Inspect Unbroken 15-Identity Chain & Tamper Proofs"}
                {stakeholder.id === 'BUYER_PUBLIC' && "Scan Pack QR Code for Verified Provenance Claim"}
              </h4>
              <p className="text-xs text-slate-700 mt-1 max-w-xl">
                Executes the authoritative business logic and updates the persistent traceability ledger.
              </p>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-slate-900 font-bold text-xs shadow-lg transition flex items-center gap-2 flex-shrink-0"
            >
              <Cpu className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? "Executing on Ledger..." : "Execute Role Action"}</span>
            </button>
          </div>

          {/* Simulation Output Card */}
          {simulationResult && (
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-5 text-xs text-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-800/40 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-900 text-sm">{simulationResult.title}</span>
                </div>
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  {simulationResult.badge}
                </span>
              </div>

              <p className="text-slate-200 leading-relaxed font-medium">
                {simulationResult.details}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-700 pt-2 border-t border-emerald-900/50">
                <div>Identity Issued: <span className="text-emerald-400 font-bold">{simulationResult.idGenerated}</span></div>
                <div>Ledger Status: <span className="text-teal-300 font-bold">{simulationResult.status}</span></div>
                <div>Recorded: <span className="text-slate-600">{new Date().toLocaleTimeString()}</span></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
