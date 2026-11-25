import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  X, 
  Filter, 
  Layers, 
  Scale, 
  ShieldCheck, 
  Phone, 
  Navigation,
  ExternalLink
} from 'lucide-react';
import { useEnterprise } from '../../context/EnterpriseContext';

export default function FacilityRegistryModal({ isOpen, onClose }) {
  const { facilities } = useEnterprise();
  const [selectedCluster, setSelectedCluster] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  if (!isOpen) return null;

  const filtered = (facilities || []).filter(f => {
    const matchCluster = selectedCluster === 'ALL' || f.cluster?.includes(selectedCluster);
    const matchType = selectedType === 'ALL' || f.facilityType === selectedType;
    return matchCluster && matchType;
  });

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md">
                <Building2 className="w-5 h-5 text-emerald-300" />
              </span>
              <h2 className="text-base font-black tracking-tight">
                Master Facility Registry — Aggregation Depots &amp; Distilleries
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              RFP Mandatory Master Table • Geo-referenced physical infrastructure with certified coordinates, weighbridges, and geofence perimeters.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter Cluster:
            </span>
            {['ALL', 'Golaghat', 'Kadamtala', 'Hojai'].map(cl => (
              <button
                key={cl}
                onClick={() => setSelectedCluster(cl)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedCluster === cl
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cl === 'ALL' ? 'All Clusters' : cl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Type:</span>
            {[
              { id: 'ALL', label: 'All Facilities' },
              { id: 'AGGREGATION_DEPOT', label: 'Aggregation Depots' },
              { id: 'PROCESSING_CENTRE_DISTILLERY', label: 'CPC Distilleries' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedType === t.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Facility Table */}
        <div className="p-5 space-y-3 overflow-y-auto">
          <div className="space-y-3">
            {filtered.map(fac => {
              const isDepot = fac.facilityType === 'AGGREGATION_DEPOT';
              return (
                <div 
                  key={fac.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-emerald-300 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isDepot ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-teal-100 text-teal-900 border border-teal-300'
                        }`}>
                          {isDepot ? 'Collection Depot' : 'CPC Distillation'}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-400">{fac.id}</span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          License: {fac.licenseNumber}
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 text-sm">{fac.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{fac.location}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs font-mono font-bold bg-slate-900 text-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{fac.lat.toFixed(4)}°N, {fac.lng.toFixed(4)}°E</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Accuracy ±{fac.accuracyM || 1.0}m • Geofence {fac.geofenceRadiusMeters}m</span>
                    </div>
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Cluster &amp; State</span>
                      <span className="font-extrabold text-slate-900">{fac.district}, {fac.state}</span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        {isDepot ? 'Depot Capacity' : 'Boiler Capacity'}
                      </span>
                      <span className="font-extrabold text-slate-900">
                        {isDepot ? `${fac.capacityKg} kg` : `${fac.boilerCapacityLiters} L (${fac.stillsCount} Stills)`}
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        {isDepot ? 'Current Wood Stock' : 'Monthly Oud Output'}
                      </span>
                      <span className="font-extrabold text-emerald-800">
                        {isDepot ? `${fac.currentStockKg} kg` : `${fac.monthlyOudOutputLiters} L / mo`}
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">In-Charge &amp; Phone</span>
                      <span className="font-bold text-slate-800 text-[11px] truncate block">{fac.inCharge}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Certified Electronic Weighbridge &amp; QR Custody Scanner Active</span>
                    </span>
                    <a
                      href={`https://maps.google.com/?q=${fac.lat},${fac.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline"
                    >
                      <span>Open Satellite Coordinates</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Showing {filtered.length} registered geo-referenced physical facilities in NERAMAC ASCTS network.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs"
          >
            Close Registry
          </button>
        </div>
      </div>
    </div>
  );
}