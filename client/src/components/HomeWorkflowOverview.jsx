import React, { useState } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { USER_ROLES } from '../data/mockEnterpriseData';
import { ROLE_PERMISSIONS } from '../utils/rbacConfig';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
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
  Building2,
  LayoutDashboard,
  RotateCcw,
  AlertCircle,
  FileCheck,
  Workflow,
  HelpCircle,
  Compass
} from 'lucide-react';

export default function HomeWorkflowOverview({ onNavigate }) {
  const {
    activeRole,
    setActiveRole,
    addToast,
    farmers,
    pologens,
    trees,
    harvests,
  } = useEnterprise();

  // Tabs: 'WORKFLOW' (Default) | 'DECISION_TREE' | 'STAKEHOLDERS'
  const [activeTab, setActiveTab] = useState('WORKFLOW');
  const [selectedPhaseId, setSelectedPhaseId] = useState('FIELD_SETUP');
  const [selectedOneLineNodeIndex, setSelectedOneLineNodeIndex] = useState(0);
  const [simulatedDfoDecision, setSimulatedDfoDecision] = useState('YES'); // 'YES' | 'NO'

  // The Exact 5 Phases with all 24+ nodes as per statutory flow
  const WORKFLOW_PHASES = [
    {
      id: 'FIELD_SETUP',
      number: '1',
      title: 'Field Setup',
      subtitle: 'Start → Farmer Registration → Farmer Verification → Plot Registration → GPS Polygon & POLOGEN ID → Tree Registration & Tree ID → Inoculation',
      badge: 'Origin & Plantation',
      summary: 'Establishes homestead provenance, revenue land titles (Dag/Patta), and biological tree inventory at the primary producer gate.',
      nodes: [
        { name: 'Start', detail: 'Onboarding Initiation & KYC Intent', icon: Compass, path: '/farmer' },
        { name: 'Farmer Registration', detail: 'Homestead profile & digital identity', icon: UserPlus, path: '/farmer/register' },
        { name: 'Farmer Verification', detail: 'NERAMAC farmer & land title verification', icon: ShieldCheck, path: '/farmer/approvals' },
        { name: 'Plot Registration', detail: 'Revenue Dag/Patta & land boundary', icon: Trees, path: '/plantation' },
        { name: 'GPS Polygon & POLOGEN ID', detail: 'Young sapling block boundary (<7 yrs)', icon: MapPin, path: '/field-inspection' },
        { name: 'Tree Registration & Tree ID', detail: 'Mature tree tag with QR ID (≥7 yrs)', icon: Trees, path: '/field-inspection' },
        { name: 'Inoculation', detail: 'AAU biological Fusarium solani induction', icon: Syringe, path: '/inoculation' }
      ],
      metrics: `${farmers.length} Farmers · ${pologens.length} POLOGENs · ${trees.length} Trees Registered`,
      statutoryRule: 'Assam Agarwood Policy 2020 • Land Revenue Jamabandi Title Mandate • AAU Certified Inoculation'
    },
    {
      id: 'APPROVAL',
      number: '2',
      title: 'Approval',
      subtitle: '→ Harvest Application → NERAMAC Verification → DFO Approval → Approved? (No loops back / Yes issues Harvest Authorisation ID)',
      badge: 'Statutory Gate',
      summary: 'Strict regulatory check ensuring timber is grown on private homestead land, preventing wild reserve felling.',
      nodes: [
        { name: 'Harvest Application', detail: 'Farmer submits requisition with tree QR ID & quota', icon: Axe, path: '/harvest' },
        { name: 'DFO Approval', detail: 'Divisional Forest Officer statutory scrutiny', icon: FileCheck, path: '/harvest' },
        { name: 'Decision: Approved?', detail: 'No → loops back to Application | Yes → Harvest Authorisation ID', icon: HelpCircle, path: '/harvest', isDecision: true }
      ],
      metrics: `${harvests.length} Felling Applications · ${harvests.filter(h => h.harvestAuthorisationId || h.status.includes('APPROVED')).length} Authorisations Granted`,
      statutoryRule: 'Assam Forest Regulation 1891 • DFO Statutory Felling Sanction Order • Non-Forest Clearance'
    },
    {
      id: 'HARVEST_PROCESSING',
      number: '3',
      title: 'Harvest to Processing',
      subtitle: '→ Harvest Recording → Harvest Batch Creation → Farm to Aggregator → Aggregator to Distillery → Receipt & Weight Reconciliation → Processing / Distillation',
      badge: 'Chain of Custody & Yield',
      summary: 'Supervised tree felling, certified farm gate weighment, transit manifests, and industrial hydro-distillation extraction.',
      nodes: [
        { name: 'Harvest Recording', detail: 'Supervised tree felling, QR scan & scale weight', icon: Axe, path: '/harvest' },
        { name: 'Harvest Batch Creation', detail: 'Mints Harvest Batch ID (HBT) with stump SHA-256', icon: Boxes, path: '/harvest' },
        { name: 'Farm to Aggregator', detail: 'e-Transit Pass movement from farm gate to depot', icon: Truck, path: '/movement' },
        { name: 'Aggregator to Distillery', detail: 'Consolidated haulage to Central Processing Centre', icon: Truck, path: '/movement' },
        { name: 'Receipt & Weight Check', detail: 'Depot weight variance reconciliation (≤ ±1.5%)', icon: Scale, path: '/movement' },
        { name: 'Processing / Distillation', detail: 'Hydro-distillation stills (ST-01..08) oil extraction', icon: Factory, path: '/processing' }
      ],
      metrics: '8 Stills Active · 1.5% Scale Tolerance Enforced · Oil & Hydrosol Mass Balance',
      statutoryRule: 'Assam Forest Transit Rules (e-Transit Pass) • Weight Variance Statutory Threshold ≤1.5%'
    },
    {
      id: 'QUALITY_COMPLIANCE',
      number: '4',
      title: 'Quality and Compliance',
      subtitle: '→ Lot Split/Merge & Batch Genealogy → Lab Testing & QA Approval → Permit & Document Linking',
      badge: 'NABL Quality & Integrity',
      summary: 'Maintains multi-source batch genealogy through splitting/merging and certifies chemical purity via GC-MS testing.',
      nodes: [
        { name: 'Lot Split / Merge', detail: 'Aggregation batches (AGG) & Distillation Lots (LOT)', icon: Boxes, path: '/aggregation' },
        { name: 'Batch Genealogy', detail: 'End-to-end provenance link back to parent tree QR IDs', icon: Workflow, path: '/traceability' },
        { name: 'Lab Testing (GC-MS)', detail: 'Agarospirol %, Chromone markers & purity index', icon: FlaskConical, path: '/laboratory' },
        { name: 'QA Approval / Pass', detail: 'NABL Certificate of Analysis (CoA) sign-off', icon: FileCheck, path: '/laboratory' },
        { name: 'Permit & Document Linking', detail: 'CITES Non-Detriment Findings & DFO Non-Forest Link', icon: FileBadge2, path: '/permits' }
      ],
      metrics: 'NABL GC-MS Tested · Agarospirol ≥ 10.5% · CITES Appendix II Compliance',
      statutoryRule: 'CITES Appendix II Export Mandate • Bureau of Indian Standards (BIS) Essential Oils QA'
    },
    {
      id: 'PACK_TO_TRACEABILITY',
      number: '5',
      title: 'Pack to Traceability',
      subtitle: '→ Packaging & Pack Identity → QR Code Generation → Export & Dispatch → QR Verification → Forward & Backward Traceability → Dashboard, Reports & Audit Trail → End',
      badge: 'Consumer Trust & Governance',
      summary: 'Serialized bottle packaging, tamper-evident laser QR, commercial dispatch, and global consumer verification.',
      nodes: [
        { name: 'Packaging & Pack Identity', detail: 'Serialized bottle packaging (PCK-NER-2026-xxx)', icon: PackageCheck, path: '/packaging' },
        { name: 'QR Code Generation', detail: 'Tamper-evident laser QR with immutable genealogy hash', icon: QrCode, path: '/packaging' },
        { name: 'Export & Dispatch', detail: 'Customs shipping bills, air cargo & domestic retail', icon: PlaneTakeoff, path: '/export' },
        { name: 'QR Verification', detail: 'Global buyer scans to inspect homestead origin & CoA', icon: QrCode, path: '/traceability' },
        { name: 'Traceability (Fwd/Bwd)', detail: 'Full traceability from single bottle back to tree stump', icon: Workflow, path: '/traceability' },
        { name: 'Dashboard & Audit Trail', detail: 'Executive KPI monitoring, DFO quota & tamper-proof logs', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'End', detail: 'Verified consumer delivery & statutory lifecycle closure', icon: CheckCircle2, path: '/dashboard' }
      ],
      metrics: 'Laser QR Mints · Full Backward Tree Genealogy · Real-Time Public Provenance',
      statutoryRule: 'DGFT Export Authorization • Legal Metrology Act (Packaged Commodities) • CITES Permitted'
    }
  ];

  // The 26 Operational Steps
  const ONE_LINE_PIPELINE = [
    { label: 'Register farmer', phase: 'FIELD_SETUP', path: '/farmer/register', desc: 'Farmer self-registration with homestead land declaration' },
    { label: 'Verify', phase: 'FIELD_SETUP', path: '/farmer/approvals', desc: 'NERAMAC land title & farmer verification' },
    { label: 'Register plot', phase: 'FIELD_SETUP', path: '/plantation', desc: 'Revenue Dag & Patta land parcel assignment' },
    { label: 'GPS / POLOGEN', phase: 'FIELD_SETUP', path: '/field-gis-studio', desc: 'Polygon boundary capture for sapling block (<7 yrs)' },
    { label: 'Trees', phase: 'FIELD_SETUP', path: '/field-gis-studio', desc: 'Mature tree geo-pinning & RFID tag registration' },
    { label: 'Inoculation', phase: 'FIELD_SETUP', path: '/inoculation', desc: 'Tree maintenance & AAU fungal inoculation' },
    { label: 'Harvest application', phase: 'APPROVAL', path: '/harvest', desc: 'Farmer submits felling requisition with tree RFIDs' },
    { label: 'NERAMAC', phase: 'APPROVAL', path: '/harvest', desc: 'NERAMAC field agent physical inspection of standing timber' },
    { label: 'DFO approval (No loops back)', phase: 'APPROVAL', path: '/harvest', desc: 'DFO Decision Gate: If rejected, loops back to Application with deficiency notice', isLoop: true },
    { label: 'Authorisation', phase: 'APPROVAL', path: '/harvest', desc: 'Statutory Harvest Authorisation ID & Felling Permit granted' },
    { label: 'Harvest', phase: 'HARVEST_PROCESSING', path: '/harvest', desc: 'Supervised tree felling, bark peeling & certified scale weighing' },
    { label: 'Batch', phase: 'HARVEST_PROCESSING', path: '/harvest', desc: 'Mints Harvest Batch (HBT) sealed with stump photo SHA-256' },
    { label: 'Aggregator', phase: 'HARVEST_PROCESSING', path: '/movement', desc: 'e-Transit Pass dispatched to regional collection depot' },
    { label: 'Distillery', phase: 'HARVEST_PROCESSING', path: '/movement', desc: 'Consolidated consignment haulage to Central Processing Centre' },
    { label: 'Weight check', phase: 'HARVEST_PROCESSING', path: '/movement', desc: 'Inward weighment variance check (tolerance ≤ ±1.5%)' },
    { label: 'Distill', phase: 'HARVEST_PROCESSING', path: '/processing', desc: 'Hydro-distillation in registered stainless stills (ST-01..08)' },
    { label: 'Lot genealogy', phase: 'QUALITY_COMPLIANCE', path: '/aggregation', desc: 'Aggregation batch pooling & distillation lot genealogy linkage' },
    { label: 'Lab QA', phase: 'QUALITY_COMPLIANCE', path: '/laboratory', desc: 'NABL accredited GC-MS purity testing (Agarospirol %)' },
    { label: 'Permits', phase: 'QUALITY_COMPLIANCE', path: '/permits', desc: 'CITES Non-Detriment Findings & Non-Forest Clearance linked' },
    { label: 'Packaging', phase: 'PACK_TO_TRACEABILITY', path: '/packaging', desc: 'High-security serialized bottle packaging' },
    { label: 'QR', phase: 'PACK_TO_TRACEABILITY', path: '/packaging', desc: 'Tamper-evident laser QR code affixed on outer carton' },
    { label: 'Dispatch', phase: 'PACK_TO_TRACEABILITY', path: '/export', desc: 'Domestic distribution or international air freight customs clearance' },
    { label: 'QR verify', phase: 'PACK_TO_TRACEABILITY', path: '/traceability', desc: 'Public or buyer instant verification of product authenticity' },
    { label: 'Traceability', phase: 'PACK_TO_TRACEABILITY', path: '/traceability', desc: 'Interactive forward and backward chain-of-custody exploration' },
    { label: 'Dashboard / audit', phase: 'PACK_TO_TRACEABILITY', path: '/dashboard', desc: 'Role-based executive analytics & regulatory compliance audit trail' },
    { label: 'End', phase: 'PACK_TO_TRACEABILITY', path: '/dashboard', desc: 'Complete traceable lifecycle verified from seed to bottle' }
  ];

  const currentPhase = WORKFLOW_PHASES.find(p => p.id === selectedPhaseId) || WORKFLOW_PHASES[0];
  const currentNode = ONE_LINE_PIPELINE[selectedOneLineNodeIndex] || ONE_LINE_PIPELINE[0];

  const handleRoleSwitchAndOpenDashboard = (roleId) => {
    setActiveRole(roleId);
    const roleObj = ROLE_PERMISSIONS[roleId];
    addToast(`Switched perspective to: ${roleObj?.name || roleId}`, 'info');
    onNavigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 1. Top Enterprise Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">NERAMAC ASCTS</span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Assam & Tripura Clusters
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Agarwood Traceability & Supply Chain Management System
              </p>
            </div>
          </div>

          {/* Quick Route Shortcuts */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end text-xs font-bold">
            <button
              onClick={() => onNavigate('/traceability')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center gap-1 shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Verify QR</span>
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition flex items-center gap-1 shadow-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* 2. TAB SWITCHER (3 Clean High-Contrast Tabs) */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('WORKFLOW')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'WORKFLOW'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>The 5 Core Workflow Phases &amp; 26 Steps</span>
          </button>

          <button
            onClick={() => setActiveTab('STAKEHOLDERS')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'STAKEHOLDERS'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-500" />
            <span>10 Stakeholder Roles &amp; Responsibilities</span>
          </button>
        </div>

        {/* 3. TAB 1: THE 5 DETAILED PHASES & 26 STEPS */}
        {activeTab === 'WORKFLOW' && (
          <div className="space-y-6">
            {/* 26-STEP PIPELINE BANNER */}
            <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                    <Workflow className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      Complete End-to-End Workflow Pipeline (26 Operational Steps)
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Click any step to inspect details and jump directly to its live working module
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  Assam Forest Regulation 1891 • Assam Agarwood Policy 2020
                </span>
              </div>

              {/* Scrollable Step Chain */}
              <div className="overflow-x-auto pb-2 pt-1">
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
                              ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                              : node.isLoop
                              ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                              : 'bg-slate-50 hover:bg-emerald-50 text-slate-800 border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                            #{index + 1}
                          </span>
                          <span>{node.label}</span>
                        </button>
                        {index < ONE_LINE_PIPELINE.length - 1 && (
                          <span className="text-slate-300 font-bold px-0.5">→</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Active Node Detail Card with Direct Launch */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Step {selectedOneLineNodeIndex + 1} of 26 • Phase: {currentNode.phase.replace('_', ' ')}
                    </span>
                    <span className="font-extrabold text-sm text-slate-900">
                      {currentNode.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {currentNode.desc}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onNavigate(currentNode.path)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Launch Step Module ({currentNode.path})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* Phase Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {WORKFLOW_PHASES.map((p) => {
                const isSelected = selectedPhaseId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPhaseId(p.id)}
                    className={`text-left p-4 rounded-xl border transition space-y-2 ${
                      isSelected
                        ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.number}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {p.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        {p.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {p.summary}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Phase Deep Dive Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Phase {currentPhase.number} of 5 • {currentPhase.badge}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {currentPhase.metrics}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {currentPhase.title}
                  </h2>
                  <div className="text-xs font-mono text-emerald-800 pt-1">
                    {currentPhase.subtitle}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 max-w-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Statutory Clearance:</span>
                  <span className="font-semibold text-slate-800 block">{currentPhase.statutoryRule}</span>
                </div>
              </div>

              {/* Nodes in this Phase */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Operational Sequence & Direct Modules:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {currentPhase.nodes.map((node, nIdx) => {
                    const Icon = node.icon;
                    return (
                      <div
                        key={nIdx}
                        className={`p-4 rounded-xl border transition space-y-3 flex flex-col justify-between ${
                          node.isDecision
                            ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
                            : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              node.isDecision ? 'bg-amber-500 text-white' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              Step {nIdx + 1}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900">
                              {node.name}
                            </h4>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                              {node.detail}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-500">{node.path}</span>
                          <button
                            onClick={() => onNavigate(node.path)}
                            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
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
            </div>
          </div>
        )}

        {/* 4. TAB 2: INTERACTIVE APPROVAL DECISION TREE (Approved? Loop) */}
        {activeTab === 'DECISION_TREE' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                Phase 2 Focus • Statutory Governance
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Approval Gate: Harvest Application → NERAMAC Verification → DFO Approval → Approved?
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Strict multi-officer verification loop ensuring wild agarwood trees from reserved forests cannot be harvested under false claims.
              </p>
            </div>

            {/* Visual Interactive Diagram */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-center text-xs">
                {/* Step 1: Farmer App */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Step 1</span>
                  <div className="font-extrabold text-slate-900 text-sm">Harvest Application</div>
                  <div className="text-[11px] text-slate-500">Farmer submits tree QR ID &amp; estimated kg</div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex justify-center text-slate-400 font-black">
                  <ArrowRight className="w-5 h-5" />
                </div>

                {/* Step 2: NERAMAC Verification */}
                <div className="p-4 bg-white border border-amber-300 rounded-xl space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold text-amber-600 uppercase">Step 2</span>
                  <div className="font-extrabold text-amber-900 text-sm">NERAMAC Verification</div>
                  <div className="text-[11px] text-slate-500">Field agent physical tree &amp; Dag/Patta check</div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex justify-center text-slate-400 font-black">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              {/* DFO Decision Gateway */}
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 bg-amber-100 border-2 border-amber-500 rounded-2xl flex items-center justify-center font-black text-amber-800 text-lg shadow-sm">
                    ?
                  </div>
                  <div className="font-black text-base text-slate-900">
                    DFO Approval Gate: Approved?
                  </div>
                  <p className="text-xs text-slate-600 max-w-md">
                    Divisional Forest Officer evaluates revenue non-forest records and tree inspection report.
                  </p>

                  {/* Interactive Decision Toggle */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs font-bold text-slate-600">Simulate Decision:</span>
                    <button
                      onClick={() => setSimulatedDfoDecision('NO')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        simulatedDfoDecision === 'NO'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      No (Deficiency)
                    </button>
                    <button
                      onClick={() => setSimulatedDfoDecision('YES')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        simulatedDfoDecision === 'YES'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Yes (Approved)
                    </button>
                  </div>
                </div>

                {/* The Two Branches */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {/* NO Branch */}
                  <div className={`p-5 rounded-xl border-2 transition space-y-2 ${
                    simulatedDfoDecision === 'NO'
                      ? 'bg-rose-50 border-rose-500 shadow-sm'
                      : 'bg-white border-slate-200 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                        BRANCH: NO (Rejected)
                      </span>
                      <RotateCcw className="w-4 h-4 text-rose-600" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Loops Back to Harvest Application
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Application status set to <code>DFO_REJECTED_RETURNED_TO_FARMER</code>. Farmer receives deficiency note, updates homestead document or tree girth notes, and re-submits to restart inspection.
                    </p>
                    <button
                      onClick={() => onNavigate('/harvest')}
                      className="mt-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <span>View in /harvest</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* YES Branch */}
                  <div className={`p-5 rounded-xl border-2 transition space-y-2 ${
                    simulatedDfoDecision === 'YES'
                      ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                      : 'bg-white border-slate-200 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        BRANCH: YES (Approved)
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Harvest Authorisation ID Issued
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      DFO issues statutory Felling Sanction Order and unique <strong>Harvest Authorisation ID</strong> (e.g. <code>HA-AS-GLG-2026-081</code>). Unlocks supervised tree felling, scale weighment, and Harvest Batch creation.
                    </p>
                    <button
                      onClick={() => onNavigate('/harvest')}
                      className="mt-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <span>View in /harvest</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. TAB 3: 10 STAKEHOLDERS & RESPONSIBILITIES MATRIX */}
        {activeTab === 'STAKEHOLDERS' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                Governance &amp; Segregation of Duties
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                10 Stakeholder Roles &amp; Statutory Responsibilities
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Each stakeholder operates under strict verification controls. Select any role to switch perspectives and open its dedicated dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {USER_ROLES.map((role) => {
                const rbac = ROLE_PERMISSIONS[role.id];
                const isCurrent = activeRole === role.id;
                return (
                  <div
                    key={role.id}
                    className={`p-4 rounded-xl border transition space-y-3 flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {role.id}
                        </span>
                        {isCurrent ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                            Current Role
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRoleSwitchAndOpenDashboard(role.id)}
                            className="text-[10px] font-bold text-emerald-700 hover:underline"
                          >
                            Switch &amp; Open
                          </button>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          {role.name}
                        </h4>
                        <div className="text-[11px] font-semibold text-emerald-700">
                          {role.badge}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {role.desc}
                        </p>
                      </div>

                      {/* Responsibilities list */}
                      {rbac?.responsibilities && (
                        <div className="pt-2 border-t border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-500 block">Core Duties:</span>
                          <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                            {rbac.responsibilities.slice(0, 2).map((resp, rIdx) => (
                              <li key={rIdx} className="leading-snug">{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400">{rbac?.allowedModules?.length || 0} Modules</span>
                      <button
                        onClick={() => handleRoleSwitchAndOpenDashboard(role.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-slate-200"
                      >
                        <span>Open Dashboard</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}