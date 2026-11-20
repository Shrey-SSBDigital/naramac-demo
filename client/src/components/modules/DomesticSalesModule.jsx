import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { Store, Plus, FileText, CheckCircle2 } from 'lucide-react';

export default function DomesticSalesModule() {
  const { domesticSales, createDomesticSale, finishedProducts } = useEnterprise();
  const [selectedSale, setSelectedSale] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    buyerName: 'Kannauj Traditional Attar & Distillers',
    gstin: '09AAACK4412B1Z4',
    buyerCity: 'Kannauj',
    buyerState: 'Uttar Pradesh',
    contactPerson: 'Vipul Tandon',
    phone: '+91 94150 33412',
    productDescription: 'NERAMAC Heritage Assam Oud 12ml Serialized Packs',
    packSerialNumbers: ['PCK-NER-2026-019', 'PCK-NER-2026-020'],
    quantityFlacons: 2,
    totalVolumeMl: 24.0,
    unitPriceInr: 24000,
    taxableAmountInr: 48000,
    gst18Inr: 8640,
    totalInvoiceInr: 56640
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createDomesticSale(form);
    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Invoice & Order ID',
      accessor: 'id',
      render: (d) => (
        <div>
          <span className="font-extrabold text-slate-900 font-mono text-xs">{d.id}</span>
          <div className="text-[10px] text-slate-500 font-mono">{d.invoiceNumber}</div>
        </div>
      )
    },
    {
      header: 'Domestic Buyer & City',
      accessor: 'buyerName',
      render: (d) => (
        <div>
          <span className="font-bold text-slate-800">{d.buyerName}</span>
          <div className="text-[11px] text-slate-500">{d.buyerCity}, {d.buyerState} (GST: {d.gstin})</div>
        </div>
      )
    },
    {
      header: 'Quantity & Flacons',
      accessor: 'quantityFlacons',
      render: (d) => (
        <div>
          <span className="font-bold text-slate-900">{d.quantityFlacons} Flacons ({d.totalVolumeMl} ml)</span>
          <div className="text-[10px] text-slate-400 font-mono">{d.packSerialNumbers?.join(', ')}</div>
        </div>
      )
    },
    {
      header: 'Invoice Value (INR)',
      accessor: 'totalInvoiceInr',
      render: (d) => (
        <div>
          <div className="font-black text-slate-900 text-xs">
            ₹ {d.totalInvoiceInr?.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Incl. 18% GST (₹ {d.gst18Inr?.toLocaleString('en-IN')})</div>
        </div>
      )
    },
    {
      header: 'Delivery Status',
      accessor: 'deliveryStatus',
      render: (d) => <StatusBadge status={d.deliveryStatus} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (d) => (
        <button
          onClick={(ev) => {
            ev.stopPropagation();
            setSelectedSale(d);
          }}
          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
        >
          GST Invoice
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
            <span>Domestic Attar & Perfumery Sales</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 15
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Commercial invoicing, GST compliance, and domestic transit permits for perfumeries in Kannauj, Mumbai, and Lucknow.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
        >
          <Store className="w-4 h-4" />
          <span>New Domestic Sale</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={domesticSales}
        searchKey="buyerName"
        searchPlaceholder="Search domestic orders by buyer, city, or invoice..."
        onRowClick={(d) => setSelectedSale(d)}
      />

      {/* GST Invoice Modal */}
      {selectedSale && (
        <Modal
          isOpen={!!selectedSale}
          onClose={() => setSelectedSale(null)}
          title={`Tax Invoice: ${selectedSale.invoiceNumber}`}
          subtitle={`Buyer: ${selectedSale.buyerName} • GSTIN: ${selectedSale.gstin}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-extrabold text-slate-900 text-xs">Commercial Billing Summary</span>
                <span className="font-mono text-xs font-bold text-emerald-800">Order: {selectedSale.id}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Buyer Details</span>
                  <div className="font-bold text-slate-900">{selectedSale.buyerName}</div>
                  <div className="text-[11px] text-slate-500">{selectedSale.buyerCity}, {selectedSale.buyerState}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Courier Tracking</span>
                  <div className="font-mono font-bold text-slate-800">{selectedSale.courierTrackingNo}</div>
                  <div className="text-[11px] text-emerald-700 font-bold">{selectedSale.deliveryStatus}</div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Taxable Value:</span>
                <span className="font-bold text-slate-900">₹ {selectedSale.taxableAmountInr?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">IGST / CGST+SGST (18%):</span>
                <span className="font-bold text-slate-900">₹ {selectedSale.gst18Inr?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-black text-slate-900">
                <span>Total Invoice Value:</span>
                <span className="text-emerald-800">₹ {selectedSale.totalInvoiceInr?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSale(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close Invoice
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Sale Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Domestic Perfumery Sale"
        subtitle="Issues GST Tax Invoice and reallocates serialized flacons"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Perfumery House / Buyer *</label>
              <input
                type="text"
                required
                value={form.buyerName}
                onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Buyer GSTIN *</label>
              <input
                type="text"
                required
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">City / State</label>
              <input
                type="text"
                value={`${form.buyerCity}, ${form.buyerState}`}
                onChange={(e) => setForm({ ...form, buyerCity: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Quantity (Flacons)</label>
              <input
                type="number"
                value={form.quantityFlacons}
                onChange={(e) => setForm({ ...form, quantityFlacons: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
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
              Create Domestic Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
