import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { Ship, Plane, Plus, ShieldCheck, Truck, ExternalLink } from 'lucide-react';

export default function ShipmentModule() {
  const { shipmentLots, createShipmentLot, exportBatches } = useEnterprise();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    createShipmentLot(form);
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
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Source Export Batch *</label>
            <select
              value={form.exportBatchId}
              onChange={(e) => setForm({ ...form, exportBatchId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
            >
              {exportBatches.map(b => (
                <option key={b.id} value={b.id}>{b.id} ({b.consigneeName}, {b.destinationCountry})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Air Carrier / Flight *</label>
              <input
                type="text"
                required
                value={form.carrier}
                onChange={(e) => setForm({ ...form, carrier: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Air Waybill Number (AWB) *</label>
              <input
                type="text"
                required
                value={form.airWaybillNumber}
                onChange={(e) => setForm({ ...form, airWaybillNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-emerald-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Departure Airport</label>
              <input
                type="text"
                value={form.portOfLoading}
                onChange={(e) => setForm({ ...form, portOfLoading: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Destination Airport</label>
              <input
                type="text"
                value={form.portOfDischarge}
                onChange={(e) => setForm({ ...form, portOfDischarge: e.target.value })}
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
              Authorize Dispatch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
