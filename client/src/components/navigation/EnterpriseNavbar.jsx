import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import { USER_ROLES } from '../../data/mockEnterpriseData';
import { Search, RotateCcw, ShieldCheck, Bell, ChevronDown, Check, Sparkles } from 'lucide-react';

export default function EnterpriseNavbar({ activeModule, onSelectModule, onOpenTraceSearch }) {
  const { activeRole, setActiveRole, resetToInitialData, finishedProducts, harvestBatches, farmers } = useEnterprise();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const currentRole = USER_ROLES.find(r => r.id === activeRole) || USER_ROLES[1];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!navSearch.trim()) return;
    onOpenTraceSearch(navSearch.trim());
    setShowSearchSuggestions(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="px-5 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Active Perspective */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm ring-2 ring-emerald-500/20">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                NERAMAC ASCTS
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-700 text-white">
                Enterprise
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                Assam & Tripura Clusters
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Agarwood Traceability & Supply Chain Management System • RFP 06/31
            </p>
          </div>
        </div>

        {/* Center: Global Forward & Backward Traceability Search */}
        <div className="relative flex-1 max-w-md hidden lg:block">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="w-4 h-4 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Scan or enter QR / Serial / Batch (e.g. PCK-NER-2026-001, HBT-AS-2026-001)..."
                value={navSearch}
                onChange={(e) => {
                  setNavSearch(e.target.value);
                  setShowSearchSuggestions(true);
                }}
                onFocus={() => setShowSearchSuggestions(true)}
                className="w-full pl-9 pr-20 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded transition shadow-xs"
              >
                VERIFY
              </button>
            </div>
          </form>

          {/* Quick Suggestions Dropdown */}
          {showSearchSuggestions && navSearch.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 max-h-64 overflow-y-auto">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Suggested Traceable Targets
              </div>
              <button
                onClick={() => {
                  setNavSearch('PCK-NER-2026-001');
                  onOpenTraceSearch('PCK-NER-2026-001');
                  setShowSearchSuggestions(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-emerald-50 rounded-lg flex items-center justify-between text-slate-800"
              >
                <div>
                  <span className="font-bold text-emerald-800">PCK-NER-2026-001</span>
                  <span className="text-[11px] text-slate-500 ml-2">Export Flacon (Dubai)</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">End-to-End</span>
              </button>
              <button
                onClick={() => {
                  setNavSearch('PCK-NER-2026-013');
                  onOpenTraceSearch('PCK-NER-2026-013');
                  setShowSearchSuggestions(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-emerald-50 rounded-lg flex items-center justify-between text-slate-800"
              >
                <div>
                  <span className="font-bold text-emerald-800">PCK-NER-2026-013</span>
                  <span className="text-[11px] text-slate-500 ml-2">Domestic Sale (Kannauj)</span>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">Domestic</span>
              </button>
              <button
                onClick={() => {
                  setNavSearch('HBT-AS-2026-001');
                  onOpenTraceSearch('HBT-AS-2026-001');
                  setShowSearchSuggestions(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-emerald-50 rounded-lg flex items-center justify-between text-slate-800"
              >
                <div>
                  <span className="font-bold text-emerald-800">HBT-AS-2026-001</span>
                  <span className="text-[11px] text-slate-500 ml-2">Harvest Batch (38.5kg)</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Harvest</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Role Switcher & Reset Controls */}
        <div className="flex items-center gap-2.5">
          {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition shadow-xs"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <div className="text-left hidden sm:block">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block -mb-0.5">Role</span>
                <span className="text-slate-900 font-extrabold">{currentRole.name}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-extrabold text-slate-900">Switch Stakeholder Role</div>
                  <div className="text-[10px] text-slate-500">
                    Modifies navigation, action forms, and maker-checker authorities.
                  </div>
                </div>

                <div className="py-1 max-h-80 overflow-y-auto space-y-0.5">
                  {USER_ROLES.map(role => {
                    const isSelected = role.id === activeRole;
                    return (
                      <button
                        key={role.id}
                        onClick={() => {
                          setActiveRole(role.id);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-900 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900">{role.name}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {role.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{role.desc}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo records back to clean initial dataset?')) {
                resetToInitialData();
              }
            }}
            title="Reset demo records to initial dataset"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
