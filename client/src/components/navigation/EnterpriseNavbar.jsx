import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useEnterprise } from '../../context/EnterpriseContext';
import { USER_ROLES } from '../../data/mockEnterpriseData';
import { getDefaultRouteForRole } from '../../utils/rbacConfig';
import { Search, RotateCcw, ShieldCheck, Bell, ChevronDown, Check, Sparkles, Building2, LogOut, Menu } from 'lucide-react';
import FacilityRegistryModal from '../common/FacilityRegistryModal';

export default function EnterpriseNavbar({ activeModule, onSelectModule, onOpenTraceSearch, onToggleSidebar }) {
  const { 
    activeRole, 
    setActiveRole, 
    currentUser,
    logout,
    resetToInitialData, 
    finishedProducts, 
    harvestBatches, 
    farmers
  } = useEnterprise();
  const navigate = useNavigate();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showFacilitiesModal, setShowFacilitiesModal] = useState(false);

  const currentRole = USER_ROLES.find(r => r.id === activeRole) || USER_ROLES[1];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!navSearch.trim()) return;
    if (onOpenTraceSearch) onOpenTraceSearch(navSearch.trim());
    navigate({ to: '/traceability' });
    setShowSearchSuggestions(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Menu + Brand Identity & Active Perspective */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition flex-shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              if (onSelectModule) onSelectModule('HOME');
              navigate({ to: '/overview' });
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white flex items-center justify-center font-black text-sm sm:text-base shadow-sm ring-2 ring-emerald-500/20 hover:scale-105 transition flex-shrink-0"
            title="Go to 26-Step Supply Chain Overview (/overview)"
          >
            N
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  if (onSelectModule) onSelectModule('HOME');
                  navigate({ to: '/overview' });
                }}
                className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight hover:text-emerald-700 transition text-left truncate"
              >
                NERAMAC ASCTS
              </button>
              <button
                onClick={() => {
                  if (onSelectModule) onSelectModule('HOME');
                  navigate({ to: '/overview' });
                }}
                className={`hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded transition ${
                  activeModule === 'HOME'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                }`}
              >
                Overview (/overview)
              </button>
              <span className="hidden md:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                Assam & Tripura Clusters
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block truncate">
              Agarwood Traceability & Supply Chain Management System • RFP 06/31
            </p>
          </div>
        </div>

        {/* Right: Controls, Offline Sync, Role Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Facilities Master Registry Pill */}
          <button
            type="button"
            onClick={() => setShowFacilitiesModal(true)}
            title="View Geo-Referenced Master Facility Registry"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200 shadow-2xs"
          >
            <Building2 className="w-3.5 h-3.5 text-teal-700" />
            <span>Facilities</span>
          </button>

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
            </button>
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

          {/* Sign Out / Exit to Login Page */}
          <button
            onClick={() => {
              logout();
              navigate({ to: '/' });
            }}
            title="Sign out and return to enterprise login page (/)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Master Facility Registry Modal */}
      <FacilityRegistryModal 
        isOpen={showFacilitiesModal} 
        onClose={() => setShowFacilitiesModal(false)} 
      />
    </header>
  );
}
