import React, { useState, useEffect } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import { FileSpreadsheet, Download, ShieldCheck, Clock, Hash, CheckCircle2 } from 'lucide-react';

export default function AuditReportsModule({ mode = null }) {
  const { auditLogs, distillations, harvestBatches, movements, exportBatches } = useEnterprise();
  const [activeTab, setActiveTab] = useState(() => mode || 'AUDIT_TRAIL'); // 'AUDIT_TRAIL' | 'MASS_BALANCE' | 'CITES_REPORTS'

  useEffect(() => {
    if (mode) setActiveTab(mode);
  }, [mode]);

  const columns = [
    {
      header: 'Audit ID & Timestamp',
      accessor: 'id',
      render: (a) => (
        <div>
          <span className="font-extrabold text-slate-900 font-mono text-xs">{a.id}</span>
          <div className="text-[10px] text-slate-500 font-mono">{a.timestamp}</div>
        </div>
      )
    },
    {
      header: 'Action / Milestone',
      accessor: 'action',
      render: (a) => (
        <div>
          <span className="font-bold text-slate-800 text-xs">{a.action}</span>
          <div className="text-[11px] text-emerald-800 font-semibold">{a.module}</div>
        </div>
      )
    },
    {
      header: 'Stakeholder Actor',
      accessor: 'actorName',
      render: (a) => (
        <div>
          <span className="font-semibold text-slate-900">{a.actorName}</span>
          <div className="text-[10px] text-slate-400 font-mono">{a.actorRole}</div>
        </div>
      )
    },
    {
      header: 'Operation Details',
      accessor: 'details',
      render: (a) => (
        <span className="text-slate-700 text-xs line-clamp-2">
          {a.details}
        </span>
      )
    },
    {
      header: 'Cryptographic SHA Hash',
      accessor: 'hashSignature',
      render: (a) => (
        <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px] block" title={a.hashSignature}>
          {a.hashSignature}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>
              {mode === 'AUDIT_TRAIL'
                ? 'Immutable Cryptographic Audit Trail'
                : mode === 'MASS_BALANCE'
                ? 'Conservation Mass Balance Reconciliation Ledger'
                : mode === 'CITES_REPORTS'
                ? 'CITES Appendix II & Regulatory Export Quota Ledgers'
                : 'Audit Trail & Statutory Compliance Reports'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 17
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === 'AUDIT_TRAIL'
              ? 'Chronological transaction ledger with cryptographic SHA-256 signatures across every supply chain milestone.'
              : mode === 'MASS_BALANCE'
              ? 'Raw heartwood to essential oil conservation balance across Depot Aggregation and CPC Distillation.'
              : mode === 'CITES_REPORTS'
              ? 'Statutory CITES Appendix II non-detriment findings and export consignment quota compliance.'
              : 'Immutable chronological transaction ledger with cryptographic SHA-256 signatures and mass balance audits.'}
          </p>
        </div>

        {/* Tab Switcher (Hidden in dedicated single-report mode) */}
        {!mode && (
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('AUDIT_TRAIL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'AUDIT_TRAIL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Immutable Audit Trail ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('MASS_BALANCE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'MASS_BALANCE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mass Balance Reconciliation
          </button>
          <button
            onClick={() => setActiveTab('CITES_REPORTS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'CITES_REPORTS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CITES Export Quota Ledgers
          </button>
        </div>
        )}
      </div>

      {/* Tab 1: Immutable Chronological Audit Trail */}
      {activeTab === 'AUDIT_TRAIL' && (
        <DataTable
          columns={columns}
          data={auditLogs}
          searchKey="action"
          searchPlaceholder="Search audit events by action, actor, or details..."
        />
      )}

      {/* Tab 2: Mass Balance Reconciliation Ledger */}
      {activeTab === 'MASS_BALANCE' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                CPC Distillation Mass Balance Reconciliation Audit
              </h3>
              <p className="text-slate-500 text-[11px]">
                Statutory equation: Raw Wood In = Pure Oud Oil + Hydrosol Water + Spent Biomass + Process Loss
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {distillations.map(d => (
              <div key={d.id} className="py-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {d.id}
                    </span>
                    <span className="font-bold text-slate-800">{d.cpcName} ({d.stillId})</span>
                  </div>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    {d.massBalanceEfficiencyPercent}% Balanced
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Input Wood</div>
                    <strong className="text-slate-900">{d.inputWoodKg} kg</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="text-[10px] text-emerald-700 uppercase font-bold">Oud Oil Output</div>
                    <strong className="text-emerald-900">{d.outputPureOudOilMl} ml ({d.outputPureOudOilKg} kg)</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-teal-50 border border-teal-200">
                    <div className="text-[10px] text-teal-700 uppercase font-bold">Hydrosol</div>
                    <strong className="text-teal-900">{d.outputHydrosolLiters} L</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="text-[10px] text-amber-700 uppercase font-bold">Spent Residue</div>
                    <strong className="text-amber-900">{d.outputSpentBiomassKg} kg</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Process Loss</div>
                    <strong className="text-slate-700">{d.calculatedProcessLossKg} kg</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: CITES Export Quotas */}
      {activeTab === 'CITES_REPORTS' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                CITES Appendix II Export Quota Utilization
              </h3>
              <p className="text-slate-500 text-[11px]">
                MoEFCC statutory quota tracking for Aquilaria malaccensis international trade
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              2026 Quota: 2,500 ml
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Approved Annual Quota</span>
              <div className="text-xl font-black text-slate-900 mt-1">2,500.0 ml</div>
              <div className="text-[11px] text-slate-500">CITES/IN/2026/EXP-441</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-emerald-700 uppercase font-bold">Exported to Date</span>
              <div className="text-xl font-black text-emerald-900 mt-1">336.0 ml</div>
              <div className="text-[11px] text-emerald-700">2 Consignments (Dubai & Paris)</div>
            </div>
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
              <span className="text-[10px] text-teal-700 uppercase font-bold">Remaining Quota</span>
              <div className="text-xl font-black text-teal-900 mt-1">2,164.0 ml</div>
              <div className="text-[11px] text-teal-700">86.5% Balance Available</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
