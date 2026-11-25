import React, { useState, useMemo } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { PlaneTakeoff, Plus, Globe2, FileCheck2, ShieldCheck, Boxes, Check, PackageCheck } from 'lucide-react';

export default function ExportModule() {
  const { exportBatches, createExportBatch, finishedProducts, addToast, activeRole } = useEnterprise();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Available finished products in stock (not yet in an export batch)
  const availablePacks = useMemo(() => {
    const vault = finishedProducts.filter(p => p.status === 'IN_VAULT_STOCK' || p.channel === 'INVENTORY' || !p.exportBatchId);
    return vault.length ? vault : finishedProducts;
  }, [finishedProducts]);

  const [selectedPackIds, setSelectedPackIds] = useState(() => {
    return availablePacks.slice(0, 2).map(p => p.serialNumber);
  });

  const selectedPackObjects = useMemo(() => {
    return availablePacks.filter(p => selectedPackIds.includes(p.serialNumber));
  }, [availablePacks, selectedPackIds]);

  const calculatedTotalVolume = useMemo(() => {
    return selectedPackObjects.reduce((acc, p) => acc + (p.volumeMl || 12.0), 0);
  }, [selectedPackObjects]);

  const calculatedTotalValueUSD = useMemo(() => {
    return selectedPackObjects.reduce((acc, p) => acc + Math.round((p.volumeMl || 12.0) * 375), 0);
  }, [selectedPackObjects]);

  const togglePack = (sNo) => {
    setSelectedPackIds(prev =>
      prev.includes(sNo) ? prev.filter(id => id !== sNo) : [...prev, sNo]
    );
  };

  const [form, setForm] = useState({
    batchCode: `EXP/NER/2026/DXB-${Math.floor(10 + Math.random() * 90)}`,
    destinationCountry: 'United Arab Emirates',
    destinationPort: 'Dubai International Airport Cargo Terminal (DXB)',
    consigneeName: 'Dubai Royal Fragrances LLC',
    consigneeAddress: 'Building 4, Al Quoz Industrial Area 3, Dubai, UAE',
    citesPermitNumber: 'CITES/IN/2026/EXP-441',
    dgftLicenseNumber: 'DGFT/0588019234/EXP/2026',
    customsShippingBillNo: `SB-${Math.floor(1000000 + Math.random() * 9000000)}-CC-KOL`,
    exporterEntity: 'North Eastern Regional Agricultural Marketing Corporation Ltd (NERAMAC)'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPackIds.length === 0) {
      addToast?.('Please select at least one finished product flacon for export', 'warning');
      return;
    }
    createExportBatch({
      ...form,
      totalPackCount: selectedPackIds.length,
      packSerialNumbers: selectedPackIds,
      totalVolumeMl: calculatedTotalVolume,
      commercialInvoiceValueUSD: calculatedTotalValueUSD
    });
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

        {activeRole !== 'NERAMAC_ADMIN' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
          >
            <PlaneTakeoff className="w-4 h-4" />
            <span>Create Export Batch</span>
          </button>
        )}
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
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Destination Country *</label>
              <select
                value={form.destinationCountry}
                onChange={(e) => setForm({ ...form, destinationCountry: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold bg-white"
              >
                <option value="United Arab Emirates">United Arab Emirates (Dubai - DXB)</option>
                <option value="France">France (Paris - CDG)</option>
                <option value="Saudi Arabia">Saudi Arabia (Riyadh - RUH)</option>
                <option value="Japan">Japan (Tokyo - HND)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Consignee Buyer Name *</label>
              <input
                type="text"
                required
                value={form.consigneeName}
                onChange={(e) => setForm({ ...form, consigneeName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold bg-white"
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
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Customs Shipping Bill No. *</label>
              <input
                type="text"
                required
                value={form.customsShippingBillNo}
                onChange={(e) => setForm({ ...form, customsShippingBillNo: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold bg-white"
              />
            </div>
          </div>

          {/* Select Finished Products from Vault Stock */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-[11px] font-black text-slate-900 flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Select Finished Products / Flacons from Vault Stock *</span>
                </label>
                <span className="text-[10px] text-slate-500">
                  Choose serialized 12ml / 24ml flacons to consolidate into this export lot
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

            {/* Product Selection Table */}
            <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-lg bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-3 w-8">Select</th>
                    <th className="py-2 px-3">Pack Serial</th>
                    <th className="py-2 px-3">Grade & Oil Spec</th>
                    <th className="py-2 px-3 text-right">Volume</th>
                    <th className="py-2 px-3 text-right">Unit Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {availablePacks.map((pack) => {
                    const isSelected = selectedPackIds.includes(pack.serialNumber);
                    const vol = pack.volumeMl || 12.0;
                    const valUsd = Math.round(vol * 375);
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
                          <div>{pack.productName || 'Assam Organic Oud Oil'}</div>
                          <div className="text-[10px] text-slate-500">Grade: {pack.resinGrade || 'Royal Super Triple-A'}</div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          {vol.toFixed(1)} ml
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">
                          ${valUsd.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  {availablePacks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                        No finished product flacons currently in vault stock. Bottle oil in Module 12 first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Selected Summary HUD */}
            <div className="p-2.5 bg-emerald-50/80 rounded-lg border border-emerald-200 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Selected Flacons</span>
                <span className="text-sm font-black text-emerald-900 font-mono">
                  {selectedPackIds.length} <span className="text-[10px] font-normal">units</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Consignment Volume</span>
                <span className="text-sm font-black text-emerald-900 font-mono">
                  {calculatedTotalVolume.toFixed(1)} <span className="text-[10px] font-normal">ml</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Export Invoice Value</span>
                <span className="text-sm font-black text-emerald-900 font-mono">
                  ${calculatedTotalValueUSD.toLocaleString()} <span className="text-[10px] font-normal">USD</span>
                </span>
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
              <PackageCheck className="w-4 h-4" />
              <span>Create Export Batch ({selectedPackIds.length} Flacons)</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
