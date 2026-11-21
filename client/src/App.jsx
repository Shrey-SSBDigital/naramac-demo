import React, { useState, useEffect } from 'react';
import { EnterpriseProvider, useEnterprise } from './context/EnterpriseContext';
import EnterpriseNavbar from './components/navigation/EnterpriseNavbar';
import EnterpriseSidebar from './components/navigation/EnterpriseSidebar';
import Toast from './components/common/Toast';
import { useAppRouter } from './router/useAppRouter';
import { isModuleAllowedForRole, ROLE_PERMISSIONS, getDefaultRouteForRole } from './utils/rbacConfig';
import { USER_ROLES } from './data/mockEnterpriseData';

// 1. Home Overview & Workflow Architecture
import HomeWorkflowOverview from './components/HomeWorkflowOverview';

// 2. Specialized Farmer Workflow Modules
import FarmerRegistrationModule from './components/modules/FarmerRegistrationModule';
import FarmerApprovalModule from './components/modules/FarmerApprovalModule';

// 3. 17 Main Enterprise Modules
import DashboardModule from './components/modules/DashboardModule';
import FarmerModule from './components/modules/FarmerModule';
import PlantationModule from './components/modules/PlantationModule';
import InoculationModule from './components/modules/InoculationModule';
import HarvestModule from './components/modules/HarvestModule';
import PermitModule from './components/modules/PermitModule';
import MovementModule from './components/modules/MovementModule';
import AggregationModule from './components/modules/AggregationModule';
import ProcessingModule from './components/modules/ProcessingModule';
import LaboratoryModule from './components/modules/LaboratoryModule';
import InventoryModule from './components/modules/InventoryModule';
import FinishedProductModule from './components/modules/FinishedProductModule';
import ExportModule from './components/modules/ExportModule';
import ShipmentModule from './components/modules/ShipmentModule';
import DomesticSalesModule from './components/modules/DomesticSalesModule';
import TraceabilityModule from './components/modules/TraceabilityModule';
import AuditReportsModule from './components/modules/AuditReportsModule';

// 4. Interactive Guided Flow & GIS Studios
import LiveWorkflowView from './components/LiveWorkflowView';
import FieldGeoTaggingStudio from './components/FieldGeoTaggingStudio';

import { ShieldAlert, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Home } from 'lucide-react';

function AppContent() {
  const { toasts, activeRole, setActiveRole } = useEnterprise();
  const { currentPath, activeModule, routeParams, navigate } = useAppRouter();

  const [traceSearchQuery, setTraceSearchQuery] = useState('PCK-NER-2026-001');

  // If route params has verifyCode, use it
  useEffect(() => {
    if (routeParams?.verifyCode) {
      setTraceSearchQuery(routeParams.verifyCode);
    }
  }, [routeParams]);

  // Legacy 14-Step flow state
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([1]);
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

  const handleOpenTraceSearch = (query) => {
    setTraceSearchQuery(query);
    navigate('/traceability');
  };

  const handleUpdateStepData = (section, data) => {
    setWorkflowData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        ...data
      }
    }));
  };

  const handleAdvanceStep = (completedStepNum) => {
    const nextStep = Math.min(completedStepNum + 1, 14);
    if (!completedSteps.includes(completedStepNum)) {
      setCompletedSteps(prev => [...prev, completedStepNum]);
    }
    setCurrentStep(nextStep);
  };

  const handleResetWorkflow = () => {
    setCurrentStep(1);
    setCompletedSteps([1]);
  };

  const handleLoadAllSteps = () => {
    setCurrentStep(14);
    setCompletedSteps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  };

  // RBAC Permission Check for current route
  const isAllowed = isModuleAllowedForRole(activeRole, activeModule);

  // Find authorized roles for restricted screen
  const authorizedRoles = Object.values(ROLE_PERMISSIONS).filter(r =>
    r.allowedModules.includes(activeModule)
  );

  // Dedicated Home Page: Shows strictly the 10-Step Workflow, Stakeholders & Responsibilities
  if (activeModule === 'HOME') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-600 selection:text-white">
        <HomeWorkflowOverview onNavigate={navigate} />
        <Toast toasts={toasts} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden selection:bg-emerald-600 selection:text-white">
      {/* 1. Enterprise Sidebar Navigation (strictly role-filtered) */}
      <EnterpriseSidebar
        activeModule={activeModule}
        onSelectModule={(mod) => navigate(mod)}
        onOpenLegacyFlow={() => navigate('/flow')}
        onOpenLegacyGeoStudio={() => navigate('/field-agent')}
      />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50">
        <EnterpriseNavbar
          activeModule={activeModule}
          onSelectModule={(mod) => navigate(mod)}
          onOpenTraceSearch={handleOpenTraceSearch}
        />

        <main className={`p-4 md:p-6 w-full mx-auto pb-24 ${
          activeModule === 'GEO_STUDIO' || activeModule === 'PLANTATIONS' ? 'max-w-[1500px]' : 'max-w-6xl'
        }`}>
          {/* Main Module Content (No blocking screen - user changes role via dropdown anytime) */}
          {activeModule === 'HOME' && (
            <HomeWorkflowOverview onNavigate={navigate} />
          )}

          {/* Executive Dashboard */}
          {activeModule === 'DASHBOARD' && (
            <DashboardModule onNavigateModule={(mod) => navigate(mod)} />
          )}

          {/* Farmer Registry */}
          {activeModule === 'FARMERS' && (
            <FarmerModule
              onOpenGeoStudio={() => navigate('/field-agent')}
              onOpenRegister={() => navigate('/farmer/register')}
            />
          )}

              {/* Farmer Registration Form */}
              {activeModule === 'FARMER_REGISTER' && (
                <FarmerRegistrationModule onNavigate={navigate} />
              )}

              {/* Farmer Maker-Checker Approvals Portal */}
              {activeModule === 'FARMER_APPROVALS' && (
                <FarmerApprovalModule onNavigate={navigate} />
              )}

              {/* Plantations & Trees GIS */}
              {activeModule === 'PLANTATIONS' && (
                <PlantationModule onOpenGeoStudio={() => navigate('/field-gis-studio')} />
              )}

              {/* Cultivation & Inoculation */}
              {activeModule === 'INOCULATION' && <InoculationModule />}

              {/* Harvest Management */}
              {activeModule === 'HARVEST' && <HarvestModule />}

              {/* Permits & DFO Orders */}
              {activeModule === 'PERMITS' && <PermitModule />}

              {/* Material Movement & Gate Tolerance */}
              {activeModule === 'MOVEMENT' && <MovementModule />}

              {/* Aggregation & Depot Pooling */}
              {activeModule === 'AGGREGATION' && <AggregationModule />}

              {/* Processing & CPC Distillation */}
              {activeModule === 'PROCESSING' && <ProcessingModule />}

              {/* Laboratory & NABL Quality */}
              {activeModule === 'LABORATORY' && <LaboratoryModule />}

              {/* Inventory & Stock Ledger */}
              {activeModule === 'INVENTORY' && <InventoryModule />}

              {/* Finished Products & Laser QR */}
              {activeModule === 'FINISHED_PRODUCTS' && (
                <FinishedProductModule onOpenTraceSearch={handleOpenTraceSearch} />
              )}

              {/* Export Batches */}
              {activeModule === 'EXPORT' && <ExportModule />}

              {/* Shipment & Cargo Lots */}
              {activeModule === 'SHIPMENT' && <ShipmentModule />}

              {/* Domestic Perfumery Sales */}
              {activeModule === 'DOMESTIC_SALES' && <DomesticSalesModule />}

              {/* Traceability & QR Verification Engine */}
              {activeModule === 'TRACEABILITY' && (
                <TraceabilityModule initialSearchQuery={traceSearchQuery} />
              )}

              {/* Audit Trail & Compliance Reports */}
              {activeModule === 'AUDIT_REPORTS' && <AuditReportsModule />}

              {/* Interactive Guided Demonstrators */}
              {activeModule === 'FLOW' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="font-extrabold text-slate-800 text-xs">
                      14-Step Operational Live Flow Wizard
                    </span>
                    <button
                      onClick={() => navigate('/dashboard')}
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
                    onResetWorkflow={handleResetWorkflow}
                    onLoadAllSteps={handleLoadAllSteps}
                    onOpenGeoStudio={() => navigate('/field-gis-studio')}
                  />
                </div>
              )}

              {activeModule === 'GEO_STUDIO' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="font-extrabold text-slate-800 text-xs">
                      Field Geo-Tagging Studio (POLOGEN Walked Boundaries & Point Tagging)
                    </span>
                    <button
                      onClick={() => navigate('/plantations')}
                      className="px-3 py-1 bg-slate-800 text-white rounded-lg text-xs font-bold"
                    >
                      Back to Plantations
                    </button>
                  </div>
                  <FieldGeoTaggingStudio
                    onAdvanceStep={(step) => {
                      handleAdvanceStep(step);
                      navigate('/flow');
                    }}
                  />
                </div>
              )}
        </main>
      </div>

      {/* Global Action Toasts */}
      <Toast toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <EnterpriseProvider>
      <AppContent />
    </EnterpriseProvider>
  );
}
