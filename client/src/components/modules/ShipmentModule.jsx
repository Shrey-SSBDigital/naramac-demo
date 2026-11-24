import React, { useState, useMemo } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { Ship, Plane, Plus, ShieldCheck, Truck, ExternalLink, Boxes, PackageCheck, FileCheck } from 'lucide-react';

export default function ShipmentModule() {
  const { shipmentLots, createShipmentLot, exportBatches, finishedProducts, addToast } = useEnterprise();
  const [selectedLot, setSelectedLot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    exportBatchId: 'EBT-2026-DXB-01',
    carrier: 'Air India Cargo (Flight AI-995)',
    airWaybillNumber: `098-${Math.floor(10000000 + Math.random() * 90000000)}`,
    portOfLoading: 'Lokpriya Gopinath Bordoloi Airport, Guwahati (GAU)',
    portOfDischarge: 'Dubai International (DXB)',
    cartonCount: 2,
    grossWeightKg: 14.5,
    consigneeBuyer: 'Dubai Royal Fragrances LLC'
  });

  const selectedBatch = useMemo(() => {
    return exportBatches.find(b => b.id === form.exportBatchId) || exportBatches[0];
  }, [exportBatches, form.exportBatchId]);

  const batchPacks = useMemo(() => {
    if (!selectedBatch?.packSerialNumbers) return [];
    return selectedBatch.packSerialNumbers.map(sNo => {
      const prod = finishedProducts.find(p => p.serialNumber === sNo);
      return prod || {
        serialNumber: sNo,
        productName: 'NERAMAC Heritage Assam Oud',
        volumeMl: 12.0,
        resinGrade: 'Royal Super Triple-A'
      };
    });
  }, [selectedBatch, finishedProducts]);

  const handleBatchSelect = (batchId) => {
    const b = exportBatches.find(x => x.id === batchId);
    setForm(prev => ({
      ...prev,
      exportBatchId: batchId,
      consigneeBuyer: b?.consigneeName || prev.consigneeBuyer,
      portOfDischarge: b?.destinationPort ? `${b.destinationPort}` : prev.portOfDischarge,
      grossWeightKg: b?.totalPackCount ? (b.totalPackCount * 2.5 + 4.5) : prev.grossWeightKg
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createShipmentLot({
      ...form,
      totalPackCount: selectedBatch?.totalPackCount || batchPacks.length,
      totalVolumeMl: selectedBatch?.totalVolumeMl || (batchPacks.length * 12.0),
      packSerialNumbers: selectedBatch?.packSerialNumbers || batchPacks.map(p => p.serialNumber)
    });
    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Terminal Lot ID',
      accessor: 'id',
      render: (s) => (
        <div>
          <span className="font-extrabold text-slate-900 font-mono text-xs">{s.id}</span>
          <div className="text-[10px] text-slate-500 font-mono">{s.dispatchDate}</div>
        </div>
      )
    },
    {
      header: 'Air Waybill (AWB) & Carrier',
      accessor: 'airWaybillNumber',
      render: (s) => (
        <div>
          <span className="font-mono text-xs font-bold text-emerald-800">{s.airWaybillNumber}</span>
          <div className="text-[11px] text-slate-600">{s.carrier}</div>
        </div>
      )
    },
    {
      header: 'Origin & Destination Ports',
      accessor: 'portOfLoading',
      render: (s) => (
        <div>
          <span className="font-bold text-slate-900">{s.portOfLoading}</span>
          <div className="text-[11px] text-slate-500">→ {s.portOfDischarge}</div>
        </div>
      )
    },
    {
      header: 'Consignee Buyer',
      accessor: 'consigneeBuyer',
      render: (s) => (
        <span className="font-semibold text-slate-800 text-xs">
          {s.consigneeBuyer}
        </span>
      )
    },
    {
      header: 'Cartons & Weight',
      accessor: 'grossWeightKg',
      render: (s) => (
        <div>
          <span className="font-bold text-slate-900">{s.cartonCount} Cartons</span>
          <div className="text-[10px] text-slate-500">{s.grossWeightKg} kg Gross</div>
        </div>
      )
    },
    {
      header: 'Flight Status',
      accessor: 'trackingStatus',
      render: (s) => <StatusBadge status={s.trackingStatus} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (s) => (
        <button
          onClick={(ev) => {
            ev.stopPropagation();
            setSelectedLot(s);
          }}
          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
        >
          Track Cargo
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
            <span>Shipment Lots & International Cargo Dispatch</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 14
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical shipping lots (ELT), Air Waybill tracking, customs seal verification, and international cargo dispatch.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
        >
          <Plane className="w-4 h-4" />
          <span>Dispatch Shipment Lot</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={shipmentLots}
        searchKey="airWaybillNumber"
        searchPlaceholder="Search shipment lots by AWB, carrier, or buyer..."
        onRowClick={(s) => setSelectedLot(s)}
      />

      {/* Detail Modal */}
      {selectedLot && (
        <Modal
          isOpen={!!selectedLot}
          onClose={() => setSelectedLot(null)}
          title={`Air Cargo Waybill: ${selectedLot.airWaybillNumber}`}
          subtitle={`Terminal Lot: ${selectedLot.id} • Carrier: ${selectedLot.carrier}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Port of Departure</span>
                <div className="font-extrabold text-slate-900">{selectedLot.portOfLoading}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Destination Airport</span>
                <div className="font-extrabold text-emerald-900">{selectedLot.portOfDischarge}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Consignee Buyer</span>
                <div className="font-semibold text-slate-800">{selectedLot.consigneeBuyer}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Flight Manifest Status</span>
                <div><StatusBadge status={selectedLot.trackingStatus} /></div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tamper-Evident Cargo Container Seals
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedLot.tamperSealNumbers?.map(seal => (
                  <span key={seal} className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                    {seal}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLot(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Dispatch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Dispatch Terminal Cargo Lot"
        subtitle="Issues Air Waybill (AWB) and links tamper container seals"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Source Export Batch *</label>
            <select
              value={form.exportBatchId}
              onChange={(e) => handleBatchSelect(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg font-mono font-bold bg-white"
            >
              {exportBatches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.id} • {b.consigneeName} ({b.destinationCountry}) • {b.totalPackCount || b.packSerialNumbers?.length || 0} Flacons (${b.commercialInvoiceValueUSD?.toLocaleString()} USD)
                </option>
              ))}
            </select>
          </div>

          {/* Linked Export Batch Cargo Breakdown Preview */}
          {selectedBatch && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Boxes className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Consignment Cargo Manifest ({selectedBatch.id})</span>
                </span>
                <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">
                  CITES: {selectedBatch.citesPermitNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-500 block uppercase font-bold">Consignee Buyer</span>
                  <span className="font-bold text-slate-900 block truncate">{selectedBatch.consigneeName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold">Destination</span>
                  <span className="font-bold text-slate-900 block truncate">{selectedBatch.destinationCountry} ({selectedBatch.destinationPort})</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold">Consignment Volume</span>
                  <span className="font-bold text-emerald-800 font-mono block">
                    {selectedBatch.totalPackCount || batchPacks.length} Flacons ({selectedBatch.totalVolumeMl} ml)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold">Invoice Value</span>
                  <span className="font-bold text-emerald-800 font-mono block">
                    ${selectedBatch.commercialInvoiceValueUSD?.toLocaleString()} USD
                  </span>
                </div>
              </div>

              {/* Table of Individual Packs Inside Batch */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-36 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
                    <tr>
                      <th className="py-1.5 px-3">Pack Serial</th>
                      <th className="py-1.5 px-3">Grade Specification</th>
                      <th className="py-1.5 px-3 text-right">Volume</th>
                      <th className="py-1.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {batchPacks.map((pack) => (
                      <tr key={pack.serialNumber} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 font-mono font-bold text-slate-900">
                          {pack.serialNumber}
                        </td>
                        <td className="py-1.5 px-3 text-slate-700">
                          {pack.productName || 'Assam Organic Oud Oil'} ({pack.resinGrade || 'Royal Super'})
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-800">
                          {(pack.volumeMl || 12.0).toFixed(1)} ml
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            EXPORT_READY
                          </span>
                        </td>
                      </tr>
                    ))}
                    {batchPacks.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-3 text-center text-slate-400 italic">
                          No serialized flacons linked to this export batch.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Air Carrier / Flight *</label>
              <input
                type="text"
                required
                value={form.carrier}
                onChange={(e) => setForm({ ...form, carrier: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Air Waybill Number (AWB) *</label>
              <input
                type="text"
                required
                value={form.airWaybillNumber}
                onChange={(e) => setForm({ ...form, airWaybillNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-emerald-800 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Port of Loading (Departure)</label>
              <input
                type="text"
                value={form.portOfLoading}
                onChange={(e) => setForm({ ...form, portOfLoading: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Port of Discharge (Destination)</label>
              <input
                type="text"
                value={form.portOfDischarge}
                onChange={(e) => setForm({ ...form, portOfDischarge: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Carton Count *</label>
              <input
                type="number"
                min="1"
                required
                value={form.cartonCount}
                onChange={(e) => setForm({ ...form, cartonCount: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded-lg font-bold bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Gross Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                required
                value={form.grossWeightKg}
                onChange={(e) => setForm({ ...form, grossWeightKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg font-bold bg-white"
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plane className="w-4 h-4" />
              <span>Authorize Cargo Dispatch</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
