import React, { useState, useRef, useEffect } from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  useNavigate,
  useLocation
} from '@tanstack/react-router';
import { useEnterprise } from '../context/EnterpriseContext';
import EnterpriseNavbar from '../components/navigation/EnterpriseNavbar';
import EnterpriseSidebar from '../components/navigation/EnterpriseSidebar';
import Toast from '../components/common/Toast';
import RoleGuardedRoute from './RoleGuardedRoute';
import { ROUTE_MAP, MODULE_TO_ROUTE } from './routeConfig';
import { isModuleAllowedForRole, getDefaultRouteForRole } from '../utils/rbacConfig';

// Module Components
import HomeWorkflowOverview from '../components/HomeWorkflowOverview';
import FarmerRegistrationModule from '../components/modules/FarmerRegistrationModule';
import FarmerApprovalModule from '../components/modules/FarmerApprovalModule';
import DashboardModule from '../components/modules/DashboardModule';
import FarmerModule from '../components/modules/FarmerModule';
import PlantationModule from '../components/modules/PlantationModule';
import FieldInspectionModule from '../components/modules/FieldInspectionModule';
import FieldGeoTaggingStudio from '../components/FieldGeoTaggingStudio';
import InoculationModule from '../components/modules/InoculationModule';
import HarvestModule from '../components/modules/HarvestModule';
import PermitModule from '../components/modules/PermitModule';
import MovementModule from '../components/modules/MovementModule';
import AggregationModule from '../components/modules/AggregationModule';
import ProcessingModule from '../components/modules/ProcessingModule';
import LaboratoryModule from '../components/modules/LaboratoryModule';
import InventoryModule from '../components/modules/InventoryModule';
import FinishedProductModule from '../components/modules/FinishedProductModule';
import ExportModule from '../components/modules/ExportModule';
import ShipmentModule from '../components/modules/ShipmentModule';
import DomesticSalesModule from '../components/modules/DomesticSalesModule';
import TraceabilityModule from '../components/modules/TraceabilityModule';
import AuditReportsModule from '../components/modules/AuditReportsModule';
import LiveWorkflowView from '../components/LiveWorkflowView';

// Shared State Context for Interactive Flow Demonstrator
const FlowDemonstratorContext = React.createContext(null);

export function useFlowDemonstrator() {
  return React.useContext(FlowDemonstratorContext);
}

// ── Root Layout Component ─────────────────────────────────────────────────────
function RootLayout() {
  const { toasts, activeRole } = useEnterprise();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation helper compatible with string path or module ID
  const appNavigate = (dest) => {
    if (!dest) return;
    if (typeof dest === 'string') {
      if (dest.startsWith('/')) {
        navigate({ to: dest });
      } else if (MODULE_TO_ROUTE[dest]) {
        navigate({ to: MODULE_TO_ROUTE[dest] });
      } else {
        navigate({ to: '/' });
      }
    }
  };

  // Shared 14-Step Flow state
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([1]);
  const [traceSearchQuery, setTraceSearchQuery] = useState('PCK-NER-2026-001');
  const [workflowData, setWorkflowData] = useState({
    farmer: {
      fullName: 'Bhaben Saikia',
      fatherName: 'Late Hemanta Saikia',
      cluster: 'Golaghat, Assam',
      village: 'Dhekial Gaon, Mouza Dhekial',
      dagNumber: 'Dag 182, Patta 44',
      estimatedTrees: 1420
    }
  });

  const handleUpdateStepData = (section, data) => {
    setWorkflowData(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), ...data }
    }));
  };

  const handleAdvanceStep = (completedStepNum) => {
    const nextStep = Math.min(completedStepNum + 1, 14);
    if (!completedSteps.includes(completedStepNum)) {
      setCompletedSteps(prev => [...prev, completedStepNum]);
    }
    setCurrentStep(nextStep);
  };

  // Automatic redirect to Role Desk on role switch if current route is not allowed
  const prevRoleRef = useRef(activeRole);
  useEffect(() => {
    if (prevRoleRef.current !== activeRole) {
      prevRoleRef.current = activeRole;
      const currentModule = ROUTE_MAP[location.pathname];
      if (currentModule && currentModule !== 'HOME' && !isModuleAllowedForRole(activeRole, currentModule)) {
        const targetRoute = getDefaultRouteForRole(activeRole);
        navigate({ to: targetRoute });
      }
    }
  }, [activeRole, location.pathname, navigate]);

  const flowContextValue = {
    currentStep,
    setCurrentStep,
    completedSteps,
    setCompletedSteps,
    workflowData,
    handleUpdateStepData,
    handleAdvanceStep,
    traceSearchQuery,
    setTraceSearchQuery,
    appNavigate
  };

  const isHome = location.pathname === '/' || location.pathname === '/home';

  if (isHome) {
    return (
      <FlowDemonstratorContext.Provider value={flowContextValue}>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-600 selection:text-white">
          <Outlet />
          <Toast toasts={toasts} />
        </div>
      </FlowDemonstratorContext.Provider>
    );
  }

  const isWideLayout =
    location.pathname.includes('gis') ||
    location.pathname.includes('plantation') ||
    location.pathname.includes('flow');

  const currentModule = ROUTE_MAP[location.pathname] || 'DASHBOARD';

  return (
    <FlowDemonstratorContext.Provider value={flowContextValue}>
      <div className="flex h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden selection:bg-emerald-600 selection:text-white">
        <EnterpriseSidebar
          activeModule={currentModule}
          onSelectModule={(mod, path) => appNavigate(path || mod)}
          onOpenLegacyFlow={() => navigate({ to: '/flow' })}
          onOpenLegacyGeoStudio={() => navigate({ to: '/field-gis-studio' })}
        />

        <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50">
          <EnterpriseNavbar
            activeModule={currentModule}
            onSelectModule={(mod) => appNavigate(mod)}
            onOpenTraceSearch={(q) => {
              setTraceSearchQuery(q);
              navigate({ to: '/traceability' });
            }}
          />

          <main className={`p-4 md:p-6 w-full mx-auto pb-24 ${isWideLayout ? 'max-w-[1500px]' : 'max-w-6xl'}`}>
            <Outlet />
          </main>
        </div>

        <Toast toasts={toasts} />
      </div>
    </FlowDemonstratorContext.Provider>
  );
}

// ── Root Route Definition ─────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: RootLayout
});

// ── Route Components with Role Guards ─────────────────────────────────────────

function HomeRoute() {
  const { appNavigate } = useFlowDemonstrator();
  return <HomeWorkflowOverview onNavigate={appNavigate} />;
}

function DashboardRoute() {
  const { appNavigate } = useFlowDemonstrator();
  return (
    <RoleGuardedRoute moduleId="DASHBOARD">
      <DashboardModule onNavigateModule={appNavigate} />
    </RoleGuardedRoute>
  );
}

function FarmerRoute() {
  const { appNavigate } = useFlowDemonstrator();
  return (
    <RoleGuardedRoute moduleId="FARMERS">
      <FarmerModule
        onOpenGeoStudio={() => appNavigate('/field-gis-studio')}
        onOpenRegister={() => appNavigate('/farmer/register')}
      />
    </RoleGuardedRoute>
  );
}

function FarmerRegisterRoute() {
  const { appNavigate } = useFlowDemonstrator();
  return (
    <RoleGuardedRoute moduleId="FARMER_REGISTER">
      <FarmerRegistrationModule onNavigate={appNavigate} />
    </RoleGuardedRoute>
  );
}

function FarmerApprovalsRoute() {
  const { appNavigate } = useFlowDemonstrator();
  return (
    <RoleGuardedRoute moduleId="FARMER_APPROVALS">
      <FarmerApprovalModule onNavigate={appNavigate} />
    </RoleGuardedRoute>
  );
}

function PlantationRoute() {
  const { appNavigate } = useFlowDemonstrator();
  return (
    <RoleGuardedRoute moduleId="PLANTATIONS">
      <PlantationModule onOpenGeoStudio={() => appNavigate('/field-gis-studio')} />
    </RoleGuardedRoute>
  );
}

function FieldInspectionRoute() {
  const { appNavigate } = useFlowDemonstrator();
  return (
    <RoleGuardedRoute moduleId="FIELD_INSPECTION">
      <FieldInspectionModule onNavigateToGisStudio={() => appNavigate('/field-gis-studio')} />
    </RoleGuardedRoute>
  );
}

function FieldGisRoute() {
  const { appNavigate, handleAdvanceStep } = useFlowDemonstrator();
  return (
    <RoleGuardedRoute moduleId="GEO_STUDIO">
      <FieldGeoTaggingStudio
        onAdvanceStep={(step) => {
          handleAdvanceStep(step);
          appNavigate('/flow');
        }}
      />
    </RoleGuardedRoute>
  );
}

function FinishedProductsRoute() {
  const { setTraceSearchQuery, appNavigate } = useFlowDemonstrator();
  return (
    <RoleGuardedRoute moduleId="FINISHED_PRODUCTS">
      <FinishedProductModule
        onOpenTraceSearch={(q) => {
          setTraceSearchQuery(q);
          appNavigate('/traceability');
        }}
      />
    </RoleGuardedRoute>
  );
}

function TraceabilityRoute() {
  const { traceSearchQuery } = useFlowDemonstrator();
  return (
    <RoleGuardedRoute moduleId="TRACEABILITY">
      <TraceabilityModule initialSearchQuery={traceSearchQuery} />
    </RoleGuardedRoute>
  );
}

function FlowRoute() {
  const {
    currentStep,
    setCurrentStep,
    workflowData,
    handleUpdateStepData,
    handleAdvanceStep,
    completedSteps,
    setCompletedSteps,
    appNavigate
  } = useFlowDemonstrator();

  return (
    <RoleGuardedRoute moduleId="FLOW">
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="font-extrabold text-slate-800 text-xs">
            14-Step Operational Live Flow Wizard
          </span>
          <button
            onClick={() => appNavigate('/dashboard')}
            className="px-3 py-1 bg-slate-800 text-white rounded-lg text-xs font-bold"
          >
            Return to Dashboard
          </button>
        </div>
        <LiveWorkflowView
          currentStep={currentStep}
          onSelectStep={(step) => setCurrentStep(step)}
          workflowData={workflowData}
          onUpdateStepData={handleUpdateStepData}
          onAdvanceStep={handleAdvanceStep}
          completedSteps={completedSteps}
          onResetWorkflow={() => {
            setCurrentStep(1);
            setCompletedSteps([1]);
          }}
          onLoadAllSteps={() => {
            setCurrentStep(14);
            setCompletedSteps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
          }}
          onOpenGeoStudio={() => appNavigate('/field-gis-studio')}
        />
      </div>
    </RoleGuardedRoute>
  );
}

// ── TanStack Route Declarations ───────────────────────────────────────────────

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomeRoute });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/home', component: HomeRoute });

// Dashboard
const dashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: '/dashboard', component: DashboardRoute });

// Farmer Registry & Sub-flows
const farmerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/farmer', component: FarmerRoute });
const farmersRoute = createRoute({ getParentRoute: () => rootRoute, path: '/farmers', component: FarmerRoute });
const farmerRegisterRoute = createRoute({ getParentRoute: () => rootRoute, path: '/farmer/register', component: FarmerRegisterRoute });
const farmersRegisterRoute = createRoute({ getParentRoute: () => rootRoute, path: '/farmers/register', component: FarmerRegisterRoute });
const farmerApprovalsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/farmer/approvals', component: FarmerApprovalsRoute });
const farmersApprovalsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/farmers/approvals', component: FarmerApprovalsRoute });

// Plantation & GIS
const plantationRoute = createRoute({ getParentRoute: () => rootRoute, path: '/plantation', component: PlantationRoute });
const plantationsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/plantations', component: PlantationRoute });
const plotRoute = createRoute({ getParentRoute: () => rootRoute, path: '/plot', component: PlantationRoute });
const plotsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/plots', component: PlantationRoute });

const fieldInspectionRoute = createRoute({ getParentRoute: () => rootRoute, path: '/field-inspection', component: FieldInspectionRoute });
const fieldAgentRoute = createRoute({ getParentRoute: () => rootRoute, path: '/field-agent', component: FieldInspectionRoute });

const fieldGisStudioRoute = createRoute({ getParentRoute: () => rootRoute, path: '/field-gis-studio', component: FieldGisRoute });
const fieldGisRoute = createRoute({ getParentRoute: () => rootRoute, path: '/field-gis', component: FieldGisRoute });
const gisStudioRoute = createRoute({ getParentRoute: () => rootRoute, path: '/gis-studio', component: FieldGisRoute });
const gisRoute = createRoute({ getParentRoute: () => rootRoute, path: '/gis', component: FieldGisRoute });

// Inoculation
const inoculationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inoculation',
  component: () => (
    <RoleGuardedRoute moduleId="INOCULATION">
      <InoculationModule />
    </RoleGuardedRoute>
  )
});

// Harvest & Permits
const harvestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/harvest',
  component: () => (
    <RoleGuardedRoute moduleId="HARVEST">
      <HarvestModule />
    </RoleGuardedRoute>
  )
});

const permitsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/permits',
  component: () => (
    <RoleGuardedRoute moduleId="PERMITS">
      <PermitModule />
    </RoleGuardedRoute>
  )
});
const dfoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dfo',
  component: () => (
    <RoleGuardedRoute moduleId="PERMITS">
      <PermitModule />
    </RoleGuardedRoute>
  )
});

// Movement & Aggregation
const movementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/movement',
  component: () => (
    <RoleGuardedRoute moduleId="MOVEMENT">
      <MovementModule />
    </RoleGuardedRoute>
  )
});

const aggregationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/aggregation',
  component: () => (
    <RoleGuardedRoute moduleId="AGGREGATION">
      <AggregationModule />
    </RoleGuardedRoute>
  )
});

// Processing & Lab
const processingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/processing',
  component: () => (
    <RoleGuardedRoute moduleId="PROCESSING">
      <ProcessingModule />
    </RoleGuardedRoute>
  )
});
const cpcRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cpc',
  component: () => (
    <RoleGuardedRoute moduleId="PROCESSING">
      <ProcessingModule />
    </RoleGuardedRoute>
  )
});

const laboratoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/laboratory',
  component: () => (
    <RoleGuardedRoute moduleId="LABORATORY">
      <LaboratoryModule />
    </RoleGuardedRoute>
  )
});
const labRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lab',
  component: () => (
    <RoleGuardedRoute moduleId="LABORATORY">
      <LaboratoryModule />
    </RoleGuardedRoute>
  )
});

// Inventory & Finished Products
const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inventory',
  component: () => (
    <RoleGuardedRoute moduleId="INVENTORY">
      <InventoryModule />
    </RoleGuardedRoute>
  )
});

const finishedProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/finished-products',
  component: FinishedProductsRoute
});

// Export & Domestic Sales
const exportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/export',
  component: () => (
    <RoleGuardedRoute moduleId="EXPORT">
      <ExportModule />
    </RoleGuardedRoute>
  )
});

const shipmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shipment',
  component: () => (
    <RoleGuardedRoute moduleId="SHIPMENT">
      <ShipmentModule />
    </RoleGuardedRoute>
  )
});
const shipmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shipments',
  component: () => (
    <RoleGuardedRoute moduleId="SHIPMENT">
      <ShipmentModule />
    </RoleGuardedRoute>
  )
});

const domesticSalesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/domestic-sales',
  component: () => (
    <RoleGuardedRoute moduleId="DOMESTIC_SALES">
      <DomesticSalesModule />
    </RoleGuardedRoute>
  )
});

// Traceability & Audit
const traceabilityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/traceability',
  component: TraceabilityRoute
});
const verifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify',
  component: TraceabilityRoute
});

const auditReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/audit-reports',
  component: () => (
    <RoleGuardedRoute moduleId="AUDIT_REPORTS">
      <AuditReportsModule />
    </RoleGuardedRoute>
  )
});

// Flow
const flowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/flow',
  component: FlowRoute
});

// ── Assemble Route Tree ───────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  homeRoute,
  dashboardRoute,
  farmerRoute,
  farmersRoute,
  farmerRegisterRoute,
  farmersRegisterRoute,
  farmerApprovalsRoute,
  farmersApprovalsRoute,
  plantationRoute,
  plantationsRoute,
  plotRoute,
  plotsRoute,
  fieldInspectionRoute,
  fieldAgentRoute,
  fieldGisStudioRoute,
  fieldGisRoute,
  gisStudioRoute,
  gisRoute,
  inoculationRoute,
  harvestRoute,
  permitsRoute,
  dfoRoute,
  movementRoute,
  aggregationRoute,
  processingRoute,
  cpcRoute,
  laboratoryRoute,
  labRoute,
  inventoryRoute,
  finishedProductsRoute,
  exportRoute,
  shipmentRoute,
  shipmentsRoute,
  domesticSalesRoute,
  traceabilityRoute,
  verifyRoute,
  auditReportsRoute,
  flowRoute
]);

export const router = createRouter({
  routeTree
});

export default function AppRouterProvider() {
  return <RouterProvider router={router} />;
}
