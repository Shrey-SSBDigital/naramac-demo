import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import StatusBadge from '../common/StatusBadge';
import {
  Users,
  Trees,
  Axe,
  FileBadge2,
  Truck,
  Boxes,
  Factory,
  History,
  Search,
  MapPin,
  Scale,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

export default function FarmerHarvestHistoryModule() {
  const {
    farmers,
    plantations,
    trees,
    harvests,
    harvestBatches,
    permits,
    movements,
    aggregations,
    distillations,
    auditLogs
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmerId, setSelectedFarmerId] = useState(() => farmers[0]?.id || '');

  const filteredFarmers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return farmers;
    return farmers.filter(f =>
      (f.name || '').toLowerCase().includes(q) ||
      (f.id || '').toLowerCase().includes(q) ||
      (f.cluster || '').toLowerCase().includes(q) ||
      (f.district || '').toLowerCase().includes(q) ||
      (f.village || '').toLowerCase().includes(q)
    );
  }, [farmers, searchTerm]);

  const selectedFarmer = useMemo(
    () => farmers.find(f => f.id === selectedFarmerId) || filteredFarmers[0] || farmers[0] || null,
    [farmers, filteredFarmers, selectedFarmerId]
  );

  const farmerData = useMemo(() => {
    if (!selectedFarmer) return null;
    const fId = selectedFarmer.id;
    const fName = selectedFarmer.name;

    const fPlantations = plantations.filter(p => p.farmerId === fId || p.farmerName === fName);
    const fTrees = trees.filter(t => t.farmerId === fId || t.farmerName === fName);
    const fHarvests = harvests.filter(h => h.farmerId === fId || h.farmerName === fName);
    const fBatches = harvestBatches.filter(b => b.farmerId === fId || b.farmerName === fName);

    const linkedBatchIds = new Set();
    const entries = fHarvests.map(h => {
      const batch = fBatches.find(
        b => b.harvestAuthId === h.id || b.id === h.harvestBatchId || (h.treeId && b.treeId === h.treeId && b.fellingOrderNumber === h.dfoSanctionNumber)
      ) || fBatches.find(b => b.harvestAuthId === h.id);

      if (batch) linkedBatchIds.add(batch.id);

      const permit = permits.find(
        p => p.permitNumber === h.dfoSanctionNumber || p.permitNumber === batch?.fellingOrderNumber || p.linkedHarvestId === h.id
      );

      const batchMovements = batch
        ? movements.filter(m => m.batchId === batch.id || (m.parentBatchIds && m.parentBatchIds.includes(batch.id)))
        : [];

      const lot = batch
        ? aggregations.find(a => a.parentBatchIds?.includes(batch.id))
        : null;

      const lotMovements = lot
        ? movements.filter(m => m.batchId === lot.id)
        : [];

      const processingRuns = distillations.filter(
        d => (lot && d.sourceBatchId === lot.id) || (batch && (d.sourceBatchId === batch.id || d.parentHarvestBatches?.includes(batch.id)))
      );

      const relatedIds = new Set([h.id, batch?.id, lot?.id, ...processingRuns.map(r => r.id)].filter(Boolean));
      const logs = auditLogs.filter(l => relatedIds.has(l.entityId));

      return {
        key: h.id,
        harvest: h,
        batch,
        permit,
        movements: [...batchMovements, ...lotMovements],
        lot,
        processingRuns,
        logs
      };
    });

    // Include any standalone batches for this farmer not matched to an application
    fBatches.forEach(batch => {
      if (linkedBatchIds.has(batch.id)) return;
      const batchMovements = movements.filter(m => m.batchId === batch.id);
      const lot = aggregations.find(a => a.parentBatchIds?.includes(batch.id));
      const lotMovements = lot ? movements.filter(m => m.batchId === lot.id) : [];
      const processingRuns = distillations.filter(
        d => (lot && d.sourceBatchId === lot.id) || d.sourceBatchId === batch.id || d.parentHarvestBatches?.includes(batch.id)
      );
      const relatedIds = new Set([batch.id, lot?.id, ...processingRuns.map(r => r.id)].filter(Boolean));
      const logs = auditLogs.filter(l => relatedIds.has(l.entityId));

      entries.push({
        key: batch.id,
        harvest: null,
        batch,
        permit: permits.find(p => p.permitNumber === batch.fellingOrderNumber || p.permitNumber === batch.transitPassNumber),
        movements: [...batchMovements, ...lotMovements],
        lot,
        processingRuns,
        logs
      });
    });

    const totalHarvestedKg = fBatches.reduce((sum, b) => sum + (b.netWeightKg || 0), 0);

    return {
      plantations: fPlantations,
      trees: fTrees,
      harvests: fHarvests,
      batches: fBatches,
      totalHarvestedKg,
      entries
    };
  }, [selectedFarmer, plantations, trees, harvests, harvestBatches, permits, movements, aggregations, distillations, auditLogs]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                Admin Governance
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                /farmer/harvest-history
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-700" />
              <span>Farmer-Wise Complete Harvest History</span>
            </h1>
            <p className="text-xs text-slate-500">
              Inspect a specific farmer&apos;s end-to-end history for every harvest: application, DFO sanction, felling batch, transit movements, depot lot, CPC processing, and audit trail.
            </p>
          </div>
        </div>

        {/* Farmer Search & Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Search Farmer (Name, ID, Cluster, Village)</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search e.g. Bhaben Saikia, FRM-AS-01, Golaghat..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Farmer *</label>
            <select
              value={selectedFarmer?.id || ''}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white"
            >
              {filteredFarmers.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.id}) — {f.cluster || f.district || 'Assam'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Selected Farmer Summary */}
      {selectedFarmer && farmerData && (
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <h2 className="text-base font-black text-slate-900">{selectedFarmer.name}</h2>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {selectedFarmer.id}
                </span>
              </div>
              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedFarmer.village || selectedFarmer.district}, {selectedFarmer.state || 'Assam'} ({selectedFarmer.cluster || 'Cluster'})
                </span>
                {selectedFarmer.dagNumber && (
                  <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {selectedFarmer.dagNumber}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Plantations</div>
                <div className="text-sm font-black text-slate-900">{farmerData.plantations.length}</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-teal-50 border border-teal-200 text-center">
                <div className="text-[10px] text-teal-700 font-bold uppercase">Matured Trees</div>
                <div className="text-sm font-black text-teal-900">{farmerData.trees.length}</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <div className="text-[10px] text-amber-700 font-bold uppercase">Harvest Records</div>
                <div className="text-sm font-black text-amber-900">{farmerData.entries.length}</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-[10px] text-emerald-700 font-bold uppercase">Harvested Wood</div>
                <div className="text-sm font-black text-emerald-900">{farmerData.totalHarvestedKg.toFixed(1)} kg</div>
              </div>
            </div>
          </div>

          {/* Each Harvest Lifecycle Card */}
          {farmerData.entries.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <Axe className="w-7 h-7 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No Harvest History Found</div>
              <p className="text-xs text-slate-500">This farmer has no harvest applications or felled batches recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {farmerData.entries.map((entry, idx) => {
                const { harvest: h, batch: b, permit, movements: movs, lot, processingRuns, logs } = entry;
                const status = h?.status || b?.status || 'RECORDED';

                return (
                  <div key={entry.key} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                    {/* Harvest Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-[11px] font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-mono font-black text-sm text-slate-900">
                          {h ? h.id : b?.id}
                        </span>
                        {b && h && (
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                            Batch: {b.id}
                          </span>
                        )}
                        {(h?.treeId || b?.treeId) && (
                          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                            <Trees className="w-3.5 h-3.5 text-emerald-600" />
                            Tree: <strong className="font-mono">{h?.treeId || b?.treeId}</strong>
                          </span>
                        )}
                      </div>
                      <StatusBadge status={status} />
                    </div>

                    {/* Timeline Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      {/* 1. Application */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <div className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>1. Harvest Application</span>
                        </div>
                        {h ? (
                          <>
                            <div className="font-bold text-slate-900">Applied: {h.applicationDate || 'N/A'}</div>
                            <div className="text-slate-600">Est. Weight: <strong>{h.estimatedWeightKg || h.estimatedQuantity || 0} kg</strong></div>
                            <div className="text-slate-600">Window: {h.harvestWindowText || 'Standard Window'}</div>
                            <div className="text-[11px] text-slate-500">Target DFO: {h.dfoDivision || 'Golaghat Forest Division'}</div>
                          </>
                        ) : (
                          <div className="text-slate-400 italic">Direct field batch record</div>
                        )}
                      </div>

                      {/* 2. DFO Sanction / Rejection */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <div className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                          <FileBadge2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>2. DFO Statutory Decision</span>
                        </div>
                        {h?.dfoDecision === 'REJECTED' || h?.status === 'REJECTED_BY_DFO' ? (
                          <div className="text-rose-700 font-semibold flex items-start gap-1">
                            <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>Rejected: {h.rejectionReason || 'Deficiency flagged by DFO'}</span>
                          </div>
                        ) : h?.dfoSanctionNumber || b?.fellingOrderNumber || permit ? (
                          <>
                            <div className="font-mono font-bold text-blue-900">
                              Order: {h?.dfoSanctionNumber || b?.fellingOrderNumber || permit?.permitNumber}
                            </div>
                            {h?.harvestAuthorisationId && (
                              <div className="text-slate-600 font-mono text-[11px]">Auth ID: {h.harvestAuthorisationId}</div>
                            )}
                            <div className="text-slate-600">
                              Officer: {h?.dfoOfficerName || permit?.officerName || 'DFO Authority'}
                            </div>
                          </>
                        ) : (
                          <div className="text-amber-700 font-semibold">Pending DFO Review</div>
                        )}
                      </div>

                      {/* 3. Felling & Batch */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <div className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5 text-amber-600" />
                          <span>3. Felling &amp; Harvest Batch</span>
                        </div>
                        {b ? (
                          <>
                            <div className="font-mono font-bold text-emerald-900">{b.id} ({b.harvestDate || b.fellingDate || 'Completed'})</div>
                            <div className="text-slate-700">
                              Cleaned Heartwood: <strong>{b.netWeightKg || 0} kg</strong>
                            </div>
                            <div className="font-mono text-[11px] text-slate-600">e-TP: {b.transitPassNumber || 'Issued'}</div>
                            <div className="text-[11px] text-slate-500">Location: {b.currentLocation || 'Field / Depot'}</div>
                          </>
                        ) : (
                          <div className="text-slate-400 italic">Not yet felled</div>
                        )}
                      </div>

                      {/* 4. Custody Movements */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <div className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-cyan-600" />
                          <span>4. Custody Transit ({movs.length})</span>
                        </div>
                        {movs.length > 0 ? (
                          <div className="space-y-1.5">
                            {movs.map(m => (
                              <div key={m.id} className="text-[11px] border-l-2 border-cyan-400 pl-2">
                                <div className="font-mono font-bold text-slate-800">{m.id} • {m.sourceName} → {m.destinationName}</div>
                                <div className="text-slate-600">
                                  {m.dispatchWeightKg}kg → {m.receivedWeightKg !== null && m.receivedWeightKg !== undefined ? `${m.receivedWeightKg}kg` : 'In Transit'}
                                  {m.grnNumber ? ` • GRN: ${m.grnNumber}` : ''}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-slate-400 italic">No transit movements recorded</div>
                        )}
                      </div>

                      {/* 5. Depot Lot & CPC Processing */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <div className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                          <Boxes className="w-3.5 h-3.5 text-purple-600" />
                          <span>5. Depot Lot &amp; CPC Processing</span>
                        </div>
                        {lot ? (
                          <div className="text-[11px]">
                            <span className="font-mono font-bold text-slate-800">Lot: {lot.id}</span> ({lot.totalWeightKg} kg)
                          </div>
                        ) : (
                          <div className="text-slate-400 text-[11px]">Not merged into a depot lot yet</div>
                        )}
                        {processingRuns.length > 0 ? (
                          processingRuns.map(run => (
                            <div key={run.id} className="text-[11px] border-l-2 border-purple-400 pl-2 mt-1">
                              <div className="font-mono font-bold text-purple-900 flex items-center gap-1">
                                <Factory className="w-3 h-3" />
                                <span>{run.id}</span>
                              </div>
                              <div className="text-slate-600">
                                Oil: {run.outputPureOudOilMl || 0}ml • Chips: {run.outputAgarwoodChipsKg || 0}kg • Raw: {run.outputRawWoodKg || 0}kg
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-400 italic text-[11px]">No CPC processing run yet</div>
                        )}
                      </div>

                      {/* 6. Audit Events */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <div className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>6. Audit Trail ({logs.length})</span>
                        </div>
                        {logs.length > 0 ? (
                          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                            {logs.slice(0, 5).map(l => (
                              <div key={l.id} className="text-[10px] text-slate-600">
                                <span className="font-mono font-bold text-slate-800">{l.action}</span>: {l.details}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-slate-400 italic">No audit entries linked</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
