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
  Fingerprint,
  Scale,
  ShoppingBag,
  Eye,
  LayoutDashboard,
  Search,
  Check
} from 'lucide-react';

export default function HomeWorkflowOverview({ onNavigate }) {
  const { activeRole, setActiveRole, addToast, farmers, farmerApplications, harvestBatches } = useEnterprise();
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState(1);
  const [activeSection, setActiveSection] = useState('WORKFLOW'); // 'WORKFLOW' | 'STAKEHOLDERS'

  // The 10 End-to-End Workflow Stages as requested
  const WORKFLOW_STEPS = [
    {
      step: 1,
      id: 'FARMER_PLANTATION',
      title: '1. Farmer & Plantation Registration',
      subtitle: 'Homestead Origin, Land Title & Tree Geo-Tagging',
      path: '/farmer/register',
      altPath: '/farmer',
      moduleId: 'FARMER_REGISTER',
      icon: Users,
      color: 'emerald',
      stakeholders: ['FARMER', 'FIELD_AGENT', 'NERAMAC_ADMIN'],
      subpoints: [
        '1. Farmer registration and verification (Identity, DPDP Act 2023 masked Aadhaar).',
        '2. Land and ownership document registration (Revenue Dag & Patta numbers, Jamabandi records).',
        '3. Plantation registration with GPS boundary (Polygon mapping via Field GIS Studio).',
        '4. Individual tree registration with Tree ID, QR code, GPS coordinates and photographs.'
      ],
      description: 'The foundation of traceability starts at the farm gate. Farmers register their private homestead land with revenue titles to prove non-forest origin. Field agents survey the land, walk perimeter boundaries (POLOGEN), and attach laser RFID tags to individual mature trees.',
      statutoryRule: 'Assam Agarwood (Aquilaria malaccensis) Policy 2020 • Land Revenue Jamabandi Title Mandate'
    },
    {
      step: 2,
      id: 'CULTIVATION_MONITORING',
      title: '2. Cultivation & Tree Monitoring',
      subtitle: 'Biological Inoculation & Growth Surveillance',
      path: '/inoculation',
      altPath: '/field-agent',
      moduleId: 'INOCULATION',
      icon: Syringe,
      color: 'teal',
      stakeholders: ['FIELD_AGENT', 'FARMER', 'NERAMAC_ADMIN'],
      subpoints: [
        '1. Cultivation activity records (pruning, irrigation, organic soil enrichment).',
        '2. Inoculation intervention records (AAU Fusarium solani biological induction strain, spiral drill depths, hole count).',
        '3. Tree growth, inspection and health monitoring (GBH cm progression, callus wound healing, resin duct deposition).'
      ],
      description: 'Cultivation and artificial fungal induction records ensure Agarwood oleoresin synthesis is systematically documented. Field agents record inoculation interventions and monitor trees over their 18 to 24 month maturation cycle.',
      statutoryRule: 'Assam Agricultural University (AAU) Certified Inoculant Protocol • CITES Appendix II Non-Detriment Guidelines'
    },
    {
      step: 3,
      id: 'HARVEST_APPLICATION',
      title: '3. Harvest Application & Approval',
      subtitle: 'Farmer Requisition & DFO Statutory Sanction',
      path: '/harvest',
      altPath: '/permits',
      moduleId: 'HARVEST',
      icon: Axe,
      color: 'amber',
      stakeholders: ['FARMER', 'FIELD_AGENT', 'FOREST_DEPT', 'NERAMAC_ADMIN'],
      subpoints: [
        '1. Farmer submits harvesting application declaring inoculated mature trees and estimated wood weight.',
        '2. Field agent inspects plantation on-site and scans tree QR codes / RFID tags.',
        '3. Authority (DFO / Forest Dept) verifies trees, confirms homestead revenue ownership, and approves specific Tree IDs and quantities.',
        '4. Statutory Harvest Permit is issued and cryptographically uploaded.'
      ],
      description: 'Before any tree can be felled, a strict statutory check ensures it was cultivated on private homestead land. The Divisional Forest Officer (DFO) scrutinizes the Lat Mandal report and issues a formal Felling Sanction Order.',
      statutoryRule: 'Assam Forest Regulation 1891 • DFO Statutory Felling Sanction Order'
    },
    {
      step: 4,
      id: 'HARVEST_RECORDING',
      title: '4. Harvest Recording',
      subtitle: 'On-Site Tree Confirmation & Scale Weighment',
      path: '/harvest',
      altPath: '/field-agent',
      moduleId: 'HARVEST',
      icon: Scale,
      color: 'red',
      stakeholders: ['FIELD_AGENT', 'FARMER', 'NERAMAC_ADMIN'],
      subpoints: [
        '1. Field agent scans approved tree QR codes / RFID tags on-site prior to felling.',
        '2. Records actual harvested quantity (certified cleaned heartwood kg & sapwood chips kg), photographs, GPS and date.',
        '3. System creates unique Harvest Batch (HBT-AS-2026-XXX) preserving complete source Tree IDs.'
      ],
      description: 'Supervised tree felling and digital scale weighment at the farm gate. Field agents capture real camera photographs of the stump stamped with RTK coordinates and Web Crypto SHA-256 buffer hash.',
      statutoryRule: 'NERAMAC SOP Section 4.2 • Farm-Gate Weighment & Stump Verification Photo Cryptography'
    },
    {
      step: 5,
      id: 'MOVEMENT_COLLECTION',
      title: '5. Material Movement & Collection',
      subtitle: 'Transit Passes & Gate Tolerance Verification',
      path: '/movement',
      altPath: '/aggregation',
      moduleId: 'MOVEMENT',
      icon: Truck,
      color: 'blue',
      stakeholders: ['COLLECTION_OPERATOR', 'FIELD_AGENT', 'NERAMAC_ADMIN'],
      subpoints: [
        '1. Sender creates dispatch record with electronic Transit Pass (e-TP) and vehicle manifest.',
        '2. Receiver confirms receipt and dual weighment at collection centre (Gate Tolerance discrepancy ≤ ±1.5%).',
        '3. Optional: Collection centre combines multiple Harvest Batches into an Aggregation Batch while retaining source lineage.'
      ],
      description: 'Raw green heartwood is dispatched under Form II Transit Passes to designated cluster collection depots (Golaghat / Hojai / Kadamtala). Dual weighment prevents tampering or illegal timber substitution.',
      statutoryRule: 'Electronic Transit Pass (e-TP) • Form II (Assam Forest Rules) • NERAMAC Gate Tolerance (±1.5%)'
    },
    {
      step: 6,
      id: 'PROCESSING_DISTILLATION',
      title: '6. Processing & Distillation',
      subtitle: 'CPC Hydro-Distillation & Mass Balance Ledger',
      path: '/processing',
      altPath: '/inventory',
      moduleId: 'PROCESSING',
      icon: Factory,
      color: 'cyan',
      stakeholders: ['CPC_OPERATOR', 'NERAMAC_ADMIN'],
      subpoints: [
        '1. Processing centre receives raw wood material and verifies custody barcode.',
        '2. Creates processing/distillation order for hydro-distillation stills (Boilers ST-01 to ST-08).',
        '3. Records input charge quantity, machine ID, soaking duration, and operator credentials.',
        '4. Records distillation outputs: Grade-1 pure agarwood oil (Dehn Al Oudh), Grade-2 oil, floral hydrosol, and exhausted residue.'
      ],
      description: 'At the Common Processing Centre (CPC), agarwood logs are chipped and hydro-distilled for 72 to 96 hours. A strict mass balance ledger calculates raw wood to oil conversion to guarantee purity and zero adulteration.',
      statutoryRule: 'Common Facility Centre (CFC) Operational Protocol • Mass Balance Conservation Standards'
    },
    {
      step: 7,
      id: 'SAMPLING_LAB_TESTING',
      title: '7. Sampling & Laboratory Testing',
      subtitle: 'GC-MS Chemical Profiling & CITES Species Purity',
      path: '/laboratory',
      altPath: '/audit-reports',
      moduleId: 'LABORATORY',
      icon: FlaskConical,
      color: 'purple',
      stakeholders: ['LAB_OFFICER', 'NERAMAC_ADMIN', 'FOREST_DEPT'],
      subpoints: [
        '1. Sample collection and registration under dual custodian tamper-evident seals.',
        '2. Laboratory performs quality tests via Gas Chromatography - Mass Spectrometry (GC-MS).',
        '3. Chemical results and reports uploaded (Agarospirol ≥ 8.5%, Jinkoh-eremol, Guaiol biomarker index).',
        '4. Quality approval, rejection or quarantine with cryptographically signed Certificate of Analysis (CoA).'
      ],
      description: 'Accredited NABL quality testing validates botanical species authenticity (Aquilaria malaccensis) and verifies absence of synthetic adulterants (DPG, DEP, mineral oils). Certified lots receive quality release for packaging.',
      statutoryRule: 'ISO/IEC 17025 Accredited Laboratory Testing • CITES Species Botanical Verification'
    },
    {
      step: 8,
      id: 'FINISHED_PACKAGING',
      title: '8. Finished Product & Packaging',
      subtitle: 'Laser QR Serialization & Crystal Flacon Packing',
      path: '/finished-products',
      altPath: '/inventory',
      moduleId: 'FINISHED_PRODUCTS',
      icon: PackageCheck,
      color: 'indigo',
      stakeholders: ['NERAMAC_ADMIN', 'EXPORTER'],
      subpoints: [
        '1. Approved released oil and certified chips sent for final cleanroom packaging.',
        '2. Individual product serial numbers generated (PCK-NER-2026-XXX).',
        '3. Laser-etched QR codes attached to each finished 12ml luxury crystal flacon and gift box.',
        '4. Product enters finished bonded inventory ready for commercial distribution.'
      ],
      description: 'Finished products are packaged under sterile custody. Each pack receives a permanent, tamper-evident laser QR code embedding its cryptographic provenance token linking directly to the origin tree.',
      statutoryRule: 'Unique Serial Numbering Specification • DGFT Export Packaging Guidelines'
    },
    {
      step: 9,
      id: 'COMMERCIAL_DISTRIBUTION',
      title: '9. Domestic Sale OR Export',
      subtitle: 'Domestic Attar Houses & CITES Port Lots',
      path: '/export',
      altPath: '/domestic-sales',
      moduleId: 'EXPORT',
      icon: PlaneTakeoff,
      color: 'blue',
      stakeholders: ['EXPORTER', 'NERAMAC_ADMIN', 'FOREST_DEPT'],
      subpoints: [
        'Domestic route: Buyer registration → Sales order → Dispatch manifest → Receipt/delivery confirmation.',
        'Export route: Export Batch creation → Wildlife Crime Control Bureau (WCCB) export approval → Shipment Lot consolidation → Port export documents (Customs / Shipping Bill) → Dispatch to UAE, Saudi Arabia, EU, and Japan.'
      ],
      description: 'The platform accommodates bifurcated supply chain routes: direct wholesale to domestic perfumers (Kannauj, Mumbai, Lucknow) or consolidation into international CITES Export Consignments for global luxury fragrance houses.',
      statutoryRule: 'CITES Export Quota Allocation • Wildlife Crime Control Bureau (WCCB) NOC • DGFT Export Licensing'
    },
    {
      step: 10,
      id: 'BUYER_VERIFICATION',
      title: '10. Final Buyer Verification',
      subtitle: 'Instant Smartphone QR Scan & End-to-End Provenance',
      path: '/traceability',
      altPath: '/verify',
      moduleId: 'TRACEABILITY',
      icon: QrCode,
      color: 'emerald',
      stakeholders: ['BUYER_PUBLIC', 'EXPORTER'],
      subpoints: [
        '1. Buyer scans product QR code using smartphone camera or web portal.',
        '2. Views authentic product identity, botanical species, grower profile, and NABL GC-MS purity results.',
        '3. Views complete processing and transit movement history from tree felling to packaging.',
        '4. Verifies authenticity, statutory DFO clearances, and fair-trade farmer compensation.'
      ],
      description: 'The ultimate consumer verification gateway. Scanning any finished bottle reveals its complete, immutable provenance timeline with DPDP Act compliant privacy protections, delivering total transparency.',
      statutoryRule: 'DPDP Act 2023 Compliant Public Provenance • National Traceability Standards'
    }
  ];

  const currentStepData = WORKFLOW_STEPS.find(s => s.step === selectedWorkflowStep) || WORKFLOW_STEPS[0];

  const handleRoleSwitch = (roleId) => {
    setActiveRole(roleId);
    const roleObj = ROLE_PERMISSIONS[roleId];
    addToast(`Switched active perspective to: ${roleObj?.name || roleId}`, 'info');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* 1. Clean Top Header Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg ring-2 ring-emerald-500/20">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-white tracking-tight">NERAMAC ASCTS</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Official Architecture Portal
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Agarwood Traceability & Supply Chain Management System • RFP 06/31
            </p>
          </div>
        </div>

        {/* Quick Portal Jump Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => onNavigate('/farmer')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Farmer Portal</span>
          </button>
          <button
            onClick={() => onNavigate('/field-agent')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Field Agent Studio</span>
          </button>
          <button
            onClick={() => onNavigate('/harvest')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Axe className="w-3.5 h-3.5 text-red-400" />
            <span>Harvest & DFO</span>
          </button>
          <button
            onClick={() => onNavigate('/traceability')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Traceability Scanner</span>
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

      {/* 2. Hero Objective & Value Chain Overview */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/20 p-6 sm:p-8 text-white shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500 text-slate-950 shadow-xs">
                Govt. of India • MDoNER
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Assam (Golaghat / Hojai) & Tripura (Kadamtala)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                End-to-End Forward & Backward Traceability
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Centralized Agarwood Traceability & Supply Chain System
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Track <span className="text-emerald-400 font-semibold italic">Aquilaria malaccensis</span> through its complete statutory lifecycle: from private homestead farmer registration and RTK GPS polygon boundary capture, through fungal inoculation, DFO harvest approvals, supervised scale weighment, CPC hydro-distillation, NABL GC-MS chemical profiling, and laser QR packaging to domestic perfumery sale or CITES international export.
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 space-y-2.5 flex-shrink-0 min-w-[280px]">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Current Active Perspective:
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="font-black text-sm text-emerald-400">
                {USER_ROLES.find(r => r.id === activeRole)?.name}
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {activeRole}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Navigation across workspaces is strictly segregated according to statutory custodian powers.
            </p>
          </div>
        </div>

        {/* Toggle between 10-Step Workflow and Stakeholders Matrix */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection('WORKFLOW')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSection === 'WORKFLOW'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>1. Complete 10-Stage Workflow Specification</span>
            </button>
            <button
              onClick={() => setActiveSection('STAKEHOLDERS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSection === 'STAKEHOLDERS'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>2. Stakeholder Roles & Responsibilities (10 Roles)</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Click any stage or role to view details and launch its workspace
          </div>
        </div>
      </div>

      {/* SECTION 1: COMPLETE 10-STAGE WORKFLOW PIPELINE */}
      {activeSection === 'WORKFLOW' && (
        <div className="space-y-6">
          {/* Step Selector Horizontal Strip */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl overflow-x-auto">
            <div className="flex items-center min-w-[960px] justify-between gap-1">
              {WORKFLOW_STEPS.map((stg) => {
                const Icon = stg.icon;
                const isSelected = selectedWorkflowStep === stg.step;

                return (
                  <button
                    key={stg.step}
                    onClick={() => setSelectedWorkflowStep(stg.step)}
                    className={`flex-1 p-2.5 rounded-xl transition text-center flex flex-col items-center group min-w-[90px] ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1 text-xs font-black transition ${
                      isSelected ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-400 group-hover:text-white'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-black line-clamp-1">
                      Step {stg.step}
                    </span>
                    <span className={`text-[9px] line-clamp-1 max-w-[85px] ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                      {stg.title.split('. ')[1] || stg.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Deep-Dive Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg flex-shrink-0">
                  {currentStepData.step}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                      Workflow Stage {currentStepData.step} of 10
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Primary Route: {currentStepData.path}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {currentStepData.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentStepData.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <button
                  onClick={() => onNavigate(currentStepData.path)}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <span>Launch {currentStepData.title.split('. ')[1]} Workspace</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              {currentStepData.description}
            </p>

            {/* Sub-steps Checklist (Exact specification from RFP) */}
            <div className="space-y-3">
              <div className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                Operational Sub-Steps & System Activities:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentStepData.subpoints.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Regulatory Authority & Custodians */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Statutory Rule & Authority
                </span>
                <p className="text-xs text-slate-300 font-medium">{currentStepData.statutoryRule}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Responsible Custodians for this Stage
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {currentStepData.stakeholders.map(roleId => (
                    <span
                      key={roleId}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {USER_ROLES.find(r => r.id === roleId)?.name || roleId}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stage Stepper Navigation */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                disabled={selectedWorkflowStep === 1}
                onClick={() => setSelectedWorkflowStep(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
              >
                ← Previous Stage
              </button>
              <span className="text-xs font-mono text-slate-400 font-bold">
                Stage {selectedWorkflowStep} / 10
              </span>
              <button
                disabled={selectedWorkflowStep === 10}
                onClick={() => setSelectedWorkflowStep(prev => Math.min(10, prev + 1))}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition"
              >
                Next Stage →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: STAKEHOLDERS & ROLES MATRIX */}
      {activeSection === 'STAKEHOLDERS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs text-slate-300 leading-relaxed flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-white">Strict Segregation of Duties (RBAC):</span>
              {' '}Each of the 10 stakeholder roles has designated statutory powers, maker-checker authorization gates, and tailored operational modules. Switching perspective updates the allowed routes and active permissions.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {USER_ROLES.map((role) => {
              const rbac = ROLE_PERMISSIONS[role.id];
              const isCurrent = activeRole === role.id;

              return (
                <div
                  key={role.id}
                  className={`rounded-2xl border p-5 space-y-3 transition flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white">{role.name}</h3>
                          {isCurrent && (
                            <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded">
                              ACTIVE PERSPECTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">{rbac?.authority || role.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex-shrink-0">
                        {role.badge}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Core Responsibilities & Statutory Mandate
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {(rbac?.responsibilities || [role.desc]).map((resp, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span className="leading-snug">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="text-[10px] font-mono text-slate-400">
                      Primary: <span className="text-slate-200 font-bold">{rbac?.defaultRoute || '/'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRoleSwitch(role.id)}
                        disabled={isCurrent}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                          isCurrent
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                      >
                        {isCurrent ? 'Active' : 'Switch Perspective'}
                      </button>

                      <button
                        onClick={() => {
                          handleRoleSwitch(role.id);
                          if (rbac?.defaultRoute) onNavigate(rbac.defaultRoute);
                        }}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 shadow-sm"
                        title="Switch and open primary workspace"
                      >
                        <span>Open Workspace</span>
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
    </div>
  );
}
