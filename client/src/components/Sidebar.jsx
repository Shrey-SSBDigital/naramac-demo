import React from 'react';
import { 
  UserCheck, 
  MapPin, 
  Layers, 
  FlaskConical, 
  FileCheck2, 
  Scale, 
  Truck, 
  Boxes, 
  Flame, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2,
  ChevronRight,
  GitFork,
  Sparkles,
  Users,
  Compass,
  Database
} from 'lucide-react';

const STEP_ICONS = [
  UserCheck,    // Step 1: Farmer Registration
  MapPin,       // Step 2: Field Geo-pinning
  Layers,       // Step 3: Plantation & Age Rule
  FlaskConical, // Step 4: Inoculation
  FileCheck2,   // Step 5: Harvest Application
  ShieldCheck,  // Step 6: DFO Sanction
  Scale,        // Step 7: Harvest Scale
  Truck,        // Step 8: Movement & Tolerance
  Boxes,        // Step 9: Depot Pooling
  Flame,        // Step 10: CPC Distillation
  FlaskConical, // Step 11: NABL Lab
  QrCode,       // Step 12: Packaging & QR
  Truck,        // Step 13: Export Shipment
  ShieldCheck   // Step 14: Buyer Provenance
];

export default function Sidebar({ 
  workflowSteps,
  currentStep,
  completedSteps,
  onSelectStep,
  viewMode,
  onToggleViewMode,
  stakeholders,
  selectedRoleId,
  onSelectRole
}) {
  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 flex-shrink-0 z-30 shadow-sm">
      {/* Brand Header Card (Assam Forest Green & Golden Amber) */}
      <div className="p-3.5 border-b border-slate-200">
        <div className="brand-header p-4 rounded-xl shadow-md text-white space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-emerald-800 flex items-center justify-center font-extrabold text-xl shadow-md ring-2 ring-emerald-400/50 flex-shrink-0">
              N
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base tracking-tight">NERAMAC</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-400/40">
                  ASCTS
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 font-medium leading-tight">
                Agarwood Traceability System
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-600/40 flex items-center justify-between text-[10px] text-emerald-200">
            <span className="font-semibold text-white">Assam & Tripura Clusters</span>
            <span className="font-mono bg-emerald-900/40 px-1.5 py-0.5 rounded border border-emerald-400/30">RFP 06/31</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Modes (Flow, Geo Studio, 15 IDs, QR Portal, Roles) */}
      <div className="p-2.5 border-b border-slate-200 space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-[11px]">
          <button
            onClick={() => onToggleViewMode('FLOW')}
            className={`py-2 px-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              viewMode === 'FLOW'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Live Flow (14)</span>
          </button>

          <button
            onClick={() => onToggleViewMode('GEO_STUDIO')}
            className={`py-2 px-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              viewMode === 'GEO_STUDIO'
                ? 'bg-teal-700 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Geo-Tag Studio</span>
          </button>

          <button
            onClick={() => onToggleViewMode('TRACEABILITY')}
            className={`py-2 px-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              viewMode === 'TRACEABILITY'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>15 IDs Graph</span>
          </button>

          <button
            onClick={() => onToggleViewMode('QR_PORTAL')}
            className={`py-2 px-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              viewMode === 'QR_PORTAL'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Verification</span>
          </button>
        </div>

        {/* Roles Directory Button */}
        <button
          onClick={() => onToggleViewMode('ROLES')}
          className={`w-full py-1.5 px-3 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 border ${
            viewMode === 'ROLES'
              ? 'bg-purple-100 text-purple-900 border-purple-300 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-700" />
          <span>Stakeholder Roles Directory (11 Roles)</span>
        </button>
      </div>

      {/* Main List Container */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-300">
        {viewMode === 'FLOW' && (
          /* WORKFLOW STAGES LIST */
          workflowSteps.map((step, idx) => {
            const isSelected = currentStep === step.stepNumber;
            const isCompleted = completedSteps.includes(step.stepNumber);

            return (
              <button
                key={step.stepNumber}
                onClick={() => onSelectStep(step.stepNumber)}
                className={`w-full p-2.5 rounded-xl text-left transition-all duration-150 flex items-center justify-between group cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500/30 text-emerald-950 font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    : 'bg-slate-50/70 border-slate-100 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold flex-shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted && !isSelected ? '✓' : step.stepNumber}
                  </span>

                  <div className="min-w-0">
                    <span className={`text-xs block font-bold truncate ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                      {step.title}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {step.actor}
                    </span>
                  </div>
                </div>

                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 ${
                  isSelected ? 'bg-emerald-200/70 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-500'
                }`}>
                  {step.idCode}
                </span>
              </button>
            );
          })
        )}

        {viewMode === 'ROLES' && (
          /* STAKEHOLDERS DIRECTORY LIST */
          stakeholders.map((s, idx) => {
            const isSelected = selectedRoleId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectRole(s.id)}
                className={`w-full p-2.5 rounded-xl text-left transition-all duration-150 flex items-center justify-between group cursor-pointer border ${
                  isSelected
                    ? 'bg-purple-50 border-purple-500 text-purple-950 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold flex-shrink-0 ${
                    isSelected ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <span className={`text-xs block font-bold truncate ${isSelected ? 'text-purple-900' : 'text-slate-800'}`}>
                      {s.roleName}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {s.organization}
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-purple-600' : 'text-slate-400'}`} />
              </button>
            );
          })
        )}

        {viewMode !== 'FLOW' && viewMode !== 'ROLES' && (
          /* CONTEXT CARD WHEN IN OTHER VIEWS */
          <div className="space-y-3 p-2 text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
              Active Demonstration Mode:
            </span>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-xs">
              <span className="font-bold text-slate-900 block text-sm">
                {viewMode === 'GEO_STUDIO' && '🛰️ Field Geo-Tagging Studio'}
                {viewMode === 'TRACEABILITY' && '🔗 15 IDs Traceability Graph'}
                {viewMode === 'QR_PORTAL' && '📱 QR Verification Portal'}
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {viewMode === 'GEO_STUDIO' && 'Demonstrate boundary perimeter walking for <7 yr saplings (POLOGEN) vs point geo-pinning for ≥7 yr mature trees with offline SQLite sync.'}
                {viewMode === 'TRACEABILITY' && 'Explore the single unbroken 15-identity graph from farmer homestead to international consumer flacon (RFP Section 3.2).'}
                {viewMode === 'QR_PORTAL' && 'Scan bottle QR code to inspect authentic provenance, NABL GC-MS purity certificate, and DPDP Act 2023 privacy protection.'}
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => onToggleViewMode('FLOW')}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center justify-between text-xs shadow-sm"
              >
                <span>Return to Live 14-Step Flow</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onToggleViewMode('GEO_STUDIO')}
                className={`w-full py-2 px-3 rounded-lg font-semibold transition flex items-center justify-between text-xs border ${
                  viewMode === 'GEO_STUDIO' ? 'bg-teal-50 text-teal-800 border-teal-300 font-bold' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>Geo-Tagging Studio</span>
                <Compass className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onToggleViewMode('TRACEABILITY')}
                className={`w-full py-2 px-3 rounded-lg font-semibold transition flex items-center justify-between text-xs border ${
                  viewMode === 'TRACEABILITY' ? 'bg-blue-50 text-blue-800 border-blue-300 font-bold' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>15 IDs Traceability</span>
                <Database className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onToggleViewMode('QR_PORTAL')}
                className={`w-full py-2 px-3 rounded-lg font-semibold transition flex items-center justify-between text-xs border ${
                  viewMode === 'QR_PORTAL' ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>QR Verification Portal</span>
                <QrCode className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-500 flex items-center justify-between">
        <span className="font-semibold">NERAMAC ASCTS v2.0</span>
        <span className="font-mono text-emerald-700 font-bold">Assam & Tripura</span>
      </div>
    </aside>
  );
}
