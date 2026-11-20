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
  ArrowLeftRight,
  CheckCircle,
  AlertTriangle,
  Layers,
  FileText,
  Workflow,
  Sparkles,
  Search
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

export default function StakeholderResponsibilitiesView({
  activeStakeholder,
  allStakeholders,
  onSelectRole,
  translations
}) {
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'UPSTREAM' | 'DOWNSTREAM' | 'REGULATORY'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRoleId, setExpandedRoleId] = useState(null);

  if (!activeStakeholder) return null;

  const ActiveIcon = ICON_MAP[activeStakeholder.icon] || ShieldCheck;

  // Determine other stakeholders and their relationships
  const otherStakeholders = allStakeholders
    .filter((s) => s.id !== activeStakeholder.id)
    .map((other) => {
      const isUpstream = activeStakeholder.upstreamDependencies.some(
        (u) => u.fromRole === other.id
      );
      const isDownstream = activeStakeholder.downstreamHandoffs.some(
        (d) => d.toRole === other.id
      );
      const isRegulatory = other.category.includes('Regulator') || other.category.includes('Governing') || other.category.includes('Audit');

      const relationToActive = other.relationshipWithOthers[activeStakeholder.id] || "Interacts through the unified digital custody chain.";
      const activeToOther = activeStakeholder.relationshipWithOthers[other.id] || "Exchanges verified digital transaction records.";

      return {
        ...other,
        isUpstream,
        isDownstream,
        isRegulatory,
        relationToActive,
        activeToOther
      };
    })
    .filter((other) => {
      if (filterType === 'UPSTREAM') return other.isUpstream;
      if (filterType === 'DOWNSTREAM') return other.isDownstream;
      if (filterType === 'REGULATORY') return other.isRegulatory;
      return true;
    })
    .filter((other) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        other.roleName.toLowerCase().includes(q) ||
        other.category.toLowerCase().includes(q) ||
        other.relationToActive.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6">
      {/* 1. Active Role Banner / Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950/70 border border-emerald-500/40 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
          {/* Role Header & Identity */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner flex-shrink-0">
              <ActiveIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activeStakeholder.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <span>📍 {activeStakeholder.clusterPresence.join(' • ')}</span>
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {activeStakeholder.roleName}
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {activeStakeholder.description}
              </p>
            </div>
          </div>

          {/* Quick Metrics of Active Role */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/60 text-xs flex-shrink-0">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Identities Handled:</span>
              <span className="font-semibold text-emerald-300 font-mono">
                {activeStakeholder.mandatoryIdentitiesHandled.length} IDs
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Upstream Inputs:</span>
              <span className="font-semibold text-teal-300 font-mono">
                {activeStakeholder.upstreamDependencies.length} Sources
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Downstream Handoffs:</span>
              <span className="font-semibold text-cyan-300 font-mono">
                {activeStakeholder.downstreamHandoffs.length} Receivers
              </span>
            </div>
          </div>
        </div>

        {/* Core Duties & Regulatory Boundary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-800">
          {/* Duties */}
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <CheckCircle className="w-3.5 h-3.5" />
              {translations.coreDuties}
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {activeStakeholder.coreDuties.map((duty, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                  <span>{duty}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mandatory IDs & Statutory Boundary */}
          <div className="space-y-3">
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
              <h3 className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Layers className="w-3.5 h-3.5" />
                {translations.mandatoryIds}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {activeStakeholder.mandatoryIdentitiesHandled.map((idObj, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-xs"
                  >
                    <span className="font-mono font-bold text-emerald-400">{idObj.code}:</span>
                    <span>{idObj.name}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-750 px-1 rounded">({idObj.action})</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-amber-950/30 rounded-xl p-3.5 border border-amber-500/30 text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{translations.regulatoryBoundary}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {activeStakeholder.regulatoryBoundary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC OTHER STAKEHOLDERS' RESPONSIBILITIES SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                {translations.otherRolesTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing how all {allStakeholders.length - 1} other stakeholders interact with, supply to, or regulate{' '}
              <span className="text-emerald-400 font-semibold">{activeStakeholder.roleName}</span>.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded-md transition ${
                  filterType === 'ALL' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({allStakeholders.length - 1})
              </button>
              <button
                onClick={() => setFilterType('UPSTREAM')}
                className={`px-3 py-1 rounded-md transition ${
                  filterType === 'UPSTREAM' ? 'bg-teal-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Upstream
              </button>
              <button
                onClick={() => setFilterType('DOWNSTREAM')}
                className={`px-3 py-1 rounded-md transition ${
                  filterType === 'DOWNSTREAM' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Downstream
              </button>
              <button
                onClick={() => setFilterType('REGULATORY')}
                className={`px-3 py-1 rounded-md transition ${
                  filterType === 'REGULATORY' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Regulators/Auditors
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stakeholder or duty..."
                className="bg-slate-850 border border-slate-700 text-xs text-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44 md:w-56"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {otherStakeholders.map((other) => {
            const OtherIcon = ICON_MAP[other.icon] || ShieldCheck;
            const isExpanded = expandedRoleId === other.id;

            return (
              <div
                key={other.id}
                className="bg-slate-850/80 border border-slate-750 hover:border-slate-650 rounded-xl p-4 transition-all duration-200 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Stakeholder Header */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                        <OtherIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {other.roleName}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {other.category}
                        </span>
                      </div>
                    </div>

                    {/* Relationship Badge */}
                    <div>
                      {other.isUpstream && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                          ↑ {translations.upstream}
                        </span>
                      )}
                      {other.isDownstream && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
                          ↓ {translations.downstream}
                        </span>
                      )}
                      {!other.isUpstream && !other.isDownstream && other.isRegulatory && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                          ⚖ Statutory Oversight
                        </span>
                      )}
                      {!other.isUpstream && !other.isDownstream && !other.isRegulatory && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                          ⇄ Ecosystem Partner
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CRITICAL: Specific Reciprocal Responsibility Box */}
                  <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 mt-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                      Relationship to {activeStakeholder.roleName}:
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      "{other.relationToActive}"
                    </p>
                  </div>

                  {/* General Core Duties of This Role */}
                  <div className="space-y-1 mt-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Key Responsibilities in Chain:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {(isExpanded ? other.coreDuties : other.coreDuties.slice(0, 2)).map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Expanded Information (Identities Handled & Upstream/Downstream) */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                      <div className="text-[11px]">
                        <span className="text-slate-400 font-medium">Digital Identities Created/Governed:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {other.mandatoryIdentitiesHandled.map((idObj, idx) => (
                            <span key={idx} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">
                              {idObj.code}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded text-[11px] text-amber-300/90 border border-amber-500/20">
                        <span className="font-semibold text-amber-400">Boundary: </span>
                        {other.regulatoryBoundary}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls: Switch Perspective or Expand */}
                <div className="mt-4 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setExpandedRoleId(isExpanded ? null : other.id)}
                    className="text-slate-400 hover:text-slate-200 text-[11px] font-medium underline underline-offset-2"
                  >
                    {isExpanded ? 'Show Less' : 'View Full Details & IDs'}
                  </button>

                  <button
                    onClick={() => onSelectRole(other.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition font-medium text-[11px] border border-slate-700 hover:border-emerald-500"
                  >
                    <span>Switch to this Role</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
