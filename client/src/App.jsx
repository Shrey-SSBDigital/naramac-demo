import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LiveWorkflowView from './components/LiveWorkflowView';
import StakeholderDetailView from './components/StakeholderDetailView';
import FieldGeoTaggingStudio from './components/FieldGeoTaggingStudio';
import TraceabilityChainView from './components/TraceabilityChainView';
import QRVerificationPortal from './components/QRVerificationPortal';
import { STAKEHOLDERS_DATA } from './data/mockData';

// 14 Ordered Real-World Operational Workflow Stages
const WORKFLOW_STAGES = [
  { stepNumber: 1, title: "Farmer Portal Registration", actor: "Registered Farmer", idCode: "FRM App" },
  { stepNumber: 2, title: "Field Inspection & Geo-pinning", actor: "NERAMAC Field Agent", idCode: "FRM" },
  { stepNumber: 3, title: "Plantation Boundary & Age Rule Survey", actor: "NERAMAC Field Agent", idCode: "PLT / PLG / TRE" },
  { stepNumber: 4, title: "Menu Inoculation & SHA-256 Photo", actor: "NERAMAC Field Agent", idCode: "INO" },
  { stepNumber: 5, title: "Grower Harvest Application", actor: "Registered Farmer", idCode: "HAU App" },
  { stepNumber: 6, title: "DFO Sanction & Maker-Checker", actor: "DFO & NERAMAC", idCode: "HAU / PMT" },
  { stepNumber: 7, title: "Harvest Felling & Scale Weighment", actor: "NERAMAC Field Agent", idCode: "HBT" },
  { stepNumber: 8, title: "Movement & Gate Variance (≤ 1.5%)", actor: "Aggregation Depot", idCode: "MOV" },
  { stepNumber: 9, title: "Depot Consignment Pooling", actor: "Aggregation Depot", idCode: "AGG" },
  { stepNumber: 10, title: "CPC Hydro-Distillation & Mass Balance", actor: "CPC Distillation Unit", idCode: "DST" },
  { stepNumber: 11, title: "NABL GC-MS Purity & CITES Release", actor: "Quality Lab Officer", idCode: "LAB" },
  { stepNumber: 12, title: "Packaging & Tamper-Evident QR", actor: "Packaging & Serialization", idCode: "PCK" },
  { stepNumber: 13, title: "Export Consignment & CITES Dispatch", actor: "Exporter & Logistics", idCode: "EBT / ELT" },
  { stepNumber: 14, title: "Buyer Smartphone QR Verification", actor: "International Buyer", idCode: "QR Scan" }
];

export default function App() {
  // 'FLOW' | 'GEO_STUDIO' | 'TRACEABILITY' | 'QR_PORTAL' | 'ROLES'
  const [viewMode, setViewMode] = useState('FLOW'); 
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([1]);
  const [selectedRoleId, setSelectedRoleId] = useState('FARMER');
  const [chainData, setChainData] = useState(null);

  // Shared live data across workflow
  const [workflowData, setWorkflowData] = useState({
    farmer: {
      fullName: "Bhaben Saikia",
      fatherName: "Late Hemanta Saikia",
      cluster: "Golaghat, Assam",
      village: "Dhekial Gaon, Mouza Dhekial",
      dagNumber: "Dag 182, Patta 44",
      estimatedTrees: 1420
    }
  });

  // Check URL pathname for direct QR verification scan
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/verify')) {
      setViewMode('QR_PORTAL');
    }
  }, []);

  // Fetch initial state & chain data from server
  useEffect(() => {
    fetch('/api/live-workflow/state')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.workflow) {
          setWorkflowData(data.workflow.data);
          setCurrentStep(data.workflow.activeStep);
          setCompletedSteps(data.workflow.completedSteps);
        }
      })
      .catch(() => {});

    fetch('/api/traceability/chain')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.chain) {
          setChainData(data.chain);
        }
      })
      .catch(() => {});
  }, []);

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

    // Sync with backend API
    fetch('/api/live-workflow/advance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepNumber: completedStepNum, stepData: workflowData })
    }).catch(() => {});
  };

  const handleResetWorkflow = () => {
    setCurrentStep(1);
    setCompletedSteps([1]);
    fetch('/api/live-workflow/reset', { method: 'POST' }).catch(() => {});
  };

  const handleLoadAllSteps = () => {
    setCurrentStep(14);
    setCompletedSteps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    fetch('/api/live-workflow/load-sample', { method: 'POST' }).catch(() => {});
  };

  const activeStakeholder = STAKEHOLDERS_DATA.find(s => s.id === selectedRoleId) || STAKEHOLDERS_DATA[0];

  // Helper for Top Navbar title
  const getActiveViewTitle = () => {
    switch (viewMode) {
      case 'FLOW':
        return `Workflow Stage ${currentStep}: ${WORKFLOW_STAGES[currentStep - 1]?.title}`;
      case 'GEO_STUDIO':
        return 'Field Studio: POLOGEN (<7 yr) & Point Geo-Tagging (≥7 yr)';
      case 'TRACEABILITY':
        return 'Traceability: 15 Authoritative Digital Identifiers Graph';
      case 'ROLES':
        return `Stakeholder Role: ${activeStakeholder?.roleName}`;
      case 'QR_PORTAL':
        return 'Verification: DPDP Act 2023 QR Provenance Portal';
      default:
        return 'NERAMAC Agarwood Traceability System';
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden selection:bg-emerald-600 selection:text-white">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        workflowSteps={WORKFLOW_STAGES}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onSelectStep={(step) => {
          setCurrentStep(step);
          setViewMode('FLOW');
        }}
        viewMode={viewMode}
        onToggleViewMode={(mode) => setViewMode(mode)}
        stakeholders={STAKEHOLDERS_DATA}
        selectedRoleId={selectedRoleId}
        onSelectRole={(roleId) => {
          setSelectedRoleId(roleId);
          setViewMode('ROLES');
        }}
      />

      {/* 2. Main Content View Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50">
        <Navbar activeRoleName={getActiveViewTitle()} />

        <main className={`p-5 md:p-6 w-full mx-auto pb-20 ${viewMode === 'GEO_STUDIO' ? 'max-w-[1440px]' : 'max-w-5xl'}`}>
          {viewMode === 'FLOW' && (
            <LiveWorkflowView
              currentStep={currentStep}
              onSelectStep={(step) => setCurrentStep(step)}
              workflowData={workflowData}
              onUpdateStepData={handleUpdateStepData}
              onAdvanceStep={handleAdvanceStep}
              completedSteps={completedSteps}
              onResetWorkflow={handleResetWorkflow}
              onLoadAllSteps={handleLoadAllSteps}
              onOpenGeoStudio={() => setViewMode('GEO_STUDIO')}
            />
          )}

          {viewMode === 'GEO_STUDIO' && (
            <FieldGeoTaggingStudio
              onAdvanceStep={(step) => {
                handleAdvanceStep(step);
                setViewMode('FLOW');
              }}
            />
          )}

          {viewMode === 'TRACEABILITY' && (
            <TraceabilityChainView chainData={chainData} />
          )}

          {viewMode === 'ROLES' && (
            <StakeholderDetailView
              stakeholder={activeStakeholder}
              allStakeholders={STAKEHOLDERS_DATA}
              stepNumber={STAKEHOLDERS_DATA.findIndex(s => s.id === selectedRoleId) + 1}
              totalSteps={STAKEHOLDERS_DATA.length}
              onNavigateRole={(roleId) => setSelectedRoleId(roleId)}
            />
          )}

          {viewMode === 'QR_PORTAL' && (
            <QRVerificationPortal chainData={chainData} />
          )}
        </main>
      </div>
    </div>
  );
}
