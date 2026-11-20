import React, { useState } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Clock, 
  Lock, 
  Camera, 
  Hash, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle,
  AlertCircle,
  FileText,
  Search
} from 'lucide-react';
import { MANDATORY_IDENTIFIERS_DATA } from '../data/mockData';

export default function IdentifiersRegisterView({ translations }) {
  const [filterCode, setFilterCode] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIdentifiers = MANDATORY_IDENTIFIERS_DATA.filter(item => {
    if (filterCode !== 'ALL' && item.code !== filterCode) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Mandatory 15 Digital Identifiers Register
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Defined under RFP Section 3.2. Each identity represents a real entity, place, event, batch or permit, linked into a single chain governed by NERAMAC.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by name or code..."
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-52 md:w-64"
            />
          </div>
        </div>

        {/* 3 Core Principles from RFP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-750 flex items-start gap-3">
            <Clock className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">The 7-Year Age Rule</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Plantings &lt; 7 yrs receive a collective POLOGEN (PLG). Trees ≥ 7 yrs are individually geo-pinned with Tree IDs (TRE).
              </p>
            </div>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-750 flex items-start gap-3">
            <Lock className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Aadhaar Decoupled (DPDP Act)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                No identifier is derived from Aadhaar. Farmer ID is internal to NERAMAC; any Aadhaar link is strictly optional and off-chain.
              </p>
            </div>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-750 flex items-start gap-3">
            <Camera className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">SHA-256 Photo Hashing</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Every photo is captured in-app and hashed in device RAM before compression or saving, making image substitution impossible.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Identifiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdentifiers.map((item, idx) => (
          <div
            key={item.code}
            className="bg-slate-850/80 border border-slate-750 hover:border-slate-650 rounded-xl p-4 transition duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Badge & Code */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                    {item.code}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      {item.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Prefix: {item.prefix}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  #{idx + 1}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {item.description}
              </p>

              {/* Sample Live Reference */}
              <div className="mt-3 bg-slate-900 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Active Sample:</span>
                <span className="font-mono text-emerald-300 font-semibold text-[11px]">{item.sample}</span>
              </div>
            </div>

            {/* Parent & Child Linkage */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-teal-400" /> Links Upward To:
                </span>
                <span className="text-slate-200 font-medium truncate max-w-[150px]">{item.parent}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3 text-cyan-400" /> Links Downward To:
                </span>
                <span className="text-slate-200 font-medium truncate max-w-[150px]">{item.child}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
