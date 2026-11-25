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
  LogOut,
  Scale,
  X
} from 'lucide-react';

export default function EnterpriseSidebar({
  activeModule,
  onSelectModule,
  onOpenLegacyFlow,
  onOpenLegacyGeoStudio,
  isOpen = false,
  onClose
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
    NERAMAC_ADMIN: 'Admin Dashboard'
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
        { id: 'FARMER_APPROVALS', name: 'Farmer Approvals', icon: ShieldCheck, badge: farmerApplications.filter(a => a.status !== 'APPROVED').length || null, highlight: true, path: '/farmer/approvals' },
        { id: 'FARMER_HARVEST_HISTORY', name: 'Farmer Harvest History', icon: FileSpreadsheet, badge: 'Admin', path: '/farmer/harvest-history' }
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
        { id: 'HARVEST_MY_APPS', name: activeRole === 'NERAMAC_ADMIN' ? 'Harvest Applications' : 'My Harvest Applications', icon: Trees, badge: harvests.length, path: '/harvest/my-applications' },
        { id: 'HARVEST_APPLY', name: 'Apply for Tree Harvest', icon: UserPlus, badge: 'New', path: '/harvest/apply' },
        { id: 'HARVEST_DFO_SANCTIONS', name: 'DFO Felling Sanctions Queue', icon: FileBadge2, badge: harvests.filter(h => h.status === 'NERAMAC_VERIFIED_AWAITING_DFO' || h.status === 'SUBMITTED_AWAITING_DFO' || h.status === 'PENDING_DFO_SANCTION' || h.status === 'SUBMITTED_AWAITING_NERAMAC').length || null, highlight: harvests.some(h => h.status === 'NERAMAC_VERIFIED_AWAITING_DFO' || h.status === 'SUBMITTED_AWAITING_DFO' || h.status === 'SUBMITTED_AWAITING_NERAMAC'), path: '/harvest/dfo-sanctions' },
        { id: 'HARVEST_DFO_APPROVED', name: 'Sanctioned Felling Orders', icon: ShieldCheck, badge: null, path: '/harvest/dfo-approved' },
        { id: 'HARVEST_FELLING', name: 'Supervised Felling & Scale', icon: Axe, badge: harvests.filter(h => h.status === 'DFO_APPROVED_AWAITING_FELLING').length || null, highlight: harvests.some(h => h.status === 'DFO_APPROVED_AWAITING_FELLING'), path: '/harvest/felling' },
        { id: 'HARVEST_BATCHES', name: 'Harvest Batches & e-TPs', icon: QrCode, badge: null, path: '/harvest/batches' },
        { id: 'PERMITS', name: 'Permits & DFO Orders', icon: FileBadge2, badge: null, path: '/permits' }
      ]
    },
    {
      group: 'Depot & Movement (4 Stages)',
      items: [
        {
          id: 'MOVEMENT_FARM_TO_DEPOT',
          name: '1. Dispatch: Farm → Depot',
          icon: Truck,
          badge: movements.filter(m => (m.movementType || (!m.destinationType?.includes('Processing') ? 'FARM_TO_AGGREGATOR' : '')) === 'FARM_TO_AGGREGATOR').length,
          path: '/movement/farm-to-depot'
        },
        {
          id: 'MOVEMENT_DEPOT_GATE_CHECK',
          name: '2. Depot Gate Weight Check',
          icon: Scale,
          badge: movements.filter(m => m.status === 'IN_TRANSIT' && (m.movementType || (!m.destinationType?.includes('Processing') ? 'FARM_TO_AGGREGATOR' : '')) === 'FARM_TO_AGGREGATOR').length || null,
          highlight: movements.some(m => m.status === 'IN_TRANSIT' && (m.movementType || (!m.destinationType?.includes('Processing') ? 'FARM_TO_AGGREGATOR' : '')) === 'FARM_TO_AGGREGATOR'),
          path: '/movement/depot-gate-check'
        },
        {
          id: 'AGGREGATION',
          name: 'Depot Lot (Merge & Split)',
          icon: Boxes,
          badge: aggregations.length,
          path: '/aggregation'
        },
        {
          id: 'MOVEMENT_DEPOT_TO_CPC',
          name: '3. Dispatch: Depot → CPC',
          icon: Truck,
          badge: movements.filter(m => (m.movementType || (m.destinationType?.includes('Processing') ? 'AGGREGATOR_TO_DISTILLERY' : '')) === 'AGGREGATOR_TO_DISTILLERY').length,
          path: '/movement/depot-to-cpc'
        },
        {
          id: 'MOVEMENT_CPC_GATE_CHECK',
          name: '4. CPC Gate Weight Check',
          icon: Scale,
          badge: movements.filter(m => m.status === 'IN_TRANSIT' && (m.movementType || (m.destinationType?.includes('Processing') ? 'AGGREGATOR_TO_DISTILLERY' : '')) === 'AGGREGATOR_TO_DISTILLERY').length || null,
          highlight: movements.some(m => m.status === 'IN_TRANSIT' && (m.movementType || (m.destinationType?.includes('Processing') ? 'AGGREGATOR_TO_DISTILLERY' : '')) === 'AGGREGATOR_TO_DISTILLERY'),
          path: '/movement/cpc-gate-check'
        },
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
        { id: 'AUDIT_TRAIL', name: 'Cryptographic Audit Trail', icon: FileSpreadsheet, badge: null, path: '/reports/audit-trail' },
        { id: 'MASS_BALANCE', name: 'Mass Balance Ledger', icon: Scale, badge: null, path: '/reports/mass-balance' },
        { id: 'CITES_REPORTS', name: 'CITES Quota Reports', icon: FileBadge2, badge: null, path: '/reports/cites' }
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
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => onClose && onClose()}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-slate-200 flex-col h-screen lg:sticky lg:top-0 flex-shrink-0 shadow-xl lg:shadow-xs transform transition-transform duration-200 ease-out ${
          isOpen ? 'flex translate-x-0' : 'hidden lg:flex -translate-x-full lg:translate-x-0'
        }`}
      >
      {/* Brand Header */}
      <div className="p-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onSelectModule) onSelectModule('HOME');
              if (onClose) onClose();
              navigate({ to: '/' });
            }}
            className="flex-1 min-w-0 text-left brand-header p-3 rounded-xl shadow-xs text-white space-y-1 transition hover:opacity-95"
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
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

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
                    if (onClose) onClose();
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
      </div>
    </aside>
    </>
  );
}
