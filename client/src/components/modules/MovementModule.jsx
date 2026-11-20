import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { Truck, Scale, Plus, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function MovementModule() {
  const { movements, createMovement, receiveMovement, harvestBatches, aggregations } = useEnterprise();
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [receiveTarget, setReceiveTarget] = useState(null);
  const [receivedWeightInput, setReceivedWeightInput] = useState(75.0);

  // Dispatch form
  const [dispatchForm, setDispatchForm] = useState({
    batchId: 'HBT-AS-2026-005',
    sourceType: 'Farmer Plot',
    sourceName: 'Bhaben Saikia Homestead (PLT-AS-01)',
    dispatchCustodian: 'NERAMAC Field Agent',
    destinationType: 'Aggregation Depot',
    destinationName: 'Golaghat Cluster Aggregation Depot',
    transitPassNumber: 'TP/FOR/GLT/2026/0944',
    vehicleNumber: 'AS-05-C-8812',
    driverName: 'Ramesh Gogoi',
    dispatchWeightKg: 31.50
  });

  const handleDispatchSubmit = (e) => {
    e.preventDefault();
    createMovement(dispatchForm);
    setIsDispatchModalOpen(false);
  };

  const handleReceiveSubmit = (e) => {
    e.preventDefault();
    if (!receiveTarget) return;
    receiveMovement(receiveTarget.id, receivedWeightInput, 'B. C. Kalita (Depot Superintendent)');
    setIsReceiveModalOpen(false);
    setReceiveTarget(null);
  };

  const columns = [
    {
      header: 'Movement ID',
      accessor: 'id',
      render: (m) => (
        <div>
          <span className="font-extrabold text-slate-900 font-mono text-xs">{m.id}</span>
          <div className="text-[10px] text-slate-400 font-mono">{m.transitPassNumber}</div>
        </div>
      )
    },
    {
      header: 'Consignment Batches',
      accessor: 'batchId',
      render: (m) => (
        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          {m.batchId}
        </span>
      )
    },
    {
      header: 'Custody Transfer Route',
      accessor: 'sourceName',
      render: (m) => (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-slate-800">{m.sourceName}</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="font-bold text-slate-900">{m.destinationName}</span>
        </div>
      )
    },
    {
      header: 'Weighment (Disp → Recv)',
      accessor: 'dispatchWeightKg',
      render: (m) => (
        <div>
          <span className="font-bold text-slate-900">
            {m.dispatchWeightKg} kg → {m.receivedWeightKg !== null ? `${m.receivedWeightKg} kg` : 'In Transit'}
          </span>
          {m.variancePercent !== null && (
            <div className={`text-[10px] font-bold ${
              Math.abs(m.variancePercent) <= 1.5 ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              Variance: {m.variancePercent}% ({m.varianceKg} kg)
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Gate Tolerance (≤ 1.5%)',
      accessor: 'toleranceStatus',
      render: (m) => <StatusBadge status={m.toleranceStatus} />
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (m) => <StatusBadge status={m.status} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (m) => (
        <div>
          {m.status === 'IN_TRANSIT' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setReceiveTarget(m);
                setReceivedWeightInput(m.dispatchWeightKg);
                setIsReceiveModalOpen(true);
              }}
              className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition"
            >
              Verify Receipt
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMovement(m);
              }}
              className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
            >
              Audit Trail
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Material Movement & Gate Weighment Tolerance</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 07
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict gate tolerance verification (&le; 1.5% natural moisture variance) across all physical custody handoffs.
          </p>
        </div>

        <button
          onClick={() => setIsDispatchModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch Material</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={movements}
        searchKey="batchId"
        searchPlaceholder="Search movement by Batch ID, route, or transit pass..."
        onRowClick={(m) => setSelectedMovement(m)}
      />

      {/* Detail Modal */}
      {selectedMovement && (
        <Modal
          isOpen={!!selectedMovement}
          onClose={() => setSelectedMovement(null)}
          title={`Movement Custody Audit: ${selectedMovement.id}`}
          subtitle={`Transit Pass: ${selectedMovement.transitPassNumber}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-slate-700">Consignment Batches</span>
                <span className="font-mono font-bold text-emerald-800">{selectedMovement.batchId}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Source Facility</span>
                  <div className="font-semibold text-slate-800">{selectedMovement.sourceName}</div>
                  <div className="text-[11px] text-slate-500">Custodian: {selectedMovement.dispatchCustodian}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Destination Facility</span>
                  <div className="font-semibold text-slate-800">{selectedMovement.destinationName}</div>
                  <div className="text-[11px] text-slate-500">Receiver: {selectedMovement.receivingCustodian}</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Dispatch Scale</span>
                <div className="text-sm font-black text-slate-900">{selectedMovement.dispatchWeightKg} kg</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Receipt Scale</span>
                <div className="text-sm font-black text-slate-900">{selectedMovement.receivedWeightKg} kg</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Gate Tolerance</span>
                <div className="text-sm font-black text-emerald-700">{selectedMovement.variancePercent}%</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <span className="font-bold">Inspection Audit Note: </span>
              {selectedMovement.notes}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedMovement(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Dispatch Modal */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="Dispatch Material Consignment"
        subtitle="Generates statutory movement record linked to State Transit Pass"
      >
        <form onSubmit={handleDispatchSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Batch To Move *</label>
            <select
              value={dispatchForm.batchId}
              onChange={(e) => setDispatchForm({ ...dispatchForm, batchId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
            >
              {harvestBatches.map(b => (
                <option key={b.id} value={b.id}>{b.id} ({b.netWeightKg}kg, {b.farmerName})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Source Facility / Plot</label>
              <input
                type="text"
                value={dispatchForm.sourceName}
                onChange={(e) => setDispatchForm({ ...dispatchForm, sourceName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Destination Facility</label>
              <select
                value={dispatchForm.destinationName}
                onChange={(e) => setDispatchForm({ ...dispatchForm, destinationName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold"
              >
                <option value="Golaghat Cluster Aggregation Depot">Golaghat Cluster Aggregation Depot</option>
                <option value="Hojai Central Aggregation Depot">Hojai Central Aggregation Depot</option>
                <option value="Kadamtala Hub Aggregation Depot">Kadamtala Hub Aggregation Depot</option>
                <option value="NERAMAC CPC Golaghat">NERAMAC CPC Golaghat (Direct Route)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Transit Pass No.</label>
              <input
                type="text"
                value={dispatchForm.transitPassNumber}
                onChange={(e) => setDispatchForm({ ...dispatchForm, transitPassNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Vehicle Registration</label>
              <input
                type="text"
                value={dispatchForm.vehicleNumber}
                onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Dispatch Scale (kg)</label>
              <input
                type="number"
                step="0.1"
                value={dispatchForm.dispatchWeightKg}
                onChange={(e) => setDispatchForm({ ...dispatchForm, dispatchWeightKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDispatchModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
            >
              Confirm Dispatch
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Receipt & Weighment Modal */}
      {receiveTarget && (
        <Modal
          isOpen={isReceiveModalOpen}
          onClose={() => {
            setIsReceiveModalOpen(false);
            setReceiveTarget(null);
          }}
          title={`Confirm Gate Receipt: ${receiveTarget.id}`}
          subtitle={`Dispatch Weight: ${receiveTarget.dispatchWeightKg} kg • Carrier: ${receiveTarget.vehicleNumber}`}
        >
          <form onSubmit={handleReceiveSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Weighbridge Received Weight (kg) *</label>
              <input
                type="number"
                step="0.05"
                required
                value={receivedWeightInput}
                onChange={(e) => setReceivedWeightInput(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg text-base font-extrabold text-slate-900"
              />
            </div>

            {/* Live Tolerance Calculation Preview */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between font-semibold text-slate-600">
                <span>Calculated Transit Variance:</span>
                <span className="font-bold text-slate-900">
                  {(receivedWeightInput - receiveTarget.dispatchWeightKg).toFixed(2)} kg (
                  {(((receivedWeightInput - receiveTarget.dispatchWeightKg) / receiveTarget.dispatchWeightKg) * 100).toFixed(2)}%)
                </span>
              </div>
              <div className="text-[11px] font-bold">
                {Math.abs(((receivedWeightInput - receiveTarget.dispatchWeightKg) / receiveTarget.dispatchWeightKg) * 100) <= 1.5 ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    PASSES gate tolerance requirement (&le; 1.5% natural moisture loss)
                  </span>
                ) : (
                  <span className="text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    EXCEEDS statutory tolerance limit (&gt; 1.5%) - Consignment will be flagged!
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsReceiveModalOpen(false)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
              >
                Accept Consignment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
