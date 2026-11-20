import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { Boxes, Plus, GitMerge, ArrowRight } from 'lucide-react';

export default function AggregationModule() {
  const { aggregations, createAggregation, harvestBatches } = useEnterprise();
  const [selectedAgg, setSelectedAgg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Poolable batches: in stock or ready for dispatch
  const poolableBatches = harvestBatches.filter(b => b.status === 'READY_FOR_DISPATCH' || b.status === 'IN_STOCK');

  const [form, setForm] = useState({
    cluster: 'Golaghat Cluster',
    depotName: 'Golaghat Cluster Aggregation Depot',
    depotId: 'DEPOT-GLT-01',
    parentBatchIds: ['HBT-AS-2026-005', 'HBT-AS-2026-006'],
    totalWeightKg: 71.7,
    uniformResinGrade: 'GRADE_A_DARK_RESIN',
    chippingSpecification: '2mm - 4mm Distillation Flakes',
    storageBay: 'Bay-3',
    destinationCPC: 'CPC-GLT-01',
    supervisor: 'B. C. Kalita (Depot Superintendent)'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createAggregation({
      ...form,
      parentDetails: form.parentBatchIds.map(id => {
        const b = harvestBatches.find(hb => hb.id === id);
        return {
          batchId: id,
          farmer: b?.farmerName || 'Registered Grower',
          weightKg: b?.netWeightKg || 35.0,
          resinGrade: b?.resinGrade || 'GRADE_A_DARK_RESIN'
        };
      })
    });
    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Aggregation Batch ID',
      accessor: 'id',
      render: (a) => (
        <div>
          <span className="font-extrabold text-slate-900 font-mono text-xs">{a.id}</span>
          <div className="text-[10px] text-slate-500 font-mono">{a.aggregationDate}</div>
        </div>
      )
    },
    {
      header: 'Depot Facility',
      accessor: 'depotName',
      render: (a) => (
        <div>
          <span className="font-bold text-slate-800">{a.depotName}</span>
          <div className="text-[11px] text-slate-500">{a.storageBay}</div>
        </div>
      )
    },
    {
      header: 'Genealogy Parents',
      accessor: 'parentBatchIds',
      render: (a) => (
        <div className="flex flex-wrap gap-1">
          {a.parentBatchIds.map(pId => (
            <span key={pId} className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              {pId}
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Total Weight',
      accessor: 'totalWeightKg',
      render: (a) => (
        <div>
          <span className="font-black text-slate-900">{a.totalWeightKg} kg</span>
          <div className="text-[10px] text-slate-500">{a.chippingSpecification}</div>
        </div>
      )
    },
    {
      header: 'Resin Classification',
      accessor: 'uniformResinGrade',
      render: (a) => (
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
          {a.uniformResinGrade.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (a) => <StatusBadge status={a.status} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (a) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedAgg(a);
          }}
          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
        >
          Genealogy
        </button>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Aggregation & Depot Consignment Pooling</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 08
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Combining multiple Harvest Batches (HBT) into uniform Aggregation Batches (AGG) while maintaining complete backward genealogy.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
        >
          <GitMerge className="w-4 h-4" />
          <span>Pool Batches into AGG</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={aggregations}
        searchKey="id"
        searchPlaceholder="Search aggregation batches by ID or facility..."
        onRowClick={(a) => setSelectedAgg(a)}
      />

      {/* Detail Modal with Parent Genealogy Breakdown */}
      {selectedAgg && (
        <Modal
          isOpen={!!selectedAgg}
          onClose={() => setSelectedAgg(null)}
          title={`Aggregation Genealogy: ${selectedAgg.id}`}
          subtitle={`Facility: ${selectedAgg.depotName} • Total Weight: ${selectedAgg.totalWeightKg} kg`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Parent Harvest Batches (Genealogy Intact)
              </span>
              <div className="mt-2 divide-y divide-slate-200">
                {selectedAgg.parentDetails?.map((parent, pIdx) => (
                  <div key={pIdx} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-emerald-900">{parent.batchId}</span>
                      <div className="text-[11px] text-slate-500">Farmer: {parent.farmer}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900">{parent.weightKg} kg</span>
                      <div className="text-[10px] text-slate-500">{parent.resinGrade}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Chipping Specification:</span>
                <span className="font-bold text-slate-900">{selectedAgg.chippingSpecification}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Destination Distillation CPC:</span>
                <span className="font-bold text-emerald-800">{selectedAgg.destinationCPC}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Depot Supervisor:</span>
                <span className="font-bold text-slate-800">{selectedAgg.supervisor}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAgg(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Pool Batches Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pool Batches into Aggregation Charge"
        subtitle="RFP Section 3.2: Parent-child relationship preserved in digital ledger"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Depot Facility</label>
            <select
              value={form.depotName}
              onChange={(e) => setForm({ ...form, depotName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg font-semibold"
            >
              <option value="Golaghat Cluster Aggregation Depot">Golaghat Cluster Aggregation Depot</option>
              <option value="Hojai Central Aggregation Depot">Hojai Central Aggregation Depot</option>
              <option value="Kadamtala Hub Aggregation Depot">Kadamtala Hub Aggregation Depot</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Pooled Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={form.totalWeightKg}
                onChange={(e) => setForm({ ...form, totalWeightKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Chipping Spec</label>
              <input
                type="text"
                value={form.chippingSpecification}
                onChange={(e) => setForm({ ...form, chippingSpecification: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
            >
              Form Aggregation Batch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
