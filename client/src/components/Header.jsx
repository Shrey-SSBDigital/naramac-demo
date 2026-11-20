import React from 'react';
import { Shield, MapPin, Globe, Wifi, WifiOff, FileText, CheckCircle2 } from 'lucide-react';

export default function Header({ language, setLanguage, isOffline, setIsOffline, activeRoleData, translations }) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-xl sticky top-0 z-50">
      {/* Top Gov / Nodal Authority Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-800/40 px-4 py-1.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-emerald-300">GOVERNMENT OF INDIA ENTERPRISE</span>
          <span className="text-slate-600">|</span>
          <span>Ministry of Development of North Eastern Region (MDoNER)</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-mono text-[11px]">RFP: NER/PROJECT/AGAR/R&D/06/31</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50 flex items-center gap-1 font-medium text-[11px]">
            <MapPin className="w-3 h-3 text-emerald-400" /> Assam & Tripura Clusters
          </span>
          <span className="text-slate-400 text-[11px]">QCBS 80:20 System Baseline</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-400/30">
            <span className="text-white font-extrabold text-xl tracking-tighter">N</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                NERAMAC
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ASCTS
                </span>
              </h1>
              <span className="hidden sm:inline-block text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                v2.0 Demo
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-md sm:max-w-xl">
              {translations.subTitle}
            </p>
          </div>
        </div>

        {/* Action Controls: Language, Offline Toggle, Active Role */}
        <div className="flex items-center gap-3">
          {/* Active Role Quick Indicator */}
          {activeRoleData && (
            <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400">{translations.activeRole}:</span>
              <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {activeRoleData.roleName}
              </span>
            </div>
          )}

          {/* Aeroplane / Offline Field Mode Simulation Toggle */}
          <button
            onClick={() => setIsOffline(!isOffline)}
            title="Toggle simulated offline mode with provisional IDs"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
              isOffline
                ? 'bg-amber-950/60 text-amber-300 border-amber-500/50 shadow-inner'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{translations.offlineMode}</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>{translations.onlineMode}</span>
              </>
            )}
          </button>

          {/* Language Selector */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setLanguage('EN')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                language === 'EN' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('AS')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                language === 'AS' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              অসমীয়া
            </button>
            <button
              onClick={() => setLanguage('BN')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                language === 'BN' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
