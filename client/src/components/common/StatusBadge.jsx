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
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-600',
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
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-500 animate-pulse',
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
          bg: 'bg-teal-50 text-teal-800 border-teal-300',
          dot: 'bg-teal-600',
          label: val.replace(/_/g, ' ')
        };

      case 'DISTILLED':
      case 'AGGREGATED':
      case 'TRANSFERRED_TO_CPC':
      case 'RECEIVED_VERIFIED':
      case 'SOLD_DOMESTIC':
      case 'DISPATCHED_EXPORT':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          dot: 'bg-blue-600',
          label: val.replace(/_/g, ' ')
        };

      case 'QUARANTINED':
      case 'EXPIRED':
      case 'REJECTED':
      case 'TOLERANCE_EXCEEDED':
      case 'FLAGGED':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          dot: 'bg-rose-600',
          label: val.replace(/_/g, ' ')
        };

      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
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
