import React from 'react';
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
  ChevronRight,
  UserCheck
} from 'lucide-react';

const ICON_MAP = {
  Sprout: Sprout,
  Compass: Compass,
  ShieldCheck: ShieldCheck,
  FileCheck2: FileCheck2,
  Boxes: Boxes,
  Flame: Flame,
  FlaskConical: FlaskConical,
  QrCode: QrCode,
  Truck: Truck,
  ShieldAlert: ShieldAlert,
  ScanLine: ScanLine
};

export default function StakeholderSelector({ 
  stakeholders, 
  selectedRoleId, 
  onSelectRole, 
  translations 
}) {
  return (
    <section className="bg-slate-900/90 border-b border-slate-800 p-4 shadow-lg backdrop-blur">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-400">
                {translations.roleSelectorTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              {translations.roleSelectorHint}
            </p>
          </div>

          {/* Quick Select Dropdown for mobile or fast switching */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Quick Switch:</span>
            <select
              value={selectedRoleId}
              onChange={(e) => onSelectRole(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {stakeholders.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.roleName} ({s.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Horizontal Scrollable Role Cards */}
        <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-700">
          {stakeholders.map((s) => {
            const isSelected = s.id === selectedRoleId;
            const IconComponent = ICON_MAP[s.icon] || ShieldCheck;

            return (
              <button
                key={s.id}
                onClick={() => onSelectRole(s.id)}
                className={`flex-shrink-0 text-left w-52 p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-emerald-950/80 to-slate-900 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-850/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {s.category.split(' ')[0]}
                    </span>
                  </div>
                  <h3
                    className={`text-xs font-semibold leading-snug line-clamp-2 ${
                      isSelected ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {s.roleName}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className={`${isSelected ? 'text-emerald-400' : 'text-slate-400'} font-medium`}>
                    {isSelected ? 'Active View' : 'Click to View'}
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-slate-400'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
