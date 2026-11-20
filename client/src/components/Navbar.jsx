import React from 'react';
import { MapPin, Sparkles } from 'lucide-react';

export default function Navbar({ activeRoleName }) {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 shadow-xs">
      <div className="px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Title and Cluster Context */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm ring-2 ring-emerald-500/20">
            N
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Agarwood Supply Chain Traceability System</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-700 text-white shadow-xs">
                NERAMAC
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                Govt of India (MDoNER)
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Assam (Golaghat Cluster) & Tripura (Kadamtala Cluster) • Section 3.2 Authoritative Traceability
            </p>
          </div>
        </div>

        {/* Current Active Perspective Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs shadow-xs">
            <span className="text-slate-500 font-medium">Perspective:</span>
            <span className="font-bold text-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              {activeRoleName || "Operational Overview"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
