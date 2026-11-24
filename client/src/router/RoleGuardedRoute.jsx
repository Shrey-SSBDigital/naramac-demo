import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useEnterprise } from '../context/EnterpriseContext';
import { isModuleAllowedForRole, ROLE_PERMISSIONS, getDefaultRouteForRole } from '../utils/rbacConfig';
import { ShieldAlert, ArrowLeft, Home, Compass } from 'lucide-react';

export default function RoleGuardedRoute({ moduleId, children }) {
  const { activeRole } = useEnterprise();
  const navigate = useNavigate();

  const isAllowed = isModuleAllowedForRole(activeRole, moduleId);

  if (!isAllowed) {
    const roleConfig = ROLE_PERMISSIONS[activeRole] || { name: activeRole };
    const defaultRoute = getDefaultRouteForRole(activeRole);
    const authorizedRoles = Object.values(ROLE_PERMISSIONS).filter(r =>
      r.allowedModules && r.allowedModules.includes(moduleId)
    );

    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-rose-200 p-8 shadow-sm space-y-5 animate-in fade-in duration-200">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-900">
              Access Restricted by RBAC Policy
            </h2>
            <p className="text-xs text-rose-600 font-semibold">
              The module <span className="font-mono font-bold bg-rose-100 px-1.5 py-0.5 rounded text-rose-800">{moduleId}</span> is not accessible under your current stakeholder perspective.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Your Active Perspective:</span>
            <span className="font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              {roleConfig.name}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-medium">Authorized Stakeholders for this Module:</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {authorizedRoles.length > 0 ? (
                authorizedRoles.map(r => (
                  <span
                    key={r.id}
                    className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold"
                  >
                    {r.name}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-[11px]">Super Admin only</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => navigate({ to: defaultRoute })}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Go to My Role Desk ({defaultRoute})</span>
          </button>
          <button
            onClick={() => navigate({ to: '/' })}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Home Overview</span>
          </button>
        </div>
      </div>
    );
  }

  return children;
}
