import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import {
  UserPlus,
  MapPin,
  Eye,
  ShieldCheck,
  Check,
  Sparkles,
  Building,
  Trees,
  Sprout,
  Plus,
  GitFork,
  ArrowRight,
  Layers,
  CheckCircle2,
  Calendar,
  Tag,
  Camera
} from 'lucide-react';

export default function FarmerModule({ onOpenGeoStudio, onOpenRegister }) {
  const {
    farmers,
    addFarmer,
    plantations,
    addPlantation,
    pologens,
    addPologen,
    trees,
    addTree,
    activeRole
  } = useEnterprise();

  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [activeTab, setActiveTab] = useState('HIERARCHY'); // 'HIERARCHY' | 'PLANTATIONS' | 'POLOGENS' | 'TREES' | 'DETAILS'
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Quick Action Sub-Modals from Farmer Profile
  const [isAttachPlantationModalOpen, setIsAttachPlantationModalOpen] = useState(false);
  const [isWalkPologenModalOpen, setIsWalkPologenModalOpen] = useState(false);
  const [isTagTreeModalOpen, setIsTagTreeModalOpen] = useState(false);

  // Form states
  const [farmerFormData, setFarmerFormData] = useState({
    name: '',
    fatherName: '',
    gender: 'Male',
    age: 45,
    phone: '',
    state: 'Assam',
    cluster: 'Golaghat Cluster',
    district: 'Golaghat',
    subdivision: 'Bokakhat',
    village: '',
    dagNumber: '',
    landAreaAcres: 2.5,
    treeCount: 200,
    coordinates: [26.5204, 93.9782]
  });

  const [plantationForm, setPlantationForm] = useState({
    name: '',
    areaHectares: 1.25,
    soilType: 'Alluvial Loam',
    elevationMeters: 96,
    matureTrees: 50,
    youngTrees: 100
  });

  const [pologenForm, setPologenForm] = useState({
    plantationId: '',
    name: '',
    plantingYear: 2023,
    ageYears: 3.0,
    saplingCount: 100,
    areaSquareMeters: 4800,
    perimeterMeters: 290
  });

  const [treeForm, setTreeForm] = useState({
    plantationId: '',
    ageYears: 12,
    girthCm: 65,
    heightMeters: 10,
    gpsLatitude: 26.5208,
    gpsLongitude: 93.9790
  });

  // Calculate farmer asset totals
  const totalPlantationsCount = plantations.length;
  const totalPologensCount = pologens.length;
  const totalSaplingsCount = pologens.reduce((sum, p) => sum + (p.saplingCount || 0), 0);
  const totalTreesCount = trees.length;

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!farmerFormData.name || !farmerFormData.village) return;
    const newF = addFarmer(farmerFormData);
    setIsRegisterModalOpen(false);
    setSelectedFarmer(newF);
    setActiveTab('HIERARCHY');
    setFarmerFormData({
      name: '',
      fatherName: '',
      gender: 'Male',
      age: 45,
      phone: '',
      state: 'Assam',
      cluster: 'Golaghat Cluster',
      district: 'Golaghat',
      subdivision: 'Bokakhat',
      village: '',
      dagNumber: '',
      landAreaAcres: 2.5,
      treeCount: 200,
      coordinates: [26.5204, 93.9782]
    });
  };

  const handleAttachPlantationSubmit = (e) => {
    e.preventDefault();
    if (!selectedFarmer) return;
    addPlantation({
      farmerId: selectedFarmer.id,
      name: plantationForm.name || `${selectedFarmer.name.split(' ')[0]} Agro Plot ${plantations.length + 1}`,
      cluster: selectedFarmer.cluster,
      areaHectares: plantationForm.areaHectares,
      soilType: plantationForm.soilType,
      elevationMeters: plantationForm.elevationMeters,
      matureTrees: plantationForm.matureTrees,
      youngTrees: plantationForm.youngTrees
    });
    setIsAttachPlantationModalOpen(false);
  };

  const handleWalkPologenSubmit = (e) => {
    e.preventDefault();
    if (!selectedFarmer) return;
    const targetPlt = plantations.find(p => p.id === pologenForm.plantationId) || plantations.find(p => p.farmerId === selectedFarmer.id);
    if (!targetPlt) return;
    addPologen({
      farmerId: selectedFarmer.id,
      plantationId: targetPlt.id,
      name: pologenForm.name || `${targetPlt.name} Sapling Block`,
      plantingYear: pologenForm.plantingYear,
      ageYears: pologenForm.ageYears,
      saplingCount: pologenForm.saplingCount,
      areaSquareMeters: pologenForm.areaSquareMeters,
      perimeterMeters: pologenForm.perimeterMeters
    });
    setIsWalkPologenModalOpen(false);
  };

  const handleTagTreeSubmit = (e) => {
    e.preventDefault();
    if (!selectedFarmer) return;
    const targetPlt = plantations.find(p => p.id === treeForm.plantationId) || plantations.find(p => p.farmerId === selectedFarmer.id);
    if (!targetPlt) return;
    addTree({
      farmerId: selectedFarmer.id,
      plantationId: targetPlt.id,
      ageYears: treeForm.ageYears,
      girthCm: treeForm.girthCm,
      heightMeters: treeForm.heightMeters,
      gpsLatitude: treeForm.gpsLatitude,
      gpsLongitude: treeForm.gpsLongitude
    });
    setIsTagTreeModalOpen(false);
  };

  // Farmer table columns
  const columns = [
    {
      header: 'Farmer ID & Name',
      accessor: 'name',
      render: (f) => (
        <div>
          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
            <span>{f.name}</span>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
              {f.id}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            S/o {f.fatherName} • {f.village}
          </div>
        </div>
      )
    },
    {
      header: 'Cluster / District',
      accessor: 'cluster',
      render: (f) => (
        <div>
          <span className="font-bold text-slate-800">{f.cluster}</span>
          <div className="text-[11px] text-slate-500">{f.district}, {f.state}</div>
        </div>
      )
    },
    {
      header: 'Land Title (Dag / Patta)',
      accessor: 'dagNumber',
      render: (f) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-700">{f.dagNumber}</span>
          <div className="text-[11px] text-slate-500">{f.landAreaAcres} Acres</div>
        </div>
      )
    },
    {
      header: 'Plantations (Plots)',
      accessor: 'id',
      render: (f) => {
        const farmerPlts = plantations.filter(p => p.farmerId === f.id);
        const totalHa = farmerPlts.reduce((sum, p) => sum + (p.areaHectares || 0), 0);
        return (
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-emerald-700" />
              <span>{farmerPlts.length} {farmerPlts.length === 1 ? 'Plot' : 'Plots'}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">{totalHa.toFixed(2)} Ha verified</div>
          </div>
        );
      }
    },
    {
      header: 'POLOGENs (<7 yrs)',
      accessor: 'id',
      render: (f) => {
        const farmerPlgs = pologens.filter(p => p.farmerId === f.id);
        const totalSap = farmerPlgs.reduce((sum, p) => sum + (p.saplingCount || 0), 0);
        return (
          <div>
            <div className="font-bold text-teal-800 flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-teal-600" />
              <span>{farmerPlgs.length} Polygons</span>
            </div>
            <div className="text-[11px] text-teal-700 font-semibold">{totalSap} Young Saplings</div>
          </div>
        );
      }
    },
    {
      header: 'Mature Trees (≥7 yrs)',
      accessor: 'id',
      render: (f) => {
        const farmerTrees = trees.filter(t => t.farmerId === f.id);
        return (
          <div>
            <div className="font-bold text-emerald-900 flex items-center gap-1">
              <Trees className="w-3.5 h-3.5 text-emerald-700" />
              <span>{farmerTrees.length} Geo-Pinned</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold">Ready for Inoculation</div>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (f) => <StatusBadge status={f.status} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (f) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFarmer(f);
            setActiveTab('HIERARCHY');
          }}
          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1"
        >
          <span>Explore Assets</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      )
    }
  ];

  // Data for selected farmer
  const farmerPlantations = selectedFarmer ? plantations.filter(p => p.farmerId === selectedFarmer.id) : [];
  const farmerPologens = selectedFarmer ? pologens.filter(p => p.farmerId === selectedFarmer.id) : [];
  const farmerTrees = selectedFarmer ? trees.filter(t => t.farmerId === selectedFarmer.id) : [];

  return (
    <div className="space-y-5">
      {/* Module Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Farmer & Grower Management</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 02 • Root Forestry Producer
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Primary producer registry. Every Plantation, young POLOGEN polygon (&lt;7 yrs), and mature tree (&ge;7 yrs) is strictly attached to its parent Farmer.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenRegister && (
            <button
              onClick={onOpenRegister}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold rounded-xl shadow-xs transition"
            >
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span>Full Registration Form (/farmer/register)</span>
            </button>
          )}
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Register Modal</span>
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={farmers}
        searchKey="name"
        searchPlaceholder="Search farmer by name, village, or Dag number..."
        filterKey="cluster"
        filterOptions={[
          { value: 'Golaghat Cluster', label: 'Golaghat Cluster (Assam)' },
          { value: 'Kadamtala Cluster', label: 'Kadamtala Cluster (Tripura)' },
          { value: 'Hojai / Golaghat', label: 'Hojai Cluster' }
        ]}
        onRowClick={(f) => {
          setSelectedFarmer(f);
          setActiveTab('HIERARCHY');
        }}
      />

      {/* Comprehensive Farmer Asset Explorer Modal */}
      {selectedFarmer && (
        <Modal
          isOpen={!!selectedFarmer}
          onClose={() => setSelectedFarmer(null)}
          title={`Grower Asset Hub: ${selectedFarmer.name}`}
          subtitle={`Farmer ID: ${selectedFarmer.id} • ${selectedFarmer.village}, ${selectedFarmer.cluster}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4 text-xs">
            {/* Top Stat Ribbon & Action Shortcuts */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Farmer Identity</span>
                  <span className="font-extrabold text-slate-900 font-mono">{selectedFarmer.id}</span>
                </div>
                <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Plantation Plots</span>
                  <span className="font-extrabold text-emerald-800">{farmerPlantations.length} Plots</span>
                </div>
                <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">POLOGEN Saplings (&lt;7y)</span>
                  <span className="font-extrabold text-teal-800">
                    {farmerPologens.reduce((sum, p) => sum + (p.saplingCount || 0), 0)} Saplings ({farmerPologens.length} Blocks)
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Mature Trees (&ge;7y)</span>
                  <span className="font-extrabold text-emerald-900">{farmerTrees.length} Geo-Pinned</span>
                </div>
              </div>

              {/* Direct "+ Add" Shortcuts attached to this farmer */}
              <div className="flex items-center gap-2">
                {onOpenGeoStudio && (
                  <button
                    onClick={() => {
                      setSelectedFarmer(null);
                      onOpenGeoStudio();
                    }}
                    className="px-2.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                    title="Launch Field GIS Studio for interactive map & camera capture"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-300" />
                    <span>GIS Studio</span>
                  </button>
                )}
                <button
                  onClick={() => setIsAttachPlantationModalOpen(true)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                  title="Attach new land plot to this farmer"
                >
                  <Building className="w-3.5 h-3.5 text-blue-300" />
                  <span>+ Plot</span>
                </button>
                <button
                  onClick={() => {
                    if (farmerPlantations.length > 0) {
                      setPologenForm(prev => ({ ...prev, plantationId: farmerPlantations[0].id }));
                      setIsWalkPologenModalOpen(true);
                    } else {
                      setIsAttachPlantationModalOpen(true);
                    }
                  }}
                  className="px-2.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                  title="Walk new sapling boundary polygon under this farmer"
                >
                  <Sprout className="w-3.5 h-3.5 text-teal-300" />
                  <span>+ POLOGEN</span>
                </button>
                <button
                  onClick={() => {
                    if (farmerPlantations.length > 0) {
                      setTreeForm(prev => ({ ...prev, plantationId: farmerPlantations[0].id }));
                      setIsTagTreeModalOpen(true);
                    } else {
                      setIsAttachPlantationModalOpen(true);
                    }
                  }}
                  className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                  title="Tag new mature tree with GPS point under this farmer"
                >
                  <Trees className="w-3.5 h-3.5 text-emerald-300" />
                  <span>+ Tag Tree</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs inside Modal */}
            <div className="flex border-b border-slate-200 gap-1">
              <button
                onClick={() => setActiveTab('HIERARCHY')}
                className={`px-3 py-2 font-bold text-xs border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === 'HIERARCHY'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Visual Hierarchy</span>
              </button>
              <button
                onClick={() => setActiveTab('PLANTATIONS')}
                className={`px-3 py-2 font-bold text-xs border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === 'PLANTATIONS'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Plantations ({farmerPlantations.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('POLOGENS')}
                className={`px-3 py-2 font-bold text-xs border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === 'POLOGENS'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>POLOGENs &lt;7y ({farmerPologens.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('TREES')}
                className={`px-3 py-2 font-bold text-xs border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === 'TREES'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Trees className="w-3.5 h-3.5" />
                <span>Mature Trees &ge;7y ({farmerTrees.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('DETAILS')}
                className={`px-3 py-2 font-bold text-xs border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === 'DETAILS'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Land Revenue Title</span>
              </button>
            </div>

            {/* TAB 1: VISUAL HIERARCHY TREE */}
            {activeTab === 'HIERARCHY' && (
              <div className="space-y-4 pt-1">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-tight">
                  <span className="font-bold">Attached Asset Flowchart: </span>
                  Shows how {selectedFarmer.name}&apos;s land plots are split into young walked POLOGEN polygons (&lt;7 yrs) and geo-pinned mature trees (&ge;7 yrs).
                </div>

                {/* Farmer Root Node */}
                <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between border-2 border-emerald-500 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-extrabold text-xs">
                      FRM
                    </div>
                    <div>
                      <div className="font-extrabold text-sm">{selectedFarmer.name}</div>
                      <div className="text-[11px] text-slate-300">
                        Farmer ID: <span className="font-mono text-emerald-300">{selectedFarmer.id}</span> • {selectedFarmer.village}, {selectedFarmer.cluster}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs text-emerald-300 font-bold">{selectedFarmer.landAreaAcres} Acres Title</div>
                    <div className="text-[10px] text-slate-400">{selectedFarmer.dagNumber}</div>
                  </div>
                </div>

                {/* Branches per Plantation */}
                {farmerPlantations.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                    No plantations attached yet. Click &quot;+ Plot&quot; above to add {selectedFarmer.name}&apos;s first land parcel.
                  </div>
                ) : (
                  <div className="space-y-4 pl-4 border-l-2 border-emerald-300 ml-4">
                    {farmerPlantations.map((plt) => {
                      const pltPologens = farmerPologens.filter(p => p.plantationId === plt.id);
                      const pltTrees = farmerTrees.filter(t => t.plantationId === plt.id);
                      const totalSaplings = pltPologens.reduce((sum, p) => sum + (p.saplingCount || 0), 0);

                      return (
                        <div key={plt.id} className="relative space-y-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                          {/* Connector indicator */}
                          <div className="absolute -left-4 top-5 w-4 h-0.5 bg-emerald-300" />

                          {/* Plantation Level Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-emerald-700" />
                              <span className="font-extrabold text-slate-900 text-xs">{plt.name}</span>
                              <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                {plt.id}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              <span className="font-bold text-slate-800">{plt.areaHectares} Ha</span> • Elev: {plt.elevationMeters}m • {plt.soilType}
                            </div>
                          </div>

                          {/* Sub-asset Split: POLOGEN vs Mature Trees */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {/* Left: POLOGEN (<7 yrs) */}
                            <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 font-bold text-teal-900 text-[11px]">
                                  <Sprout className="w-3.5 h-3.5 text-teal-700" />
                                  <span>POLOGEN Sapling Polygons (&lt;7 yrs)</span>
                                </div>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-teal-200/80 text-teal-900 rounded">
                                  {totalSaplings} Saplings
                                </span>
                              </div>
                              <p className="text-[10px] text-teal-800 leading-tight">
                                Collective perimeter walk for young saplings. Drill tags and felling are strictly prohibited.
                              </p>

                              {pltPologens.length === 0 ? (
                                <div className="text-[11px] text-teal-700/70 italic py-1">No POLOGEN recorded for this plot.</div>
                              ) : (
                                <div className="space-y-1.5 pt-1">
                                  {pltPologens.map((plg) => (
                                    <div key={plg.id} className="p-2 bg-white rounded border border-teal-200 text-[10px] space-y-0.5">
                                      <div className="flex items-center justify-between font-bold text-teal-950">
                                        <span className="font-mono">{plg.id}</span>
                                        <span>{plg.saplingCount} Saplings</span>
                                      </div>
                                      <div className="text-slate-500 flex items-center justify-between">
                                        <span>Planted: {plg.plantingYear} ({plg.ageYears} yrs)</span>
                                        <span className="font-mono">{plg.areaSquareMeters} m²</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Right: Mature Trees (≥7 yrs) */}
                            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-[11px]">
                                  <Trees className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Mature Trees (Point GPS &ge;7 yrs)</span>
                                </div>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-200/80 text-emerald-900 rounded">
                                  {pltTrees.length} Geo-Pinned
                                </span>
                              </div>
                              <p className="text-[10px] text-emerald-800 leading-tight">
                                Individual trunk QR nail tags, camera buffer photo hash, eligible for fungal inoculation.
                              </p>

                              {pltTrees.length === 0 ? (
                                <div className="text-[11px] text-emerald-700/70 italic py-1">No mature trees geo-tagged yet.</div>
                              ) : (
                                <div className="space-y-1.5 pt-1 max-h-36 overflow-y-auto">
                                  {pltTrees.slice(0, 5).map((tree) => (
                                    <div key={tree.id} className="p-2 bg-white rounded border border-emerald-200 text-[10px] flex items-center justify-between">
                                      <div>
                                        <span className="font-mono font-bold text-emerald-900">{tree.id}</span>
                                        <span className="text-slate-500 ml-2">{tree.ageYears} Yrs • {tree.girthCm}cm</span>
                                      </div>
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        tree.inoculationStatus === 'INOCULATED' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                                      }`}>
                                        {tree.inoculationStatus === 'INOCULATED' ? 'Inoculated' : 'Growing'}
                                      </span>
                                    </div>
                                  ))}
                                  {pltTrees.length > 5 && (
                                    <div className="text-center text-[10px] font-bold text-emerald-700 py-0.5">
                                      + {pltTrees.length - 5} more mature trees in this plot
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PLANTATIONS LIST */}
            {activeTab === 'PLANTATIONS' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-xs">
                    Plantations Attached to {selectedFarmer.name} ({farmerPlantations.length})
                  </span>
                  <button
                    onClick={() => setIsAttachPlantationModalOpen(true)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Attach New Plantation</span>
                  </button>
                </div>

                {farmerPlantations.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl">No plantations found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {farmerPlantations.map(p => (
                      <div key={p.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900">{p.name}</span>
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-700">{p.id}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                          <div>Area: <b className="text-slate-800">{p.areaHectares} Ha</b></div>
                          <div>Elevation: <b className="text-slate-800">{p.elevationMeters}m</b></div>
                          <div>Soil: <b className="text-slate-800">{p.soilType}</b></div>
                          <div>Total Trees: <b className="text-emerald-800">{p.totalTrees}</b></div>
                        </div>
                        <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Inspection: {p.inspectionDate}</span>
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Boundary Walked</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: POLOGENS (<7 YRS) */}
            {activeTab === 'POLOGENS' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-teal-900 text-xs">
                    Walked POLOGEN Sapling Polygons (&lt; 7 Yrs) under {selectedFarmer.name} ({farmerPologens.length})
                  </span>
                  <button
                    onClick={() => {
                      if (farmerPlantations.length > 0) {
                        setPologenForm(prev => ({ ...prev, plantationId: farmerPlantations[0].id }));
                        setIsWalkPologenModalOpen(true);
                      } else {
                        setIsAttachPlantationModalOpen(true);
                      }
                    }}
                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Walk New POLOGEN</span>
                  </button>
                </div>

                {farmerPologens.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl">No POLOGEN recorded for this farmer.</div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-teal-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-teal-50 text-teal-900 font-bold border-b border-teal-200">
                        <tr>
                          <th className="p-2.5">POLOGEN ID</th>
                          <th className="p-2.5">Plantation</th>
                          <th className="p-2.5">Saplings</th>
                          <th className="p-2.5">Age / Year</th>
                          <th className="p-2.5">Perimeter & Area</th>
                          <th className="p-2.5">Walked Date</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-teal-100 bg-white">
                        {farmerPologens.map((plg) => (
                          <tr key={plg.id} className="hover:bg-teal-50/40">
                            <td className="p-2.5 font-mono font-bold text-teal-950">{plg.id}</td>
                            <td className="p-2.5 text-slate-700">{plg.plantationId}</td>
                            <td className="p-2.5 font-extrabold text-teal-800">{plg.saplingCount} Saplings</td>
                            <td className="p-2.5 text-slate-600">{plg.ageYears} yrs ({plg.plantingYear})</td>
                            <td className="p-2.5 text-slate-600 font-mono text-[11px]">{plg.areaSquareMeters} m² ({plg.perimeterMeters}m)</td>
                            <td className="p-2.5 text-slate-500 font-mono">{plg.walkedDate}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                                {plg.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MATURE TREES (≥7 YRS) */}
            {activeTab === 'TREES' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-950 text-xs">
                    Mature Geo-Tagged Trees (&ge; 7 Yrs) under {selectedFarmer.name} ({farmerTrees.length})
                  </span>
                  <button
                    onClick={() => {
                      if (farmerPlantations.length > 0) {
                        setTreeForm(prev => ({ ...prev, plantationId: farmerPlantations[0].id }));
                        setIsTagTreeModalOpen(true);
                      } else {
                        setIsAttachPlantationModalOpen(true);
                      }
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tag Mature Tree</span>
                  </button>
                </div>

                {farmerTrees.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl">No mature trees pinned yet.</div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-emerald-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-emerald-50 text-emerald-900 font-bold border-b border-emerald-200">
                        <tr>
                          <th className="p-2.5">Tree ID</th>
                          <th className="p-2.5">Plantation</th>
                          <th className="p-2.5">Age & Girth</th>
                          <th className="p-2.5">GPS Latitude/Longitude</th>
                          <th className="p-2.5">Inoculation</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100 bg-white">
                        {farmerTrees.map((t) => (
                          <tr key={t.id} className="hover:bg-emerald-50/40">
                            <td className="p-2.5 font-mono font-bold text-emerald-950">
                              <div>{t.id}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{t.qrTagCode}</div>
                            </td>
                            <td className="p-2.5 text-slate-700">{t.plantationId}</td>
                            <td className="p-2.5">
                              <span className="font-bold text-slate-900">{t.ageYears} Yrs</span>
                              <div className="text-[10px] text-slate-500">Girth: {t.girthCm}cm</div>
                            </td>
                            <td className="p-2.5 font-mono text-[11px] text-slate-600">
                              {t.gpsLatitude.toFixed(4)}, {t.gpsLongitude.toFixed(4)}
                            </td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                t.inoculationStatus === 'INOCULATED' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {t.inoculationStatus === 'INOCULATED' ? 'Inoculated' : 'Growing'}
                              </span>
                            </td>
                            <td className="p-2.5"><StatusBadge status={t.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: LAND REVENUE TITLE */}
            {activeTab === 'DETAILS' && (
              <div className="space-y-4 pt-1">
                {/* Land Ownership */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Statutory Land Ownership & Revenue Title</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Revenue Records</span>
                      <div className="font-bold text-slate-900">{selectedFarmer.dagNumber}</div>
                      <div className="text-[11px] text-slate-500">{selectedFarmer.village}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Plantation Holding</span>
                      <div className="font-bold text-slate-900">{selectedFarmer.landAreaAcres} Acres</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">{selectedFarmer.treeCount} Agarwood Trees</div>
                    </div>
                  </div>
                </div>

                {/* Farmer Status */}
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span className="font-extrabold text-emerald-900">Verified Producer Status</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-tight">
                    Registered under Assam Agarwood Policy 2020. Land tenure and tree assets certified by NERAMAC field inspection.
                  </p>
                  <div className="font-mono text-xs font-bold text-emerald-950 bg-white/80 p-2 rounded border border-emerald-200">
                    Grower ID: {selectedFarmer.id} • Status: {selectedFarmer.status}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedFarmer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition"
              >
                Close Hub
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Attach Plantation Modal (Farmer pre-selected) */}
      {isAttachPlantationModalOpen && selectedFarmer && (
        <Modal
          isOpen={isAttachPlantationModalOpen}
          onClose={() => setIsAttachPlantationModalOpen(false)}
          title={`Attach Plantation Plot to ${selectedFarmer.name}`}
          subtitle={`Farmer ID: ${selectedFarmer.id} • ${selectedFarmer.cluster}`}
        >
          <form onSubmit={handleAttachPlantationSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Plot / Parcel Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dhekial East Agro-Parcel"
                value={plantationForm.name}
                onChange={(e) => setPlantationForm({ ...plantationForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Area (Hectares)</label>
                <input
                  type="number"
                  step="0.01"
                  value={plantationForm.areaHectares}
                  onChange={(e) => setPlantationForm({ ...plantationForm, areaHectares: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Elevation (Meters)</label>
                <input
                  type="number"
                  value={plantationForm.elevationMeters}
                  onChange={(e) => setPlantationForm({ ...plantationForm, elevationMeters: parseInt(e.target.value) || 90 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Young Saplings (&lt;7 yrs)</label>
                <input
                  type="number"
                  value={plantationForm.youngTrees}
                  onChange={(e) => setPlantationForm({ ...plantationForm, youngTrees: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Mature Trees (&ge;7 yrs)</label>
                <input
                  type="number"
                  value={plantationForm.matureTrees}
                  onChange={(e) => setPlantationForm({ ...plantationForm, matureTrees: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAttachPlantationModalOpen(false)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
              >
                Attach Plot
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Walk POLOGEN Modal (Farmer pre-selected) */}
      {isWalkPologenModalOpen && selectedFarmer && (
        <Modal
          isOpen={isWalkPologenModalOpen}
          onClose={() => setIsWalkPologenModalOpen(false)}
          title={`Walk POLOGEN (&lt;7 yrs) for ${selectedFarmer.name}`}
          subtitle={`Farmer ID: ${selectedFarmer.id} • Closed sapling boundary walk`}
        >
          <form onSubmit={handleWalkPologenSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Plantation Plot *</label>
              <select
                value={pologenForm.plantationId || (farmerPlantations[0]?.id || '')}
                onChange={(e) => setPologenForm({ ...pologenForm, plantationId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {farmerPlantations.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Sapling Count (&lt;7 yrs) *</label>
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
                  onChange={(e) => setPologenForm({ ...pologenForm, areaSquareMeters: parseInt(e.target.value) || 4500 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Perimeter (Meters)</label>
                <input
                  type="number"
                  value={pologenForm.perimeterMeters}
                  onChange={(e) => setPologenForm({ ...pologenForm, perimeterMeters: parseInt(e.target.value) || 280 })}
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
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold"
              >
                Confirm POLOGEN Walk
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Tag Mature Tree Modal (Farmer pre-selected) */}
      {isTagTreeModalOpen && selectedFarmer && (
        <Modal
          isOpen={isTagTreeModalOpen}
          onClose={() => setIsTagTreeModalOpen(false)}
          title={`Tag Mature Tree (&ge;7 yrs) for ${selectedFarmer.name}`}
          subtitle={`Farmer ID: ${selectedFarmer.id} • Point GPS & QR Nail Tag`}
        >
          <form onSubmit={handleTagTreeSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Plantation Plot *</label>
              <select
                value={treeForm.plantationId || (farmerPlantations[0]?.id || '')}
                onChange={(e) => setTreeForm({ ...treeForm, plantationId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {farmerPlantations.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
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
                  onChange={(e) => setTreeForm({ ...treeForm, girthCm: parseInt(e.target.value) || 60 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                onClick={() => setIsTagTreeModalOpen(false)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
              >
                Confirm Point Pin Tag
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Register Farmer Form Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Agarwood Grower"
        subtitle="Generates FRM Authoritative Digital Identity"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Grower Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dhiren Kalita"
                value={farmerFormData.name}
                onChange={(e) => setFarmerFormData({ ...farmerFormData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Father / Guardian Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Late Atul Kalita"
                value={farmerFormData.fatherName}
                onChange={(e) => setFarmerFormData({ ...farmerFormData, fatherName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+91 94350..."
                value={farmerFormData.phone}
                onChange={(e) => setFarmerFormData({ ...farmerFormData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Cluster / State</label>
              <select
                value={farmerFormData.cluster}
                onChange={(e) => setFarmerFormData({
                  ...farmerFormData,
                  cluster: e.target.value,
                  state: e.target.value.includes('Tripura') ? 'Tripura' : 'Assam'
                })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Golaghat Cluster">Golaghat Cluster (Assam)</option>
                <option value="Kadamtala Cluster">Kadamtala Cluster (Tripura)</option>
                <option value="Hojai / Golaghat">Hojai Cluster (Assam)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Estimated Trees</label>
              <input
                type="number"
                value={farmerFormData.treeCount}
                onChange={(e) => setFarmerFormData({ ...farmerFormData, treeCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Village & Mouza *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dhekial Gaon, Mouza Dhekial"
                value={farmerFormData.village}
                onChange={(e) => setFarmerFormData({ ...farmerFormData, village: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Dag & Patta Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dag 192, Patta 48"
                value={farmerFormData.dagNumber}
                onChange={(e) => setFarmerFormData({ ...farmerFormData, dagNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
            >
              Register Farmer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
