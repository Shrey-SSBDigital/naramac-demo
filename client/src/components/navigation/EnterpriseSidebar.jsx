import React, { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useEnterprise } from '../../context/EnterpriseContext';
import { isModuleAllowedForRole, ROLE_PERMISSIONS, getDefaultRouteForRole } from '../../utils/rbacConfig';
import { USER_ROLES } from '../../data/mockEnterpriseData';
import {
  LayoutDashboard,
  Home,
  Users,
  UserPlus,
  ShieldCheck,
  Trees,
  Syringe,
  Axe,
  FileBadge2,
  Truck,
  Boxes,
  Factory,
  FlaskConical,
  Warehouse,
  PackageCheck,
  PlaneTakeoff,
  Ship,
  Store,
  QrCode,
  FileSpreadsheet,
  GitFork,
  Compass,
  MapPin,
  Footprints,
  ChevronRight,
  Sparkles,
  Lock,
  ChevronDown,
  LogOut
} from 'lucide-react';

export default function EnterpriseSidebar({
  activeModule,
  onSelectModule,
  onOpenLegacyFlow,
  onOpenLegacyGeoStudio
}) {
  const {
    activeRole,
    setActiveRole,
    logout,
    farmers,
    farmerApplications,
    pologens,
    trees,
    harvests,
    movements,
    aggregations,
    distillations,
    labTests,
    finishedProducts,
    exportBatches,
    plantations
  } = useEnterprise();

  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentRoleConfig = ROLE_PERMISSIONS[activeRole] || ROLE_PERMISSIONS.NERAMAC_ADMIN;

  const ROLE_DASHBOARD_LABELS = {
    FARMER: 'Farmer Dashboard',
    FIELD_AGENT: 'Field Operations Desk',
    FOREST_DEPT: 'DFO Statutory Desk',
    COLLECTION_OPERATOR: 'Depot Intake Desk',
    CPC_OPERATOR: 'Distillery Operations',
    LAB_OFFICER: 'NABL Quality Lab Desk',
    EXPORTER: 'Export & Logistics Desk',
    BUYER_PUBLIC: 'Consumer Provenance Portal',
    NERAMAC_ADMIN: 'Executive Control Room'
  };

  // Master Navigation Groups with All Enterprise Routes
  const ALL_NAV_GROUPS = [
    {
      group: 'Architecture & Overview',
      items: [
        {
          id: 'HOME',
          name: '26-Step Supply Chain Overview',
          icon: Compass,
          badge: '26 Steps',
          highlight: true,
          path: '/overview'
        }
      ]
    },
    {
      group: 'Role Workspace',
      items: [
        {
          id: 'DASHBOARD',
          name: ROLE_DASHBOARD_LABELS[activeRole] || 'Executive Dashboard',
          icon: LayoutDashboard,
          badge: 'Live',
          highlight: true,
          path: '/dashboard'
        }
      ]
    },
    {
      group: 'Farmer Governance',
      items: [
        { id: 'FARMERS', name: 'Farmer Registry', icon: Users, badge: farmers.length, path: '/farmer' },
        { id: 'FARMER_REGISTER', name: 'Farmer Registration Form', icon: UserPlus, badge: 'New', highlight: true, path: '/farmer/register' },
        { id: 'FARMER_APPROVALS', name: 'Farmer Approvals', icon: ShieldCheck, badge: farmerApplications.filter(a => a.status !== 'APPROVED').length || null, highlight: true, path: '/farmer/approvals' }
      ]
    },
    {
      group: 'Plantation',
      items: [
        { id: 'PLANTATIONS', name: 'Plantation', icon: Trees, badge: plantations.length, path: '/plantation' }
      ]
    },
    {
      group: 'Field Agent Inspection',
      items: [
        { id: 'FIELD_INSPECTION', name: 'Field Inspection (Geo-Tag)', icon: MapPin, badge: 'GPS+Photo', highlight: true, path: '/field-inspection' }
      ]
    },
    {
      group: 'Field GIS Studio',
      items: [
        { id: 'GEO_STUDIO', name: 'Field GIS Studio', icon: Compass, badge: 'GIS Map', highlight: true, path: '/field-gis-studio' }
      ]
    },
    {
      group: 'Tree Inoculation',
      items: [
        { id: 'INOCULATION', name: 'Inoculation', icon: Syringe, badge: null, path: '/inoculation' }
      ]
    },
    {
      group: 'Harvest & Statutory',
      items: [
        { id: 'HARVEST', name: 'Harvest Management', icon: Axe, badge: harvests.length, path: '/harvest' },
        { id: 'PERMITS', name: 'Permits & DFO Orders', icon: FileBadge2, badge: null, path: '/permits' }
      ]
    },
    {
      group: 'Depot & Movement',
      items: [
        {
          id: 'MOVEMENT',
          name: 'Movement & Weight Recon',
          icon: Truck,
          badge: movements.filter(m => m.status === 'IN_TRANSIT').length ? `${movements.filter(m => m.status === 'IN_TRANSIT').length} In Transit` : movements.length,
          highlight: movements.some(m => m.status === 'IN_TRANSIT'),
          path: '/movement'
        },
        { id: 'AGGREGATION', name: 'Depot Batch Collection (Pooling)', icon: Boxes, badge: aggregations.length, path: '/aggregation' },
        { id: 'INVENTORY', name: 'Inventory & Vault Stock', icon: Warehouse, badge: null, path: '/inventory' }
      ]
    },
    {
      group: 'CPC Processing & Lab',
      items: [
        { id: 'PROCESSING', name: 'Distillation Stills & Oil', icon: Factory, badge: distillations.length, path: '/processing' },
        { id: 'LABORATORY', name: 'Lab Quality & Purity Testing', icon: FlaskConical, badge: labTests.length, path: '/laboratory' },
        { id: 'FINISHED_PRODUCTS', name: 'Bottled Oil & Packaging', icon: PackageCheck, badge: finishedProducts.length, path: '/finished-products' }
      ]
    },
    {
      group: 'Sales & Distribution',
      items: [
        { id: 'EXPORT', name: 'Export Batches (CITES)', icon: PlaneTakeoff, badge: exportBatches.length, path: '/export' },
        { id: 'SHIPMENT', name: 'Shipment & Terminal Lots', icon: Ship, badge: null, path: '/shipments' },
        { id: 'DOMESTIC_SALES', name: 'Domestic Attar Sales', icon: Store, badge: null, path: '/domestic-sales' }
      ]
    },
    {
      group: 'Trust & Governance',
      items: [
        { id: 'TRACEABILITY', name: 'Traceability & QR Scan', icon: QrCode, badge: 'Live', highlight: true, path: '/traceability' },
        { id: 'AUDIT_REPORTS', name: 'Reports & Audit History', icon: FileSpreadsheet, badge: null, path: '/audit-reports' }
      ]
    }
  ];

  // Strictly filter navigation items based on active role RBAC permissions
  const displayedNavGroups = ALL_NAV_GROUPS.map(grp => {
    const visibleItems = grp.items.filter(item => isModuleAllowedForRole(activeRole, item.id));
    return {
      ...grp,
      items: visibleItems
    };
  }).filter(grp => grp.items.length > 0);

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 flex-shrink-0 z-30 shadow-xs">
      {/* Brand Header */}
      <div className="p-3 border-b border-slate-200">
        <button
          onClick={() => {
            if (onSelectModule) onSelectModule('HOME');
            navigate({ to: '/' });
          }}
          className="w-full text-left brand-header p-3 rounded-xl shadow-xs text-white space-y-1 transition hover:opacity-95"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-emerald-800 flex items-center justify-center font-extrabold text-lg shadow-xs flex-shrink-0">
              N
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-sm tracking-tight">NERAMAC</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-400/40">
                  ASCTS
                </span>
              </div>
              <p className="text-[10px] text-emerald-100 font-medium truncate">
                Agarwood Traceability System
              </p>
            </div>
          </div>
        </button>

        {/* Active Role Card & Dropdown Switcher */}
        <div className="mt-2 relative">
          <button
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className="w-full p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between text-left transition"
          >
            <div className="truncate pr-1">
              <div className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">
                Perspective (RBAC)
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">
                {currentRoleConfig.name}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {currentRoleConfig.allowedModules.length} Mod
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </button>

          {/* Role Dropdown */}
          {roleSwitcherOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 max-h-72 overflow-y-auto">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Switch Stakeholder Role
              </div>
              {USER_ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    setActiveRole(r.id);
                    setRoleSwitcherOpen(false);
                    const targetRoute = getDefaultRouteForRole(r.id);
                    navigate({ to: targetRoute });
                    if (onSelectModule) onSelectModule(targetRoute);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                    activeRole === r.id
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="truncate">{r.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    activeRole === r.id ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {r.badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Group Items */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {displayedNavGroups.map((grp, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-0.5">
              {grp.group}
            </div>
            {grp.items.map((item) => {
              const Icon = item.icon;
              const currentPath = location.pathname;
              const isActive = currentPath === item.path || (activeModule && activeModule === item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (onSelectModule) onSelectModule(item.id, item.path);
                    navigate({ to: item.path });
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition group ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : item.highlight
                      ? 'text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 font-bold border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-emerald-800 text-white'
                          : item.highlight
                          ? 'bg-emerald-200 text-emerald-900 font-bold'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Guided Flow Demonstrator */}
        {isModuleAllowedForRole(activeRole, 'FLOW') && (
          <div className="pt-2 border-t border-slate-200 space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
              Step-by-Step Flow
            </div>
            <button
              onClick={() => {
                if (onOpenLegacyFlow) onOpenLegacyFlow();
                navigate({ to: '/flow' });
              }}
              className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-between text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition"
            >
              <div className="flex items-center gap-2">
                <GitFork className="w-4 h-4 text-teal-700" />
                <span>14-Step Flow Wizard</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-teal-600" />
            </button>
          </div>
        )}
      </div>

      {/* Footer Info & Sign Out */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
        <button
          type="button"
          onClick={() => {
            logout();
            navigate({ to: '/' });
          }}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span>Sign Out / Switch Role</span>
        </button>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span className="font-semibold text-slate-700">Govt. of India (MDoNER)</span>
          <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">v2.1.0</span>
        </div>
      </div>
    </aside>
  );
}
