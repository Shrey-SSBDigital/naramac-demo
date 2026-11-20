import React, { useState, useEffect, useRef } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Trees,
  MapPin,
  Plus,
  Layers,
  Filter,
  Compass,
  CheckCircle2,
  Sprout,
  Building,
  Users,
  GitFork,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function PlantationModule() {
  const {
    farmers,
    plantations,
    addPlantation,
    pologens,
    addPologen,
    trees,
    addTree
  } = useEnterprise();

  const [activeTab, setActiveTab] = useState('MAP'); // 'MAP' | 'HIERARCHY' | 'POLOGENS' | 'TREES'
  const [selectedFarmerId, setSelectedFarmerId] = useState('ALL');
  const [selectedCluster, setSelectedCluster] = useState('ALL');

  const [selectedTree, setSelectedTree] = useState(null);
  const [selectedPologen, setSelectedPologen] = useState(null);

  const [isAddTreeModalOpen, setIsAddTreeModalOpen] = useState(false);
  const [isWalkPologenModalOpen, setIsWalkPologenModalOpen] = useState(false);

  // Form state for adding a mature tree
  const [treeFormFarmerId, setTreeFormFarmerId] = useState(farmers[0]?.id || 'FRM-AS-01');
  const [treeForm, setTreeForm] = useState({
    plantationId: plantations[0]?.id || 'PLT-AS-01',
    ageYears: 12,
    girthCm: 68,
    heightMeters: 11,
    gpsLatitude: 26.5208,
    gpsLongitude: 93.9790
  });

  // Form state for walking a POLOGEN
  const [pologenFormFarmerId, setPologenFormFarmerId] = useState(farmers[0]?.id || 'FRM-AS-01');
  const [pologenForm, setPologenForm] = useState({
    plantationId: plantations[0]?.id || 'PLT-AS-01',
    name: '',
    plantingYear: 2023,
    ageYears: 3.5,
    saplingCount: 140,
    areaSquareMeters: 5200,
    perimeterMeters: 310
  });

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Filtered collections based on selected farmer and cluster
  const filteredPlantations = plantations.filter(p => {
    const matchesFarmer = selectedFarmerId === 'ALL' || p.farmerId === selectedFarmerId;
    const matchesCluster = selectedCluster === 'ALL' || p.cluster === selectedCluster;
    return matchesFarmer && matchesCluster;
  });

  const filteredPologens = pologens.filter(plg => {
    const matchesFarmer = selectedFarmerId === 'ALL' || plg.farmerId === selectedFarmerId;
    const matchesCluster = selectedCluster === 'ALL' || plg.cluster === selectedCluster;
    return matchesFarmer && matchesCluster;
  });

  const filteredTrees = trees.filter(t => {
    const matchesFarmer = selectedFarmerId === 'ALL' || t.farmerId === selectedFarmerId;
    const matchesCluster = selectedCluster === 'ALL' || t.cluster === selectedCluster;
    return matchesFarmer && matchesCluster;
  });

  // Plantations available for the selected farmer in the forms
  const treeFormAvailablePlantations = plantations.filter(p => p.farmerId === treeFormFarmerId);
  const pologenFormAvailablePlantations = plantations.filter(p => p.farmerId === pologenFormFarmerId);

  // Update plantation selection when farmer selection changes in modals
  useEffect(() => {
    if (treeFormAvailablePlantations.length > 0 && !treeFormAvailablePlantations.some(p => p.id === treeForm.plantationId)) {
      setTreeForm(prev => ({ ...prev, plantationId: treeFormAvailablePlantations[0].id }));
    }
  }, [treeFormFarmerId, treeFormAvailablePlantations, treeForm.plantationId]);

  useEffect(() => {
    if (pologenFormAvailablePlantations.length > 0 && !pologenFormAvailablePlantations.some(p => p.id === pologenForm.plantationId)) {
      setPologenForm(prev => ({ ...prev, plantationId: pologenFormAvailablePlantations[0].id }));
    }
  }, [pologenFormFarmerId, pologenFormAvailablePlantations, pologenForm.plantationId]);

  // Leaflet Map Initialization and Dynamic Layer updates
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [26.5204, 93.9782],
        zoom: 9,
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

    // 1. Layer 1: Plantation Boundary Polygons (Emerald Green)
    filteredPlantations.forEach(plt => {
      const poly = L.polygon(plt.boundaryPolygon, {
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.20,
        weight: 2
      });

      poly.bindPopup(`
        <div style="font-family:sans-serif;font-size:12px;line-height:1.4;">
          <div style="font-weight:bold;color:#064e3b;font-size:13px;">${plt.name}</div>
          <div style="color:#64748b;font-size:11px;">ID: ${plt.id} • ${plt.areaHectares} Ha</div>
          <div style="margin-top:4px;padding:3px 6px;background:#ecfdf5;border-radius:4px;font-size:11px;">
            Attached Farmer: <b style="color:#047857;">${plt.farmerName}</b> (${plt.farmerId})
          </div>
          <div style="color:#047857;margin-top:4px;">
            <b>Trees: ${plt.totalTrees}</b> (${plt.matureTrees} mature, ${plt.youngTrees} young)
          </div>
        </div>
      `);
      poly.addTo(layerGroup);
    });

    // 2. Layer 2: POLOGEN Boundary Polygons for Saplings (< 7 yrs) (Cyan/Teal dashed)
    filteredPologens.forEach(plg => {
      const poly = L.polygon(plg.boundaryPolygon, {
        color: '#0d9488',
        fillColor: '#14b8a6',
        fillOpacity: 0.35,
        weight: 2,
        dashArray: '4, 4'
      });

      poly.bindPopup(`
        <div style="font-family:sans-serif;font-size:12px;line-height:1.4;">
          <div style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:bold;background:#ccfbf1;color:#0f766e;">
            POLOGEN (&lt;7 yrs)
          </div>
          <div style="font-weight:bold;color:#134e4a;font-size:13px;margin-top:2px;">${plg.name}</div>
          <div style="color:#64748b;font-size:11px;">ID: ${plg.id} • ${plg.plantationId}</div>
          <div style="margin-top:4px;padding:3px 6px;background:#f0fdfa;border-radius:4px;font-size:11px;">
            Attached Farmer: <b style="color:#0f766e;">${plg.farmerName}</b> (${plg.farmerId})
          </div>
          <div style="margin-top:4px;color:#0f766e;font-weight:bold;">
            ${plg.saplingCount} Saplings (${plg.ageYears} yrs, planted ${plg.plantingYear})
          </div>
          <div style="color:#64748b;font-size:10px;margin-top:2px;">
            Walked: ${plg.walkedDate} • Area: ${plg.areaSquareMeters} m²
          </div>
        </div>
      `);
      poly.on('click', () => setSelectedPologen(plg));
      poly.addTo(layerGroup);
    });

    // 3. Layer 3: Mature Tree Point Pins (>= 7 yrs) (Dark Emerald Pins)
    const treeIcon = L.divIcon({
      className: 'custom-tree-pin',
      html: `<div style="background-color:#047857;width:10px;height:10px;border-radius:50%;border:2px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,0.45);"></div>`,
      iconSize: [10, 10],
      iconAnchor: [5, 5]
    });

    filteredTrees.slice(0, 80).forEach(t => {
      const marker = L.marker([t.gpsLatitude, t.gpsLongitude], { icon: treeIcon });
      marker.bindPopup(`
        <div style="font-family:sans-serif;font-size:12px;line-height:1.4;">
          <div style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:bold;background:#dcfce7;color:#15803d;">
            Mature Tree (&ge;7 yrs)
          </div>
          <div style="font-weight:bold;color:#064e3b;font-size:13px;font-family:monospace;margin-top:2px;">${t.id}</div>
          <div style="color:#64748b;font-size:11px;">Plot: ${t.plantationId}</div>
          <div style="margin-top:4px;padding:3px 6px;background:#f0fdf4;border-radius:4px;font-size:11px;">
            Attached Farmer: <b style="color:#15803d;">${t.farmerName}</b> (${t.farmerId})
          </div>
          <div style="margin-top:3px;">
            Age: <b>${t.ageYears} Yrs</b> • Girth: <b>${t.girthCm}cm</b>
          </div>
          <div style="color:#64748b;font-family:monospace;font-size:10px;margin-top:2px;">
            GPS: ${t.gpsLatitude.toFixed(4)}, ${t.gpsLongitude.toFixed(4)}
          </div>
          <div style="margin-top:3px;">
            <span style="font-size:9px;font-weight:bold;padding:1px 5px;border-radius:3px;background:#ecfdf5;color:#047857;">
              ${t.status}
            </span>
          </div>
        </div>
      `);
      marker.on('click', () => setSelectedTree(t));
      marker.addTo(layerGroup);
    });

    // Auto-center map based on selection
    if (selectedFarmerId !== 'ALL') {
      const farmerObj = farmers.find(f => f.id === selectedFarmerId);
      if (farmerObj && farmerObj.coordinates) {
        map.setView(farmerObj.coordinates, 14);
      }
    } else if (selectedCluster === 'Kadamtala Cluster') {
      map.setView([24.4623, 92.2104], 12);
    } else if (selectedCluster === 'Golaghat Cluster') {
      map.setView([26.5204, 93.9782], 12);
    } else {
      map.setView([25.5, 93.0], 8);
    }
  }, [selectedFarmerId, selectedCluster, filteredPlantations, filteredPologens, filteredTrees, farmers]);

  const handleAddTreeSubmit = (e) => {
    e.preventDefault();
    const farmer = farmers.find(f => f.id === treeFormFarmerId);
    const plantation = plantations.find(p => p.id === treeForm.plantationId);
    if (!farmer || !plantation) return;

    addTree({
      farmerId: farmer.id,
      farmerName: farmer.name,
      plantationId: plantation.id,
      plantationName: plantation.name,
      ageYears: treeForm.ageYears,
      girthCm: treeForm.girthCm,
      heightMeters: treeForm.heightMeters,
      gpsLatitude: treeForm.gpsLatitude,
      gpsLongitude: treeForm.gpsLongitude
    });
    setIsAddTreeModalOpen(false);
  };

  const handleWalkPologenSubmit = (e) => {
    e.preventDefault();
    const farmer = farmers.find(f => f.id === pologenFormFarmerId);
    const plantation = plantations.find(p => p.id === pologenForm.plantationId);
    if (!farmer || !plantation) return;

    addPologen({
      farmerId: farmer.id,
      farmerName: farmer.name,
      plantationId: plantation.id,
      plantationName: plantation.name,
      name: pologenForm.name || `${plantation.name} Sapling Block`,
      plantingYear: pologenForm.plantingYear,
      ageYears: pologenForm.ageYears,
      saplingCount: pologenForm.saplingCount,
      areaSquareMeters: pologenForm.areaSquareMeters,
      perimeterMeters: pologenForm.perimeterMeters
    });
    setIsWalkPologenModalOpen(false);
  };

  // POLOGEN Table Columns
  const pologenColumns = [
    {
      header: 'POLOGEN ID',
      accessor: 'id',
      render: (plg) => (
        <div>
          <span className="font-extrabold text-teal-950 font-mono text-xs">{plg.id}</span>
          <div className="text-[10px] text-slate-500 font-bold">{plg.name}</div>
        </div>
      )
    },
    {
      header: 'Attached Farmer',
      accessor: 'farmerName',
      render: (plg) => (
        <div>
          <span className="font-extrabold text-slate-900">{plg.farmerName}</span>
          <div className="text-[10px] font-mono text-slate-500">{plg.farmerId}</div>
        </div>
      )
    },
    {
      header: 'Plantation Plot',
      accessor: 'plantationId',
      render: (plg) => (
        <div>
          <span className="font-bold text-slate-800">{plg.plantationId}</span>
          <div className="text-[11px] text-slate-500">{plg.cluster}</div>
        </div>
      )
    },
    {
      header: 'Sapling Count (<7 yrs)',
      accessor: 'saplingCount',
      render: (plg) => (
        <div>
          <span className="font-extrabold text-teal-800 text-xs">{plg.saplingCount} Saplings</span>
          <div className="text-[10px] text-slate-500">Planted: {plg.plantingYear} ({plg.ageYears} yrs)</div>
        </div>
      )
    },
    {
      header: 'Walked Perimeter & Area',
      accessor: 'areaSquareMeters',
      render: (plg) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-700">{plg.areaSquareMeters} m²</span>
          <div className="text-[10px] text-slate-500">{plg.perimeterMeters}m perimeter ({plg.walkedVerticesCount} vertices)</div>
        </div>
      )
    },
    {
      header: 'Walked Date',
      accessor: 'walkedDate',
      render: (plg) => (
        <span className="font-mono text-[11px] text-slate-600">{plg.walkedDate}</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (plg) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
          {plg.status}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (plg) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPologen(plg);
          }}
          className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
        >
          View Details
        </button>
      )
    }
  ];

  // Mature Trees Table Columns
  const treeColumns = [
    {
      header: 'Tree ID & QR Tag',
      accessor: 'id',
      render: (t) => (
        <div>
          <span className="font-extrabold text-slate-900 font-mono text-xs">{t.id}</span>
          <div className="text-[10px] text-slate-500 font-mono">{t.qrTagCode}</div>
        </div>
      )
    },
    {
      header: 'Attached Farmer',
      accessor: 'farmerName',
      render: (t) => (
        <div>
          <span className="font-extrabold text-slate-900">{t.farmerName}</span>
          <div className="text-[10px] font-mono text-slate-500">{t.farmerId}</div>
        </div>
      )
    },
    {
      header: 'Plantation Plot',
      accessor: 'plantationId',
      render: (t) => (
        <div>
          <span className="font-bold text-slate-800">{t.plantationId}</span>
          <div className="text-[11px] text-slate-500">{t.cluster}</div>
        </div>
      )
    },
    {
      header: 'Age & Trunk Dimensions',
      accessor: 'ageYears',
      render: (t) => (
        <div>
          <span className="font-extrabold text-emerald-800">{t.ageYears} Yrs</span>
          <div className="text-[11px] text-slate-500">Girth: {t.girthCm}cm • H: {t.heightMeters}m</div>
        </div>
      )
    },
    {
      header: 'GPS Point Pin',
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
          {t.inoculationStatus === 'INOCULATED' ? 'Inoculated' : 'Growing'}
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
            <span>Plantations, POLOGEN & Tree Management</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 03 • Attached by Farmer
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Two-tier statutory tracking: young trees (&lt;7 yrs) walked as POLOGEN perimeter polygons vs mature trees (&ge;7 yrs) tagged with point GPS pins.
          </p>
        </div>

        {/* Global Module Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWalkPologenModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
          >
            <Sprout className="w-4 h-4" />
            <span>Walk POLOGEN (&lt;7y)</span>
          </button>
          <button
            onClick={() => setIsAddTreeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tag Tree (&ge;7y)</span>
          </button>
        </div>
      </div>

      {/* Top Filter Bar: Farmer & Cluster Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Farmer Selector */}
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-slate-700">Filter by Farmer:</span>
            <select
              value={selectedFarmerId}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              className="font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
            >
              <option value="ALL">All Farmers ({farmers.length})</option>
              {farmers.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.id})</option>
              ))}
            </select>
          </div>

          {/* Cluster Selector */}
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-teal-700" />
            <span className="font-bold text-slate-700">Cluster:</span>
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
            >
              <option value="ALL">All Clusters</option>
              <option value="Golaghat Cluster">Golaghat Cluster (Assam)</option>
              <option value="Kadamtala Cluster">Kadamtala Cluster (Tripura)</option>
              <option value="Hojai / Golaghat">Hojai Cluster</option>
            </select>
          </div>
        </div>

        {/* Counts Ribbon */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600">
          <span><b>{filteredPlantations.length}</b> Plantations</span>
          <span>•</span>
          <span className="text-teal-700 font-bold"><b>{filteredPologens.length}</b> POLOGENs</span>
          <span>•</span>
          <span className="text-emerald-800 font-bold"><b>{filteredTrees.length}</b> Mature Trees</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 bg-white px-3 pt-2 rounded-t-xl border border-b-0">
        <button
          onClick={() => setActiveTab('MAP')}
          className={`px-3.5 py-2 font-bold text-xs border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'MAP'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Interactive Geospatial GIS Map</span>
        </button>
        <button
          onClick={() => setActiveTab('HIERARCHY')}
          className={`px-3.5 py-2 font-bold text-xs border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'HIERARCHY'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>Farmer Grouped Hierarchy</span>
        </button>
        <button
          onClick={() => setActiveTab('POLOGENS')}
          className={`px-3.5 py-2 font-bold text-xs border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'POLOGENS'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>POLOGEN Registry &lt;7y ({filteredPologens.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('TREES')}
          className={`px-3.5 py-2 font-bold text-xs border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'TREES'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trees className="w-4 h-4" />
          <span>Mature Trees Registry &ge;7y ({filteredTrees.length})</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE GIS MAP */}
      {activeTab === 'MAP' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl overflow-hidden shadow-xs space-y-2">
          {/* Map Legend */}
          <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-700" />
              <span className="font-extrabold text-slate-900">
                Geospatial Layer View: {selectedFarmerId === 'ALL' ? 'All Registered Plantations' : `Focused on ${farmers.find(f => f.id === selectedFarmerId)?.name}`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500/30 border border-emerald-600 inline-block" />
                <span>Plantation Plot Boundary</span>
              </span>
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <span className="w-3.5 h-3.5 rounded bg-teal-400/40 border-2 border-dashed border-teal-600 inline-block" />
                <span>POLOGEN (&lt;7 yrs Saplings)</span>
              </span>
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 border border-white shadow-xs inline-block" />
                <span>Mature Tree Pin (&ge;7 yrs)</span>
              </span>
            </div>
          </div>

          <div className="h-[460px] w-full relative z-0">
            <div ref={mapContainerRef} className="h-full w-full" />
          </div>
        </div>
      )}

      {/* TAB 2: FARMER GROUPED HIERARCHY */}
      {activeTab === 'HIERARCHY' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <span>Grouped by statutory land owner. Each farmer holds one or more plantation parcels containing walked POLOGENs and tagged mature trees.</span>
            <span className="font-bold text-slate-800">{farmers.length} Registered Farmers</span>
          </div>

          <div className="space-y-4">
            {farmers
              .filter(f => selectedFarmerId === 'ALL' || f.id === selectedFarmerId)
              .filter(f => selectedCluster === 'ALL' || f.cluster === selectedCluster)
              .map(farmer => {
                const farmerPlts = plantations.filter(p => p.farmerId === farmer.id);
                const farmerPlgs = pologens.filter(p => p.farmerId === farmer.id);
                const farmerTrs = trees.filter(t => t.farmerId === farmer.id);
                const totalSaplings = farmerPlgs.reduce((sum, p) => sum + (p.saplingCount || 0), 0);

                return (
                  <div key={farmer.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                    {/* Farmer Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-extrabold flex items-center justify-center text-xs">
                          FRM
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                            <span>{farmer.name}</span>
                            <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              {farmer.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {farmer.village} • {farmer.cluster} • Title: <span className="font-mono">{farmer.dagNumber}</span> ({farmer.landAreaAcres} Acres)
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-600 font-bold">{farmerPlts.length} Plots</span>
                        <span className="text-teal-700 font-bold">{totalSaplings} Saplings</span>
                        <span className="text-emerald-800 font-bold">{farmerTrs.length} Mature Trees</span>
                      </div>
                    </div>

                    {/* Plantations owned by this farmer */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {farmerPlts.map(plt => {
                        const pltPologens = farmerPlgs.filter(p => p.plantationId === plt.id);
                        const pltTrees = farmerTrs.filter(t => t.plantationId === plt.id);

                        return (
                          <div key={plt.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-900 text-xs">{plt.name}</span>
                              <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border text-slate-700 font-bold">{plt.id}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {plt.areaHectares} Ha • Elev: {plt.elevationMeters}m • {plt.soilType}
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                              <div className="p-2 rounded bg-teal-50 border border-teal-200">
                                <div className="text-[10px] font-bold text-teal-800 uppercase">POLOGENs (&lt;7 yrs)</div>
                                <div className="font-extrabold text-teal-950 mt-0.5">
                                  {pltPologens.reduce((sum, p) => sum + (p.saplingCount || 0), 0)} Saplings
                                </div>
                                <div className="text-[10px] text-teal-700">{pltPologens.length} Walked Blocks</div>
                              </div>
                              <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                                <div className="text-[10px] font-bold text-emerald-800 uppercase">Mature Trees (&ge;7 yrs)</div>
                                <div className="font-extrabold text-emerald-950 mt-0.5">{pltTrees.length} Geo-Pinned</div>
                                <div className="text-[10px] text-emerald-700">QR Tagged</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: POLOGEN REGISTRY (<7 YRS) */}
      {activeTab === 'POLOGENS' && (
        <div className="space-y-4">
          <DataTable
            columns={pologenColumns}
            data={filteredPologens}
            searchKey="name"
            searchPlaceholder="Search POLOGEN by ID or block name..."
            filterKey="status"
            filterOptions={[
              { value: 'WALKED_VERIFIED', label: 'Walked & Verified' }
            ]}
            onRowClick={(plg) => setSelectedPologen(plg)}
          />
        </div>
      )}

      {/* TAB 4: MATURE TREES REGISTRY (≥7 YRS) */}
      {activeTab === 'TREES' && (
        <div className="space-y-4">
          <DataTable
            columns={treeColumns}
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
        </div>
      )}

      {/* POLOGEN Detail Modal */}
      {selectedPologen && (
        <Modal
          isOpen={!!selectedPologen}
          onClose={() => setSelectedPologen(null)}
          title={`POLOGEN Perimeter Walk: ${selectedPologen.id}`}
          subtitle={`Young Agarwood Sapling Block (< 7 Years) • Statutory Non-Felling Asset`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            {/* Header Identity */}
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-teal-950 text-sm">{selectedPologen.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-200 text-teal-900">
                  {selectedPologen.status}
                </span>
              </div>
              <div className="text-teal-800 text-[11px]">
                Parent Plantation: <b className="font-mono">{selectedPologen.plantationId}</b> ({selectedPologen.plantationName})
              </div>
            </div>

            {/* Attached Farmer Card */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Attached Farmer</span>
                <span className="font-extrabold text-slate-900 text-sm">{selectedPologen.farmerName}</span>
                <span className="text-[10px] text-slate-500 font-mono ml-2">ID: {selectedPologen.farmerId}</span>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded">
                Verified Landholder
              </span>
            </div>

            {/* Sapling & Walked Perimeter Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Sapling Count</span>
                <div className="font-extrabold text-teal-800 text-lg">{selectedPologen.saplingCount} Saplings</div>
                <div className="text-[11px] text-slate-500">Species: {selectedPologen.species}</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Planting Age & Year</span>
                <div className="font-extrabold text-slate-900 text-lg">{selectedPologen.ageYears} Years</div>
                <div className="text-[11px] text-slate-500">Planted: {selectedPologen.plantingYear}</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Walked Surface Area</span>
                <div className="font-mono font-bold text-slate-900 text-sm">{selectedPologen.areaSquareMeters} m²</div>
                <div className="text-[11px] text-slate-500">{selectedPologen.perimeterMeters}m Closed Perimeter</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Field Verification</span>
                <div className="font-bold text-slate-900 text-xs">{selectedPologen.fieldAgent}</div>
                <div className="text-[11px] text-slate-500">Date: {selectedPologen.walkedDate}</div>
              </div>
            </div>

            {/* Statutory Regulation Notice */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <span className="font-bold">Statutory Forestry Note: </span>
              In accordance with Assam & Tripura agarwood rules, trees below 7 years cannot be individually nail-tagged or felled. They are governed collectively under this POLOGEN polygon until reaching maturity.
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPologen(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Mature Tree Detail Modal */}
      {selectedTree && (
        <Modal
          isOpen={!!selectedTree}
          onClose={() => setSelectedTree(null)}
          title={`Point Geo-Tag Details: ${selectedTree.id}`}
          subtitle={`Plantation: ${selectedTree.plantationId} • CITES Appendix II`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            {/* Attached Farmer Header */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Attached Farmer</span>
                <span className="font-extrabold text-emerald-950 text-sm">{selectedTree.farmerName}</span>
                <span className="text-[10px] text-emerald-700 font-mono ml-2">ID: {selectedTree.farmerId}</span>
              </div>
              <StatusBadge status={selectedTree.status} />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Tree Species</span>
                <div className="font-extrabold text-emerald-900 text-sm italic">{selectedTree.species}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Inoculation</span>
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedTree.inoculationStatus === 'INOCULATED' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedTree.inoculationStatus === 'INOCULATED' ? 'Inoculated' : 'Not Inoculated'}
                  </span>
                </div>
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

      {/* Walk POLOGEN Modal */}
      <Modal
        isOpen={isWalkPologenModalOpen}
        onClose={() => setIsWalkPologenModalOpen(false)}
        title="Walk New POLOGEN (< 7 Years Saplings)"
        subtitle="Step 1: Select Farmer • Step 2: Select Plantation • Step 3: Record Sapling Count"
      >
        <form onSubmit={handleWalkPologenSubmit} className="space-y-4 text-xs">
          {/* Step 1: Select Farmer */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Step 1: Select Owning Farmer *
            </label>
            <select
              value={pologenFormFarmerId}
              onChange={(e) => setPologenFormFarmerId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg font-bold text-slate-800 bg-emerald-50/40 border-emerald-300"
            >
              {farmers.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.id}) - {f.village}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Plantation */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Step 2: Target Plantation Parcel *
            </label>
            <select
              value={pologenForm.plantationId}
              onChange={(e) => setPologenForm({ ...pologenForm, plantationId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {pologenFormAvailablePlantations.length === 0 ? (
                <option value="">No plantations found for this farmer</option>
              ) : (
                pologenFormAvailablePlantations.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id}) - {p.areaHectares} Ha</option>
                ))
              )}
            </select>
          </div>

          {/* Block Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Sapling Block Name</label>
            <input
              type="text"
              placeholder="e.g. East Boundary Nursery Block"
              value={pologenForm.name}
              onChange={(e) => setPologenForm({ ...pologenForm, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Sapling Count (&lt; 7 yrs) *</label>
              <input
                type="number"
                required
                value={pologenForm.saplingCount}
                onChange={(e) => setPologenForm({ ...pologenForm, saplingCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Planting Year</label>
              <input
                type="number"
                value={pologenForm.plantingYear}
                onChange={(e) => setPologenForm({ ...pologenForm, plantingYear: parseInt(e.target.value) || 2023 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Walked Area (m²)</label>
              <input
                type="number"
                value={pologenForm.areaSquareMeters}
                onChange={(e) => setPologenForm({ ...pologenForm, areaSquareMeters: parseInt(e.target.value) || 5000 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Perimeter (Meters)</label>
              <input
                type="number"
                value={pologenForm.perimeterMeters}
                onChange={(e) => setPologenForm({ ...pologenForm, perimeterMeters: parseInt(e.target.value) || 300 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsWalkPologenModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pologenFormAvailablePlantations.length === 0}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
            >
              Confirm POLOGEN Walk
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Tree Form Modal */}
      <Modal
        isOpen={isAddTreeModalOpen}
        onClose={() => setIsAddTreeModalOpen(false)}
        title="Tag Mature Agarwood Tree (Point GPS)"
        subtitle="Step 1: Select Farmer • Step 2: Select Plantation • Step 3: Record GPS & Trunk Girth"
      >
        <form onSubmit={handleAddTreeSubmit} className="space-y-4 text-xs">
          {/* Step 1: Select Farmer */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Step 1: Select Owning Farmer *
            </label>
            <select
              value={treeFormFarmerId}
              onChange={(e) => setTreeFormFarmerId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg font-bold text-slate-800 bg-emerald-50/40 border-emerald-300"
            >
              {farmers.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.id}) - {f.village}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Plantation */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Step 2: Target Plantation Plot *
            </label>
            <select
              value={treeForm.plantationId}
              onChange={(e) => setTreeForm({ ...treeForm, plantationId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {treeFormAvailablePlantations.length === 0 ? (
                <option value="">No plantations found for this farmer</option>
              ) : (
                treeFormAvailablePlantations.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id}) - {p.areaHectares} Ha</option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tree Age (Years &ge; 7)</label>
              <input
                type="number"
                min="7"
                max="35"
                value={treeForm.ageYears}
                onChange={(e) => setTreeForm({ ...treeForm, ageYears: parseInt(e.target.value) || 7 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Trunk Girth (cm)</label>
              <input
                type="number"
                value={treeForm.girthCm}
                onChange={(e) => setTreeForm({ ...treeForm, girthCm: parseInt(e.target.value) || 50 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Height (Meters)</label>
              <input
                type="number"
                value={treeForm.heightMeters}
                onChange={(e) => setTreeForm({ ...treeForm, heightMeters: parseInt(e.target.value) || 8 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">GPS Point Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={treeForm.gpsLatitude}
                onChange={(e) => setTreeForm({ ...treeForm, gpsLatitude: parseFloat(e.target.value) || 26.52 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">GPS Point Longitude</label>
            <input
              type="number"
              step="0.0001"
              value={treeForm.gpsLongitude}
              onChange={(e) => setTreeForm({ ...treeForm, gpsLongitude: parseFloat(e.target.value) || 93.97 })}
              className="w-full px-3 py-2 border rounded-lg"
            />
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
              disabled={treeFormAvailablePlantations.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
            >
              Confirm Point Tag
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
