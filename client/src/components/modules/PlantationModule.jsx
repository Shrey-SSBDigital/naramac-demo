import React, { useState, useMemo } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import {
  Trees,
  MapPin,
  Plus,
  Compass,
  CheckCircle2,
  Sprout,
  Users,
  GitFork,
  ArrowRight,
  ShieldCheck,
  Calendar,
  FileText,
  Landmark,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
  Tag
} from 'lucide-react';

export default function PlantationModule({ onOpenGeoStudio }) {
  const {
    farmers,
    plantations,
    addPlantation,
    pologens,
    trees
  } = useEnterprise();

  // Active Tab: 'PLOTS' (Default) | 'HIERARCHY' | 'SURVEY_ASSETS'
  const [activeTab, setActiveTab] = useState('PLOTS');
  const [selectedFarmerId, setSelectedFarmerId] = useState('ALL');
  const [selectedCluster, setSelectedCluster] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected item states for detail modals
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [selectedPologen, setSelectedPologen] = useState(null);
  const [selectedTree, setSelectedTree] = useState(null);

  // Modal open states
  const [isAddPlotModalOpen, setIsAddPlotModalOpen] = useState(false);

  // Form state for registering a new plot / plantation
  const [plotForm, setPlotForm] = useState({
    farmerId: farmers[0]?.id || 'FRM-AS-01',
    name: '',
    dagNumber: 'Dag 312, Patta 78',
    landAreaAcres: '3.2',
    cluster: 'Golaghat Cluster',
    district: 'Golaghat',
    village: 'Mohuramukh Gaon, Bokakhat',
    soilType: 'Red Loamy / Alluvial',
    elevationMeters: '96',
    declaredSaplings: '300',
    declaredMature: '120',
    jamabandiDoc: 'Jamabandi_GLT_Dag312_Patta78.pdf',
    jamabandiHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  });

  // Filtered collections
  const filteredPlantations = useMemo(() => {
    return plantations.filter(p => {
      const matchesFarmer = selectedFarmerId === 'ALL' || p.farmerId === selectedFarmerId;
      const matchesCluster = selectedCluster === 'ALL' || p.cluster === selectedCluster;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.farmerName && p.farmerName.toLowerCase().includes(q)) ||
        (p.dagNumber && p.dagNumber.toLowerCase().includes(q)) ||
        (p.district && p.district.toLowerCase().includes(q));
      return matchesFarmer && matchesCluster && matchesSearch;
    });
  }, [plantations, selectedFarmerId, selectedCluster, searchQuery]);

  const filteredPologens = useMemo(() => {
    return pologens.filter(plg => {
      const matchesFarmer = selectedFarmerId === 'ALL' || plg.farmerId === selectedFarmerId;
      const matchesCluster = selectedCluster === 'ALL' || plg.cluster === selectedCluster;
      return matchesFarmer && matchesCluster;
    });
  }, [pologens, selectedFarmerId, selectedCluster]);

  const filteredTrees = useMemo(() => {
    return trees.filter(t => {
      const matchesFarmer = selectedFarmerId === 'ALL' || t.farmerId === selectedFarmerId;
      const matchesCluster = selectedCluster === 'ALL' || t.cluster === selectedCluster;
      return matchesFarmer && matchesCluster;
    });
  }, [trees, selectedFarmerId, selectedCluster]);

  // Aggregate metrics
  const totalHectares = useMemo(() => {
    return plantations.reduce((sum, p) => sum + (parseFloat(p.areaHectares) || 0), 0).toFixed(2);
  }, [plantations]);

  const totalAcres = useMemo(() => {
    return (totalHectares * 2.47105).toFixed(1);
  }, [totalHectares]);

  const surveyedPlotsCount = useMemo(() => {
    return plantations.filter(p =>
      pologens.some(plg => plg.plantationId === p.id) ||
      trees.some(t => t.plantationId === p.id)
    ).length;
  }, [plantations, pologens, trees]);

  // Handle Add Plot submit
  const handleAddPlotSubmit = (e) => {
    e.preventDefault();
    const farmer = farmers.find(f => f.id === plotForm.farmerId) || farmers[0];
    if (!farmer) return;

    const acres = parseFloat(plotForm.landAreaAcres) || 2.5;
    const hectares = parseFloat((acres * 0.404686).toFixed(2));

    addPlantation({
      farmerId: farmer.id,
      farmerName: farmer.name,
      name: plotForm.name.trim() || `${farmer.name} Agro-Parcel`,
      dagNumber: plotForm.dagNumber,
      landAreaAcres: acres,
      areaHectares: hectares,
      cluster: plotForm.cluster,
      district: plotForm.district,
      village: plotForm.village,
      soilType: plotForm.soilType,
      elevationMeters: parseInt(plotForm.elevationMeters) || 96,
      youngTrees: parseInt(plotForm.declaredSaplings) || 0,
      matureTrees: parseInt(plotForm.declaredMature) || 0,
      totalTrees: (parseInt(plotForm.declaredSaplings) || 0) + (parseInt(plotForm.declaredMature) || 0),
      jamabandiDoc: plotForm.jamabandiDoc,
      jamabandiHash: plotForm.jamabandiHash,
      status: 'PENDING_SURVEY'
    });

    setIsAddPlotModalOpen(false);
    // Reset form for next entry
    setPlotForm({
      farmerId: farmers[0]?.id || 'FRM-AS-01',
      name: '',
      dagNumber: 'Dag 312, Patta 78',
      landAreaAcres: '3.2',
      cluster: 'Golaghat Cluster',
      district: 'Golaghat',
      village: 'Mohuramukh Gaon, Bokakhat',
      soilType: 'Red Loamy / Alluvial',
      elevationMeters: '96',
      declaredSaplings: '300',
      declaredMature: '120',
      jamabandiDoc: 'Jamabandi_GLT_Dag312_Patta78.pdf',
      jamabandiHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    });
  };

  // Columns for Plots & Plantations Registry Table
  const plotColumns = [
    {
      header: 'Plot ID & Title',
      accessor: 'id',
      render: (plot) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-emerald-950 font-mono text-xs">{plot.id}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
              {plot.state || (plot.cluster?.includes('Tripura') ? 'Tripura' : 'Assam')}
            </span>
          </div>
          <div className="text-xs font-bold text-slate-900">{plot.name}</div>
          <div className="text-[11px] font-mono text-emerald-800 font-semibold">{plot.dagNumber || 'Dag 182, Patta 44'}</div>
        </div>
      )
    },
    {
      header: 'Attached Farmer',
      accessor: 'farmerName',
      render: (plot) => {
        const farmerObj = farmers.find(f => f.id === plot.farmerId);
        return (
          <div>
            <div className="font-extrabold text-slate-900">{plot.farmerName}</div>
            <div className="text-[10px] font-mono text-slate-500">{plot.farmerId}</div>
            {farmerObj && (
              <div className="text-[11px] text-slate-500">{farmerObj.phone}</div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Land Area & Cadastral',
      accessor: 'areaHectares',
      render: (plot) => {
        const ha = parseFloat(plot.areaHectares) || 1.25;
        const acres = plot.landAreaAcres ? parseFloat(plot.landAreaAcres) : (ha * 2.471).toFixed(1);
        return (
          <div>
            <div className="font-extrabold text-slate-900 text-xs">
              {acres} Acres <span className="text-slate-400 font-normal">({ha} Ha)</span>
            </div>
            <div className="text-[11px] text-slate-500">
              {plot.soilType || 'Red Loamy'} • {plot.elevationMeters || 96}m MSL
            </div>
          </div>
        );
      }
    },
    {
      header: 'Location / Cluster',
      accessor: 'cluster',
      render: (plot) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">{plot.district || 'Golaghat'}</div>
          <div className="text-[11px] text-slate-500">{plot.cluster}</div>
        </div>
      )
    },
    {
      header: 'Declared vs Surveyed',
      accessor: 'totalTrees',
      render: (plot) => {
        const plotPologens = pologens.filter(p => p.plantationId === plot.id);
        const plotTrees = trees.filter(t => t.plantationId === plot.id);
        const declared = plot.totalTrees || 380;
        return (
          <div className="space-y-1">
            <div className="text-xs text-slate-700 font-medium">
              Declared: <b>{declared}</b> trees
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded font-bold border border-teal-200">
                {plotPologens.length} POLOGEN
              </span>
              <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                {plotTrees.length} Trees
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'GIS Field Survey',
      accessor: 'status',
      render: (plot) => {
        const hasSurvey = pologens.some(p => p.plantationId === plot.id) || trees.some(t => t.plantationId === plot.id);
        if (hasSurvey) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Survey Complete</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Field Visit</span>
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (plot) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedPlot(plot)}
            className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            View Details
          </button>
          {onOpenGeoStudio && (
            <button
              onClick={onOpenGeoStudio}
              title="Launch Field GIS Studio to survey this plot"
              className="px-2.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Survey</span>
            </button>
          )}
        </div>
      )
    }
  ];

  // POLOGEN Columns
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
      header: 'Attached Plot & Farmer',
      accessor: 'plantationId',
      render: (plg) => (
        <div>
          <span className="font-bold text-slate-800 text-xs">{plg.plantationId}</span>
          <div className="text-[11px] text-slate-600">{plg.farmerName} ({plg.farmerId})</div>
        </div>
      )
    },
    {
      header: 'Saplings & Age',
      accessor: 'saplingCount',
      render: (plg) => (
        <div>
          <span className="font-extrabold text-teal-800">{plg.saplingCount} Saplings</span>
          <div className="text-[11px] text-slate-500">&lt; 7 Yrs • Planted {plg.plantingYear || 2022}</div>
        </div>
      )
    },
    {
      header: 'Area & Perimeter',
      accessor: 'areaSquareMeters',
      render: (plg) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-700">{(plg.areaSquareMeters || 8200).toLocaleString()} m²</span>
          <div className="text-[11px] text-slate-500">Perimeter: {plg.perimeterMeters || 390}m</div>
        </div>
      )
    },
    {
      header: 'Survey Date',
      accessor: 'walkedDate',
      render: (plg) => (
        <span className="font-mono text-xs text-slate-600">{plg.walkedDate}</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (plg) => <StatusBadge status={plg.status} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (plg) => (
        <button
          onClick={() => setSelectedPologen(plg)}
          className="px-2.5 py-1 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
        >
          Details
        </button>
      )
    }
  ];

  // Tree Columns
  const treeColumns = [
    {
      header: 'Tree ID / QR Tag',
      accessor: 'id',
      render: (t) => (
        <div>
          <span className="font-extrabold text-emerald-950 font-mono text-xs">{t.id}</span>
          <div className="text-[10px] font-mono text-slate-500">{t.qrTagCode || `TAG-${t.id}`}</div>
        </div>
      )
    },
    {
      header: 'Attached Plot & Farmer',
      accessor: 'plantationId',
      render: (t) => (
        <div>
          <span className="font-bold text-slate-800 text-xs">{t.plantationId}</span>
          <div className="text-[11px] text-slate-600">{t.farmerName} ({t.farmerId})</div>
        </div>
      )
    },
    {
      header: 'Maturity & Dimensions',
      accessor: 'ageYears',
      render: (t) => (
        <div>
          <span className="font-extrabold text-emerald-800">{t.ageYears} Yrs</span>
          <div className="text-[11px] text-slate-500">Girth: {t.girthCm}cm • H: {t.heightM || t.heightMeters || 12}m</div>
        </div>
      )
    },
    {
      header: 'GPS Coordinates',
      accessor: 'gpsLatitude',
      render: (t) => {
        const lat = typeof t.gpsLatitude === 'number' ? t.gpsLatitude : (t.coordinates ? t.coordinates[0] : 26.5208);
        const lng = typeof t.gpsLongitude === 'number' ? t.gpsLongitude : (t.coordinates ? t.coordinates[1] : 93.9790);
        return (
          <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        );
      }
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
          onClick={() => setSelectedTree(t)}
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
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Plots & Plantations Management
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 03 • Homestead Land Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastral plot declarations, revenue Dag/Patta titles, and registered agro-parcels. Field surveys (POLOGEN boundary walk and tree geo-pinning) are conducted via the <b>Field GIS Studio</b>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddPlotModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Plot / Plantation</span>
          </button>

          {onOpenGeoStudio && (
            <button
              type="button"
              onClick={onOpenGeoStudio}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              title="Launch Field GIS Studio for interactive map & cadastral boundary survey"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Open Field GIS Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Registered Plots</span>
            <Trees className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{plantations.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across {farmers.length} approved farmers</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Land Area</span>
            <Landmark className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-black text-teal-950 mt-1">{totalAcres} <span className="text-xs font-bold text-slate-500">Acres</span></div>
          <div className="text-[10px] text-slate-400 mt-0.5">{totalHectares} Hectares Cadastral Area</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Survey Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-800 mt-1">{surveyedPlotsCount} <span className="text-xs font-bold text-slate-500">/ {plantations.length}</span></div>
          <div className="text-[10px] text-slate-400 mt-0.5">With GIS POLOGENs or Trees</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Surveyed Assets</span>
            <Sprout className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{pologens.length + trees.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{pologens.length} POLOGENs • {trees.length} Mature Trees</div>
        </div>
      </div>

      {/* Top Filter Bar: Farmer, Cluster & Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Farmer Selector */}
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-slate-700">Farmer:</span>
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

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search Plot ID, Dag/Patta, Farmer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 w-56 font-medium"
          />
        </div>
      </div>

      {/* Informational Callout Bar linking to Field GIS Studio */}
      <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-800">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-emerald-950">Field Agent Workflow:</span>
            <span className="text-emerald-800 ml-1">
              Once an approved farmer registers a Plot here, Field Agents conduct the on-ground survey (POLOGEN boundary walk & mature tree tagging) in the <b>Field GIS Studio</b>.
            </span>
          </div>
        </div>
        {onOpenGeoStudio && (
          <button
            onClick={onOpenGeoStudio}
            className="shrink-0 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs transition"
          >
            <span>Launch Field GIS Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 bg-white px-3 pt-2 rounded-t-xl border border-b-0">
        <button
          onClick={() => setActiveTab('PLOTS')}
          className={`px-3.5 py-2 font-bold text-xs border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'PLOTS'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trees className="w-4 h-4" />
          <span>Plots & Plantations Registry ({filteredPlantations.length})</span>
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
          onClick={() => setActiveTab('SURVEY_ASSETS')}
          className={`px-3.5 py-2 font-bold text-xs border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'SURVEY_ASSETS'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Surveyed Assets ({filteredPologens.length} POLOGENs • {filteredTrees.length} Trees)</span>
        </button>
      </div>

      {/* TAB 1: PLOTS & PLANTATIONS REGISTRY */}
      {activeTab === 'PLOTS' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-4 shadow-xs">
          <DataTable
            columns={plotColumns}
            data={filteredPlantations}
            searchKey="name"
            emptyMessage="No registered plots found matching the filter."
          />
        </div>
      )}

      {/* TAB 2: FARMER GROUPED HIERARCHY */}
      {activeTab === 'HIERARCHY' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-5 shadow-xs space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Farmer → Plot → Surveyed Asset Tree Structure
          </div>

          {farmers
            .filter(f => selectedFarmerId === 'ALL' || f.id === selectedFarmerId)
            .map(farmer => {
              const farmerPlots = plantations.filter(p => p.farmerId === farmer.id);
              return (
                <div key={farmer.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 p-3.5 flex items-center justify-between border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {farmer.name[0]}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm">{farmer.name}</span>
                        <span className="text-xs font-mono text-slate-500 ml-2">({farmer.id})</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 font-mono">
                      {farmer.village} • {farmerPlots.length} Plots
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {farmerPlots.length === 0 ? (
                      <div className="text-xs text-slate-400 italic py-2">
                        No plots declared yet. Click "+ Add Plot / Plantation" to declare an agro-parcel.
                      </div>
                    ) : (
                      farmerPlots.map(plot => {
                        const plotPologens = pologens.filter(p => p.plantationId === plot.id);
                        const plotTrees = trees.filter(t => t.plantationId === plot.id);
                        return (
                          <div key={plot.id} className="border border-slate-100 bg-slate-50/50 p-3.5 rounded-xl space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-800">{plot.name}</span>
                                <span className="font-mono text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  {plot.id}
                                </span>
                                <span className="text-[11px] text-slate-500 font-mono">{plot.dagNumber}</span>
                              </div>
                              <button
                                onClick={() => setSelectedPlot(plot)}
                                className="text-xs font-bold text-emerald-700 hover:underline"
                              >
                                View Plot Details →
                              </button>
                            </div>

                            {/* Linked survey assets */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div className="p-2.5 bg-white rounded-lg border border-teal-100">
                                <div className="font-bold text-teal-900 flex items-center justify-between">
                                  <span>POLOGEN Sapling Blocks (&lt;7 yrs)</span>
                                  <span className="text-[11px] font-mono text-teal-700">{plotPologens.length} active</span>
                                </div>
                                {plotPologens.length === 0 ? (
                                  <div className="text-[11px] text-slate-400 mt-1 italic">No POLOGEN polygon walked yet.</div>
                                ) : (
                                  <div className="mt-1 space-y-1">
                                    {plotPologens.map(plg => (
                                      <div key={plg.id} className="text-[11px] flex items-center justify-between font-mono bg-teal-50/60 p-1.5 rounded">
                                        <span className="font-bold text-teal-950">{plg.id}</span>
                                        <span>{plg.saplingCount} saplings ({plg.areaSquareMeters} m²)</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
                                <div className="font-bold text-emerald-900 flex items-center justify-between">
                                  <span>Mature Tagged Trees (≥7 yrs)</span>
                                  <span className="text-[11px] font-mono text-emerald-700">{plotTrees.length} tagged</span>
                                </div>
                                {plotTrees.length === 0 ? (
                                  <div className="text-[11px] text-slate-400 mt-1 italic">No mature trees geo-pinned yet.</div>
                                ) : (
                                  <div className="mt-1 space-y-1">
                                    {plotTrees.map(t => (
                                      <div key={t.id} className="text-[11px] flex items-center justify-between font-mono bg-emerald-50/60 p-1.5 rounded">
                                        <span className="font-bold text-emerald-950">{t.id}</span>
                                        <span>{t.ageYears}y • Girth: {t.girthCm}cm • {t.status}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* TAB 3: SURVEYED ASSETS SUMMARY */}
      {activeTab === 'SURVEY_ASSETS' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-5 shadow-xs space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-extrabold text-teal-950 text-sm flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-teal-700" />
                  <span>POLOGEN Sapling Perimeter Polygons (&lt; 7 Years)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Walked perimeter boundaries of high-density saplings with autonomous area computation.
                </p>
              </div>
              {onOpenGeoStudio && (
                <button
                  onClick={onOpenGeoStudio}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Compass className="w-3.5 h-3.5 text-teal-700" />
                  <span>Walk in Field GIS Studio</span>
                </button>
              )}
            </div>

            <DataTable
              columns={pologenColumns}
              data={filteredPologens}
              searchKey="id"
              emptyMessage="No POLOGEN sapling blocks recorded."
            />
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-extrabold text-emerald-950 text-sm flex items-center gap-1.5">
                  <Trees className="w-4 h-4 text-emerald-700" />
                  <span>Mature Individually Tagged Trees (≥ 7 Years)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Point geo-pinned trees tagged with physical QR identifiers, GBH/height measurements, and SHA-256 photos.
                </p>
              </div>
              {onOpenGeoStudio && (
                <button
                  onClick={onOpenGeoStudio}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Pin in Field GIS Studio</span>
                </button>
              )}
            </div>

            <DataTable
              columns={treeColumns}
              data={filteredTrees}
              searchKey="id"
              emptyMessage="No mature trees geo-pinned."
            />
          </div>
        </div>
      )}

      {/* MODAL: Register New Agro-Plot / Plantation */}
      <Modal
        isOpen={isAddPlotModalOpen}
        onClose={() => setIsAddPlotModalOpen(false)}
        title="Register New Agro-Plot / Plantation Parcel"
        subtitle="Homestead Cadastral Declaration • Step 2 in ASCTS Traceability Chain"
      >
        <form onSubmit={handleAddPlotSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Select Approved Farmer Identity (FRM ID) *
            </label>
            <select
              value={plotForm.farmerId}
              onChange={(e) => {
                const fId = e.target.value;
                const f = farmers.find(x => x.id === fId);
                setPlotForm({
                  ...plotForm,
                  farmerId: fId,
                  name: f ? `${f.name} Agro-Parcel 01` : plotForm.name,
                  dagNumber: f?.dagNumber || plotForm.dagNumber,
                  cluster: f?.cluster || plotForm.cluster,
                  district: f?.district || plotForm.district,
                  village: f?.village || plotForm.village
                });
              }}
              className="w-full px-3 py-2 border rounded-lg font-bold text-slate-800 bg-emerald-50/40 border-emerald-300"
            >
              {farmers.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.id}) — {f.village}, {f.dagNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Plot / Plantation Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mohuramukh Agarwood Parcel 01"
              value={plotForm.name}
              onChange={e => setPlotForm({ ...plotForm, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Cadastral Revenue Title (Dag & Patta) *
              </label>
              <input
                type="text"
                required
                value={plotForm.dagNumber}
                onChange={e => setPlotForm({ ...plotForm, dagNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Homestead Plot Area (Acres) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={plotForm.landAreaAcres}
                onChange={e => setPlotForm({ ...plotForm, landAreaAcres: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Cluster Region
              </label>
              <select
                value={plotForm.cluster}
                onChange={e => setPlotForm({ ...plotForm, cluster: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Golaghat Cluster">Golaghat Cluster (Assam)</option>
                <option value="Kadamtala Cluster">Kadamtala Cluster (Tripura)</option>
                <option value="Hojai / Golaghat">Hojai Cluster</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Soil Classification
              </label>
              <input
                type="text"
                value={plotForm.soilType}
                onChange={e => setPlotForm({ ...plotForm, soilType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Declared Young Saplings (&lt;7 yrs)
              </label>
              <input
                type="number"
                value={plotForm.declaredSaplings}
                onChange={e => setPlotForm({ ...plotForm, declaredSaplings: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Declared Mature Trees (≥7 yrs)
              </label>
              <input
                type="number"
                value={plotForm.declaredMature}
                onChange={e => setPlotForm({ ...plotForm, declaredMature: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1">
            <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              <span>Next Step: On-Ground Field Agent Visit</span>
            </span>
            <p className="text-[11px] text-emerald-800">
              Upon registering this plot, it enters the <b>Field GIS Studio</b> queue where a Field Agent conducts the on-ground POLOGEN boundary walk and tags individual mature trees with RTK GPS and SHA-256 photos.
            </p>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddPlotModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register Plot & Issue Plot ID</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Plot Record Details */}
      <Modal
        isOpen={!!selectedPlot}
        onClose={() => setSelectedPlot(null)}
        title={selectedPlot ? `${selectedPlot.id} • Plot & Land Details` : 'Plot Details'}
        subtitle={selectedPlot?.name}
      >
        {selectedPlot && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Plot ID</span>
                <div className="font-mono font-black text-emerald-900 text-sm">{selectedPlot.id}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Attached Farmer</span>
                <div className="font-bold text-slate-900">{selectedPlot.farmerName}</div>
                <div className="font-mono text-[10px] text-slate-500">{selectedPlot.farmerId}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Revenue Title</span>
                <div className="font-bold text-slate-900">{selectedPlot.dagNumber || 'Dag 182, Patta 44'}</div>
                <div className="text-[10px] text-emerald-700 font-bold">Lat Mandal Cleared</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Cadastral Area</span>
                <div className="font-bold text-slate-900">
                  {selectedPlot.landAreaAcres || (selectedPlot.areaHectares * 2.471).toFixed(1)} Acres ({selectedPlot.areaHectares} Ha)
                </div>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-800 text-xs">Cadastral Survey Assets</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-teal-50 p-2 rounded-lg border border-teal-200">
                  <div className="font-bold text-teal-900">POLOGEN Polygons (&lt;7 yrs)</div>
                  <div className="text-lg font-black text-teal-950 mt-0.5">
                    {pologens.filter(p => p.plantationId === selectedPlot.id).length}
                  </div>
                </div>
                <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <div className="font-bold text-emerald-900">Tagged Trees (≥7 yrs)</div>
                  <div className="text-lg font-black text-emerald-950 mt-0.5">
                    {trees.filter(t => t.plantationId === selectedPlot.id).length}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedPlot(null)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              {onOpenGeoStudio && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlot(null);
                    onOpenGeoStudio();
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Compass className="w-4 h-4 text-emerald-300" />
                  <span>Open in Field GIS Studio</span>
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: POLOGEN Details */}
      <Modal
        isOpen={!!selectedPologen}
        onClose={() => setSelectedPologen(null)}
        title={selectedPologen ? `${selectedPologen.id} • POLOGEN Detail` : 'POLOGEN Details'}
        subtitle="Young Sapling Boundary Polygon (< 7 Years)"
      >
        {selectedPologen && (
          <div className="space-y-4 text-xs">
            <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono font-black text-teal-950 text-sm">{selectedPologen.id}</span>
                <StatusBadge status={selectedPologen.status} />
              </div>
              <div className="font-bold text-slate-800">{selectedPologen.name}</div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-teal-200">
                <div>Attached Plot: <b>{selectedPologen.plantationId}</b></div>
                <div>Farmer: <b>{selectedPologen.farmerName}</b></div>
                <div>Saplings: <b>{selectedPologen.saplingCount}</b></div>
                <div>Area: <b>{selectedPologen.areaSquareMeters} m²</b></div>
                <div>Perimeter: <b>{selectedPologen.perimeterMeters}m</b></div>
                <div>Vertices: <b>{selectedPologen.walkedVerticesCount || 5} points</b></div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPologen(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Tree Details */}
      <Modal
        isOpen={!!selectedTree}
        onClose={() => setSelectedTree(null)}
        title={selectedTree ? `${selectedTree.id} • Mature Tree Pin` : 'Tree Details'}
        subtitle="Individual Geo-Pinned Tree (≥ 7 Years)"
      >
        {selectedTree && (
          <div className="space-y-4 text-xs">
            <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono font-black text-emerald-950 text-sm">{selectedTree.id}</span>
                <StatusBadge status={selectedTree.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-emerald-200">
                <div>Attached Plot: <b>{selectedTree.plantationId}</b></div>
                <div>Farmer: <b>{selectedTree.farmerName}</b></div>
                <div>Age: <b>{selectedTree.ageYears} Years</b></div>
                <div>Girth: <b>{selectedTree.girthCm} cm</b></div>
                <div>Height: <b>{selectedTree.heightM || selectedTree.heightMeters || 12} m</b></div>
                <div>QR Tag: <b className="font-mono">{selectedTree.qrTagCode}</b></div>
                <div className="col-span-2 font-mono text-[10px] bg-white p-1.5 rounded border border-emerald-200">
                  GPS: {(selectedTree.gpsLatitude || selectedTree.coordinates?.[0] || 26.52).toFixed(5)}, {(selectedTree.gpsLongitude || selectedTree.coordinates?.[1] || 93.97).toFixed(5)}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTree(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
