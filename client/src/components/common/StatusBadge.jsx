import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;

  const getStatusConfig = (val) => {
    const s = String(val).toUpperCase();

    switch (s) {
      case 'ACTIVE':
      case 'RELEASED':
      case 'RELEASED_FOR_COMMERCIAL_USE':
      case 'PASSED':
      case 'FELL_COMPLETED':
      case 'COMPLETED':
      case 'COMPLETED_PACKAGED':
      case 'CLEARED_FOR_DEPARTURE':
      case 'DELIVERED':
      case 'PAID_FULL':
        return {
          bg: 'bg-emerald-100 text-emerald-950 border-emerald-400 font-black shadow-2xs',
          dot: 'bg-emerald-700',
          label: val.replace(/_/g, ' ')
        };

      case 'PENDING':
      case 'PENDING_RELEASE':
      case 'PENDING_DFO_SANCTION':
      case 'PENDING_FINAL_SIGN_OFF':
      case 'PENDING_WEIGHMENT':
      case 'MATURING':
      case 'IN_TRANSIT':
      case 'IN_FLIGHT_TRANSIT':
      case 'UNDER_CUSTOMS_CLEARANCE':
      case 'MANIFEST_FILED':
        return {
          bg: 'bg-amber-100 text-amber-950 border-amber-400 font-black shadow-2xs',
          dot: 'bg-amber-600 animate-pulse',
          label: val.replace(/_/g, ' ')
        };

      case 'IN_STOCK':
      case 'IN_VAULT_STOCK':
      case 'READY_FOR_DISTILLATION':
      case 'READY_FOR_DISPATCH':
      case 'MATURE_GROWING':
      case 'INOCULATED':
      case 'SANCTION_APPROVED':
        return {
          bg: 'bg-teal-100 text-teal-950 border-teal-400 font-black shadow-2xs',
          dot: 'bg-teal-700',
          label: val.replace(/_/g, ' ')
        };

      case 'DISTILLED':
      case 'AGGREGATED':
      case 'TRANSFERRED_TO_CPC':
      case 'RECEIVED_VERIFIED':
      case 'SOLD_DOMESTIC':
      case 'DISPATCHED_EXPORT':
        return {
          bg: 'bg-blue-100 text-blue-950 border-blue-400 font-black shadow-2xs',
          dot: 'bg-blue-700',
          label: val.replace(/_/g, ' ')
        };

      case 'QUARANTINED':
      case 'EXPIRED':
      case 'REJECTED':
      case 'TOLERANCE_EXCEEDED':
      case 'FLAGGED':
        return {
          bg: 'bg-rose-100 text-rose-950 border-rose-400 font-black shadow-2xs',
          dot: 'bg-rose-700',
          label: val.replace(/_/g, ' ')
        };

      default:
        return {
          bg: 'bg-slate-100 text-slate-900 border-slate-400 font-black shadow-2xs',
          dot: 'bg-slate-600',
          label: val.replace(/_/g, ' ')
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span className="truncate">{config.label}</span>
    </span>
  );
}
