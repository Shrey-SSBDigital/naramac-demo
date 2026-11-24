import React, { useState } from 'react';
import { 
  MapPin, 
  Layers, 
  Compass, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Eye, 
  Navigation, 
  Footprints,
  Info
} from 'lucide-react';

export default function GISMapView({ translations }) {
  const [activeCluster, setActiveCluster] = useState('GOLAGHAT'); // 'GOLAGHAT' | 'KADAMTALA'
  const [layers, setLayers] = useState({
    plantations: true,
    pologens: true,
    trees: true,
    facilities: true
  });
  const [selectedPin, setSelectedPin] = useState(null);
  const [isWalkingSimulation, setIsWalkingSimulation] = useState(false);
  const [walkedPoints, setWalkedPoints] = useState([]);
  const [overlapResult, setOverlapResult] = useState(null);

  // Cluster spatial elements
  const clusterData = {
    GOLAGHAT: {
      name: "Golaghat Cluster, Assam",
      center: "26.5182° N, 93.9723° E",
      description: "Brahmaputra valley agroforestry zone. 500 target farmers, 600 plantations, 17 lakh trees.",
      stats: { farmers: 486, plantations: 582, trees: "16.84 Lakh", cpcs: 10, depots: 10 },
      items: [
        { id: "PLT-1", type: "PLANTATION", name: "Saikia Heritage Holding", area: "2.45 Ha", coords: { x: 38, y: 42 }, color: "#10b981", details: "Verified title. 940 mature trees, 480 young nursery trees." },
        { id: "PLG-1", type: "POLOGEN", name: "POLOGEN Block 3 (<7 yrs)", area: "4,850 m²", coords: { x: 42, y: 38 }, color: "#06b6d4", details: "Planting year 2021. 480 trees. Boundary closed." },
        { id: "TRE-89", type: "TREE", name: "Mature Tree #89 (≥7 yrs)", tag: "AS-GLG-TAG-8941", coords: { x: 39, y: 44 }, color: "#f59e0b", details: "Age 11.4 yrs. Point coordinates 26.5204, 93.9743. Inoculated." },
        { id: "TRE-90", type: "TREE", name: "Mature Tree #90 (≥7 yrs)", tag: "AS-GLG-TAG-8942", coords: { x: 37, y: 45 }, color: "#f59e0b", details: "Age 11.4 yrs. Companion tree. Point accuracy ±1.2m." },
        { id: "DEP-4", type: "DEPOT", name: "NERAMAC Aggregation Depot #4", area: "Dergaon Rd", coords: { x: 55, y: 28 }, color: "#6366f1", details: "Collection depot with 60-ton calibrated scale & moisture lab." },
        { id: "CPC-1", type: "CPC", name: "NERAMAC Common Processing Centre #1", area: "Golaghat Ind. Estate", coords: { x: 65, y: 60 }, color: "#ec4899", details: "12 Hydro-distillation stills, wood chipping and grading facility." }
      ]
    },
    KADAMTALA: {
      name: "Kadamtala Cluster, North Tripura",
      center: "24.4612° N, 92.2045° E",
      description: "Sub-Himalayan Jampui foothill plantations. 500 target farmers, 600 plantations, 17 lakh trees.",
      stats: { farmers: 462, plantations: 540, trees: "16.12 Lakh", cpcs: 10, depots: 10 },
      items: [
        { id: "PLT-K1", type: "PLANTATION", name: "Jampui Foothills Grove", area: "1.95 Ha", coords: { x: 32, y: 48 }, color: "#10b981", details: "Organic homestead plantation. 790 mature trees, 390 saplings." },
        { id: "PLG-K1", type: "POLOGEN", name: "Jampui POLOGEN Block 1", area: "3,900 m²", coords: { x: 35, y: 52 }, color: "#06b6d4", details: "Age 7.1 yrs - System trigger: 45 trees due for individual tagging." },
        { id: "TRE-K1", type: "TREE", name: "Tree #K-102 (≥7 yrs)", tag: "TR-KAD-TAG-102", coords: { x: 31, y: 46 }, color: "#f59e0b", details: "Age 8.6 yrs. Geo-pinned coordinate 24.4630, 92.2070." },
        { id: "DEP-K1", type: "DEPOT", name: "Kadamtala Aggregation Hub #1", area: "Station Road", coords: { x: 48, y: 35 }, color: "#6366f1", details: "Collection and weighment depot for North Tripura growers." },
        { id: "CPC-K2", type: "CPC", name: "Kadamtala CPC #2 Distillation", area: "Kadamtala Complex", coords: { x: 62, y: 50 }, color: "#ec4899", details: "State-of-the-art steam distillation with stainless steel stills." }
      ]
    }
  };

  const currentCluster = clusterData[activeCluster];

  const handleSimulateBoundaryWalk = () => {
    setIsWalkingSimulation(true);
    setWalkedPoints([]);
    setOverlapResult(null);

    const points = [
      { x: 38, y: 40 },
      { x: 46, y: 37 },
      { x: 48, y: 46 },
      { x: 41, y: 49 },
      { x: 38, y: 40 }
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < points.length) {
        setWalkedPoints(prev => [...prev, points[current]]);
        current++;
      } else {
        clearInterval(interval);
        setIsWalkingSimulation(false);
        setOverlapResult({
          status: "PASSED_NO_OVERLAP",
          verticesCount: 5,
          computedAreaSqM: 4850,
          accuracy: "±1.8m satellite lock",
          message: "Closed boundary polygon captured successfully. 0% overlap with existing registered plantations."
        });
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Cluster Selector & Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-700" />
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Cluster Geospatial & GIS Infrastructure
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Field mapping of plantations, closed POLOGEN polygons, and individually geo-pinned trees. Section 3.2 compliance.
            </p>
          </div>

          {/* Cluster Switcher Buttons */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => { setActiveCluster('GOLAGHAT'); setSelectedPin(null); }}
              className={`px-4 py-1.5 rounded-lg font-bold transition ${
                activeCluster === 'GOLAGHAT' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Golaghat (Assam)
            </button>
            <button
              onClick={() => { setActiveCluster('KADAMTALA'); setSelectedPin(null); }}
              className={`px-4 py-1.5 rounded-lg font-bold transition ${
                activeCluster === 'KADAMTALA' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Kadamtala (Tripura)
            </button>
          </div>
        </div>

        {/* Cluster Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100 text-center">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-600 uppercase font-bold block">Registered Farmers</span>
            <span className="text-sm font-black text-emerald-950 font-mono mt-0.5 block">{currentCluster.stats.farmers}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-600 uppercase font-bold block">Plantations</span>
            <span className="text-sm font-black text-teal-950 font-mono mt-0.5 block">{currentCluster.stats.plantations}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-600 uppercase font-bold block">Mature Trees (≥7 yrs)</span>
            <span className="text-sm font-black text-amber-950 font-mono mt-0.5 block">{currentCluster.stats.trees}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-600 uppercase font-bold block">Aggregation Depots</span>
            <span className="text-sm font-black text-blue-950 font-mono mt-0.5 block">{currentCluster.stats.depots} Active</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-600 uppercase font-bold block">CPC Distilleries</span>
            <span className="text-sm font-black text-purple-950 font-mono mt-0.5 block">{currentCluster.stats.cpcs} Stills</span>
          </div>
        </div>
      </div>

      {/* Interactive Map Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Map Canvas */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          {/* Layer toggles & actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-700" /> Layers:
              </span>
              <label className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={layers.plantations}
                  onChange={(e) => setLayers({ ...layers, plantations: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px]">Plantations</span>
              </label>
              <label className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={layers.pologens}
                  onChange={(e) => setLayers({ ...layers, pologens: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-[11px]">POLOGENs (&lt;7y)</span>
              </label>
              <label className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={layers.trees}
                  onChange={(e) => setLayers({ ...layers, trees: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-[11px]">Tree Pins (≥7y)</span>
              </label>
            </div>

            {/* Boundary walk simulator button */}
            <button
              onClick={handleSimulateBoundaryWalk}
              disabled={isWalkingSimulation}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold flex items-center gap-1.5 transition shadow-2xs"
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>{isWalkingSimulation ? "Recording Vertices..." : "Simulate Ground Walk"}</span>
            </button>
          </div>

          {/* SVG Canvas Map Display */}
          <div className="relative w-full h-[400px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
            {/* Grid background lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

            {/* Cluster boundary silhouette */}
            <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon
                points="20,20 80,15 90,75 45,88 15,65"
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.8"
                strokeDasharray="2,2"
              />

              {/* Walking Boundary Simulation polygon */}
              {walkedPoints.length > 1 && (
                <polyline
                  points={walkedPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill={walkedPoints.length >= 5 ? 'rgba(16, 185, 129, 0.25)' : 'none'}
                  stroke="#10b981"
                  strokeWidth="1.2"
                  strokeDasharray={walkedPoints.length < 5 ? "1.5,1.5" : "none"}
                />
              )}
            </svg>

            {/* Render Map Items */}
            {currentCluster.items.map((item) => {
              // Check layer visibility
              if (item.type === 'PLANTATION' && !layers.plantations) return null;
              if (item.type === 'POLOGEN' && !layers.pologens) return null;
              if (item.type === 'TREE' && !layers.trees) return null;

              const isSelected = selectedPin?.id === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedPin(item)}
                  style={{ left: `${item.coords.x}%`, top: `${item.coords.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'scale-125 ring-4 ring-white shadow-xl z-30'
                      : 'hover:scale-110 z-20'
                  }`}
                  style={{
                    left: `${item.coords.x}%`,
                    top: `${item.coords.y}%`,
                    backgroundColor: item.color
                  }}
                  title={`${item.name} (${item.type})`}
                >
                  <MapPin className="w-3.5 h-3.5 text-white" />
                </button>
              );
            })}

            {/* Cluster Center Title & Compass */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-750 text-xs">
              <span className="font-bold text-white block">{currentCluster.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">{currentCluster.center}</span>
            </div>
          </div>

          {/* Overlap detection result notice */}
          {overlapResult && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold">Topology Validation: {overlapResult.status}</span>
                <p className="text-[11px] text-slate-300 mt-0.5">{overlapResult.message}</p>
                <div className="flex gap-4 mt-1 font-mono text-[10px] text-slate-400">
                  <span>Vertices: {overlapResult.verticesCount}</span>
                  <span>Area: {overlapResult.computedAreaSqM} m²</span>
                  <span>Accuracy: {overlapResult.accuracy}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected GIS Entity Detail Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-700" />
              Feature Inspector
            </h3>

            {selectedPin ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold uppercase">
                    {selectedPin.type}
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-1.5">{selectedPin.name}</h4>
                  <p className="text-xs text-slate-600 font-medium mt-1">{selectedPin.details}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">UID:</span>
                    <span className="font-mono text-emerald-950 font-black">{selectedPin.id}</span>
                  </div>
                  {selectedPin.tag && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-semibold">Physical Tag:</span>
                      <span className="font-mono text-amber-950 font-bold">{selectedPin.tag}</span>
                    </div>
                  )}
                  {selectedPin.area && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-semibold">Extent:</span>
                      <span className="text-slate-900 font-bold">{selectedPin.area}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">Cluster Location:</span>
                    <span className="text-slate-900 font-bold">{currentCluster.name}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-medium">
                <MapPin className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p>Click any map marker pin to inspect spatial metadata, boundaries, or tree coordinates.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
            <span className="font-bold text-slate-900">Section 3.2 Geospatial Rule:</span>
            <p className="mt-0.5">
              Exact satellite coordinates are treated as protected data and masked on buyer-facing views.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
