import React, { useState } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { USER_ROLES } from '../data/mockEnterpriseData';
import { ROLE_PERMISSIONS } from '../utils/rbacConfig';
import {
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Sparkles,
  ExternalLink,
  Users,
  UserPlus,
  MapPin,
  Trees,
  Syringe,
  Axe,
  Scale,
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
  Fingerprint,
  ShoppingBag,
  Eye,
  LayoutDashboard,
  Search,
  Check,
  RotateCcw,
  AlertCircle,
  FileCheck,
  Workflow,
  HelpCircle,
  Clock,
  Compass
} from 'lucide-react';

export default function HomeWorkflowOverview({ onNavigate }) {
  const {
    activeRole,
    setActiveRole,
    addToast,
    farmers,
    farmerApplications,
    pologens,
    trees,
    harvests,
    harvestBatches,
    movements,
    aggregations,
    distillations,
    labTests,
    finishedProducts,
    exportBatches,
    domesticSales
  } = useEnterprise();

  const [activeTab, setActiveTab] = useState('WORKFLOW'); // 'WORKFLOW' | 'STAKEHOLDERS' | 'DECISION_TREE'
  const [selectedPhaseId, setSelectedPhaseId] = useState('FIELD_SETUP');
  const [selectedOneLineNodeIndex, setSelectedOneLineNodeIndex] = useState(0);
  const [simulatedDfoDecision, setSimulatedDfoDecision] = useState('YES'); // 'YES' | 'NO'

  // The Exact 5 Phases with all 24+ nodes as requested
  const WORKFLOW_PHASES = [
    {
      id: 'FIELD_SETUP',
      number: '1',
      title: 'Field Setup',
      subtitle: 'Start → Farmer Registration → Farmer Verification → Plot Registration → GPS Polygon & POLOGEN ID → Tree Registration & Tree ID → Cultivation & Inoculation',
      color: 'emerald',
      badge: 'Origin & Plantation',
      summary: 'Establishes homestead provenance, land titles, and biological tree inventory at the primary producer gate.',
      nodes: [
        { name: 'Start', detail: 'Onboarding Initiation & KYC Intent', icon: Compass, path: '/farmer' },
        { name: 'Farmer Registration', detail: 'Homestead profile & DPDP masked identity', icon: UserPlus, path: '/farmer/register' },
        { name: 'Farmer Verification', detail: 'NERAMAC Maker-Checker title inspection', icon: ShieldCheck, path: '/farmer/approvals' },
        { name: 'Plot Registration', detail: 'Revenue Dag/Patta & cadastral boundary', icon: Trees, path: '/plantations' },
        { name: 'GPS Polygon & POLOGEN ID', detail: 'Young sapling block boundary (<7 yrs)', icon: MapPin, path: '/field-inspection' },
        { name: 'Tree Registration & Tree ID', detail: 'Mature tree tag with RFID (≥7 yrs)', icon: Trees, path: '/field-inspection' },
        { name: 'Cultivation & Inoculation', detail: 'AAU biological Fusarium solani induction', icon: Syringe, path: '/inoculation' }
      ],
      metrics: `${farmers.length} Farmers · ${pologens.length} POLOGENs · ${trees.length} Trees Registered`,
      statutoryRule: 'Assam Agarwood Policy 2020 • Land Revenue Jamabandi Title Mandate • AAU Certified Inoculation'
    },
    {
      id: 'APPROVAL',
      number: '2',
      title: 'Approval',
      subtitle: '→ Harvest Application → NERAMAC Verification → DFO Approval → Approved? (No loops back / Yes issues Harvest Authorisation ID)',
      color: 'amber',
      badge: 'Statutory Gate',
      summary: 'Strict regulatory check ensuring timber is cultivated on private homestead land, preventing wild reserve felling.',
      nodes: [
        { name: 'Harvest Application', detail: 'Farmer submits requisition with tree RFID & quota', icon: Axe, path: '/harvest' },
        { name: 'NERAMAC Verification', detail: 'Field Agent on-site homestead origin confirmation', icon: ShieldCheck, path: '/harvest' },
        { name: 'DFO Approval', detail: 'Divisional Forest Officer statutory scrutiny', icon: FileCheck, path: '/harvest' },
        { name: 'Decision: Approved?', detail: 'No → loops back to Application | Yes → Harvest Authorisation ID', icon: HelpCircle, path: '/harvest', isDecision: true }
      ],
      decisionDetail: {
        noBranch: 'No → Application rejected with deficiency note; loops back to Harvest Application for farmer correction.',
        yesBranch: 'Yes → Issues official Harvest Authorisation ID (e.g. HA-AS-GLG-2026-081) and statutory felling permit.'
      },
      metrics: `${harvests.length} Felling Applications · ${harvests.filter(h => h.harvestAuthorisationId || h.status.includes('APPROVED')).length} Authorisations Granted`,
      statutoryRule: 'Assam Forest Regulation 1891 • DFO Statutory Felling Sanction Order • Non-Forest Clearance'
    },
    {
      id: 'HARVEST_PROCESSING',
      number: '3',
      title: 'Harvest to Processing',
      subtitle: '→ Harvest Recording → Harvest Batch Creation → Farm to Aggregator → Aggregator to Distillery → Receipt & Weight Reconciliation → Processing / Distillation',
      color: 'cyan',
      badge: 'Chain of Custody & Yield',
      summary: 'Supervised tree felling, certified farm-gate weighment, transit manifests, and hydro-distillation run.',
      nodes: [
        { name: 'Harvest Recording', detail: 'Farm-gate supervised felling & stump SHA-256 photo', icon: Scale, path: '/harvest' },
        { name: 'Harvest Batch Creation', detail: 'Mints Harvest Batch (HBT-AS-2026-xxx) linked to trees', icon: QrCode, path: '/harvest' },
        { name: 'Farm to Aggregator', detail: 'Dispatch under e-Transit Pass Form II to depot', icon: Truck, path: '/movement' },
        { name: 'Aggregator to Distillery', detail: 'Depot pooled batch aggregation to CPC distillation', icon: Boxes, path: '/aggregation' },
        { name: 'Receipt & Weight Reconciliation', detail: 'Dual weighment check with ≤ ±1.5% gate tolerance', icon: Scale, path: '/movement' },
        { name: 'Processing / Distillation', detail: 'Boilers ST-01 to ST-08 (72-96h), pure oil & hydrosol', icon: Factory, path: '/processing' }
      ],
      metrics: `${harvestBatches.length} Harvest Batches · ${movements.length} Transit Dispatches · ${distillations.length} Distillation Stills Active`,
      statutoryRule: 'Electronic Transit Pass (e-TP) • Form II Assam Forest Rules • NERAMAC Gate Tolerance (±1.5%)'
    },
    {
      id: 'QUALITY_COMPLIANCE',
      number: '4',
      title: 'Quality and Compliance',
      subtitle: '→ Lot Split/Merge & Batch Genealogy → Lab Testing & QA Approval → Permit & Document Linking',
      color: 'purple',
      badge: 'NABL Quality & Integrity',
      summary: 'Maintains multi-source batch genealogy through splitting/merging and certifies chromatographic chemical purity.',
      nodes: [
        { name: 'Lot Split/Merge & Batch Genealogy', detail: 'Preserves multi-source lineage through splitting & pooling', icon: GitBranch, path: '/aggregation' },
        { name: 'Lab Testing & QA Approval', detail: 'NABL ISO 17025 GC-MS purity release (Agarospirol ≥ 8.5%)', icon: FlaskConical, path: '/laboratory' },
        { name: 'Permit & Document Linking', detail: 'Cryptographic binding of e-TP, DFO sanction, CITES NOC', icon: FileBadge2, path: '/permits' }
      ],
      metrics: `${aggregations.length} Aggregated Lots · ${labTests.length} NABL GC-MS Tests Passed`,
      statutoryRule: 'ISO/IEC 17025 Accredited Laboratory Testing • CITES Appendix II Botanical Verification'
    },
    {
      id: 'PACK_TRACEABILITY',
      number: '5',
      title: 'Pack to Traceability',
      subtitle: '→ Packaging & Pack Identity → QR Code Generation → Export & Dispatch → QR Verification → Forward & Backward Traceability → Dashboard, Reports & Audit Trail → End',
      color: 'blue',
      badge: 'Consumer Trust & Governance',
      summary: 'Serialized luxury flacon bottling, tamper-evident laser QR, commercial dispatch, and immutable provenance.',
      nodes: [
        { name: 'Packaging & Pack Identity', detail: '12ml crystal flacons with unique Serial No. (PCK-NER-2026-xxx)', icon: PackageCheck, path: '/finished-products' },
        { name: 'QR Code Generation', detail: 'Laser-etched high-density cryptographic QR code', icon: QrCode, path: '/finished-products' },
        { name: 'Export & Dispatch', detail: 'Customs shipping bills vs domestic attar perfumery orders', icon: PlaneTakeoff, path: '/export' },
        { name: 'QR Verification', detail: 'Smartphone camera scan & instant public authenticity check', icon: Eye, path: '/traceability' },
        { name: 'Forward & Backward Traceability', detail: 'Full multi-hop supply chain graph from bottle back to farmer', icon: GitBranch, path: '/traceability' },
        { name: 'Dashboard, Reports & Audit Trail', detail: 'Executive KPI analytics & mass balance ledger → End', icon: LayoutDashboard, path: '/dashboard' }
      ],
      metrics: `${finishedProducts.length} Serialized Flacons · ${exportBatches.length} Export Batches · ${domesticSales.length} Domestic Invoices`,
      statutoryRule: 'DPDP Act 2023 Compliant Public Provenance • DGFT Export Licensing • CITES Appendix II'
    }
  ];

  // The Exact 24-Node One-Line Pipeline specified by the user
  const ONE_LINE_PIPELINE = [
    { label: 'Register farmer', path: '/farmer/register', phase: 'FIELD_SETUP', desc: 'Farmer self-registration with homestead land declaration' },
    { label: 'verify', path: '/farmer/approvals', phase: 'FIELD_SETUP', desc: 'NERAMAC maker-checker identity and land title verification' },
    { label: 'register plot', path: '/plantations', phase: 'FIELD_SETUP', desc: 'Homestead plantation parcel declaration with cadastral Dag/Patta' },
    { label: 'GPS/POLOGEN', path: '/field-inspection', phase: 'FIELD_SETUP', desc: 'Field agent walks perimeter for young sapling block (<7 yrs)' },
    { label: 'trees', path: '/field-inspection', phase: 'FIELD_SETUP', desc: 'Laser RFID nail tagging of individual mature trees (≥7 yrs)' },
    { label: 'cultivation', path: '/inoculation', phase: 'FIELD_SETUP', desc: 'Fusarium solani biological fungal inoculation and health monitoring' },
    { label: 'harvest application', path: '/harvest', phase: 'APPROVAL', desc: 'Farmer declares mature trees & submits felling requisition' },
    { label: 'NERAMAC', path: '/harvest', phase: 'APPROVAL', desc: 'Field Agent verifies on-site tree RFID and homestead land validity' },
    { label: 'DFO approval (No loops back)', path: '/harvest', phase: 'APPROVAL', isLoop: true, desc: 'DFO Decision Gate: If NO → loops back to Application with deficiency' },
    { label: 'authorisation', path: '/harvest', phase: 'APPROVAL', desc: 'If YES → issues official Harvest Authorisation ID & felling permit' },
    { label: 'harvest', path: '/harvest', phase: 'HARVEST_PROCESSING', desc: 'Supervised felling, digital scale weighment, stump SHA-256 photo' },
    { label: 'batch', path: '/harvest', phase: 'HARVEST_PROCESSING', desc: 'Creation of Harvest Batch (HBT-AS-2026-xxx) preserving tree IDs' },
    { label: 'aggregator', path: '/movement', phase: 'HARVEST_PROCESSING', desc: 'Farm to Collection Centre transit under e-Transit Pass Form II' },
    { label: 'distillery', path: '/aggregation', phase: 'HARVEST_PROCESSING', desc: 'Depot Aggregated Batch (AGB-xxx) transfer to CPC Distillation Plant' },
    { label: 'weight check', path: '/movement', phase: 'HARVEST_PROCESSING', desc: 'Gate tolerance verification enforcing ≤ ±1.5% weighment discrepancy' },
    { label: 'distill', path: '/processing', phase: 'HARVEST_PROCESSING', desc: 'Hydro-distillation Boilers ST-01 to ST-08 (72-96h), oil/hydrosol output' },
    { label: 'lot genealogy', path: '/aggregation', phase: 'QUALITY_COMPLIANCE', desc: 'Preserving full source batch genealogy across splits and charges' },
    { label: 'lab QA', path: '/laboratory', phase: 'QUALITY_COMPLIANCE', desc: 'NABL ISO 17025 GC-MS purity testing and Certificate of Analysis' },
    { label: 'permits', path: '/permits', phase: 'QUALITY_COMPLIANCE', desc: 'Binding felling sanctions, transit passes, CITES and customs permits' },
    { label: 'packaging', path: '/finished-products', phase: 'PACK_TRACEABILITY', desc: '12ml crystal flacons packaging with unique serial number' },
    { label: 'QR', path: '/finished-products', phase: 'PACK_TRACEABILITY', desc: 'Laser-etched tamper-evident cryptographic QR code on each bottle' },
    { label: 'dispatch', path: '/export', phase: 'PACK_TRACEABILITY', desc: 'CITES air cargo shipping lots vs domestic perfumery sales' },
    { label: 'QR verify', path: '/traceability', phase: 'PACK_TRACEABILITY', desc: 'Instant smartphone QR scan for consumer provenance check' },
    { label: 'traceability', path: '/traceability', phase: 'PACK_TRACEABILITY', desc: 'Full bidirectional chain-of-custody provenance graph' },
    { label: 'dashboard/audit', path: '/dashboard', phase: 'PACK_TRACEABILITY', desc: 'Executive KPI tracking, mass balance conservation ledger' },
    { label: 'End', path: '/audit-reports', phase: 'PACK_TRACEABILITY', desc: 'Immutable audit trail archival and statutory compliance clearance' }
  ];

  const currentPhase = WORKFLOW_PHASES.find(p => p.id === selectedPhaseId) || WORKFLOW_PHASES[0];
  const currentNode = ONE_LINE_PIPELINE[selectedOneLineNodeIndex] || ONE_LINE_PIPELINE[0];

  const handleRoleSwitch = (roleId) => {
    setActiveRole(roleId);
    const roleObj = ROLE_PERMISSIONS[roleId];
    addToast(`Switched active perspective to: ${roleObj?.name || roleId}`, 'info');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* 1. Header Bar */}
      <header className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg ring-2 ring-emerald-500/20">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-white tracking-tight">NERAMAC ASCTS</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Official Supply Chain Architecture
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Agarwood Traceability & Supply Chain Management System • End-to-End Enterprise Flow
            </p>
          </div>
        </div>

        {/* Quick Route Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => onNavigate('/farmer')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Farmers</span>
          </button>
          <button
            onClick={() => onNavigate('/field-inspection')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>Field Inspection</span>
          </button>
          <button
            onClick={() => onNavigate('/harvest')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Axe className="w-3.5 h-3.5 text-amber-400" />
            <span>Harvest & Approval</span>
          </button>
          <button
            onClick={() => onNavigate('/movement')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Movement</span>
          </button>
          <button
            onClick={() => onNavigate('/processing')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Factory className="w-3.5 h-3.5 text-blue-400" />
            <span>Processing</span>
          </button>
          <button
            onClick={() => onNavigate('/laboratory')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
            <span>Lab QA</span>
          </button>
          <button
            onClick={() => onNavigate('/traceability')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Verify QR</span>
          </button>
          <button
            onClick={() => onNavigate('/dashboard')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </div>
      </header>

      {/* 2. MASTER ONE-LINE PIPELINE RUNNER BANNER */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/30 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Workflow className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Complete End-to-End One-Line Version (26 Operational Steps)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Click any step to inspect & launch its working module
          </span>
        </div>

        {/* Scrollable / Interactive Full One-Line Sequence */}
        <div className="overflow-x-auto pb-2 pt-1 scrollbar-thin">
          <div className="flex items-center gap-1 min-w-max text-xs">
            {ONE_LINE_PIPELINE.map((node, index) => {
              const isSelected = selectedOneLineNodeIndex === index;
              return (
                <React.Fragment key={index}>
                  <button
                    onClick={() => {
                      setSelectedOneLineNodeIndex(index);
                      setSelectedPhaseId(node.phase);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap text-xs border ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md ring-2 ring-emerald-400/30'
                        : node.isLoop
                        ? 'bg-rose-950/80 text-rose-300 border-rose-700/60 hover:bg-rose-900'
                        : 'bg-slate-800/80 text-slate-200 border-slate-700/80 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] opacity-60 font-mono">#{index + 1}</span>
                    <span>{node.label}</span>
                  </button>
                  {index < ONE_LINE_PIPELINE.length - 1 && (
                    <span className="text-slate-600 font-bold px-0.5">→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Active Node Detail Card with Direct Launch */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Step {selectedOneLineNodeIndex + 1} of 26 • Phase: {currentNode.phase.replace('_', ' ')}
              </span>
              <span className="font-extrabold text-sm text-white">
                {currentNode.label}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {currentNode.desc}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onNavigate(currentNode.path)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Launch Step Module ({currentNode.path})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Navigation View Switcher (5 PHASES vs DECISION TREE vs STAKEHOLDERS) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('WORKFLOW')}
          className={`px-4 py-2 rounded-xl font-extrabold transition flex items-center gap-2 ${
            activeTab === 'WORKFLOW'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>The 5 Core Workflow Phases</span>
        </button>

        <button
          onClick={() => setActiveTab('DECISION_TREE')}
          className={`px-4 py-2 rounded-xl font-extrabold transition flex items-center gap-2 ${
            activeTab === 'DECISION_TREE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Approval Gate Decision Tree (Approved? Loop)</span>
        </button>

        <button
          onClick={() => setActiveTab('STAKEHOLDERS')}
          className={`px-4 py-2 rounded-xl font-extrabold transition flex items-center gap-2 ${
            activeTab === 'STAKEHOLDERS'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span>10 Stakeholder Matrix & Responsibilities</span>
        </button>
      </div>

      {/* 4. TAB 1: THE 5 DETAILED PHASES VIEW */}
      {activeTab === 'WORKFLOW' && (
        <div className="space-y-6">
          {/* Phase Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {WORKFLOW_PHASES.map((p) => {
              const isSelected = selectedPhaseId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPhaseId(p.id)}
                  className={`text-left p-4 rounded-2xl border-2 transition space-y-2 ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 shadow-xl'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                      isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.number}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {p.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-sm font-black ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {p.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {p.summary}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Phase Deep Dive Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Phase {currentPhase.number} of 5 • {currentPhase.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {currentPhase.metrics}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {currentPhase.title}
                </h2>
                <div className="text-xs font-mono text-emerald-300/90 pt-1">
                  {currentPhase.subtitle}
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1 max-w-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Statutory Clearance:</span>
                <span className="font-semibold text-slate-300 block">{currentPhase.statutoryRule}</span>
              </div>
            </div>

            {/* Nodes in this Phase */}
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                Operational Sequence & Modules:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {currentPhase.nodes.map((node, nIdx) => {
                  const Icon = node.icon;
                  return (
                    <div
                      key={nIdx}
                      className={`p-4 rounded-2xl border transition space-y-2 flex flex-col justify-between ${
                        node.isDecision
                          ? 'bg-amber-950/30 border-amber-600/50 hover:border-amber-500'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            node.isDecision ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            Node {nIdx + 1}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-white">
                            {node.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                            {node.detail}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500">{node.path}</span>
                        <button
                          onClick={() => onNavigate(node.path)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Callout if Approval Phase */}
            {currentPhase.id === 'APPROVAL' && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 space-y-2 text-xs">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Statutory Decision Gateway Logic:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl space-y-1">
                    <span className="font-black text-rose-300">Decision [NO]:</span>
                    <p className="text-[11px] text-rose-200/80">
                      DFO rejects with deficiency remark (e.g. homestead Patta discrepancy). Application <strong>loops back to Harvest Application</strong> for farmer revision.
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl space-y-1">
                    <span className="font-black text-emerald-300">Decision [YES]:</span>
                    <p className="text-[11px] text-emerald-200/80">
                      DFO issues official <strong>Harvest Authorisation ID</strong> (e.g. HA-AS-GLG-2026-081) and statutory felling permit. Unlocks field felling and scale weighment.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TAB 2: INTERACTIVE APPROVAL DECISION TREE (Approved? Loop) */}
      {activeTab === 'DECISION_TREE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-white shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Phase 2 Focus • Statutory Governance
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Approval Gate: Harvest Application → NERAMAC Verification → DFO Approval → Approved?
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Strict maker-checker statutory loop ensuring wild agarwood trees from reserved forests cannot be harvested under false claims.
            </p>
          </div>

          {/* Visual Interactive Diagram */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-center text-xs">
              {/* Step 1: Farmer App */}
              <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Step 1</span>
                <div className="font-extrabold text-white text-sm">Harvest Application</div>
                <div className="text-[11px] text-slate-400">Farmer submits tree RFID & estimated kg</div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-center text-slate-600 font-black">
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>

              {/* Step 2: NERAMAC Verification */}
              <div className="p-4 bg-slate-900 border border-amber-700/80 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase">Step 2</span>
                <div className="font-extrabold text-amber-300 text-sm">NERAMAC Verification</div>
                <div className="text-[11px] text-slate-400">Field agent physical tree & Dag/Patta check</div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-center text-slate-600 font-black">
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>

            {/* DFO Decision Gateway */}
            <div className="border-t border-slate-800 pt-6 space-y-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 bg-purple-950 border-2 border-purple-500 rounded-2xl flex items-center justify-center font-black text-purple-300 text-lg shadow-lg">
                  ?
                </div>
                <div className="font-black text-base text-purple-200">
                  DFO Approval Gate: Approved?
                </div>
                <p className="text-xs text-slate-400 max-w-md">
                  Divisional Forest Officer evaluates revenue non-forest records and tree inspection report.
                </p>

                {/* Interactive Decision Toggle */}
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-slate-400">Simulate DFO Decision:</span>
                  <button
                    onClick={() => setSimulatedDfoDecision('NO')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                      simulatedDfoDecision === 'NO'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    No (Deficiency)
                  </button>
                  <button
                    onClick={() => setSimulatedDfoDecision('YES')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                      simulatedDfoDecision === 'YES'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Yes (Approved)
                  </button>
                </div>
              </div>

              {/* The Two Branches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {/* NO Branch */}
                <div className={`p-5 rounded-2xl border-2 transition space-y-2 ${
                  simulatedDfoDecision === 'NO'
                    ? 'bg-rose-950/60 border-rose-500 shadow-xl'
                    : 'bg-slate-900/40 border-slate-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                      BRANCH: NO (Rejected)
                    </span>
                    <RotateCcw className="w-4 h-4 text-rose-400" />
                  </div>
                  <h4 className="text-sm font-extrabold text-white">
                    Loops Back to Harvest Application
                  </h4>
                  <p className="text-xs text-rose-200/80 leading-relaxed">
                    Application status set to <code>DFO_REJECTED_RETURNED_TO_FARMER</code>. Farmer receives deficiency note, updates homestead document or tree girth notes, and re-submits to restart inspection.
                  </p>
                  <button
                    onClick={() => onNavigate('/harvest')}
                    className="mt-2 px-3 py-1 bg-rose-900/80 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>View Loop in /harvest</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* YES Branch */}
                <div className={`p-5 rounded-2xl border-2 transition space-y-2 ${
                  simulatedDfoDecision === 'YES'
                    ? 'bg-emerald-950/60 border-emerald-500 shadow-xl'
                    : 'bg-slate-900/40 border-slate-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      BRANCH: YES (Approved)
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-extrabold text-white">
                    Harvest Authorisation ID Issued
                  </h4>
                  <p className="text-xs text-emerald-200/80 leading-relaxed">
                    DFO issues statutory Felling Sanction Order and unique <strong>Harvest Authorisation ID</strong> (e.g. <code>HA-AS-GLG-2026-081</code>). Unlocks supervised tree felling, scale weighment, and Harvest Batch creation.
                  </p>
                  <button
                    onClick={() => onNavigate('/harvest')}
                    className="mt-2 px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>View Authorisations in /harvest</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: 10 STAKEHOLDERS & RESPONSIBILITIES MATRIX */}
      {activeTab === 'STAKEHOLDERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-white shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Governance & Segregation of Duties
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              10 Stakeholder Roles & Statutory Responsibilities
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Each stakeholder operates under strict maker-checker controls. Switch perspectives anytime via the navbar or role buttons below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {USER_ROLES.map((role) => {
              const rbac = ROLE_PERMISSIONS[role.id];
              const isCurrent = activeRole === role.id;
              return (
                <div
                  key={role.id}
                  className={`p-4 rounded-2xl border transition space-y-3 flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-slate-950 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {role.id}
                      </span>
                      {isCurrent ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                          Active Perspective
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRoleSwitch(role.id)}
                          className="text-[10px] font-bold text-emerald-400 hover:underline"
                        >
                          Switch Role
                        </button>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">
                        {role.name}
                      </h4>
                      <div className="text-[11px] font-semibold text-emerald-400">
                        {role.badge}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {role.desc}
                      </p>
                    </div>

                    {/* Responsibilities list */}
                    {rbac?.responsibilities && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Core Duties:</span>
                        <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                          {rbac.responsibilities.slice(0, 2).map((resp, rIdx) => (
                            <li key={rIdx} className="leading-snug">{resp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">{rbac?.allowedModules?.length || 0} Modules</span>
                    <button
                      onClick={() => onNavigate(rbac?.defaultRoute || '/')}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <span>Go to Primary View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
