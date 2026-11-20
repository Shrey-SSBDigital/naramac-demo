import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { PlaneTakeoff, Plus, Globe2, FileCheck2, ShieldCheck } from 'lucide-react';

export default function ExportModule() {
  const { exportBatches, createExportBatch, finishedProducts } = useEnterprise();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Available finished products in stock
  const availablePacks = finishedProducts.filter(p => p.status === 'IN_VAULT_STOCK');

  const [form, setForm] = useState({
    batchCode: `EXP/NER/2026/DXB-${Math.floor(10 + Math.random() * 90)}`,
    destinationCountry: 'United Arab Emirates',
    destinationPort: 'Dubai International Airport Cargo Terminal (DXB)',
    consigneeName: 'Dubai Royal Fragrances LLC',
    consigneeAddress: 'Building 4, Al Quoz Industrial Area 3, Dubai, UAE',
    citesPermitNumber: 'CITES/IN/2026/EXP-441',
    dgftLicenseNumber: 'DGFT/0588019234/EXP/2026',
    customsShippingBillNo: `SB-${Math.floor(1000000 + Math.random() * 9000000)}-CC-KOL`,
    totalPackCount: 4,
    packSerialNumbers: ['PCK-NER-2026-017', 'PCK-NER-2026-018'],
    totalVolumeMl: 48.0,
    commercialInvoiceValueUSD: 18000.0,
    exporterEntity: 'North Eastern Regional Agricultural Marketing Corporation Ltd (NERAMAC)'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createExportBatch(form);
    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Export Batch Code',
      accessor: 'id',
      render: (e) => (
        <div>
          <span className="font-extrabold text-slate-900 font-mono text-xs">{e.id}</span>
          <div className="text-[10px] text-slate-500 font-mono">{e.batchCode}</div>
        </div>
      )
    },
    {
      header: 'Destination & Consignee',
      accessor: 'consigneeName',
      render: (e) => (
        <div>
          <span className="font-bold text-slate-800">{e.consigneeName}</span>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Globe2 className="w-3 h-3 text-slate-400" />
            <span>{e.destinationCountry} ({e.destinationPort})</span>
          </div>
        </div>
      )
    },
    {
      header: 'Pack Volume & Value',
      accessor: 'totalVolumeMl',
      render: (e) => (
        <div>
          <span className="font-black text-emerald-800 text-xs">{e.totalPackCount} Packs ({e.totalVolumeMl} ml)</span>
          <div className="text-[11px] text-slate-700 font-bold">USD ${e.commercialInvoiceValueUSD?.toLocaleString()}</div>
        </div>
      )
    },
    {
      header: 'CITES & DGFT Clearance',
      accessor: 'citesPermitNumber',
      render: (e) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-800">{e.citesPermitNumber}</span>
          <div className="text-[10px] text-slate-400 font-mono">{e.customsShippingBillNo}</div>
        </div>
      )
    },
    {
      header: 'Export Status',
      accessor: 'exportStatus',
      render: (e) => <StatusBadge status={e.exportStatus} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (e) => (
        <button
          onClick={(ev) => {
            ev.stopPropagation();
            setSelectedBatch(e);
          }}
          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
        >
          Packing List
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
            <span>Export Batch Management & CITES Clearance</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 13
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Grouping finished serialized packs into commercial export lots under DGFT and CITES Appendix II export quotas.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
        >
          <PlaneTakeoff className="w-4 h-4" />
          <span>Create Export Batch</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={exportBatches}
        searchKey="consigneeName"
        searchPlaceholder="Search export batches by consignee, destination country, or CITES permit..."
        onRowClick={(e) => setSelectedBatch(e)}
      />

      {/* Detail Modal */}
      {selectedBatch && (
        <Modal
          isOpen={!!selectedBatch}
          onClose={() => setSelectedBatch(null)}
          title={`Export Lot Packing List: ${selectedBatch.id}`}
          subtitle={`Consignee: ${selectedBatch.consigneeName} • ${selectedBatch.destinationCountry}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Consignee Address</span>
                <div className="font-semibold text-slate-900">{selectedBatch.consigneeAddress}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Commercial Invoice</span>
                <div className="text-base font-black text-emerald-800">USD ${selectedBatch.commercialInvoiceValueUSD?.toLocaleString()}</div>
                <div className="text-[11px] text-slate-500">{selectedBatch.totalPackCount} Bottles ({selectedBatch.totalVolumeMl} ml)</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Serialized Pack Manifest (Full Provenance)
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {selectedBatch.packSerialNumbers?.map(sNo => (
                  <span key={sNo} className="font-mono text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded">
                    {sNo}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close Manifest
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Export Batch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Form Export Batch (CITES Allocation)"
        subtitle="Consolidate serialized vault flacons into an approved export consignment"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Destination Country *</label>
              <select
                value={form.destinationCountry}
                onChange={(e) => setForm({ ...form, destinationCountry: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold"
              >
                <option value="United Arab Emirates">United Arab Emirates (Dubai)</option>
                <option value="France">France (Paris)</option>
                <option value="Saudi Arabia">Saudi Arabia (Riyadh)</option>
                <option value="Japan">Japan (Tokyo)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Consignee Buyer Name *</label>
              <input
                type="text"
                required
                value={form.consigneeName}
                onChange={(e) => setForm({ ...form, consigneeName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">CITES Export Permit No. *</label>
              <input
                type="text"
                required
                value={form.citesPermitNumber}
                onChange={(e) => setForm({ ...form, citesPermitNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Invoice Value (USD) *</label>
              <input
                type="number"
                step="500"
                required
                value={form.commercialInvoiceValueUSD}
                onChange={(e) => setForm({ ...form, commercialInvoiceValueUSD: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg font-bold text-emerald-800"
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
              Create Export Batch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
