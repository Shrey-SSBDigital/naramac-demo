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
  Sparkles
} from 'lucide-react';

export default function DashboardModule({ onNavigateModule }) {
  const {
    farmers,
    plantations,
    trees,
    harvests,
    harvestBatches,
    distillations,
    finishedProducts,
    exportBatches,
    movements,
    inventory,
    activeRole
  } = useEnterprise();

  // Metrics
  const totalWoodHarvestedKg = harvestBatches.reduce((acc, b) => acc + (b.netWeightKg || 0), 0);
  const totalOudOilDistilledMl = distillations.reduce((acc, d) => acc + (d.outputPureOudOilMl || 0), 0);
  const totalExportBottles = exportBatches.reduce((acc, e) => acc + (e.totalPackCount || 0), 0);
  const totalDomesticBottles = finishedProducts.filter(p => p.channel === 'DOMESTIC').length;
  const inStockBottles = finishedProducts.filter(p => p.status === 'IN_VAULT_STOCK').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome & RFP Reference Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
              Operational Command Center
            </span>
            <span className="text-xs text-emerald-200">
              RFP: NER/PROJECT/AGAR/RESEARCH AND DEVELOPMENT/06/31
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            NERAMAC Agarwood Supply Chain Traceability System (ASCTS)
          </h2>
          <p className="text-xs text-emerald-100/90 leading-relaxed">
            Centralized digital traceability governing <span className="font-bold text-white">Aquilaria malaccensis</span> value chain across Golaghat Cluster (Assam) and Kadamtala Cluster (North Tripura) from farmer registration to international CITES export.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
            <button
              onClick={() => onNavigateModule('TRACEABILITY')}
              className="bg-white text-emerald-900 font-extrabold px-3.5 py-1.5 rounded-xl shadow-xs hover:bg-emerald-50 transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Verify Product Provenance</span>
            </button>
            <button
              onClick={() => onNavigateModule('PLANTATIONS')}
              className="bg-emerald-800/80 hover:bg-emerald-700/80 text-white font-bold px-3 py-1.5 rounded-xl border border-emerald-500/40 transition flex items-center gap-1.5"
            >
              <Trees className="w-3.5 h-3.5 text-emerald-300" />
              <span>Explore Satellite Map (100 Trees)</span>
            </button>
          </div>
        </div>

        {/* Background decorative flair */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
      </div>

      {/* Primary KPI Grid (8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Registered Farmers"
          value={farmers.length}
          subvalue="Assam & Tripura Clusters"
          icon={Users}
          color="emerald"
          badge="100% Geo-Verified"
        />
        <MetricCard
          title="Tagged Mature Trees"
          value={trees.length}
          subvalue={`${plantations.length} Verified Plantations`}
          icon={Trees}
          color="teal"
          trend="+100 Active"
        />
        <MetricCard
          title="Harvested Wood"
          value={`${totalWoodHarvestedKg.toFixed(1)} kg`}
          subvalue={`${harvestBatches.length} Official Harvest Batches`}
          icon={Axe}
          color="amber"
          badge="DFO Sanctioned"
        />
        <MetricCard
          title="Pure Oud Distilled"
          value={`${totalOudOilDistilledMl.toFixed(1)} ml`}
          subvalue="Hydro & Steam Distillation"
          icon={Factory}
          color="purple"
          badge="NABL Released"
        />
        <MetricCard
          title="Serialized Flacons"
          value={finishedProducts.length}
          subvalue={`${inStockBottles} In Vault Reserve`}
          icon={PackageCheck}
          color="blue"
          badge="Laser QR Tagged"
        />
        <MetricCard
          title="Export Shipments"
          value={`${totalExportBottles} Packs`}
          subvalue={`${exportBatches.length} CITES Batches (Dubai & Paris)`}
          icon={PlaneTakeoff}
          color="emerald"
          trend="USD $126,000"
        />
        <MetricCard
          title="Domestic Sales"
          value={`${totalDomesticBottles} Packs`}
          subvalue="Kannauj & Mumbai Perfumeries"
          icon={TrendingUp}
          color="amber"
          trend="₹ 113,280"
        />
        <MetricCard
          title="Depot Stock Ledger"
          value={`${inventory.length} SKUs`}
          subvalue="3 Depots & 2 CPC Facilities"
          icon={Warehouse}
          color="teal"
          badge="≤ 1.5% Variance"
        />
      </div>

      {/* Two Column Layout: Operational Highlights & Interactive Flow Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Custody Movements (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Live Material Custody Transfers & Gate Tolerance (≤ 1.5%)
              </h3>
              <p className="text-xs text-slate-500">
                Continuous weighbridge audit trail between farmers, collection depots, CPC units and export customs.
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('MOVEMENT')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {movements.slice(0, 4).map(mov => (
              <div key={mov.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {mov.id}
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {mov.sourceName} → {mov.destinationName}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] flex items-center gap-3">
                    <span>Carrier: <strong className="text-slate-700">{mov.vehicleNumber}</strong></span>
                    <span>Transit Pass: <strong className="text-slate-700">{mov.transitPassNumber}</strong></span>
                  </div>
                </div>

                <div className="text-right space-y-1 flex-shrink-0">
                  <div className="font-bold text-slate-900">
                    {mov.dispatchWeightKg} kg → {mov.receivedWeightKg !== null ? `${mov.receivedWeightKg} kg` : 'In Transit'}
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    {mov.variancePercent !== null && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        Math.abs(mov.variancePercent) <= 1.5 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        Var: {mov.variancePercent}%
                      </span>
                    )}
                    <StatusBadge status={mov.toleranceStatus} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Processing & NABL Quality Snapshot (1 col) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  CPC Mass Balance & Lab
                </h3>
                <p className="text-xs text-slate-500">Hydro-distillation yields & GC-MS</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                NABL Certified
              </span>
            </div>

            <div className="mt-3 space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 font-semibold text-[11px]">
                  <span>Mass Balance Equation</span>
                  <span className="font-bold text-emerald-700">99.8% Balanced</span>
                </div>
                <div className="text-[11px] text-slate-700 font-mono bg-white p-2 rounded border border-slate-200">
                  Wood (75.0kg) = Oud Oil (245ml) + Hydrosol (18.5L) + Spent (68.2kg) + Loss (6.5kg)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span>GC-MS Chemical Profiling</span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-bold">Standard ≥ 8%</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                      <span>Agarospirol Content</span>
                      <strong className="text-emerald-700">14.82% (Premium)</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                      <span>Jinkoh-eremol Marker</span>
                      <strong className="text-emerald-700">6.24% (Pure)</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-teal-600 h-full rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateModule('LABORATORY')}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Laboratory Console</span>
          </button>
        </div>
      </div>

      {/* End-to-End Value Chain Flow Interactive Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Section 3.2 Value Chain Flow (14 Interconnected Milestones)
            </h3>
            <p className="text-xs text-slate-500">
              Click any stage to jump directly to its dedicated enterprise module.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs">
          {[
            { step: '01', title: 'Farmer Register', module: 'FARMERS' },
            { step: '02', title: 'GPS Point Tag', module: 'PLANTATIONS' },
            { step: '03', title: 'Inoculation', module: 'INOCULATION' },
            { step: '04', title: 'DFO Sanction', module: 'PERMITS' },
            { step: '05', title: 'Harvest Scale', module: 'HARVEST' },
            { step: '06', title: 'Tolerance Check', module: 'MOVEMENT' },
            { step: '07', title: 'Depot Pooling', module: 'AGGREGATION' },
            { step: '08', title: 'CPC Distillation', module: 'PROCESSING' },
            { step: '09', title: 'NABL GC-MS', module: 'LABORATORY' },
            { step: '10', title: 'Quality Release', module: 'LABORATORY' },
            { step: '11', title: 'Flacon Laser QR', module: 'FINISHED_PRODUCTS' },
            { step: '12', title: 'CITES Export', module: 'EXPORT' },
            { step: '13', title: 'Airway Cargo', module: 'SHIPMENT' },
            { step: '14', title: 'Buyer Scan', module: 'TRACEABILITY' }
          ].map((flow, idx) => (
            <button
              key={idx}
              onClick={() => onNavigateModule(flow.module)}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-left group"
            >
              <div className="text-[10px] font-mono font-bold text-emerald-700">{flow.step}</div>
              <div className="font-bold text-slate-800 text-[11px] truncate mt-0.5 group-hover:text-emerald-900">
                {flow.title}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
