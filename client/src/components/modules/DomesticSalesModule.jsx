import React, { useState, useMemo } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { Store, Plus, FileText, CheckCircle2, Boxes, PackageCheck, Receipt } from 'lucide-react';

export default function DomesticSalesModule() {
  const { domesticSales, createDomesticSale, finishedProducts, addToast, activeRole } = useEnterprise();
  const [selectedSale, setSelectedSale] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Available finished products in stock (not sold domestically or dispatched for export)
  const availablePacks = useMemo(() => {
    const vault = finishedProducts.filter(p => p.status === 'IN_VAULT_STOCK' || p.channel === 'INVENTORY' || !p.domesticSaleId);
    return vault.length ? vault : finishedProducts;
  }, [finishedProducts]);

  const [selectedPackIds, setSelectedPackIds] = useState(() => {
    return availablePacks.slice(0, 1).map(p => p.serialNumber);
  });

  const selectedPackObjects = useMemo(() => {
    return availablePacks.filter(p => selectedPackIds.includes(p.serialNumber));
  }, [availablePacks, selectedPackIds]);

  const calculatedTotalVolume = useMemo(() => {
    return selectedPackObjects.reduce((acc, p) => acc + (p.volumeMl || 12.0), 0);
  }, [selectedPackObjects]);

  const taxableAmountInr = useMemo(() => {
    return selectedPackObjects.reduce((acc, p) => acc + Math.round(((p.volumeMl || 12.0) / 12.0) * 24000), 0);
  }, [selectedPackObjects]);

  const gst18Inr = useMemo(() => {
    return Math.round(taxableAmountInr * 0.18);
  }, [taxableAmountInr]);

  const totalInvoiceInr = useMemo(() => {
    return taxableAmountInr + gst18Inr;
  }, [taxableAmountInr, gst18Inr]);

  const togglePack = (sNo) => {
    setSelectedPackIds(prev =>
      prev.includes(sNo) ? prev.filter(id => id !== sNo) : [...prev, sNo]
    );
  };

  const [form, setForm] = useState({
    buyerName: 'Kannauj Traditional Attar & Distillers',
    gstin: '09AAACK4412B1Z4',
    buyerCity: 'Kannauj',
    buyerState: 'Uttar Pradesh',
    contactPerson: 'Vipul Tandon',
    phone: '+91 94150 33412',
    productDescription: 'NERAMAC Heritage Assam Oud 12ml Serialized Packs'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPackIds.length === 0) {
      addToast?.('Please select at least one finished product flacon for domestic sale', 'warning');
      return;
    }
    createDomesticSale({
      ...form,
      packSerialNumbers: selectedPackIds,
      quantityFlacons: selectedPackIds.length,
      totalVolumeMl: calculatedTotalVolume,
      unitPriceInr: 24000,
      taxableAmountInr,
      gst18Inr,
      totalInvoiceInr
    });
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

        {activeRole !== 'NERAMAC_ADMIN' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
          >
            <Store className="w-4 h-4" />
            <span>New Domestic Sale</span>
          </button>
        )}
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
        maxWidth="max-w-2xl"
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
                className="w-full px-3 py-2 border rounded-lg font-bold bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Buyer GSTIN *</label>
              <input
                type="text"
                required
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Destination City & State *</label>
              <input
                type="text"
                required
                value={`${form.buyerCity}, ${form.buyerState}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setForm({ ...form, buyerCity: parts[0]?.trim() || '', buyerState: parts[1]?.trim() || '' });
                }}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                placeholder="e.g. Kannauj, Uttar Pradesh"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Person & Phone</label>
              <input
                type="text"
                value={`${form.contactPerson} (${form.phone})`}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              />
            </div>
          </div>

          {/* Select Finished Products from Inventory */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-[11px] font-black text-slate-900 flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Select Flacons from Vault Inventory *</span>
                </label>
                <span className="text-[10px] text-slate-500">
                  Select available serialized flacons to invoice under domestic GST
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedPackIds(availablePacks.map(p => p.serialNumber))}
                  className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                >
                  Select All ({availablePacks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPackIds([])}
                  className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100 rounded border border-slate-200 transition"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Pack Selection Table */}
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-3 w-8">Select</th>
                    <th className="py-2 px-3">Pack Serial</th>
                    <th className="py-2 px-3">Product Name & Grade</th>
                    <th className="py-2 px-3 text-right">Volume</th>
                    <th className="py-2 px-3 text-right">Base Price (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {availablePacks.map((pack) => {
                    const isSelected = selectedPackIds.includes(pack.serialNumber);
                    const vol = pack.volumeMl || 12.0;
                    const priceInr = Math.round((vol / 12.0) * 24000);
                    return (
                      <tr
                        key={pack.serialNumber}
                        onClick={() => togglePack(pack.serialNumber)}
                        className={`cursor-pointer transition hover:bg-slate-50 ${
                          isSelected ? 'bg-emerald-50/70 font-semibold text-emerald-950' : 'text-slate-700'
                        }`}
                      >
                        <td className="py-2 px-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePack(pack.serialNumber)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                          />
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          {pack.serialNumber}
                        </td>
                        <td className="py-2 px-3">
                          <div>{pack.productName || 'Heritage Assam Oud Oil'}</div>
                          <div className="text-[10px] text-slate-500">Grade: {pack.resinGrade || 'Royal Super Triple-A'}</div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          {vol.toFixed(1)} ml
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                          ₹{priceInr.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                  {availablePacks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                        No finished product flacons currently in stock. Bottle oil in Module 12 first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Tax Summary Card */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Selected Items ({selectedPackIds.length} Flacons, {calculatedTotalVolume.toFixed(1)} ml):</span>
                <span className="font-bold text-slate-900">₹ {taxableAmountInr.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST @ 18% (CGST 9% + SGST 9% / IGST):</span>
                <span className="font-bold text-slate-900">₹ {gst18Inr.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 text-xs font-black text-emerald-950 font-sans">
                <span>Total Tax Invoice Value:</span>
                <span className="font-mono text-emerald-800 text-sm">₹ {totalInvoiceInr.toLocaleString('en-IN')}</span>
              </div>
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
              disabled={selectedPackIds.length === 0}
              className={`px-4 py-2 rounded-xl font-bold shadow-xs transition flex items-center gap-1.5 ${
                selectedPackIds.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Generate Tax Invoice ({selectedPackIds.length} Flacons)</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
