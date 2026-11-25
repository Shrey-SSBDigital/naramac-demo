import React from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import MetricCard from '../common/MetricCard';
import StatusBadge from '../common/StatusBadge';
import {
  Users,
  Trees,
  Axe,
  Factory,
  PackageCheck,
  PlaneTakeoff,
  TrendingUp,
  Warehouse,
  Truck,
  FlaskConical,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Scale,
  Boxes,
  FileCheck,
  FileBadge2,
  QrCode,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowRight,
  Store,
  Compass,
  FileText
} from 'lucide-react';

export default function DashboardModule({ onNavigateModule }) {
  const {
    farmers,
    plantations,
    pologens,
    trees,
    harvests,
    harvestBatches,
    distillations,
    finishedProducts,
    exportBatches,
    movements,
    aggregations,
    labTests,
    domesticSales,
    inventory,
    activeRole
  } = useEnterprise();

  // Metrics
  const totalWoodHarvestedKg = harvestBatches.reduce((acc, b) => acc + (b.netWeightKg || 0), 0);
  const totalOudOilDistilledMl = distillations.reduce((acc, d) => acc + (d.outputPureOudOilMl || 0), 0);
  const totalExportBottles = exportBatches.reduce((acc, e) => acc + (e.totalPackCount || 0), 0);
  const totalDomesticBottles = finishedProducts.filter(p => p.channel === 'DOMESTIC').length;
  const inStockBottles = finishedProducts.filter(p => p.status === 'IN_VAULT_STOCK').length;
  const totalSaplings = (pologens || []).reduce((sum, p) => sum + (p.saplingCount || 0), 0);

  // Default farmer context for FARMER role view (prefers demonstration farmer Manoj Kalita)
  const myFarmer = farmers.find(f => f.isDemonstration || f.id === 'FRM-AS-03') || farmers[0] || {
    id: 'FRM-AS-03',
    name: 'Manoj Kalita',
    village: 'Mohuramukh Gaon, Mouza Bokakhat',
    district: 'Golaghat',
    dagNumber: 'Dag 312, Patta 78',
    landAreaAcres: 3.2
  };
  const myTrees = trees.filter(t => t.farmerId === myFarmer.id);
  const myPologens = pologens.filter(p => p.farmerId === myFarmer.id);
  const myHarvests = harvests.filter(h => h.farmerId === myFarmer.id);
  const myPlantations = plantations.filter(p => p.farmerId === myFarmer.id);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. REGISTERED FARMER DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeRole === 'FARMER') {
    return (
      <div className="space-y-6">
        {/* Farmer Profile Hero */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
                  Primary Producer Portal
                </span>
                <span className="text-xs text-emerald-200 font-mono">
                  ID: {myFarmer.id}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white">
                Farmer Dashboard • {myFarmer.name}
              </h1>
              <p className="text-xs text-emerald-100">
                Homestead Agarwood Grower • {myFarmer.village}, {myFarmer.district} • Land Title: <strong className="text-white">{myFarmer.dagNumber}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onNavigateModule('HARVEST')}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Axe className="w-4 h-4" />
                <span>Apply for Tree Harvest</span>
              </button>
              <button
                onClick={() => onNavigateModule('FARMER_REGISTER')}
                className="px-3.5 py-2 bg-emerald-900/80 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl border border-emerald-500/40 transition flex items-center gap-1.5"
              >
                <Trees className="w-4 h-4 text-emerald-300" />
                <span>Register New Parcel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Farmer 4 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Registered Homestead Land"
            value={`${myFarmer.landAreaAcres || 3.5} Acres`}
            subvalue={myFarmer.dagNumber}
            icon={Trees}
            color="emerald"
            badge="Revenue Dag/Patta"
          />
          <MetricCard
            title="Standing Mature Trees (≥7y)"
            value={`${myTrees.length} Trees`}
            subvalue={`${myTrees.filter(t => t.status === 'INOCULATED').length} Biological Inoculated`}
            icon={CheckCircle2}
            color="teal"
            badge="QR Tagged"
          />
          <MetricCard
            title="Young Sapling Blocks (<7y)"
            value={`${myPologens.length} POLOGENs`}
            subvalue={`${myPologens.reduce((sum, p) => sum + (p.saplingCount || 0), 0)} Saplings`}
            icon={Compass}
            color="cyan"
            badge="GPS Mapped"
          />
          <MetricCard
            title="Felling Authorisations"
            value={`${myHarvests.length} Applications`}
            subvalue={`${myHarvests.filter(h => h.harvestAuthorisationId || h.status.includes('APPROVED')).length} Authorised by DFO`}
            icon={Axe}
            color="amber"
            badge="Assam Agarwood Policy"
          />
        </div>

        {/* Two-Column: Standing Trees Inventory & Felling Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Standing Trees Inventory */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  My Standing Agarwood Trees Inventory
                </h3>
                <p className="text-xs text-slate-500">
                  Attached to your registered homestead parcel under NERAMAC supervision.
                </p>
              </div>
              <button
                onClick={() => onNavigateModule('PLANTATIONS')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>View on Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {myTrees.slice(0, 5).map(tree => (
                <div key={tree.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{tree.id}</span>
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {tree.rfidTag}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Age: <strong className="text-slate-700">{tree.ageYears} yrs</strong> • Girth (GBH): <strong className="text-slate-700">{tree.gbhCm || tree.girthCm || 64} cm</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tree.status === 'INOCULATED'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {tree.status}
                    </span>
                    <button
                      onClick={() => onNavigateModule('HARVEST')}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold"
                    >
                      Apply Harvest
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Felling Sanctions Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">
                Felling Approval Status
              </h3>
              <p className="text-xs text-slate-500">
                DFO Statutory Clearance Tracker
              </p>
            </div>

            <div className="space-y-3">
              {myHarvests.map(h => (
                <div key={h.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{h.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {h.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Target Tree: <strong className="text-slate-800">{h.treeId}</strong> • Est. Weight: <strong className="text-slate-800">{h.estimatedWeightKg} kg</strong>
                  </div>
                  {h.harvestAuthorisationId && (
                    <div className="p-1.5 bg-emerald-50 rounded border border-emerald-200 font-mono text-[10px] text-emerald-900 font-bold">
                      Auth ID: {h.harvestAuthorisationId}
                    </div>
                  )}
                  {h.rejectionReason && (
                    <div className="p-1.5 bg-rose-50 rounded border border-rose-200 text-[10px] text-rose-800">
                      Deficiency: {h.rejectionReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. NERAMAC FIELD AGENT DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeRole === 'FIELD_AGENT') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                Field Operations Command
              </span>
              <span className="text-xs text-slate-400">Assam & Tripura Forestry Clusters</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              Field Agent Dashboard • NERAMAC-FA-04
            </h1>
            <p className="text-xs text-slate-300">
              Physical homestead inspections, GPS perimeter surveys, POLOGEN sapling tagging, and felling scale supervision.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateModule('FIELD_INSPECTION')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4" />
              <span>Start Field Inspection (Geo-Tag)</span>
            </button>
            <button
              onClick={() => onNavigateModule('HARVEST')}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4" />
              <span>Supervise Felling & Weigh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Assigned Farmers"
            value={farmers.length}
            subvalue="Golaghat & Kadamtala"
            icon={Users}
            color="emerald"
            badge="Homestead KYC"
          />
          <MetricCard
            title="Mapped POLOGENs (<7y)"
            value={pologens.length}
            subvalue={`${totalSaplings} Total Saplings`}
            icon={Compass}
            color="teal"
            badge="Turf.js Validated"
          />
          <MetricCard
            title="Tagged Mature Trees (≥7y)"
            value={trees.length}
            subvalue="QR Tagged"
            icon={Trees}
            color="amber"
            badge="SHA-256 Photo Hash"
          />
          <MetricCard
            title="Felling Supervision Queue"
            value={harvests.filter(h => h.status === 'DFO_APPROVED_AWAITING_FELLING').length}
            subvalue="DFO Approved Ready to Fell"
            icon={Axe}
            color="purple"
            badge="Farm-Gate Scale"
          />
        </div>

        {/* Assigned Farmers Quick Inspection Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Assigned Farmer Parcels for Field Inspection
              </h3>
              <p className="text-xs text-slate-500">
                Select any farmer to tag young POLOGEN sapling blocks (&lt;7 yrs) or geo-pin mature trees (≥7 yrs).
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('FIELD_INSPECTION')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Launch Field Inspection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {farmers.slice(0, 6).map(f => (
              <div key={f.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{f.name} ({f.id})</div>
                  <div className="text-[11px] text-slate-500">{f.village}, {f.district} • Land: {f.dagNumber}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                    {pologens.filter(p => p.farmerId === f.id).length} POLOGEN
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {trees.filter(t => t.farmerId === f.id).length} Trees
                  </span>
                  <button
                    onClick={() => onNavigateModule('FIELD_INSPECTION')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                  >
                    Inspect & Tag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. FOREST DEPARTMENT / DFO STATUTORY SANCTION DESK
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeRole === 'FOREST_DEPT') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500 text-white">
                Statutory Regulator
              </span>
              <span className="text-xs text-blue-200 font-mono">Assam Forest Regulation 1891</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              DFO Statutory Approval Desk • Golaghat Division
            </h1>
            <p className="text-xs text-blue-100">
              Statutory verification of homestead agarwood felling, issuance of Harvest Authorisation IDs, and transit permits.
            </p>
          </div>

          <button
            onClick={() => onNavigateModule('HARVEST')}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Review Felling Applications (Decision Gate)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Pending DFO Clearance"
            value={harvests.filter(h => h.status.includes('AWAITING_DFO')).length}
            subvalue="Requisitions in Scrutiny"
            icon={Axe}
            color="amber"
            badge="Decision Gate Active"
          />
          <MetricCard
            title="Harvest Authorisations"
            value={harvests.filter(h => h.harvestAuthorisationId || h.status.includes('APPROVED')).length}
            subvalue="Issued with Authorisation ID"
            icon={FileCheck}
            color="emerald"
            badge="Statutory Order"
          />
          <MetricCard
            title="Electronic Transit Passes"
            value={movements.length}
            subvalue="Form II Transit Passes"
            icon={Truck}
            color="blue"
            badge="e-TP Active"
          />
          <MetricCard
            title="CITES Export Oversight"
            value={`${exportBatches.length} Consignments`}
            subvalue="Appendix II Species Verification"
            icon={PlaneTakeoff}
            color="purple"
            badge="WCCB Clearance"
          />
        </div>

        {/* Pending Approval Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Harvest Felling Applications Awaiting Statutory Decision
              </h3>
              <p className="text-xs text-slate-500">
                Decision Gate: Approve to issue Harvest Authorisation ID or Reject with deficiency note to loop back.
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('HARVEST')}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Open Approval Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {harvests.map(h => (
              <div key={h.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{h.id} • Tree {h.treeId}</div>
                  <div className="text-[11px] text-slate-500">Farmer: {h.farmerName} • Est. Weight: {h.estimatedWeightKg} kg</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {h.status.replace(/_/g, ' ')}
                  </span>
                  <button
                    onClick={() => onNavigateModule('HARVEST')}
                    className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold"
                  >
                    DFO Decision
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. COLLECTION CENTRE & DEPOT INTAKE DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeRole === 'COLLECTION_OPERATOR') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-400 text-slate-950">
              Cluster Depot Operations
            </span>
            <h1 className="text-2xl font-black text-white">
              Collection Centre Dashboard • Golaghat Depot Hub
            </h1>
            <p className="text-xs text-teal-100">
              Farm-to-depot weighment verification, gate tolerance audit (≤ ±1.5%), and homogeneous aggregation batch assembly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateModule('MOVEMENT')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4" />
              <span>Verify Receipt & Gate Tolerance</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Received Green Wood"
            value={`${totalWoodHarvestedKg.toFixed(1)} kg`}
            subvalue="Farm Gate Intake"
            icon={Scale}
            color="teal"
            badge="Certified Scale"
          />
          <MetricCard
            title="Gate Tolerance Compliance"
            value="100% Pass"
            subvalue="Variance ≤ ±1.5%"
            icon={ShieldCheck}
            color="emerald"
            badge="Zero Transit Loss"
          />
          <MetricCard
            title="Aggregation Batches"
            value={aggregations.length}
            subvalue="Pooled for Distillation"
            icon={Boxes}
            color="cyan"
            badge="Preserved Lineage"
          />
          <MetricCard
            title="Vault Storage"
            value={`${inventory.length} Lots`}
            subvalue="Secure Custody"
            icon={Warehouse}
            color="amber"
            badge="QR Tracked"
          />
        </div>

        {/* Inward Consignments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Inward Farm Gate Consignments & Tolerance Audit (≤ ±1.5%)
              </h3>
              <p className="text-xs text-slate-500">
                Mandatory electronic weighbridge reconciliation at depot gate before lot pooling.
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('MOVEMENT')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Manage Movements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {movements.map(m => (
              <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{m.id} • {m.sourceName} → {m.destinationName}</div>
                  <div className="text-[11px] text-slate-500">
                    Vehicle: {m.vehicleNumber} • e-Transit Pass: {m.transitPassNumber}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{m.dispatchWeightKg} kg → {m.receivedWeightKg !== null ? `${m.receivedWeightKg} kg` : 'En Route'}</span>
                    <div className={`text-[10px] font-bold ${Math.abs(m.variancePercent || 0) <= 1.5 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      Var: {m.variancePercent !== null ? `${m.variancePercent}%` : 'Pending'}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateModule('MOVEMENT')}
                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold"
                  >
                    Verify Gate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. COMMON PROCESSING CENTRE (CPC) / DISTILLERY DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeRole === 'CPC_OPERATOR') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950">
              Common Processing Centre (CPC)
            </span>
            <h1 className="text-2xl font-black text-white">
              CPC Distillation Plant Dashboard • Boilers ST-01 to ST-08
            </h1>
            <p className="text-xs text-cyan-200">
              Hydro-distillation run monitoring (72-96 hrs), oil yield tracking, and raw wood to essential oil mass balance ledger.
            </p>
          </div>

          <button
            onClick={() => onNavigateModule('PROCESSING')}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Factory className="w-4 h-4" />
            <span>Launch Distillation Run</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Stills"
            value={`${distillations.length} Stills`}
            subvalue="Boilers ST-01 to ST-08"
            icon={Factory}
            color="cyan"
            badge="Hydro-Distillation"
          />
          <MetricCard
            title="Pure Oud Extracted"
            value={`${totalOudOilDistilledMl.toFixed(1)} ml`}
            subvalue="Grade-1 & Grade-2 Oil"
            icon={Sparkles}
            color="purple"
            badge="Dehn Al Oudh"
          />
          <MetricCard
            title="Mass Balance Yield"
            value="0.18% Yield"
            subvalue="Raw Wood to Oil Ratio"
            icon={Scale}
            color="emerald"
            badge="Conservation OK"
          />
          <MetricCard
            title="Lab Samples Released"
            value={`${labTests.length} Samples`}
            subvalue="NABL GC-MS Tested"
            icon={FlaskConical}
            color="blue"
            badge="Agarospirol ≥8.5%"
          />
        </div>

        {/* Live Stills Monitoring Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                CPC Distillation Stills Live Monitoring (ST-01 to ST-08)
              </h3>
              <p className="text-xs text-slate-500">
                Continuous 72-96 hour hydro-distillation monitoring and condensate collection ledger.
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('PROCESSING')}
              className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
            >
              <span>Open CPC Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {['ST-01', 'ST-02', 'ST-03', 'ST-04', 'ST-05', 'ST-06', 'ST-07', 'ST-08'].map((stillId, idx) => {
              const activeRun = distillations[idx % distillations.length];
              const isRunning = idx < 5;
              return (
                <div key={stillId} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{stillId}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${isRunning ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                      {isRunning ? 'RUNNING (82h)' : 'COOLING / READY'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Input Lot: <strong className="font-mono text-slate-800">{activeRun?.inputBatchId || `LOT-AS-2026-0${idx+1}`}</strong>
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Temp: 102.4°C</span>
                    <span>Oil: {(14.5 + idx * 2.2).toFixed(1)} ml</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. NABL ACCREDITED QUALITY LAB DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeRole === 'LAB_OFFICER') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-400 text-slate-950">
              ISO/IEC 17025 Accredited Laboratory
            </span>
            <h1 className="text-2xl font-black text-white">
              NABL GC-MS Chemical Testing Dashboard • Guwahati Lab
            </h1>
            <p className="text-xs text-purple-200">
              Gas Chromatography - Mass Spectrometry (GC-MS), botanical species authentication, and Certificate of Analysis (CoA) sign-off.
            </p>
          </div>

          <button
            onClick={() => onNavigateModule('LABORATORY')}
            className="px-4 py-2 bg-purple-400 hover:bg-purple-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Enter GC-MS Purity Results</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Lab Samples Tested"
            value={labTests.length}
            subvalue="Distillation Batches"
            icon={FlaskConical}
            color="purple"
            badge="GC-MS Chromatogram"
          />
          <MetricCard
            title="Average Agarospirol"
            value="10.8%"
            subvalue="Benchmark ≥ 8.5%"
            icon={Sparkles}
            color="emerald"
            badge="Grade-A Purity"
          />
          <MetricCard
            title="Certificates of Analysis"
            value={labTests.filter(l => l.status === 'RELEASED_PASSED').length}
            subvalue="Cryptographically Signed"
            icon={FileBadge2}
            color="cyan"
            badge="NABL Released"
          />
          <MetricCard
            title="Packaging Queue"
            value={finishedProducts.length}
            subvalue="Flacons Ready for Serialisation"
            icon={PackageCheck}
            color="blue"
            badge="Laser QR Ready"
          />
        </div>

        {/* NABL GC-MS Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                NABL GC-MS Quality Testing Queue & CoA Releases
              </h3>
              <p className="text-xs text-slate-500">
                Verification of Agarospirol ≥ 8.5%, Chromone chemical markers, and issuance of tamper-proof CoA.
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('LABORATORY')}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
            >
              <span>Launch Lab Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {labTests.map(t => (
              <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{t.id} • Batch {t.distillationBatchId}</div>
                  <div className="text-[11px] text-slate-500">
                    Agarospirol: <strong className="text-purple-700 font-bold">{t.agarospirolPercent || '11.4'}%</strong> • Status: {t.status}
                  </div>
                </div>
                <button
                  onClick={() => onNavigateModule('LABORATORY')}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold"
                >
                  View CoA
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. EXPORTER & LOGISTICS DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeRole === 'EXPORTER') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-400 text-slate-950">
              Global Trade & CITES Compliance
            </span>
            <h1 className="text-2xl font-black text-white">
              Exporter & Logistics Dashboard
            </h1>
            <p className="text-xs text-blue-200">
              Assembly of CITES Export Batches, customs clearance, shipping bills, and international luxury perfume consignments.
            </p>
          </div>

          <button
            onClick={() => onNavigateModule('EXPORT')}
            className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <PlaneTakeoff className="w-4 h-4" />
            <span>Assemble Export Batch</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Export Batches"
            value={exportBatches.length}
            subvalue="CITES Appendix II"
            icon={PlaneTakeoff}
            color="emerald"
            badge="WCCB Approved"
          />
          <MetricCard
            title="Exported Flacons"
            value={`${totalExportBottles} Packs`}
            subvalue="Dubai, Riyadh & Paris"
            icon={PackageCheck}
            color="blue"
            badge="Customs Cleared"
          />
          <MetricCard
            title="Export Invoice Value"
            value="$126,000 USD"
            subvalue="Foreign Exchange"
            icon={TrendingUp}
            color="teal"
            badge="High Value Forex"
          />
          <MetricCard
            title="Domestic Attar Sales"
            value={`${totalDomesticBottles} Packs`}
            subvalue="Kannauj & Mumbai Perfumers"
            icon={Store}
            color="amber"
            badge="GST Invoiced"
          />
        </div>

        {/* Export Consignments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Active CITES Export Consignments & Customs Desks
              </h3>
              <p className="text-xs text-slate-500">
                Consignments prepared under DGFT Export Licences and Wildlife Crime Control Bureau (WCCB) Non-Detriment Findings.
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('EXPORT')}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Export Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {exportBatches.map(e => (
              <div key={e.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{e.id} • {e.destinationCountry} ({e.destinationPort})</div>
                  <div className="text-[11px] text-slate-500">
                    CITES Permit: {e.citesPermitNumber} • {e.totalPackCount} Luxury Flacons • Shipping Bill: {e.shippingBillNumber || 'SB-2026-9912'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {e.customsStatus || 'CUSTOMS_CLEARED'}
                  </span>
                  <button
                    onClick={() => onNavigateModule('EXPORT')}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                  >
                    View Papers
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. BUYER & CONSUMER PROVENANCE PORTAL
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeRole === 'BUYER_PUBLIC') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
              Consumer Trust & Provenance
            </span>
            <h1 className="text-2xl font-black text-white">
              Public Provenance & Authenticity Portal
            </h1>
            <p className="text-xs text-emerald-200">
              Scan laser-etched QR code on any 12ml crystal flacon to verify legal homestead origin, farmer fair trade, and GC-MS purity.
            </p>
          </div>

          <button
            onClick={() => onNavigateModule('TRACEABILITY')}
            className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan / Verify QR Code</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="100% Legal Homestead Origin"
            value="Zero Forest Depletion"
            subvalue="Assam Policy 2020 Validated"
            icon={Trees}
            color="emerald"
            badge="DFO Verified"
          />
          <MetricCard
            title="NABL GC-MS Purity"
            value="Certified Pure"
            subvalue="Agarospirol ≥ 8.5% Guaranteed"
            icon={FlaskConical}
            color="purple"
            badge="No Adulterants"
          />
          <MetricCard
            title="Fair Trade Farmer Return"
            value="Direct Farm-Gate"
            subvalue="Guaranteed Remuneration"
            icon={ShieldCheck}
            color="teal"
            badge="NERAMAC Certified"
          />
        </div>

        {/* Quick Provenance Verifier */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900">
              Instant Flacon Authenticity & Tree Lineage Scan
            </h3>
            <p className="text-xs text-slate-500">
              Enter the laser-etched serial code printed on your 12ml crystal flacon.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              defaultValue="PCK-NER-2026-001"
              id="buyerScanInput"
              className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 bg-slate-50"
            />
            <button
              onClick={() => onNavigateModule('TRACEABILITY')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>Verify Lineage</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>Sample Verified Codes:</span>
            <button onClick={() => onNavigateModule('TRACEABILITY')} className="font-mono font-bold text-emerald-700 underline">PCK-NER-2026-001</button>
            <span>•</span>
            <button onClick={() => onNavigateModule('TRACEABILITY')} className="font-mono font-bold text-emerald-700 underline">PCK-NER-2026-013</button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. NERAMAC ADMIN DASHBOARD (Overall & Cluster-Wise)
  // ─────────────────────────────────────────────────────────────────────────────
  const farmerClusterMap = {};
  farmers.forEach(f => {
    farmerClusterMap[f.id] = f.cluster || (f.district ? `${f.district} Cluster` : 'Other Cluster');
  });

  const resolveCluster = (item) => {
    if (item?.cluster) return item.cluster;
    if (item?.farmerId && farmerClusterMap[item.farmerId]) return farmerClusterMap[item.farmerId];
    if (item?.district) return `${item.district} Cluster`;
    return 'Golaghat Cluster';
  };

  const clusterSet = new Set([
    ...farmers.map(resolveCluster),
    ...(pologens || []).map(resolveCluster),
    ...trees.map(resolveCluster),
    ...harvestBatches.map(resolveCluster)
  ]);

  const clusterStats = Array.from(clusterSet).map(clusterName => {
    const cFarmers = farmers.filter(f => resolveCluster(f) === clusterName);
    const cPologens = (pologens || []).filter(p => resolveCluster(p) === clusterName);
    const cSaplings = cPologens.reduce((sum, p) => sum + (p.saplingCount || 0), 0);
    const cTrees = trees.filter(t => resolveCluster(t) === clusterName);
    const cBatches = harvestBatches.filter(b => resolveCluster(b) === clusterName);
    const cHarvestKg = cBatches.reduce((sum, b) => sum + (b.netWeightKg || 0), 0);
    return {
      clusterName,
      farmersCount: cFarmers.length,
      pologensCount: cPologens.length,
      saplingsCount: cSaplings,
      treesCount: cTrees.length,
      batchesCount: cBatches.length,
      harvestKg: cHarvestKg
    };
  });

  return (
    <div className="space-y-6">
      {/* Overall KPI Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Registered Farmers"
          value={farmers.length}
          subvalue={`${clusterStats.length} Active Clusters`}
          icon={Users}
          color="emerald"
          badge="Overall Total"
        />
        <MetricCard
          title="POLOGENs (<7 yrs)"
          value={pologens?.length || 0}
          subvalue={`${totalSaplings} Total Saplings`}
          icon={Compass}
          color="cyan"
          badge="Polygon Mapped"
        />
        <MetricCard
          title="Matured Trees (≥7 yrs)"
          value={trees.length}
          subvalue="QR Tagged & Geo-Pinned"
          icon={Trees}
          color="teal"
          trend="Farmer Attached"
        />
        <MetricCard
          title="Harvested Wood"
          value={`${totalWoodHarvestedKg.toFixed(1)} kg`}
          subvalue={`${harvestBatches.length} Official Harvest Batches`}
          icon={Axe}
          color="amber"
          badge="DFO Sanctioned"
        />
      </div>

      {/* Cluster-Wise Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Cluster-Wise Overview (Farmers, POLOGENs, Trees &amp; Harvested Wood)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Live cluster distribution across all registered Assam &amp; Tripura agarwood clusters.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            {clusterStats.length} Clusters
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Cluster</th>
                <th className="px-4 py-3 text-right">Farmers</th>
                <th className="px-4 py-3 text-right">POLOGENs (&lt;7 yrs)</th>
                <th className="px-4 py-3 text-right">Matured Trees (≥7 yrs)</th>
                <th className="px-4 py-3 text-right">Harvested Wood (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clusterStats.map(c => (
                <tr key={c.clusterName} className="hover:bg-emerald-50/40 transition">
                  <td className="px-4 py-3 font-extrabold text-slate-900">{c.clusterName}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-800">
                    {c.farmersCount}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span className="font-bold text-cyan-800">{c.pologensCount}</span>
                    <span className="text-[10px] text-slate-400 ml-1">({c.saplingsCount} saplings)</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-teal-800">
                    {c.treesCount}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span className="font-bold text-amber-800">{c.harvestKg.toFixed(1)} kg</span>
                    <span className="text-[10px] text-slate-400 ml-1">({c.batchesCount} batches)</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-emerald-50/70 border-t border-emerald-200 font-extrabold text-slate-900">
              <tr>
                <td className="px-4 py-3">Overall Total</td>
                <td className="px-4 py-3 text-right font-mono">{farmers.length}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {pologens?.length || 0} <span className="text-[10px] font-semibold text-slate-500">({totalSaplings} saplings)</span>
                </td>
                <td className="px-4 py-3 text-right font-mono">{trees.length}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {totalWoodHarvestedKg.toFixed(1)} kg <span className="text-[10px] font-semibold text-slate-500">({harvestBatches.length} batches)</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
