import React, { useState, useEffect, useRef } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Trees, MapPin, Plus, Layers, Filter, Compass, CheckCircle2 } from 'lucide-react';

export default function PlantationModule() {
  const { plantations, trees, addTree } = useEnterprise();
  const [selectedCluster, setSelectedCluster] = useState('ALL');
  const [selectedTree, setSelectedTree] = useState(null);
  const [isAddTreeModalOpen, setIsAddTreeModalOpen] = useState(false);

  // Form state for adding a tree
  const [treeForm, setTreeForm] = useState({
    plantationId: plantations[0]?.id || 'PLT-AS-01',
    farmerId: plantations[0]?.farmerId || 'FRM-AS-01',
    ageYears: 12,
    girthCm: 68,
    heightMeters: 11,
    gpsLatitude: 26.5208,
    gpsLongitude: 93.9790,
    cluster: 'Golaghat Cluster'
  });

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Filtered plantations and trees
  const filteredPlantations = plantations.filter(p => selectedCluster === 'ALL' || p.cluster === selectedCluster);
  const filteredTrees = trees.filter(t => selectedCluster === 'ALL' || t.cluster === selectedCluster);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = selectedCluster === 'Kadamtala Cluster' ? [24.4623, 92.2104] : [26.5204, 93.9782];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: selectedCluster === 'ALL' ? 8 : 13,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      layerGroupRef.current = layerGroup;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // Custom tree marker icon
    const treeIcon = L.divIcon({
      className: 'custom-tree-pin',
      html: `<div style="background-color:#059669;width:10px;height:10px;border-radius:50%;border:2px solid #ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>`,
      iconSize: [10, 10],
      iconAnchor: [5, 5]
    });

    // Add Plantation Boundary Polygons
    filteredPlantations.forEach(plt => {
      const poly = L.polygon(plt.boundaryPolygon, {
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.25,
        weight: 2
      });

      poly.bindPopup(`
        <div style="font-family:sans-serif;font-size:12px;line-height:1.4;">
          <strong style="color:#064e3b;font-size:13px;">${plt.name}</strong><br/>
          <span style="color:#64748b;">ID: ${plt.id} • ${plt.areaHectares} Ha</span><br/>
          <span>Owner: <b>${plt.farmerName}</b></span><br/>
          <span style="color:#047857;font-weight:bold;">Trees: ${plt.totalTrees} (${plt.matureTrees} mature)</span>
        </div>
      `);
      poly.addTo(layerGroup);
    });

    // Add First 60 Point Trees Markers
    filteredTrees.slice(0, 60).forEach(t => {
      const marker = L.marker([t.gpsLatitude, t.gpsLongitude], { icon: treeIcon });
      marker.bindPopup(`
        <div style="font-family:sans-serif;font-size:12px;line-height:1.4;">
          <strong style="color:#064e3b;font-size:13px;font-family:monospace;">${t.id}</strong><br/>
          <span>Age: <b>${t.ageYears} Yrs</b> • Girth: <b>${t.girthCm}cm</b></span><br/>
          <span style="color:#64748b;font-family:monospace;font-size:10px;">GPS: ${t.gpsLatitude.toFixed(4)}, ${t.gpsLongitude.toFixed(4)}</span><br/>
          <span style="display:inline-block;margin-top:3px;padding:1px 5px;border-radius:4px;font-size:9px;font-weight:bold;background:#ecfdf5;color:#047857;">
            ${t.status}
          </span>
        </div>
      `);
      marker.on('click', () => setSelectedTree(t));
      marker.addTo(layerGroup);
    });

    // Center map view on cluster switch
    if (selectedCluster === 'Kadamtala Cluster') {
      map.setView([24.4623, 92.2104], 13);
    } else if (selectedCluster === 'Golaghat Cluster') {
      map.setView([26.5204, 93.9782], 13);
    } else {
      map.setView([25.5, 93.0], 8);
    }
  }, [selectedCluster, filteredPlantations, filteredTrees]);

  const handleAddTreeSubmit = (e) => {
    e.preventDefault();
    addTree(treeForm);
    setIsAddTreeModalOpen(false);
  };

  const columns = [
    {
      header: 'Tree ID & Tag',
      accessor: 'id',
      render: (t) => (
        <div>
          <span className="font-extrabold text-slate-900 font-mono text-xs">{t.id}</span>
          <div className="text-[10px] text-slate-500 font-mono">{t.qrTagCode}</div>
        </div>
      )
    },
    {
      header: 'Plantation & Cluster',
      accessor: 'plantationId',
      render: (t) => (
        <div>
          <span className="font-bold text-slate-800">{t.plantationId}</span>
          <div className="text-[11px] text-slate-500">{t.cluster}</div>
        </div>
      )
    },
    {
      header: 'Age & Dimensions',
      accessor: 'ageYears',
      render: (t) => (
        <div>
          <span className="font-extrabold text-emerald-800">{t.ageYears} Yrs</span>
          <div className="text-[11px] text-slate-500">Girth: {t.girthCm}cm • H: {t.heightMeters}m</div>
        </div>
      )
    },
    {
      header: 'GPS Latitude / Longitude',
      accessor: 'gpsLatitude',
      render: (t) => (
        <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
          {t.gpsLatitude.toFixed(4)}, {t.gpsLongitude.toFixed(4)}
        </span>
      )
    },
    {
      header: 'Inoculation',
      accessor: 'inoculationStatus',
      render: (t) => (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          t.inoculationStatus === 'INOCULATED' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
        }`}>
          {t.inoculationStatus === 'INOCULATED' ? 'Inoculated' : 'Not Inoculated'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (t) => <StatusBadge status={t.status} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (t) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTree(t);
          }}
          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
        >
          Details
        </button>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Module Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Plantation Boundaries & Tree Registry (GIS)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 03
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            POLOGEN walked closed polygon boundaries (&lt;7 yrs) & individual point geo-pinning (&ge;7 yrs) for 100 tagged trees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Cluster filter */}
          <select
            value={selectedCluster}
            onChange={(e) => setSelectedCluster(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
          >
            <option value="ALL">All Clusters ({trees.length} Trees)</option>
            <option value="Golaghat Cluster">Golaghat Cluster (Assam)</option>
            <option value="Kadamtala Cluster">Kadamtala Cluster (Tripura)</option>
            <option value="Hojai / Golaghat">Hojai Cluster</option>
          </select>

          <button
            onClick={() => setIsAddTreeModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tag Tree (Point GPS)</span>
          </button>
        </div>
      </div>

      {/* Interactive Leaflet GIS Satellite Map */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-2">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-extrabold text-slate-900">
              Interactive Geospatial Map: 15 Plantation Polygons & 100 Tagged Trees
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-slate-600 font-semibold">
              <span className="w-3 h-3 rounded bg-emerald-600/30 border border-emerald-600 inline-block" />
              Plantation Polygon
            </span>
            <span className="flex items-center gap-1 text-slate-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              Geo-pinned Tree
            </span>
          </div>
        </div>

        <div className="h-96 w-full relative z-0">
          <div ref={mapContainerRef} className="h-full w-full" />
        </div>
      </div>

      {/* 100 Trees Table */}
      <DataTable
        columns={columns}
        data={filteredTrees}
        searchKey="id"
        searchPlaceholder="Search trees by Tree ID (e.g. TRE-AS-001) or Tag code..."
        filterKey="status"
        filterOptions={[
          { value: 'MATURE_GROWING', label: 'Mature & Growing' },
          { value: 'INOCULATED', label: 'Inoculated' },
          { value: 'HARVESTED', label: 'Felled / Harvested' }
        ]}
        onRowClick={(t) => setSelectedTree(t)}
      />

      {/* Selected Tree Detail Modal */}
      {selectedTree && (
        <Modal
          isOpen={!!selectedTree}
          onClose={() => setSelectedTree(null)}
          title={`Point Geo-Tag Details: ${selectedTree.id}`}
          subtitle={`Plantation: ${selectedTree.plantationId} • CITES Appendix II`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Tree Species</span>
                <div className="font-extrabold text-emerald-900 text-sm italic">{selectedTree.species}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Tree Status</span>
                <div><StatusBadge status={selectedTree.status} /></div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Age & Girth</span>
                <div className="font-bold text-slate-800">{selectedTree.ageYears} Years • {selectedTree.girthCm} cm Girth</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">GPS Coordinates</span>
                <div className="font-mono text-slate-800">{selectedTree.gpsLatitude}, {selectedTree.gpsLongitude}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cryptographic Photo Hash (On-Device Proof)
              </span>
              <div className="p-2.5 rounded-lg bg-slate-100 font-mono text-[11px] text-slate-700 break-all border border-slate-200">
                {selectedTree.photoHash}
              </div>
              <p className="text-[10px] text-slate-500">
                Tamper-evident camera buffer SHA-256 hash verified during field agent inspection.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTree(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Tree Form Modal */}
      <Modal
        isOpen={isAddTreeModalOpen}
        onClose={() => setIsAddTreeModalOpen(false)}
        title="Tag Mature Agarwood Tree (Point GPS)"
        subtitle="Mandatory Point Geo-Pinning for trees ≥ 7 years of age"
      >
        <form onSubmit={handleAddTreeSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Plantation</label>
              <select
                value={treeForm.plantationId}
                onChange={(e) => {
                  const p = plantations.find(p => p.id === e.target.value);
                  setTreeForm({
                    ...treeForm,
                    plantationId: e.target.value,
                    farmerId: p?.farmerId || 'FRM-AS-01',
                    cluster: p?.cluster || 'Golaghat Cluster'
                  });
                }}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {plantations.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tree Age (Years &ge; 7)</label>
              <input
                type="number"
                min="7"
                max="30"
                value={treeForm.ageYears}
                onChange={(e) => setTreeForm({ ...treeForm, ageYears: parseInt(e.target.value) || 7 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Trunk Girth (cm)</label>
              <input
                type="number"
                value={treeForm.girthCm}
                onChange={(e) => setTreeForm({ ...treeForm, girthCm: parseInt(e.target.value) || 50 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Height (Meters)</label>
              <input
                type="number"
                value={treeForm.heightMeters}
                onChange={(e) => setTreeForm({ ...treeForm, heightMeters: parseInt(e.target.value) || 8 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">GPS Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={treeForm.gpsLatitude}
                onChange={(e) => setTreeForm({ ...treeForm, gpsLatitude: parseFloat(e.target.value) || 26.52 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">GPS Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={treeForm.gpsLongitude}
                onChange={(e) => setTreeForm({ ...treeForm, gpsLongitude: parseFloat(e.target.value) || 93.97 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddTreeModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
            >
              Confirm Point Tag
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
