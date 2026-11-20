import React from 'react';

export default function MetricCard({
  title,
  value,
  subvalue,
  icon: Icon,
  trend,
  color = 'emerald',
  badge
}) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      iconBg: 'bg-amber-600 text-white',
      badge: 'bg-amber-100 text-amber-800 border-amber-300'
    },
    teal: {
      bg: 'bg-teal-50 text-teal-800 border-teal-200',
      iconBg: 'bg-teal-600 text-white',
      badge: 'bg-teal-100 text-teal-800 border-teal-300'
    },
    blue: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      iconBg: 'bg-blue-600 text-white',
      badge: 'bg-blue-100 text-blue-800 border-blue-300'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-800 border-purple-200',
      iconBg: 'bg-purple-600 text-white',
      badge: 'bg-purple-100 text-purple-800 border-purple-300'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs flex-shrink-0 ${scheme.iconBg}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        {subvalue && (
          <span className="text-slate-500 font-medium truncate">
            {subvalue}
          </span>
        )}
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scheme.badge}`}>
            {badge}
          </span>
        )}
        {trend && (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
