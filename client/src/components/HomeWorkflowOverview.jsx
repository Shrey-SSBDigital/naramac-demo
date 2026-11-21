import React, { useState } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { USER_ROLES } from '../data/mockEnterpriseData';
import { ROLE_PERMISSIONS } from '../utils/rbacConfig';
import {
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Users,
  MapPin,
  Trees,
  Syringe,
  Axe,
  Truck,
  Boxes,
  Factory,
  FlaskConical,
  PackageCheck,
  PlaneTakeoff,
  QrCode,
  FileBadge2,
  Lock,
  ChevronRight,
  Info,
  Building2,
  Fingerprint
} from 'lucide-react';

export default function HomeWorkflowOverview({ onNavigate }) {
  const { activeRole, setActiveRole, addToast, farmerApplications, farmers } = useEnterprise();
  const [selectedStage, setSelectedStage] = useState(1);
  const [activeTab, setActiveTab] = useState('PIPELINE'); // 'PIPELINE' | 'ROLES' | 'QUICK_START'

  // The 8 Core End-to-End Value Chain Stages
  const WORKFLOW_STAGES = [
    {
      stage: 1,
      id: 'ONBOARDING',
      title: 'Farmer & Land Title Onboarding',
      subtitle: 'Revenue Validation & Dag/Patta Verification',
      moduleId: 'FARMER_REGISTER',
      path: '/farmers/register',
      icon: Users,
      color: 'emerald',
      stakeholders: ['FARMER', 'FIELD_AGENT', 'NERAMAC_ADMIN'],
      statutoryRule: 'Assam Agarwood (Aquilaria malaccensis) Policy 2020 • Land Revenue Jamabandi Title Mandate',
      inputs: 'Farmer identity, Dag & Patta revenue numbers, Jamabandi land records, DPDP Act 2023 masked Aadhaar',
      outputs: 'Pending Farmer Application (APP-AS-2026-XXX) with Lat Mandal inspection requisition',
      description: 'Farmers submit formal homestead agarwood cultivation applications declaring land titles, Dag/Patta numbers, and estimated saplings (<7y) and mature trees (≥7y). Includes DPDP Act 2023 compliant data protection.',
      makerChecker: 'Lat Mandal verifies land ownership with Circle Office; Field Agent inspects ground boundaries.'
    },
    {
      stage: 2,
      id: 'GIS_STUDIO',
      title: 'Field GIS & Forensic Photo Capture',
      subtitle: 'POLOGEN Boundary Walk & Mature Tree Tagging',
      moduleId: 'GEO_STUDIO',
      path: '/field-gis-studio',
      icon: MapPin,
      color: 'amber',
      stakeholders: ['FIELD_AGENT', 'NERAMAC_ADMIN', 'FOREST_DEPT'],
      statutoryRule: 'MoEFCC Guidelines: POLOGEN polygon capture for saplings < 7 yrs; Individual RFID nail tagging for trees ≥ 7 yrs',
      inputs: 'On-site RTK GPS location, plantation physical perimeter, tree Girth at Breast Height (GBH in cm)',
      outputs: 'Walked POLOGEN polygon geometry, tagged tree registry, tamper-evident photo stamped with Web Crypto SHA-256 buffer hash',
      description: 'NERAMAC Field Agents walk plantation perimeters creating POLOGEN polygon boundaries for young saplings and geo-pinning mature trees with laser RFID tags. Photos are watermarked and cryptographically hashed in real time.',
      makerChecker: 'SHA-256 buffer hash verifies photo integrity without server round-trip; prevents spoofed tree images.'
    },
    {
      stage: 3,
      id: 'INOCULATION',
      title: 'Cultivation & Biological Inoculation',
      subtitle: 'AAU Fusarium Fungal Inoculation & Growth Audit',
      moduleId: 'INOCULATION',
      path: '/inoculation',
      icon: Syringe,
      color: 'teal',
      stakeholders: ['FIELD_AGENT', 'FARMER', 'NERAMAC_ADMIN'],
      statutoryRule: 'Assam Agricultural University (AAU) Certified Inoculant Strains (Fusarium solani / Chaetomium globosum)',
      inputs: 'Mature Agarwood tree (GBH ≥ 50cm, age ≥ 7 yrs), certified fungal culture batch, spiral drill pattern',
      outputs: 'Cryptographic Inoculation Passport (INO-2023-XXX), induction date, 18-24 month resin maturation countdown',
      description: 'Fungal inoculum is induced into tree trunks via calibrated spiral drilling to stimulate oleoresin synthesis. Field agents record drill depth, hole counts, batch codes, and monitor resin deposition milestones.',
      makerChecker: 'Periodic field audits verify callus wound healing and resin duct development prior to felling sanction.'
    },
    {
      stage: 4,
      id: 'HARVEST_SANCTION',
      title: 'Statutory Harvest & DFO Felling Sanction',
      subtitle: 'Forest Department Clearance & Felling Orders',
      moduleId: 'HARVEST',
      path: '/harvest',
      icon: Axe,
      color: 'red',
      stakeholders: ['FOREST_DEPT', 'NERAMAC_ADMIN', 'FIELD_AGENT'],
      statutoryRule: 'DFO Felling Sanction Order • Transit Pass Form II (Assam Forest Regulation 1891 / Tripura Forest Rules)',
      inputs: 'Matured resinous tree (18+ months post-inoculation), farmer harvest application, DFO inspection dossier',
      outputs: 'Statutory DFO Felling Sanction (DFO/GLT/HARV-XXX), Stump verification photo hash, Harvest Batch (HBT-AS-2026-XXX)',
      description: 'Forest Department DFO validates that trees originate from non-forest homestead land. Field agents supervise tree felling, extract infected heartwood, record net green weight, and generate uniquely serialized Harvest Batches.',
      makerChecker: 'DFO physical stamp and field agent stump photo hash prevent illegal felling from reserved forest reserves.'
    },
    {
      stage: 5,
      id: 'MOVEMENT_DEPOT',
      title: 'Depot Intake & Gate Tolerance Control',
      subtitle: 'Weighment Reconciliation & Strict Variance Check',
      moduleId: 'MOVEMENT',
      path: '/movement',
      icon: Truck,
      color: 'blue',
      stakeholders: ['COLLECTION_OPERATOR', 'FIELD_AGENT', 'NERAMAC_ADMIN'],
      statutoryRule: 'NERAMAC SOP: Mandatory Gate Tolerance Verification (maximum allowable transit weight discrepancy ≤ ±1.5%)',
      inputs: 'Dispatched raw green heartwood, electronic Transit Pass (e-TP), dispatch weighbridge slip',
      outputs: 'Depot Receipt Certificate, certified net intake weight, gate tolerance audit record (PASS / HOLD)',
      description: 'Raw agarwood is transported to designated NERAMAC cluster collection depots (Golaghat / Hojai / Kadamtala). Operators perform dual weighment to detect moisture loss or unauthorized material substitution.',
      makerChecker: 'Automated lock: Any discrepancy exceeding ±1.5% flags automated alert and freezes transit lot for physical audit.'
    },
    {
      stage: 6,
      id: 'PROCESSING_DISTILL',
      title: 'Aggregation & CPC Hydro-Distillation',
      subtitle: 'Batch Pooling & Steam Extraction Stills',
      moduleId: 'PROCESSING',
      path: '/processing',
      icon: Factory,
      color: 'indigo',
      stakeholders: ['CPC_OPERATOR', 'NERAMAC_ADMIN'],
      statutoryRule: 'Common Facility Centre (CFC) Distillation Protocol • Strict Input/Output Mass Balance Conservation',
      inputs: 'Aggregated Harvest Batches (AGG-AS-2026-XXX), boiler charge loading, mechanical chipping & soaking logs',
      outputs: 'Grade-1 Dehn Al Oudh Pure Oil (OIL-2026-XXX), Grade-2 oil, floral hydrosol water, spent wood residue',
      description: 'Material from multiple compliant farmers is aggregated while preserving source tree lineage. The charge is hydro-distilled in calibrated stainless steel stills (ST-01 to ST-08) for 72-96 hours under controlled temperature.',
      makerChecker: 'Mass Balance Ledger calculates input dry weight vs output oil, hydrosol, and waste to guarantee zero adulteration.'
    },
    {
      stage: 7,
      id: 'QUALITY_LAB',
      title: 'NABL Quality Lab & GC-MS Profiling',
      subtitle: 'Chemical Purity & CITES Species Authentication',
      moduleId: 'LABORATORY',
      path: '/laboratory',
      icon: FlaskConical,
      color: 'purple',
      stakeholders: ['LAB_OFFICER', 'NERAMAC_ADMIN', 'FOREST_DEPT'],
      statutoryRule: 'ISO/IEC 17025 Accredited Laboratory Testing • CITES Appendix II Species Verification (Aquilaria malaccensis)',
      inputs: 'Sterile 50ml composite oil sample (SMP-LAB-2026-XXX) drawn under dual custody',
      outputs: 'Gas Chromatography-Mass Spectrometry (GC-MS) report, Sesquiterpene biomarker index, Certificate of Analysis (CoA)',
      description: 'Accredited chemists test the oil for key therapeutic sesquiterpenes (Agarospirol ≥ 8.5%, Jinkoh-eremol, Guaiol). Checks ensure zero synthetic DPG, DEP, or mineral oil dilution, releasing the lot for packaging.',
      makerChecker: 'Dual digital signatures by Chemist and Laboratory Director required before Certificate of Analysis is minted.'
    },
    {
      stage: 8,
      id: 'PACKAGING_EXPORT',
      title: 'Laser QR Packaging & Global Export',
      subtitle: 'Serialized Crystal Flacons & CITES Export Lots',
      moduleId: 'FINISHED_PRODUCTS',
      path: '/finished-products',
      icon: PackageCheck,
      color: 'emerald',
      stakeholders: ['EXPORTER', 'BUYER_PUBLIC', 'NERAMAC_ADMIN'],
      statutoryRule: 'CITES Export Permit Quota • DGFT Export Licensing • Unique Product Laser QR Serialization',
      inputs: 'Certified Grade-1 pure agarwood oil, tamper-evident 12ml crystal flacons, CITES export quota sanction',
      outputs: 'Serialized finished packs (PCK-NER-2026-XXX), Export Batches (EXP-2026-XXX), terminal shipment lots',
      description: 'Oil is bottled into luxury crystal flacons laser-etched with unique QR codes. Export batches are consolidated for customs inspection and dispatched to global perfumery markets in UAE, Saudi Arabia, EU, and Japan.',
      makerChecker: 'Public scanning instantly surfaces complete tree-to-bottle lineage, farmer compensation, and NABL purity tests.'
    }
  ];

  const currentStageData = WORKFLOW_STAGES.find(s => s.stage === selectedStage) || WORKFLOW_STAGES[0];

  const handleRoleSwitch = (roleId) => {
    setActiveRole(roleId);
    const roleObj = ROLE_PERMISSIONS[roleId];
    addToast(`Perspective updated to: ${roleObj?.name || roleId}`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 sm:p-8 shadow-md border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">
                GOVERNMENT OF INDIA • MDONER
              </span>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                Assam & Tripura Clusters
              </span>
              <span className="bg-white/10 text-emerald-200 text-[10px] font-mono px-2 py-0.5 rounded-md">
                RFP 06/31 Production Blueprint
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              NERAMAC Agarwood Traceability & Supply Chain System
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Complete forward and backward traceability engine for <span className="text-emerald-400 font-semibold italic">Aquilaria malaccensis</span> (Assam Agarwood) — from farmer homestead registration, POLOGEN GIS walking, and biological inoculation, to hydro-distillation, NABL GC-MS lab testing, and CITES export packaging.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 flex-shrink-0">
            <button
              onClick={() => onNavigate('/traceability')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition group"
            >
              <QrCode className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition" />
              <span>Launch QR Traceability Scanner</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
            <button
              onClick={() => onNavigate('/farmers/register')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span>Register New Farmer Onboarding</span>
            </button>
          </div>
        </div>

        {/* Live System Counter Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/60">
          <div className="bg-slate-900/60 backdrop-blur-sm p-3 rounded-xl border border-slate-700/40">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Registered Farmers</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{farmers.length} Growers</div>
            <div className="text-[9px] text-slate-400">Assam & Tripura Clusters</div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm p-3 rounded-xl border border-slate-700/40">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Pending Applications</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">
              {farmerApplications.filter(a => a.status !== 'APPROVED').length} In Pipeline
            </div>
            <div className="text-[9px] text-slate-400">Maker-Checker Portal</div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm p-3 rounded-xl border border-slate-700/40">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Active Role Perspective</div>
            <div className="text-lg font-black text-white mt-0.5 truncate">
              {USER_ROLES.find(r => r.id === activeRole)?.name || activeRole}
            </div>
            <div className="text-[9px] text-emerald-300">RBAC Filtered Workspace</div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm p-3 rounded-xl border border-slate-700/40">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Security & Cryptography</div>
            <div className="text-lg font-black text-cyan-400 mt-0.5">SHA-256 + RTK</div>
            <div className="text-[9px] text-slate-400">Web Crypto Forensic Seal</div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs for Home Overview */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('PIPELINE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'PIPELINE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>End-to-End Value Chain Pipeline (8 Stages)</span>
          </button>
          <button
            onClick={() => setActiveTab('ROLES')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'ROLES'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Stakeholders & Roles Matrix (10 Roles)</span>
          </button>
          <button
            onClick={() => setActiveTab('QUICK_START')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'QUICK_START'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workflow Launchpad</span>
          </button>
        </div>

        <div className="text-[11px] font-semibold text-slate-500 hidden sm:block">
          Interactive Architecture Guide
        </div>
      </div>

      {/* TAB 1: 8-STAGE VALUE CHAIN PIPELINE */}
      {activeTab === 'PIPELINE' && (
        <div className="space-y-6">
          {/* Horizontal Step Indicator Strip */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
            <div className="flex items-center min-w-[780px] justify-between">
              {WORKFLOW_STAGES.map((stg, idx) => {
                const Icon = stg.icon;
                const isSelected = selectedStage === stg.stage;
                return (
                  <React.Fragment key={stg.stage}>
                    <button
                      onClick={() => setSelectedStage(stg.stage)}
                      className={`flex flex-col items-center p-2 rounded-xl transition text-center min-w-[85px] group ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600 font-bold'
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 text-xs font-black transition ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-extrabold line-clamp-1">
                        Stage {stg.stage}
                      </span>
                      <span className="text-[9px] text-slate-500 line-clamp-1 max-w-[80px]">
                        {stg.id}
                      </span>
                    </button>
                    {idx < WORKFLOW_STAGES.length - 1 && (
                      <div className="h-0.5 flex-1 mx-1 bg-slate-200 min-w-[12px]" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Detailed Stage Deep-Dive Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-xs flex-shrink-0">
                  {currentStageData.stage}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Stage {currentStageData.stage} of 8 • Value-Chain Step
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                      Route: {currentStageData.path}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900">
                    {currentStageData.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {currentStageData.subtitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate(currentStageData.path)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
              >
                <span>Open {currentStageData.title}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Description & Overview */}
            <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
              {currentStageData.description}
            </div>

            {/* Grid of Key Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Statutory Framework */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Statutory Authority & Compliance Rule</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-normal">
                  {currentStageData.statutoryRule}
                </p>
              </div>

              {/* Maker-Checker Control */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/70 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                  <Lock className="w-3.5 h-3.5 text-blue-700" />
                  <span>Maker-Checker & Verification Gate</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-normal">
                  {currentStageData.makerChecker}
                </p>
              </div>

              {/* Inputs */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Required Input Material / Documents
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  {currentStageData.inputs}
                </p>
              </div>

              {/* Outputs */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-1">
                <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                  Generated Output Artifact / Digital Record
                </div>
                <p className="text-xs font-bold text-emerald-900">
                  {currentStageData.outputs}
                </p>
              </div>
            </div>

            {/* Responsible Stakeholders in this Stage */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Custodians for this Stage:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentStageData.stakeholders.map((roleId) => {
                    const roleInfo = USER_ROLES.find(r => r.id === roleId);
                    const isMyRole = activeRole === roleId;
                    return (
                      <span
                        key={roleId}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isMyRole
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isMyRole && <CheckCircle2 className="w-3 h-3 text-white" />}
                        {roleInfo?.name || roleId}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={selectedStage === 1}
                  onClick={() => setSelectedStage(prev => Math.max(1, prev - 1))}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  Previous Stage
                </button>
                <button
                  disabled={selectedStage === 8}
                  onClick={() => setSelectedStage(prev => Math.min(8, prev + 1))}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-40"
                >
                  Next Stage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STAKEHOLDERS & ROLES MATRIX */}
      {activeTab === 'ROLES' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-slate-800">Strict Role-Based Access Control (RBAC):</span>
              {' '}Each user role is strictly restricted to its statutory functions. The sidebar navigation dynamically adapts to only show authorized operations for the currently active perspective.
            </div>
            <div className="text-[11px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold flex-shrink-0">
              Active: {USER_ROLES.find(r => r.id === activeRole)?.name}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {USER_ROLES.map((role) => {
              const rbac = ROLE_PERMISSIONS[role.id];
              const isCurrent = activeRole === role.id;

              return (
                <div
                  key={role.id}
                  className={`bg-white rounded-xl border p-4.5 space-y-3 transition flex flex-col justify-between ${
                    isCurrent
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-black text-slate-900">{role.name}</h3>
                          {isCurrent && (
                            <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-slate-500">{rbac?.authority || role.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
                        {role.badge}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Statutory Mandate & Duties
                      </div>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {(rbac?.responsibilities || [role.desc]).map((resp, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span className="leading-snug">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-[10px] text-slate-500 font-medium">
                      Allowed Modules: <span className="font-bold text-slate-700">{rbac?.allowedModules?.length || 0}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRoleSwitch(role.id)}
                        disabled={isCurrent}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                          isCurrent
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
                        }`}
                      >
                        {isCurrent ? 'Active Perspective' : 'Switch to this Role'}
                      </button>
                      <button
                        onClick={() => {
                          handleRoleSwitch(role.id);
                          if (rbac?.defaultRoute) onNavigate(rbac.defaultRoute);
                        }}
                        className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                        title="Switch and navigate to primary screen"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: WORKFLOW LAUNCHPAD */}
      {activeTab === 'QUICK_START' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Farmer Onboarding */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Farmer Registration Form</h3>
              <p className="text-xs text-slate-500 mt-1">
                Formal registration form with Jamabandi Dag/Patta upload and DPDP Act masked Aadhaar.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/farmers/register')}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Go to Registration Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Field GIS Studio */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Field GIS Studio & SHA-256</h3>
              <p className="text-xs text-slate-500 mt-1">
                Walk POLOGEN boundaries, geo-pin mature trees, and capture SHA-256 watermarked photos.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/field-gis-studio')}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Open Field GIS Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: NERAMAC Maker-Checker Approvals */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">NERAMAC Maker-Checker Portal</h3>
              <p className="text-xs text-slate-500 mt-1">
                Review Lat Mandal verification, inspect SHA-256 field photos, and sanction digital FRM IDs.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/farmers/approvals')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Open Approvals Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Distillation & CPC Stills */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Distillation & CPC Stills</h3>
              <p className="text-xs text-slate-500 mt-1">
                Hydro-distillation charge runs (ST-01 to ST-08) and strict input/output mass balance ledger.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/processing')}
              className="w-full py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Open Processing Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 5: NABL Lab & GC-MS Profiles */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">NABL Quality Lab & GC-MS</h3>
              <p className="text-xs text-slate-500 mt-1">
                Sesquiterpene biomarker chemical profiling and Certificate of Analysis (CoA) release.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/laboratory')}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Open Laboratory Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 6: QR Provenance Scanner */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">QR Provenance Scanner</h3>
              <p className="text-xs text-slate-500 mt-1">
                Scan or enter any finished flacon or batch ID to verify forward and backward provenance.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/traceability')}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Open Traceability Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
