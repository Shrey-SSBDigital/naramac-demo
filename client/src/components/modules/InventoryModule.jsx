import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import { Warehouse, Building2, Layers, ShieldCheck } from 'lucide-react';

export default function InventoryModule() {
  const { inventory } = useEnterprise();

  const columns = [
    {
      header: 'Item SKU & Description',
      accessor: 'itemCategory',
      render: (i) => (
        <div>
          <span className="font-extrabold text-slate-900 text-xs">{i.itemCategory}</span>
          <div className="text-[10px] text-slate-400 font-mono">{i.sku}</div>
        </div>
      )
    },
    {
      header: 'Facility Location',
      accessor: 'facilityName',
      render: (i) => (
        <div>
          <span className="font-bold text-slate-800">{i.facilityName}</span>
          <div className="text-[11px] text-slate-500">{i.storageCondition}</div>
        </div>
      )
    },
    {
      header: 'Total Quantity',
      accessor: 'quantityKg',
      render: (i) => (
        <span className="font-black text-slate-900 text-xs">
          {i.quantityKg} {i.unit}
        </span>
      )
    },
    {
      header: 'Allocated vs Available',
      accessor: 'availableKg',
      render: (i) => (
        <div className="space-y-0.5">
          <div className="text-emerald-800 font-extrabold text-xs">
            {i.availableKg} {i.unit} Available
          </div>
          <div className="text-[10px] text-slate-400">
            {i.allocatedKg} {i.unit} Reserved
          </div>
        </div>
      )
    },
    {
      header: 'Valuation (INR)',
      accessor: 'valuationInr',
      render: (i) => (
        <span className="font-mono text-xs font-bold text-slate-800">
          ₹ {i.valuationInr.toLocaleString('en-IN')}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Inventory & Multi-Facility Vault Ledger</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 11
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stock ledger of raw logs, chipped flakes, decanted oil, hydrosol, and finished flacons across all facilities.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={inventory}
        searchKey="itemCategory"
        searchPlaceholder="Search inventory by SKU, material category, or facility..."
      />
    </div>
  );
}
