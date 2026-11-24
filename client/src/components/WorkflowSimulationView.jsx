import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck2, 
  Scale, 
  Clock, 
  WifiOff, 
  RefreshCw, 
  ShieldCheck, 
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function WorkflowSimulationView({ translations }) {
  // 1. DFO Maker-Checker State
  const [dfoOrderRef, setDfoOrderRef] = useState('FD/GLG/AGAR/2026/918');
  const [dfoDecision, setDfoDecision] = useState('APPROVE');
  const [dfoResult, setDfoResult] = useState(null);
  const [isDfoLoading, setIsDfoLoading] = useState(false);

  // 2. Weight Variance State
  const [dispatchWeight, setDispatchWeight] = useState(185.4);
  const [receiptWeight, setReceiptWeight] = useState(184.8);
  const [toleranceLimit, setToleranceLimit] = useState(1.5);
  const [varianceResult, setVarianceResult] = useState(null);

  // 3. Age Rule State
  const [treeAgeInput, setTreeAgeInput] = useState(7.2);
  const [ageResult, setAgeResult] = useState(null);

  // 4. Offline Sync State
  const [provisionalId, setProvisionalId] = useState('PROV-HBT-9901');
  const [syncResult, setSyncResult] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Handle DFO simulation
  const handleDfoSubmit = (e) => {
    e.preventDefault();
    setIsDfoLoading(true);
    setTimeout(() => {
      setIsDfoLoading(false);
      if (dfoDecision === 'APPROVE') {
        setDfoResult({
          status: "APPROVED_AND_MAKER_CHECKER_VERIFIED",
          permitId: "PMT-DFO-GLG-918",
          dfoOfficer: "Sri K. N. Sarma, IFS (DFO Golaghat)",
          checkerOfficer: "Smt. P. Kalita (NERAMAC Senior Officer)",
          docHash: "fa71b96a84d293f0b263b65ef319087cf29486c91a0c77607736f1b11cb3a890",
          message: "DFO Statutory Harvest Order recorded, verified by NERAMAC Maker-Checker, and linked to Tree IDs."
        });
      } else {
        setDfoResult({
          status: "REJECTED_BY_DFO",
          orderRef: dfoOrderRef,
          message: "Harvest application rejected by DFO. Harvest batch creation blocked."
        });
      }
    }, 400);
  };

  // Handle Weight Variance check
  const handleVarianceCheck = (e) => {
    e.preventDefault();
    const d = parseFloat(dispatchWeight) || 0;
    const r = parseFloat(receiptWeight) || 0;
    const diff = parseFloat((r - d).toFixed(2));
    const pct = parseFloat(((diff / d) * 100).toFixed(2));
    const absPct = Math.abs(pct);
    const passed = absPct <= toleranceLimit;

    setVarianceResult({
      varianceKg: diff,
      variancePct: pct,
      passed,
      message: passed
        ? `Weighment verified. Variance (${absPct}%) is within approved tolerance (≤ ${toleranceLimit}%). Receipt accepted.`
        : `ALERT: Variance (${absPct}%) exceeds tolerance limit (≤ ${toleranceLimit}%). Unexplained loss routed for reasoned approval!`
    });
  };

  // Handle Age Rule evaluation
  const handleAgeEvaluate = (e) => {
    e.preventDefault();
    const age = parseFloat(treeAgeInput);
    if (age < 7.0) {
      setAgeResult({
        category: "POLOGEN",
        isMature: false,
        message: `Tree age ${age} yrs is below 7.0 years. Trace collectively as a POLOGEN polygon block. No individual tagging required.`
      });
    } else {
      setAgeResult({
        category: "TRE_INDIVIDUAL",
        isMature: true,
        taskRef: "TASK-TAG-2026-0842",
        assignedIds: ["TRE-GH-MAT-01", "TRE-GH-MAT-02", "TRE-GH-MAT-03"],
        message: `Tree age ${age} yrs has reached 7.0-year threshold! System automatically raises a field task to tag and geo-pin individual trees with Tree Identities.`
      });
    }
  };

  // Handle Offline Sync simulation
  const handleOfflineSync = () => {
    setIsSyncing(true);
    setSyncResult(null);
    setTimeout(() => {
      setIsSyncing(false);
      const authId = provisionalId.replace('PROV-', 'AUTH-NER-');
      setSyncResult({
        status: "RECONCILED",
        provisionalId,
        authoritativeId: authId,
        auditHash: "7d4a2f8c5b9e1a3d6f0c8e2b4a7d9f1e3c5a7b9d0e2f4a6c8e0b2d4f6a8c0e2b",
        message: `Provisional offline ID reconciled to ${authId} without collision. Original provisional ID preserved in immutable audit trail.`
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-emerald-700" />
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Live Interactive Operational Rules & Workflow Simulator
          </h2>
        </div>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl font-medium">
          Test core business logic from the RFP: DFO statutory maker-checker control, weighment tolerance monitoring (≤ 1.5%), the 7-year age rule transition, and offline-provisional sync.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Simulation 1: DFO Maker-Checker Workflow */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileCheck2 className="w-4 h-4 text-amber-700" />
              <h3 className="text-sm font-black text-slate-900">
                1. DFO Harvest Authorisation & Maker-Checker
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 font-medium">
              RFP Section 2.6 & 3.2: DFO issues statutory felling order; NERAMAC Maker-Checker validates the order before harvest can proceed.
            </p>

            <form onSubmit={handleDfoSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">DFO Order Reference:</label>
                <input
                  type="text"
                  value={dfoOrderRef}
                  onChange={(e) => setDfoOrderRef(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">DFO Statutory Decision:</label>
                <select
                  value={dfoDecision}
                  onChange={(e) => setDfoDecision(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold"
                >
                  <option value="APPROVE">Approve Harvest (Permit 200 kg from 2 mature trees)</option>
                  <option value="REJECT">Reject (Sanctuary Buffer / Quota Exceeded)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isDfoLoading}
                className="w-full mt-2 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-2xs"
              >
                {isDfoLoading ? "Executing Maker-Checker Scrutiny..." : "Execute DFO & Maker-Checker Action"}
              </button>
            </form>
          </div>

          {dfoResult && (
            <div className={`mt-4 p-3 rounded-xl border text-xs shadow-2xs ${
              dfoResult.status.includes('APPROVED')
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center gap-1.5 font-black mb-1">
                {dfoResult.status.includes('APPROVED') ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <AlertTriangle className="w-4 h-4 text-rose-700" />}
                <span>Status: {dfoResult.status}</span>
              </div>
              <p className="text-[11px] text-slate-700 font-medium">{dfoResult.message}</p>
              {dfoResult.permitId && (
                <div className="mt-2 pt-2 border-t border-emerald-200 text-[10px] space-y-0.5 font-mono text-slate-800">
                  <div>Permit Issued: <span className="text-emerald-900 font-bold">{dfoResult.permitId}</span></div>
                  <div>Maker-Checker: <span className="text-teal-900 font-bold">{dfoResult.checkerOfficer}</span></div>
                  <div className="truncate text-slate-600">Signed Order Hash: {dfoResult.docHash}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Simulation 2: Weighment & Transit Variance Check */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-black text-slate-900">
                2. Movement & Weighment Variance Control
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 font-medium">
              RFP Section 2.7 & 3.2: Reconciles dispatch vs receipt weight against approved tolerance (≤ 1.5%). Auto-routes exceptions.
            </p>

            <form onSubmit={handleVarianceCheck} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Dispatch Wt (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dispatchWeight}
                    onChange={(e) => setDispatchWeight(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Receipt Wt (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={receiptWeight}
                    onChange={(e) => setReceiptWeight(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Allowed Tolerance Limit (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={toleranceLimit}
                  onChange={(e) => setToleranceLimit(parseFloat(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-2xs"
              >
                Compute Weight Reconciliation
              </button>
            </form>
          </div>

          {varianceResult && (
            <div className={`mt-4 p-3 rounded-xl border text-xs shadow-2xs ${
              varianceResult.passed
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}>
              <div className="flex items-center justify-between font-black mb-1">
                <span>Variance: {varianceResult.varianceKg} kg ({varianceResult.variancePct}%)</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white border font-bold">
                  {varianceResult.passed ? 'PASSED' : 'EXCEPTION ALERT'}
                </span>
              </div>
              <p className="text-[11px] text-slate-700 font-medium mt-1">{varianceResult.message}</p>
            </div>
          )}
        </div>

        {/* Simulation 3: The 7-Year Age Rule Engine */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-black text-slate-900">
                3. The Age Rule Engine (&lt; 7y vs ≥ 7y)
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 font-medium">
              RFP Section 3.2: Configurable business rule. Trees below 7 yrs are traced as POLOGEN polygons; trees crossing 7 yrs automatically generate individual tagging tasks.
            </p>

            <form onSubmit={handleAgeEvaluate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Agarwood Planting Age (Years):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1.0"
                    max="15.0"
                    step="0.1"
                    value={treeAgeInput}
                    onChange={(e) => setTreeAgeInput(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="w-20 font-mono text-center bg-slate-100 py-1.5 rounded-lg border border-slate-300 text-slate-900 font-black text-xs">
                    {treeAgeInput} yrs
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-slate-600 text-[11px] font-semibold">
                <span>Presets:</span>
                <button
                  type="button"
                  onClick={() => setTreeAgeInput(4.5)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200"
                >
                  4.5 yrs (Young)
                </button>
                <button
                  type="button"
                  onClick={() => setTreeAgeInput(7.1)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold border border-emerald-300"
                >
                  7.1 yrs (Threshold Trigger)
                </button>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-2xs"
              >
                Evaluate Age Rule Compliance
              </button>
            </form>
          </div>

          {ageResult && (
            <div className={`mt-4 p-3 rounded-xl border text-xs shadow-2xs ${
              ageResult.isMature
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-blue-50 border-blue-300 text-blue-950'
            }`}>
              <div className="font-black flex items-center gap-1.5 mb-1">
                <span>Identity Model: {ageResult.category}</span>
              </div>
              <p className="text-[11px] text-slate-700 font-medium">{ageResult.message}</p>
              {ageResult.isMature && (
                <div className="mt-2 pt-2 border-t border-amber-200 font-mono text-[10px] text-slate-800 font-semibold">
                  Task Generated: <span className="text-amber-900 font-black">{ageResult.taskRef}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Simulation 4: Offline Field Mode & Provisional ID Sync */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <WifiOff className="w-4 h-4 text-purple-700" />
              <h3 className="text-sm font-black text-slate-900">
                4. Offline Mode & Provisional ID Reconciliation
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 font-medium">
              RFP Section 3.4: Field mobile apps issue non-colliding provisional IDs when offline in remote plantations, reconciling cleanly upon server sync.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Provisional Offline Identifier:
                </label>
                <input
                  type="text"
                  value={provisionalId}
                  onChange={(e) => setProvisionalId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1 font-medium">
                <div>Field Device: <span className="text-slate-900 font-bold">Rugged Android Tablet #AG-09</span></div>
                <div>Status: <span className="text-amber-900 font-bold">Recorded locally with SHA-256 photo hash</span></div>
              </div>

              <button
                onClick={handleOfflineSync}
                disabled={isSyncing}
                className="w-full mt-2 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? "Synchronizing to Central Server..." : "Simulate Reconnection & Sync"}</span>
              </button>
            </div>
          </div>

          {syncResult && (
            <div className="mt-4 p-3 rounded-xl bg-purple-50 border border-purple-300 text-xs text-purple-950 shadow-2xs">
              <div className="font-black flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-4 h-4 text-purple-700" />
                <span>Sync Status: {syncResult.status}</span>
              </div>
              <p className="text-[11px] text-slate-700 font-medium">{syncResult.message}</p>
              <div className="mt-2 pt-2 border-t border-purple-200 font-mono text-[10px] space-y-0.5 text-slate-800">
                <div>Authoritative ID: <span className="text-emerald-900 font-black">{syncResult.authoritativeId}</span></div>
                <div className="truncate text-slate-600">Audit Proof Hash: {syncResult.auditHash}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
