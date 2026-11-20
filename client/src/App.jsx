import React, { useState, useEffect } from 'react';
import { EnterpriseProvider, useEnterprise } from './context/EnterpriseContext';
import EnterpriseNavbar from './components/navigation/EnterpriseNavbar';
import EnterpriseSidebar from './components/navigation/EnterpriseSidebar';
import Toast from './components/common/Toast';

// 17 Main Enterprise Modules
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

// Interactive Guided Flow & GIS Studios
import LiveWorkflowView from './components/LiveWorkflowView';
import FieldGeoTaggingStudio from './components/FieldGeoTaggingStudio';

function AppContent() {
  const { toasts } = useEnterprise();

  // Active module navigation
  const [activeModule, setActiveModule] = useState('DASHBOARD');
  const [traceSearchQuery, setTraceSearchQuery] = useState('PCK-NER-2026-001');

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

  // Check URL pathname for direct QR scan link (e.g. /verify/PCK-NER-2026-001)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/verify')) {
      const parts = window.location.pathname.split('/verify/');
      if (parts[1]) {
        setTraceSearchQuery(parts[1]);
      }
      setActiveModule('TRACEABILITY');
    }
  }, []);

  const handleOpenTraceSearch = (query) => {
    setTraceSearchQuery(query);
    setActiveModule('TRACEABILITY');
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

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden selection:bg-emerald-600 selection:text-white">
      {/* 1. Enterprise Sidebar Navigation */}
      <EnterpriseSidebar
        activeModule={activeModule}
        onSelectModule={(mod) => setActiveModule(mod)}
        onOpenLegacyFlow={() => setActiveModule('FLOW')}
        onOpenLegacyGeoStudio={() => setActiveModule('GEO_STUDIO')}
      />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50">
        <EnterpriseNavbar
          activeModule={activeModule}
          onSelectModule={(mod) => setActiveModule(mod)}
          onOpenTraceSearch={handleOpenTraceSearch}
        />

        <main className={`p-5 md:p-6 w-full mx-auto pb-24 ${
          activeModule === 'GEO_STUDIO' || activeModule === 'PLANTATIONS' ? 'max-w-[1500px]' : 'max-w-6xl'
        }`}>
          {/* Module 1: Dashboard */}
          {activeModule === 'DASHBOARD' && (
            <DashboardModule onNavigateModule={(mod) => setActiveModule(mod)} />
          )}

          {/* Module 2: Farmer Management */}
          {activeModule === 'FARMERS' && <FarmerModule />}

          {/* Module 3: Plantation & Trees GIS */}
          {activeModule === 'PLANTATIONS' && <PlantationModule />}

          {/* Module 4: Cultivation & Inoculation */}
          {activeModule === 'INOCULATION' && <InoculationModule />}

          {/* Module 5: Harvest Management */}
          {activeModule === 'HARVEST' && <HarvestModule />}

          {/* Module 6: Permits & DFO Orders */}
          {activeModule === 'PERMITS' && <PermitModule />}

          {/* Module 7: Material Movement & Gate Tolerance */}
          {activeModule === 'MOVEMENT' && <MovementModule />}

          {/* Module 8: Aggregation & Depot Pooling */}
          {activeModule === 'AGGREGATION' && <AggregationModule />}

          {/* Module 9: Processing & CPC Distillation */}
          {activeModule === 'PROCESSING' && <ProcessingModule />}

          {/* Module 10: Laboratory & NABL Quality */}
          {activeModule === 'LABORATORY' && <LaboratoryModule />}

          {/* Module 11: Inventory & Stock Ledger */}
          {activeModule === 'INVENTORY' && <InventoryModule />}

          {/* Module 12: Finished Products & Laser QR */}
          {activeModule === 'FINISHED_PRODUCTS' && (
            <FinishedProductModule onOpenTraceSearch={handleOpenTraceSearch} />
          )}

          {/* Module 13: Export Batches */}
          {activeModule === 'EXPORT' && <ExportModule />}

          {/* Module 14: Shipment & Cargo Lots */}
          {activeModule === 'SHIPMENT' && <ShipmentModule />}

          {/* Module 15: Domestic Perfumery Sales */}
          {activeModule === 'DOMESTIC_SALES' && <DomesticSalesModule />}

          {/* Module 16: Traceability & QR Verification Engine */}
          {activeModule === 'TRACEABILITY' && (
            <TraceabilityModule initialSearchQuery={traceSearchQuery} />
          )}

          {/* Module 17: Audit Trail & Compliance Reports */}
          {activeModule === 'AUDIT_REPORTS' && <AuditReportsModule />}

          {/* Interactive Guided Demonstrators */}
          {activeModule === 'FLOW' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="font-extrabold text-slate-800 text-xs">
                  14-Step Operational Live Flow Wizard
                </span>
                <button
                  onClick={() => setActiveModule('DASHBOARD')}
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
                onOpenGeoStudio={() => setActiveModule('GEO_STUDIO')}
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
                  onClick={() => setActiveModule('PLANTATIONS')}
                  className="px-3 py-1 bg-slate-800 text-white rounded-lg text-xs font-bold"
                >
                  Back to Plantations
                </button>
              </div>
              <FieldGeoTaggingStudio
                onAdvanceStep={(step) => {
                  handleAdvanceStep(step);
                  setActiveModule('FLOW');
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
