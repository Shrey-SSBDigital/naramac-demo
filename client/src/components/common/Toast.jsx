import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts = [] }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-200 ${
              isSuccess 
                ? 'bg-emerald-900 text-white border-emerald-700' 
                : isWarning
                  ? 'bg-amber-900 text-white border-amber-700'
                  : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />}
            {isWarning && <AlertCircle className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />}
            {isInfo && <Info className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />}
            <span className="flex-1 leading-snug">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
