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
    <section className="bg-white border-b border-slate-200 p-4 shadow-xs">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-black tracking-wide uppercase text-emerald-900">
                {translations.roleSelectorTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {translations.roleSelectorHint}
            </p>
          </div>

          {/* Quick Select Dropdown for mobile or fast switching */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-bold">Quick Switch:</span>
            <select
              value={selectedRoleId}
              onChange={(e) => onSelectRole(e.target.value)}
              className="bg-white border border-slate-300 text-xs text-slate-900 font-bold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
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
        <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 pt-1">
          {stakeholders.map((s) => {
            const isSelected = s.id === selectedRoleId;
            const IconComponent = ICON_MAP[s.icon] || ShieldCheck;

            return (
              <button
                key={s.id}
                onClick={() => onSelectRole(s.id)}
                className={`flex-shrink-0 text-left w-52 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-500/30'
                    : 'bg-white border-slate-200 hover:border-emerald-400 hover:bg-slate-50 text-slate-900 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-emerald-800/80 text-emerald-100 border border-emerald-600'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {s.category.split(' ')[0]}
                    </span>
                  </div>
                  <h3
                    className={`text-xs font-bold leading-snug line-clamp-2 ${
                      isSelected ? 'text-white font-extrabold' : 'text-slate-900'
                    }`}
                  >
                    {s.roleName}
                  </h3>
                </div>

                <div className={`mt-3 pt-2 border-t ${isSelected ? 'border-emerald-600/60' : 'border-slate-100'} flex items-center justify-between text-[11px]`}>
                  <span className={`${isSelected ? 'text-emerald-100' : 'text-slate-600'} font-bold`}>
                    {isSelected ? 'Active View' : 'Click to View'}
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isSelected ? 'text-emerald-100 translate-x-0.5' : 'text-slate-400'
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
  );
}
