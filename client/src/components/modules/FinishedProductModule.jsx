import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { PackageCheck, QrCode, Plus, ShieldCheck, Download, ExternalLink } from 'lucide-react';

export default function FinishedProductModule({ onOpenTraceSearch }) {
  const { finishedProducts, packageFinishedProducts, distillations } = useEnterprise();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isBottleModalOpen, setIsBottleModalOpen] = useState(false);

  const [bottleForm, setBottleForm] = useState({
    distillationRunId: 'DST-AS-2026-01',
    flaconCount: 4,
    volumeMl: 12.0
  });

  const handleBottleSubmit = (e) => {
    e.preventDefault();
    packageFinishedProducts(bottleForm.distillationRunId, bottleForm.flaconCount, bottleForm.volumeMl);
    setIsBottleModalOpen(false);
  };

  const columns = [
    {
      header: 'Serial Number',
      accessor: 'serialNumber',
      render: (p) => (
        <div>
          <span className="font-extrabold text-slate-900 font-mono text-xs">{p.serialNumber}</span>
          <div className="text-[10px] text-slate-500 font-mono">Packaged: {p.packagingDate}</div>
        </div>
      )
    },
    {
      header: 'Product Description',
      accessor: 'productName',
      render: (p) => (
        <div>
          <span className="font-bold text-slate-800">{p.productName}</span>
          <div className="text-[11px] text-emerald-800 font-semibold">{p.grade} • {p.volumeMl}ml</div>
        </div>
      )
    },
    {
      header: 'Origin & Distillation Run',
      accessor: 'distillationRunId',
      render: (p) => (
        <div>
          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            {p.distillationRunId}
          </span>
          <div className="text-[11px] text-slate-500">{p.originCluster}</div>
        </div>
      )
    },
    {
      header: 'Channel & Destination',
      accessor: 'channel',
      render: (p) => (
        <div>
          <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
            p.channel === 'EXPORT' ? 'bg-blue-100 text-blue-800' : p.channel === 'DOMESTIC' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
          }`}>
            {p.channel}
          </span>
          <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{p.destinationBuyer || 'In Vault'}</div>
        </div>
      )
    },
    {
      header: 'MRP Valuation',
      accessor: 'mrpInr',
      render: (p) => (
        <span className="font-mono text-xs font-bold text-slate-800">
          ₹ {p.mrpInr?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (p) => <StatusBadge status={p.status} />
    },
    {
      header: 'Action',
      accessor: 'serialNumber',
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(p);
            }}
            className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenTraceSearch(p.serialNumber);
            }}
            className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Trace
          </button>
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
            <span>Finished Products & Tamper-Evident QR Packaging</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 12
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Serialized 12ml / 25ml flacons with laser-etched QR codes linking to the complete 15-identity origin graph.
          </p>
        </div>

        <button
          onClick={() => setIsBottleModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
        >
          <PackageCheck className="w-4 h-4" />
          <span>Bottle Flacons (Generate QR)</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={finishedProducts}
        searchKey="serialNumber"
        searchPlaceholder="Search product by Serial Number (e.g. PCK-NER-2026-001)..."
        onRowClick={(p) => setSelectedProduct(p)}
      />

      {/* QR Code Presentation Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={`Laser QR Serialization: ${selectedProduct.serialNumber}`}
          subtitle={selectedProduct.productName}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-center">
            {/* QR Card */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200">
                <QRCodeSVG
                  value={selectedProduct.qrCodeString}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="space-y-1">
                <span className="font-mono text-sm font-black text-slate-900 tracking-tight">
                  {selectedProduct.serialNumber}
                </span>
                <p className="text-[11px] text-slate-500 font-mono">
                  {selectedProduct.qrCodeString}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Origin Grower (DPDP Masked):</span>
                <span className="font-bold text-slate-900">{selectedProduct.originFarmerMasked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Distillation Charge:</span>
                <span className="font-mono font-bold text-emerald-800">{selectedProduct.distillationRunId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">NABL Certificate:</span>
                <span className="font-mono font-bold text-slate-800">{selectedProduct.labCoaNumber}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  onOpenTraceSearch(selectedProduct.serialNumber);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Full Traceability</span>
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bottle Flacons Modal */}
      <Modal
        isOpen={isBottleModalOpen}
        onClose={() => setIsBottleModalOpen(false)}
        title="Bottle & Serialize Finished Oud Packs"
        subtitle="Generates unique serial numbers and cryptographic QR tags for retail packs"
      >
        <form onSubmit={handleBottleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Source Distillation Run (NABL Released) *</label>
            <select
              value={bottleForm.distillationRunId}
              onChange={(e) => setBottleForm({ ...bottleForm, distillationRunId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
            >
              {distillations.filter(d => d.labReleaseStatus === 'RELEASED').map(d => (
                <option key={d.id} value={d.id}>{d.id} ({d.outputPureOudOilMl}ml pure oud oil)</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Number of Flacons to Bottle *</label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={bottleForm.flaconCount}
                onChange={(e) => setBottleForm({ ...bottleForm, flaconCount: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Flacon Volume (ml)</label>
              <select
                value={bottleForm.volumeMl}
                onChange={(e) => setBottleForm({ ...bottleForm, volumeMl: parseFloat(e.target.value) || 12 })}
                className="w-full px-3 py-2 border rounded-lg font-semibold"
              >
                <option value="12">12 ml (Standard Flacon)</option>
                <option value="25">25 ml (Collector Edition)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsBottleModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
            >
              Execute Packaging & Serialization
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
