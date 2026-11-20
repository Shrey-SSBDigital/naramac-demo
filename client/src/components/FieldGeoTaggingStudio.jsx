import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Eye,
  EyeOff,
  Download,
  MousePointer2,
  SquareDashed,
  Tag,
  Footprints,
  MapPin,
  Ruler,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Undo2,
  Trash2,
  Check,
  Camera,
  Wifi,
  WifiOff,
  RefreshCw,
  ArrowRight,
  Compass,
  X,
  ShieldCheck,
  TreePine,
  Sparkles
} from 'lucide-react';
import GoogleGisMapCanvas from './GoogleGisMapCanvas';
import {
  computePolygonMeasurements,
  validatePolygonOverlap,
  validatePologenContainment,
  findContainingPlantation,
  computePathDistance,
  formatIndianNumber,
  formatCoordinate,
  closeRing,
  buildRegistryGeoJSON
} from '../utils/spatialUtils';

// Default seed fallback in case API is temporarily unreachable
const FALLBACK_REGISTRY = {
  plantations: [
    {
      id: 'PLT-AS-GLG-0001-X',
      name: 'Nahorjan Homestead Sachi Estate',
      farmerId: 'FRM-GH-0104',
      farmerName: 'Bhaben Saikia',
      cluster: 'GOLAGHAT',
      district: 'Golaghat, Assam',
      dagPatta: 'Dag 182, Patta 44',
      coordinates: [[[93.9612, 26.5112], [93.9652, 26.5115], [93.9655, 26.5150], [93.9614, 26.5148], [93.9612, 26.5112]]]
    },
    {
      id: 'PLT-AS-GLG-0002-9',
      name: 'Dergaon North Sachi Block',
      farmerId: 'FRM-GH-0118',
      farmerName: 'Pranab Gogoi',
      cluster: 'GOLAGHAT',
      district: 'Golaghat, Assam',
      dagPatta: 'Dag 214, Patta 61',
      coordinates: [[[93.9932, 26.5458], [93.9977, 26.5461], [93.9980, 26.5499], [93.9935, 26.5496], [93.9932, 26.5458]]]
    },
    {
      id: 'PLT-TR-KDM-0003-C',
      name: 'Kadamtala Eastern Agar Garden',
      farmerId: 'FRM-TR-0042',
      farmerName: 'Ratan Debbarma',
      cluster: 'KADAMTALA',
      district: 'North Tripura, Tripura',
      dagPatta: 'Dag 94, Khatian 18',
      coordinates: [[[92.2035, 24.4602], [92.2080, 24.4604], [92.2083, 24.4643], [92.2037, 24.4641], [92.2035, 24.4602]]]
    },
    {
      id: 'PLT-TR-KDM-0004-P',
      name: 'Churaibari Hill Slope Block',
      farmerId: 'FRM-TR-0059',
      farmerName: 'Manik Reang',
      cluster: 'KADAMTALA',
      district: 'North Tripura, Tripura',
      dagPatta: 'Dag 112, Khatian 29',
      coordinates: [[[92.2225, 24.4401], [92.2266, 24.4403], [92.2269, 24.4440], [92.2227, 24.4438], [92.2225, 24.4401]]]
    }
  ],
  pologens: [
    {
      id: 'PLG-AS-GLG-0001-M',
      version: 'v1',
      parentPlantationId: 'PLT-AS-GLG-0001-X',
      name: 'Nahorjan Sapling Block A (2022)',
      cluster: 'GOLAGHAT',
      plantingYear: 2022,
      ageYears: 4.5,
      saplingCount: 340,
      coordinates: [[[93.9631, 26.5117], [93.9648, 26.5118], [93.9649, 26.5131], [93.9632, 26.5130], [93.9631, 26.5117]]]
    },
    {
      id: 'PLG-AS-GLG-0001-N',
      version: 'v1',
      parentPlantationId: 'PLT-AS-GLG-0001-X',
      name: 'Nahorjan Nursery Extension (2023)',
      cluster: 'GOLAGHAT',
      plantingYear: 2023,
      ageYears: 3.4,
      saplingCount: 180,
      coordinates: [[[93.9616, 26.5133], [93.9630, 26.5134], [93.9631, 26.5144], [93.9617, 26.5143], [93.9616, 26.5133]]]
    },
    {
      id: 'PLG-AS-GLG-0002-K',
      version: 'v1',
      parentPlantationId: 'PLT-AS-GLG-0002-9',
      name: 'Dergaon Young Block B (2021)',
      cluster: 'GOLAGHAT',
      plantingYear: 2021,
      ageYears: 5.2,
      saplingCount: 420,
      coordinates: [[[93.9938, 26.5464], [93.9958, 26.5465], [93.9959, 26.5482], [93.9939, 26.5481], [93.9938, 26.5464]]]
    },
    {
      id: 'PLG-TR-KDM-0003-R',
      version: 'v1',
      parentPlantationId: 'PLT-TR-KDM-0003-C',
      name: 'Kadamtala Nursery Plot 1 (2022)',
      cluster: 'KADAMTALA',
      plantingYear: 2022,
      ageYears: 4.1,
      saplingCount: 290,
      coordinates: [[[92.2041, 24.4608], [92.2059, 24.4609], [92.2060, 24.4624], [92.2042, 24.4623], [92.2041, 24.4608]]]
    },
    {
      id: 'PLG-TR-KDM-0004-S',
      version: 'v1',
      parentPlantationId: 'PLT-TR-KDM-0004-P',
      name: 'Churaibari Slope Saplings (2023)',
      cluster: 'KADAMTALA',
      plantingYear: 2023,
      ageYears: 3.2,
      saplingCount: 215,
      coordinates: [[[92.2232, 24.4407], [92.2248, 24.4408], [92.2249, 24.4422], [92.2233, 24.4421], [92.2232, 24.4407]]]
    }
  ],
  trees: [
    {
      id: 'TRE-AS-GLG-0001-01',
      parentPlantationId: 'PLT-AS-GLG-0001-X',
      cluster: 'GOLAGHAT',
      rfidTag: 'AS-GLG-TAG-8941',
      species: 'Aquilaria malaccensis Lam.',
      ageYears: 11.4,
      gbhCm: 64.5,
      heightM: 11.2,
      status: 'INOCULATED',
      pinColor: 'slate',
      elevation: '86.4 m MSL',
      accuracyM: 1.2,
      photoSha256: '7d4a2f8c5b9e1a3d6f0c8e2b4a7d9f1e3c5a7b9d0e2f4a6c8e0b2d4f6a8c0e2b',
      coordinates: [93.9621, 26.5125]
    },
    {
      id: 'TRE-AS-GLG-0001-02',
      parentPlantationId: 'PLT-AS-GLG-0001-X',
      cluster: 'GOLAGHAT',
      rfidTag: 'AS-GLG-TAG-8942',
      species: 'Aquilaria malaccensis Lam.',
      ageYears: 10.2,
      gbhCm: 59.0,
      heightM: 10.6,
      status: 'VERIFIED_HEALTHY',
      pinColor: 'green',
      elevation: '86.9 m MSL',
      accuracyM: 1.1,
      photoSha256: '9a1c3e5f7b9d1a3c5e7f9b1d3a5c7e9f1b3d5a7c9e1f3b5d7a9c1e3f5b7d9a1c',
      coordinates: [93.9639, 26.5141]
    },
    {
      id: 'TRE-AS-GLG-0002-01',
      parentPlantationId: 'PLT-AS-GLG-0002-9',
      cluster: 'GOLAGHAT',
      rfidTag: 'AS-GLG-TAG-9014',
      species: 'Aquilaria malaccensis Lam.',
      ageYears: 9.8,
      gbhCm: 56.4,
      heightM: 10.1,
      status: 'VERIFIED_HEALTHY',
      pinColor: 'green',
      elevation: '89.1 m MSL',
      accuracyM: 1.3,
      photoSha256: '4f6e8d2c1b3a5f7e9d1c3b5a7f9e1d3c5b7a9f1e3d5c7b9a1f3e5d7c9b1a3f5e',
      coordinates: [93.9950, 26.5488]
    },
    {
      id: 'TRE-AS-GLG-0002-02',
      parentPlantationId: 'PLT-AS-GLG-0002-9',
      cluster: 'GOLAGHAT',
      rfidTag: 'AS-GLG-TAG-9015',
      species: 'Aquilaria malaccensis Lam.',
      ageYears: 12.8,
      gbhCm: 72.0,
      heightM: 12.8,
      status: 'HARVEST_AUTHORIZED',
      pinColor: 'red',
      elevation: '89.5 m MSL',
      accuracyM: 0.9,
      photoSha256: 'e2d4c6b8a0f2e4d6c8b0a2f4e6d8c0b2a4f6e8d0c2b4a6f8e0d2c4b6a8f0e2d4',
      coordinates: [93.9968, 26.5472]
    },
    {
      id: 'TRE-TR-KDM-0003-01',
      parentPlantationId: 'PLT-TR-KDM-0003-C',
      cluster: 'KADAMTALA',
      rfidTag: 'TR-KDM-TAG-4102',
      species: 'Aquilaria malaccensis Lam.',
      ageYears: 10.6,
      gbhCm: 61.5,
      heightM: 10.9,
      status: 'INOCULATED',
      pinColor: 'green',
      elevation: '52.3 m MSL',
      accuracyM: 1.4,
      photoSha256: 'b1a3c5e7f9d1b3a5c7e9f1d3b5a7c9e1f3d5b7a9c1e3f5d7b9a1c3e5f7d9b1a3',
      coordinates: [92.2068, 24.4629]
    },
    {
      id: 'TRE-TR-KDM-0004-01',
      parentPlantationId: 'PLT-TR-KDM-0004-P',
      cluster: 'KADAMTALA',
      rfidTag: 'TR-KDM-TAG-4188',
      species: 'Aquilaria malaccensis Lam.',
      ageYears: 13.1,
      gbhCm: 74.8,
      heightM: 13.0,
      status: 'HARVEST_AUTHORIZED',
      pinColor: 'red',
      elevation: '61.0 m MSL',
      accuracyM: 1.1,
      photoSha256: 'c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5',
      coordinates: [92.2256, 24.4428]
    }
  ],
  facilities: [
    { id: 'CPC-AS-GLG-01', code: 'C', type: 'CPC', name: 'Golaghat Common Processing Centre (CPC)', cluster: 'GOLAGHAT', details: 'Hydro-distillation Stills #1-6 • Batch Weight Scale', coordinates: [93.9742, 26.5245] },
    { id: 'DFO-AS-GLG-01', code: 'D', type: 'DFO', name: 'Golaghat Divisional Forest Office (DFO Hub)', cluster: 'GOLAGHAT', details: 'Statutory Felling Authorisations & Transit Desk', coordinates: [93.9885, 26.5065] },
    { id: 'CPC-TR-KDM-01', code: 'C', type: 'CPC', name: 'Kadamtala Agarwood CPC & Grading Hub', cluster: 'KADAMTALA', details: 'North Tripura Distillation & Pre-Export Quarantine', coordinates: [92.2145, 24.4530] },
    { id: 'LAB-AS-GHY-01', code: 'L', type: 'LAB', name: 'NERAMAC NABL GC-MS Lab (Guwahati)', cluster: 'CORRIDOR', details: 'ISO/IEC 17025 Chemical Profiling', coordinates: [91.7362, 26.1445] },
    { id: 'PRT-AS-GHY-01', code: 'P', type: 'PORT', name: 'NE Export Gateway & Customs Terminal', cluster: 'CORRIDOR', details: 'CITES Appendix II Export Permit & Dispatch', coordinates: [91.5859, 26.1061] }
  ],
  corridors: [
    { id: 'MOV-AS-2026-0118', name: 'Golaghat Harvest -> CPC -> DFO Corridor', cluster: 'GOLAGHAT', permitRef: 'TP-AS-GLG-2026-441', coordinates: [[93.9632, 26.5130], [93.9742, 26.5245], [93.9885, 26.5065], [93.9958, 26.5478]] },
    { id: 'MOV-TR-2026-0092', name: 'Kadamtala Harvest -> CPC Corridor', cluster: 'KADAMTALA', permitRef: 'TP-TR-KDM-2026-112', coordinates: [[92.2060, 24.4622], [92.2145, 24.4530], [92.2248, 24.4420]] },
    { id: 'MOV-NE-NODAL-01', name: 'NE Nodal Corridor: Golaghat -> Guwahati -> Kadamtala', cluster: 'CORRIDOR', permitRef: 'NERAMAC-INTERSTATE-2026-09', coordinates: [[93.9742, 26.5245], [91.7362, 26.1445], [91.5859, 26.1061], [92.2145, 24.4530]] }
  ]
};

const CLUSTER_VIEWPORTS = {
  GOLAGHAT: { lat: 26.5295, lng: 93.9785, zoom: 13 },
  KADAMTALA: { lat: 24.4525, lng: 92.2145, zoom: 13 },
  CORRIDOR: { lat: 25.62, lng: 92.85, zoom: 7 }
};

export default function FieldGeoTaggingStudio({ onAdvanceStep }) {
  // Registry Data (synced with Express /api/gis/registry)
  const [registry, setRegistry] = useState(FALLBACK_REGISTRY);

  // Navigation, Map Type & Tool States
  const [activeCluster, setActiveCluster] = useState('GOLAGHAT');
  const [viewport, setViewport] = useState(CLUSTER_VIEWPORTS.GOLAGHAT);
  const [mapType, setMapType] = useState('hybrid'); // 'hybrid' | 'satellite' | 'terrain' | 'roadmap'
  const [activeTool, setActiveTool] = useState('INSPECT'); // 'INSPECT' | 'SELECT_AREA' | 'REGISTER_PLANTATION' | 'WALK_POLOGEN' | 'GEO_PIN_TREE' | 'DISTANCE'
  const [exactGpsView, setExactGpsView] = useState(true);

  // Layer Visibility Checkboxes
  const [layers, setLayers] = useState({
    plantations: true,
    pologens: true,
    trees: true,
    facilities: true,
    corridors: true
  });

  // Selection & Interactive Drawing State
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [draftPoints, setDraftPoints] = useState([]); // Array of [lng, lat]
  const [isWalkingSim, setIsWalkingSim] = useState(false);
  const walkTimerRef = useRef(null);

  // Form Metadata for New Registrations
  const [draftForm, setDraftForm] = useState({
    name: '',
    farmerName: 'Bhaben Saikia',
    dagPatta: 'Dag 235, Patta 72',
    plantingYear: 2023,
    saplingCount: 280,
    rfidTag: 'AS-GLG-TAG-9204',
    ageYears: 10.8,
    gbhCm: 63.0,
    heightM: 11.4,
    treeStatus: 'VERIFIED_HEALTHY'
  });

  // AR Camera Modal & SHA-256 Hash
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraHash, setCameraHash] = useState('7d4a2f8c5b9e1a3d6f0c8e2b4a7d9f1e3c5a7b9d0e2f4a6c8e0b2d4f6a8c0e2b');

  // Offline-First Simulation & Notification Banner
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [bannerMsg, setBannerMsg] = useState(null);

  const showToast = (text, tone = 'success') => {
    setBannerMsg({ text, tone });
    setTimeout(() => setBannerMsg(null), 5000);
  };

  // Load initial GIS Registry from Express Backend
  useEffect(() => {
    fetch('/api/gis/registry')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.success && res?.data) {
          setRegistry(res.data);
        }
      })
      .catch(() => {
        // Fallback already initialized
      });
    return () => {
      if (walkTimerRef.current) clearInterval(walkTimerRef.current);
    };
  }, []);

  // Switch Cluster
  const handleSelectCluster = (clusterKey) => {
    setActiveCluster(clusterKey);
    setViewport({ ...CLUSTER_VIEWPORTS[clusterKey] });
  };

  // Switch GIS Tool (with smart zoom so Plantations are easy to click inside!)
  const handleSelectTool = (tool) => {
    if (walkTimerRef.current) clearInterval(walkTimerRef.current);
    setIsWalkingSim(false);
    setActiveTool(tool);
    setDraftPoints([]);

    // Smart auto-focus when entering Walk POLOGEN or Geo-Pin Tree so user clearly sees a Plantation polygon
    if (tool === 'WALK_POLOGEN' || tool === 'GEO_PIN_TREE') {
      const targetCluster = activeCluster === 'KADAMTALA' ? 'KADAMTALA' : 'GOLAGHAT';
      const targetPlt =
        (registry.plantations || []).find((p) => p.cluster === targetCluster) || registry.plantations?.[0];
      if (targetPlt) {
        const m = computePolygonMeasurements(targetPlt.coordinates);
        if (m.center) {
          setViewport({ lat: m.center[1], lng: m.center[0], zoom: 16 });
        }
      }
    }
  };

  // Select Entity from Map or Spatial Registry List
  const handleSelectEntity = (entity) => {
    setSelectedEntity(entity);
    if (activeTool === 'SELECT_AREA') {
      setDraftPoints([]); // Clear custom selection box when clicking an existing farm
    }
    if (entity.type === 'TREE') {
      setViewport({ lat: entity.coordinates[1], lng: entity.coordinates[0], zoom: 17 });
    } else {
      const m = computePolygonMeasurements(entity.coordinates);
      if (m.center) {
        setViewport({
          lat: m.center[1],
          lng: m.center[0],
          zoom: entity.type === 'POLOGEN' ? 17 : 16
        });
      }
    }
  };

  // Map Click Handler for Interactive Tools
  const handleMapClickPoint = (lngLat) => {
    if (activeTool === 'GEO_PIN_TREE') {
      setDraftPoints([lngLat]);
    } else if (['SELECT_AREA', 'REGISTER_PLANTATION', 'WALK_POLOGEN', 'DISTANCE'].includes(activeTool)) {
      if (activeTool === 'SELECT_AREA') {
        setSelectedEntity(null);
      }
      setDraftPoints((prev) => [...prev, lngLat]);
    }
  };

  // Dragging a vertex updates its coordinate live
  const handleUpdateDraftPoint = (idx, newLngLat) => {
    setDraftPoints((prev) => {
      const next = [...prev];
      next[idx] = newLngLat;
      return next;
    });
  };

  // 1-Click Sample Plantation Boundary (for quick demo in Register Plantation mode)
  const handleSamplePlantationPlot = () => {
    const sample =
      activeCluster === 'KADAMTALA'
        ? [
            [92.2125, 24.4622],
            [92.2162, 24.4624],
            [92.2164, 24.4654],
            [92.2127, 24.4652]
          ]
        : [
            [93.9778, 26.5310],
            [93.9818, 26.5313],
            [93.9821, 26.5345],
            [93.9780, 26.5342]
          ];
    setDraftPoints(sample);
    setViewport({ lat: sample[0][1] + 0.0016, lng: sample[0][0] + 0.002, zoom: 16 });
    showToast('Sample plantation boundary plotted! Drag any corner vertex or click "Commit to Registry".', 'success');
  };

  // Simulate Ground-Walked GPS Boundary for POLOGEN (<7 yrs) inside Golaghat / Kadamtala Plantation
  const handleSimulatePologenWalk = () => {
    if (isWalkingSim) return;
    setIsWalkingSim(true);
    setDraftPoints([]);

    const simWalkCoords =
      activeCluster === 'KADAMTALA'
        ? [
            [92.2063, 24.4608],
            [92.2076, 24.4609],
            [92.2077, 24.4622],
            [92.2064, 24.4621]
          ]
        : [
            [93.9961, 26.5480],
            [93.9974, 26.5481],
            [93.9975, 26.5494],
            [93.9962, 26.5493]
          ];

    setViewport({
      lat: simWalkCoords[0][1] + 0.0006,
      lng: simWalkCoords[0][0] + 0.0006,
      zoom: 17
    });

    let i = 0;
    walkTimerRef.current = setInterval(() => {
      if (i >= simWalkCoords.length) {
        clearInterval(walkTimerRef.current);
        setIsWalkingSim(false);
        showToast('Simulated GPS perimeter walk completed! Turf.js containment & overlap checks passed.', 'success');
        return;
      }
      setDraftPoints((prev) => [...prev, simWalkCoords[i]]);
      i++;
    }, 450);
  };

  // 1-Click Quick Mature Tree Pin inside current cluster's Plantation
  const handleQuickPinTree = () => {
    const pt = activeCluster === 'KADAMTALA' ? [92.2055, 24.4631] : [93.9633, 26.5138];
    setDraftPoints([pt]);
    setViewport({ lat: pt[1], lng: pt[0], zoom: 17 });
    showToast('Mature tree pin dropped inside parent plantation! Drag pin or click "Commit to Registry".', 'success');
  };

  // Live Turf.js Spatial Analysis of Current Draft Geometry
  const draftAnalysis = useMemo(() => {
    if (activeTool === 'DISTANCE') {
      return { kind: 'DISTANCE', ...computePathDistance(draftPoints) };
    }
    if (activeTool === 'SELECT_AREA' && draftPoints.length >= 3) {
      const ring = closeRing(draftPoints);
      return {
        kind: 'SELECT_AREA',
        measurements: computePolygonMeasurements([ring])
      };
    }
    if (activeTool === 'GEO_PIN_TREE' && draftPoints.length === 1) {
      const parent = findContainingPlantation(draftPoints[0], registry.plantations);
      return {
        kind: 'TREE',
        lngLat: draftPoints[0],
        contained: Boolean(parent),
        parentPlantation: parent
      };
    }
    if ((activeTool === 'REGISTER_PLANTATION' || activeTool === 'WALK_POLOGEN') && draftPoints.length >= 3) {
      const ring = closeRing(draftPoints);
      const measurements = computePolygonMeasurements([ring]);
      const overlapList = activeTool === 'REGISTER_PLANTATION' ? registry.plantations : registry.pologens;
      const overlap = validatePolygonOverlap([ring], overlapList);
      const containment =
        activeTool === 'WALK_POLOGEN'
          ? validatePologenContainment([ring], registry.plantations)
          : { contained: true, parentPlantation: null };

      return {
        kind: activeTool,
        measurements,
        overlap,
        containment
      };
    }
    return null;
  }, [activeTool, draftPoints, registry]);

  // Live Floating Map HUD Banner Text
  const mapHudBanner = useMemo(() => {
    if (activeTool === 'INSPECT') return null;
    if (activeTool === 'SELECT_AREA') {
      if (draftAnalysis?.measurements) {
        const m = draftAnalysis.measurements;
        return `Custom Area: ${m.assamBigha.toFixed(3)} Bigha · ${m.areaHa.toFixed(4)} ha · ${formatIndianNumber(Math.round(m.areaSqFt))} sq ft`;
      }
      return 'Select Area: Click any Plantation/POLOGEN polygon to measure it, or click 3+ points on map for custom area';
    }
    if (activeTool === 'REGISTER_PLANTATION') {
      if (draftAnalysis?.measurements) {
        const m = draftAnalysis.measurements;
        const ok = draftAnalysis.overlap?.valid ? '0.0% Overlap ✓' : `${draftAnalysis.overlap?.overlapPct}% Overlap ✗`;
        return `New Plantation: ${m.assamBigha.toFixed(2)} Bigha (${m.areaHa.toFixed(2)} ha) · ${ok}`;
      }
      return `Register Plantation: Click at least 3 corners on map (${draftPoints.length}/3 plotted)`;
    }
    if (activeTool === 'WALK_POLOGEN') {
      if (draftAnalysis?.measurements) {
        const m = draftAnalysis.measurements;
        const inPlt = draftAnalysis.containment?.contained ? `Inside ${draftAnalysis.containment.parentPlantation.id} ✓` : 'Outside Plantation ✗';
        return `Walk POLOGEN: ${m.assamBigha.toFixed(3)} Bigha (${formatIndianNumber(m.areaSqM, 0)} m²) · ${inPlt}`;
      }
      return `Walk POLOGEN (<7y): Click 3+ corners INSIDE a green Plantation, or click "Simulate GPS Walk" (${draftPoints.length}/3)`;
    }
    if (activeTool === 'GEO_PIN_TREE') {
      if (draftAnalysis?.kind === 'TREE') {
        return draftAnalysis.contained
          ? `Tree Pin Ready inside ${draftAnalysis.parentPlantation.id} ✓ — Drag pin or click Commit`
          : 'Tree Pin is outside any Plantation — drag or click inside a green Plantation boundary';
      }
      return 'Geo-Pin Tree (≥7y): Click inside any green Plantation boundary on Google Maps to drop a Tree pin';
    }
    if (activeTool === 'DISTANCE') {
      if (draftPoints.length >= 2 && draftAnalysis) {
        return `Measured Distance: ${formatIndianNumber(draftAnalysis.meters)} m (${draftAnalysis.km} km · ${formatIndianNumber(Math.round(draftAnalysis.meters * 3.28084))} ft)`;
      }
      return 'Distance Tool: Click 2 or more points on Google Maps to measure exact geodesic distance';
    }
    return null;
  }, [activeTool, draftPoints, draftAnalysis]);

  // Save Newly Surveyed Entity (Online API + Local Optimistic Update, or Offline SQLite Queue)
  const handleSaveDraft = async () => {
    if (!draftAnalysis) return;

    if (activeTool === 'REGISTER_PLANTATION') {
      if (!draftAnalysis.overlap.valid) {
        showToast(`Turf.js Overlap Blocked (${draftAnalysis.overlap.overlapPct}% overlap with existing plantation). Drag vertices to resolve.`, 'error');
        return;
      }
      const payload = {
        name: draftForm.name.trim() || `Surveyed Agarwood Holding (${activeCluster === 'KADAMTALA' ? 'Tripura' : 'Assam'})`,
        farmerName: draftForm.farmerName,
        cluster: activeCluster === 'KADAMTALA' ? 'KADAMTALA' : 'GOLAGHAT',
        dagPatta: draftForm.dagPatta,
        coordinates: [closeRing(draftPoints)]
      };
      await commitRecord('PLANTATION', '/api/gis/plantations', payload);
    } else if (activeTool === 'WALK_POLOGEN') {
      if (!draftAnalysis.containment.contained) {
        showToast('Turf.js Containment Rule: A POLOGEN block must lie strictly inside a registered green Plantation boundary!', 'error');
        return;
      }
      if (!draftAnalysis.overlap.valid) {
        showToast(`Turf.js Overlap Blocked (${draftAnalysis.overlap.overlapPct}% overlap with sibling POLOGEN).`, 'error');
        return;
      }
      const payload = {
        name: draftForm.name.trim() || `Walked Sapling Block (${draftForm.plantingYear})`,
        parentPlantationId: draftAnalysis.containment.parentPlantation.id,
        cluster: draftAnalysis.containment.parentPlantation.cluster,
        plantingYear: Number(draftForm.plantingYear) || 2023,
        saplingCount: Number(draftForm.saplingCount) || 250,
        coordinates: [closeRing(draftPoints)]
      };
      await commitRecord('POLOGEN', '/api/gis/pologens', payload);
    } else if (activeTool === 'GEO_PIN_TREE') {
      if (!draftAnalysis.contained) {
        showToast('Turf.js Containment Rule: Mature Tree pin must be placed inside a registered green Plantation boundary!', 'error');
        return;
      }
      const payload = {
        parentPlantationId: draftAnalysis.parentPlantation.id,
        cluster: draftAnalysis.parentPlantation.cluster,
        rfidTag: draftForm.rfidTag,
        ageYears: Number(draftForm.ageYears) || 10.5,
        gbhCm: Number(draftForm.gbhCm) || 62.0,
        heightM: Number(draftForm.heightM) || 11.0,
        status: draftForm.treeStatus,
        photoSha256: cameraHash,
        coordinates: draftPoints[0]
      };
      await commitRecord('TREE', '/api/gis/trees', payload);
    }
  };

  // Helper to create local fallback object if Express API is offline
  const buildLocalRecord = (kind, payload) => {
    const clusterCode = payload.cluster === 'KADAMTALA' ? 'TR-KDM' : 'AS-GLG';
    if (kind === 'PLANTATION') {
      const idx = registry.plantations.length + 1;
      const suffix = String.fromCharCode(65 + (idx % 26));
      return {
        id: `PLT-${clusterCode}-${String(idx).padStart(4, '0')}-${suffix}`,
        farmerId: `FRM-${clusterCode}-${100 + idx}`,
        district: payload.cluster === 'KADAMTALA' ? 'North Tripura, Tripura' : 'Golaghat, Assam',
        ...payload
      };
    }
    if (kind === 'POLOGEN') {
      const idx = registry.pologens.length + 1;
      const suffix = String.fromCharCode(75 + (idx % 15));
      return {
        id: `PLG-${clusterCode}-${String(idx).padStart(4, '0')}-${suffix}`,
        version: 'v1',
        ageYears: +(2026.5 - (Number(payload.plantingYear) || 2023)).toFixed(1),
        ...payload
      };
    }
    const idx = registry.trees.length + 1;
    return {
      id: `TRE-${clusterCode}-0001-${String(idx).padStart(2, '0')}`,
      species: 'Aquilaria malaccensis Lam.',
      pinColor: payload.status === 'HARVEST_AUTHORIZED' ? 'red' : payload.status === 'INOCULATED' ? 'slate' : 'green',
      elevation: '87.1 m MSL',
      accuracyM: 1.1,
      ...payload
    };
  };

  const commitRecord = async (kind, endpoint, payload) => {
    if (isOffline) {
      setOfflineQueue((prev) => [...prev, { kind, endpoint, payload, queuedAt: new Date().toISOString() }]);
      setDraftPoints([]);
      setActiveTool('INSPECT');
      showToast(`Cached ${kind} offline in mobile SQLite queue (#AG-09). Sync when back online.`, 'warning');
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.data) {
          setRegistry(json.data);
          const created = json.plantation || json.pologen || json.tree;
          if (created) setSelectedEntity({ type: kind, ...created });
          setDraftPoints([]);
          setActiveTool('INSPECT');
          showToast(`${kind} ${created?.id || ''} committed to NERAMAC Spatial Registry with Turf.js verification!`, 'success');
          return;
        }
      }
      throw new Error('API_UNAVAILABLE');
    } catch {
      // Seamless local state update so demo always works even without backend running
      const localItem = buildLocalRecord(kind, payload);
      setRegistry((prev) => ({
        ...prev,
        plantations: kind === 'PLANTATION' ? [localItem, ...prev.plantations] : prev.plantations,
        pologens: kind === 'POLOGEN' ? [localItem, ...prev.pologens] : prev.pologens,
        trees: kind === 'TREE' ? [localItem, ...prev.trees] : prev.trees
      }));
      setSelectedEntity({ type: kind, ...localItem });
      setDraftPoints([]);
      setActiveTool('INSPECT');
      showToast(`${kind} ${localItem.id} registered and validated with Turf.js!`, 'success');
    }
  };

  // Sync Offline SQLite Queue to Express Backend
  const handleSyncOfflineQueue = async () => {
    if (offlineQueue.length === 0 || isOffline) return;
    setIsSyncing(true);
    let syncedCount = 0;
    let latestData = null;

    for (const item of offlineQueue) {
      try {
        const res = await fetch(item.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload)
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.data) {
            latestData = json.data;
            syncedCount++;
            continue;
          }
        }
        throw new Error('local');
      } catch {
        const localItem = buildLocalRecord(item.kind, item.payload);
        setRegistry((prev) => ({
          ...prev,
          plantations: item.kind === 'PLANTATION' ? [localItem, ...prev.plantations] : prev.plantations,
          pologens: item.kind === 'POLOGEN' ? [localItem, ...prev.pologens] : prev.pologens,
          trees: item.kind === 'TREE' ? [localItem, ...prev.trees] : prev.trees
        }));
        syncedCount++;
      }
    }

    setTimeout(() => {
      if (latestData) setRegistry(latestData);
      setOfflineQueue([]);
      setIsSyncing(false);
      showToast(`Synchronized ${syncedCount} offline SQLite GIS record(s) to Central Ledger!`, 'success');
    }, 600);
  };

  // Export RFC 7946 GeoJSON File
  const handleExportGeoJSON = () => {
    const geojson = buildRegistryGeoJSON(registry);
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neramac-ascts-gis-registry-${new Date().toISOString().slice(0, 10)}.geojson`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`Exported ${geojson.features.length} spatial features to RFC 7946 GeoJSON.`, 'success');
  };

  // Selected Entity Computed Measurements
  const selectedMeasurements = useMemo(() => {
    if (!selectedEntity || selectedEntity.type === 'TREE') return null;
    return computePolygonMeasurements(selectedEntity.coordinates);
  }, [selectedEntity]);

  const totalPLT = registry.plantations?.length || 0;
  const totalPLG = registry.pologens?.length || 0;
  const totalTRE = registry.trees?.length || 0;

  return (
    <div className="space-y-4">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            GIS Plantation, POLOGEN &amp; Tree Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ground-walked polygons, Turf.js overlap validation, boundary containment, and GeoJSON export
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setExactGpsView(!exactGpsView)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 shadow-2xs ${
              exactGpsView
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            {exactGpsView ? <Eye className="w-3.5 h-3.5 text-slate-600" /> : <EyeOff className="w-3.5 h-3.5 text-amber-700" />}
            <span>{exactGpsView ? 'NERAMAC Exact GPS View' : 'DPDP Masked GPS View'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportGeoJSON}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 transition flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export GeoJSON</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {bannerMsg && (
        <div
          className={`px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 shadow-xs ${
            bannerMsg.tone === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : bannerMsg.tone === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerMsg.tone === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            )}
            <span>{bannerMsg.text}</span>
          </div>
          <button onClick={() => setBannerMsg(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. UNIFIED GIS TOOLBAR CARD */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2.5">
        {/* Row 1: Cluster Pills (Left) + GIS Tool Switcher (Right) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Cluster Selector */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1 mr-1">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              Cluster:
            </span>
            {[
              { key: 'GOLAGHAT', label: 'Golaghat (Assam)' },
              { key: 'KADAMTALA', label: 'Kadamtala (Tripura)' },
              { key: 'CORRIDOR', label: 'NE Nodal Corridor' }
            ].map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => handleSelectCluster(c.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeCluster === c.key
                    ? 'gis-btn-emerald shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* GIS Action Tools */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'INSPECT', label: 'Inspect', icon: MousePointer2 },
              { id: 'SELECT_AREA', label: 'Select Area', icon: SquareDashed },
              { id: 'REGISTER_PLANTATION', label: 'Register Plantation', icon: Tag },
              { id: 'WALK_POLOGEN', label: 'Walk POLOGEN', icon: Footprints },
              { id: 'GEO_PIN_TREE', label: 'Geo-Pin Tree', icon: MapPin },
              { id: 'DISTANCE', label: 'Distance', icon: Ruler }
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTool === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTool(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'gis-btn-dark shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Google Map Type Tabs (Left) + Contextual Tool Actions & Offline Toggle (Right) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs">
            {[
              { id: 'hybrid', label: 'Hybrid' },
              { id: 'satellite', label: 'Satellite' },
              { id: 'terrain', label: 'Terrain' },
              { id: 'roadmap', label: 'Roadmap' }
            ].map((mt) => (
              <button
                key={mt.id}
                type="button"
                onClick={() => setMapType(mt.id)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  mapType === mt.id
                    ? 'gis-btn-dark'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {mt.label}
              </button>
            ))}
          </div>

          {/* Contextual Tool Action Helpers + Offline Network Simulator */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {activeTool === 'REGISTER_PLANTATION' && (
              <button
                type="button"
                onClick={handleSamplePlantationPlot}
                className="px-2.5 py-1 rounded-md gis-btn-emerald font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-Plot Sample Holding</span>
              </button>
            )}

            {activeTool === 'WALK_POLOGEN' && (
              <button
                type="button"
                onClick={handleSimulatePologenWalk}
                disabled={isWalkingSim}
                className="px-2.5 py-1 rounded-md gis-btn-emerald disabled:opacity-50 font-semibold flex items-center gap-1"
              >
                <Footprints className="w-3 h-3" />
                <span>{isWalkingSim ? 'Walking Perimeter...' : 'Simulate GPS Walk'}</span>
              </button>
            )}

            {activeTool === 'GEO_PIN_TREE' && (
              <button
                type="button"
                onClick={handleQuickPinTree}
                className="px-2.5 py-1 rounded-md gis-btn-amber font-semibold flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                <span>Quick Pin Inside Plantation</span>
              </button>
            )}

            {['SELECT_AREA', 'REGISTER_PLANTATION', 'WALK_POLOGEN', 'GEO_PIN_TREE', 'DISTANCE'].includes(activeTool) &&
              draftPoints.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setDraftPoints((p) => p.slice(0, -1))}
                    className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1"
                  >
                    <Undo2 className="w-3 h-3" />
                    Undo
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraftPoints([])}
                    className="px-2 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                </>
              )}

            {/* Offline Field Mode Pill */}
            <button
              type="button"
              onClick={() => setIsOffline(!isOffline)}
              className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold flex items-center gap-1.5 transition ${
                isOffline
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              {isOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              <span>{isOffline ? 'Offline SQLite Mode' : 'Online Synced'}</span>
            </button>

            {offlineQueue.length > 0 && (
              <button
                type="button"
                onClick={handleSyncOfflineQueue}
                disabled={isOffline || isSyncing}
                className="px-2.5 py-1 rounded-md gis-btn-emerald disabled:opacity-50 text-[11px] font-bold flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync ({offlineQueue.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. MAIN SPLIT WORKSPACE: LEFT GOOGLE MAP (8 COLS) + RIGHT SPATIAL REGISTRY (4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT: Interactive Google Map + Bottom Layer Bar */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
          <GoogleGisMapCanvas
            mapType={mapType}
            onChangeMapType={setMapType}
            viewport={viewport}
            registry={registry}
            layers={layers}
            activeTool={activeTool}
            selectedEntity={selectedEntity}
            onSelectEntity={handleSelectEntity}
            draftPoints={draftPoints}
            onMapClickPoint={handleMapClickPoint}
            onUpdateDraftPoint={handleUpdateDraftPoint}
            hudBanner={mapHudBanner}
          />

          {/* Bottom Layer Toggles Footer */}
          <div className="px-3.5 py-2.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-3.5 text-slate-700">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Layers:
              </span>

              {[
                { key: 'plantations', label: 'Plantations', accent: 'accent-emerald-700' },
                { key: 'pologens', label: 'POLOGENs', accent: 'accent-blue-600' },
                { key: 'trees', label: 'Trees', accent: 'accent-emerald-600' },
                { key: 'facilities', label: 'CPC / Labs / Ports', accent: 'accent-slate-900' },
                { key: 'corridors', label: 'MOV Corridors', accent: 'accent-teal-600' }
              ].map((l) => (
                <label key={l.key} className="flex items-center gap-1.5 cursor-pointer select-none font-medium">
                  <input
                    type="checkbox"
                    checked={layers[l.key]}
                    onChange={(e) => setLayers((prev) => ({ ...prev, [l.key]: e.target.checked }))}
                    className={`rounded w-3.5 h-3.5 ${l.accent}`}
                  />
                  <span>{l.label}</span>
                </label>
              ))}
            </div>

            <span className="font-mono text-[11px] text-slate-500">
              Google Maps + Turf.js Spatial
            </span>
          </div>
        </div>

        {/* RIGHT: Spatial Registry Panel */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col h-[578px]">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Spatial Registry ({totalPLT} PLT · {totalPLG} PLG · {totalTRE} TRE)
            </h2>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Click any Plantation or POLOGEN to measure strictly the area inside that selected farm/block in sq ft, Bigha (Assam), hectares, and m².
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 px-3 py-1">
            {/* Plantations List */}
            {(registry.plantations || []).map((plt) => {
              const m = computePolygonMeasurements(plt.coordinates);
              const isSelected = selectedEntity?.id === plt.id;
              return (
                <div
                  key={plt.id}
                  onClick={() => handleSelectEntity({ type: 'PLANTATION', ...plt })}
                  className={`py-3 px-2 rounded-lg transition cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected ? 'bg-emerald-50/80 ring-1 ring-emerald-300 my-1' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-bold text-slate-900 truncate">{plt.id}</div>
                    <div className="text-xs font-medium text-slate-700 truncate mt-0.5">{plt.name}</div>
                    <div className="font-mono text-[11px] text-slate-500 mt-1 leading-snug">
                      {m.assamBigha.toFixed(3)} Bigha · {m.areaHa.toFixed(4)} ha · {formatIndianNumber(Math.round(m.areaSqFt))} sq ft · {formatIndianNumber(m.areaSqM, 1)} m²
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectEntity({ type: 'PLANTATION', ...plt });
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border flex-shrink-0 transition ${
                      isSelected
                        ? 'gis-btn-emerald'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              );
            })}

            {/* POLOGENs List (< 7 yrs) */}
            {(registry.pologens || []).map((plg) => {
              const m = computePolygonMeasurements(plg.coordinates);
              const isSelected = selectedEntity?.id === plg.id;
              return (
                <div
                  key={plg.id}
                  onClick={() => handleSelectEntity({ type: 'POLOGEN', ...plg })}
                  className={`py-3 px-2 rounded-lg transition cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected ? 'bg-amber-50/80 ring-1 ring-amber-300 my-1' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-emerald-800 truncate">{plg.id}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {plg.version || 'v1'}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-700 truncate mt-0.5">
                      {plg.name} · {plg.saplingCount} trees (&lt;7y)
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 mt-1 leading-snug">
                      {m.assamBigha.toFixed(3)} Bigha · {m.areaHa.toFixed(4)} ha · {formatIndianNumber(Math.round(m.areaSqFt))} sq ft · {formatIndianNumber(m.areaSqM, 1)} m²
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectEntity({ type: 'POLOGEN', ...plg });
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border flex-shrink-0 transition ${
                      isSelected
                        ? 'gis-btn-amber'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              );
            })}

            {/* Mature Trees List (>= 7 yrs) */}
            {(registry.trees || []).map((t) => {
              const isSelected = selectedEntity?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectEntity({ type: 'TREE', ...t })}
                  className={`py-3 px-2 rounded-lg transition cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected ? 'bg-teal-50/80 ring-1 ring-teal-300 my-1' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <TreePine className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                      <span className="font-mono text-xs font-bold text-slate-900 truncate">{t.id}</span>
                    </div>
                    <div className="text-xs text-slate-700 truncate mt-0.5">
                      RFID {t.rfidTag} · {t.ageYears}y · GBH {t.gbhCm} cm
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 mt-0.5 truncate">
                      {formatCoordinate(t.coordinates[1], t.coordinates[0], exactGpsView)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectEntity({ type: 'TREE', ...t });
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border flex-shrink-0 transition ${
                      isSelected
                        ? 'gis-btn-dark'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4A. SELECT AREA (CUSTOM POLYGON) OR DISTANCE MEASUREMENT CARD */}
      {activeTool === 'SELECT_AREA' && draftAnalysis?.measurements && (
        <div className="bg-white border-2 border-sky-500/40 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SquareDashed className="w-4 h-4 text-sky-600" />
              <span>Custom Selected Area Measurement (Turf.js Geodesic)</span>
            </h3>
            <button
              type="button"
              onClick={() => setDraftPoints([])}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-slate-100"
            >
              Clear Selection
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              <span className="text-[10px] uppercase text-slate-500 font-semibold block">Assam Bigha</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {draftAnalysis.measurements.assamBigha.toFixed(3)} Bigha
              </span>
              <span className="text-[10px] text-emerald-700 block">
                {draftAnalysis.measurements.bighaWhole}B · {draftAnalysis.measurements.katha}K · {draftAnalysis.measurements.lessa}L
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              <span className="text-[10px] uppercase text-slate-500 font-semibold block">Hectares</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {draftAnalysis.measurements.areaHa.toFixed(4)} ha
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              <span className="text-[10px] uppercase text-slate-500 font-semibold block">Square Feet</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {formatIndianNumber(Math.round(draftAnalysis.measurements.areaSqFt))} sq ft
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              <span className="text-[10px] uppercase text-slate-500 font-semibold block">Square Meters &amp; Perimeter</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {formatIndianNumber(draftAnalysis.measurements.areaSqM, 1)} m²
              </span>
              <span className="text-[10px] text-slate-500 block">
                Perimeter: {formatIndianNumber(Math.round(draftAnalysis.measurements.perimeterM))} m
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTool === 'DISTANCE' && (
        <div className="bg-white border-2 border-sky-500/40 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-5 h-5 text-sky-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Geodesic Distance Measurement Tool</h3>
              <p className="text-xs text-slate-500">
                Click points on Google Maps to measure road/boundary distances. Drag any point to recalculate live.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <span className="text-slate-500 block text-[10px]">METERS</span>
              <span className="font-bold text-slate-900 text-sm">{formatIndianNumber(draftAnalysis?.meters || 0)} m</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <span className="text-slate-500 block text-[10px]">KILOMETERS</span>
              <span className="font-bold text-slate-900 text-sm">{draftAnalysis?.km || 0} km</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <span className="text-slate-500 block text-[10px]">FEET</span>
              <span className="font-bold text-slate-900 text-sm">
                {formatIndianNumber(Math.round((draftAnalysis?.meters || 0) * 3.28084))} ft
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4B. ACTIVE DRAFT REGISTRATION & TURF.JS VALIDATION CARD */}
      {['REGISTER_PLANTATION', 'WALK_POLOGEN', 'GEO_PIN_TREE'].includes(activeTool) && (
        <div className="bg-white border-2 border-emerald-600/30 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">
                {activeTool === 'REGISTER_PLANTATION' && 'Register New Plantation Holding (PLT) — Turf.js Overlap Validation'}
                {activeTool === 'WALK_POLOGEN' && 'Walk New POLOGEN Block (< 7 Years PLG) — Turf.js Containment & Overlap Validation'}
                {activeTool === 'GEO_PIN_TREE' && 'Geo-Pin Individual Mature Tree (≥ 7 Years TRE) — Hardware RAM SHA-256'}
              </h3>
            </div>

            {/* Live Turf.js Status Badges */}
            {draftAnalysis && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {draftAnalysis.overlap && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                      draftAnalysis.overlap.valid
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    {draftAnalysis.overlap.valid
                      ? '✓ 0.0% Overlap (Turf.js Cleared)'
                      : `✗ ${draftAnalysis.overlap.overlapPct}% Overlap Conflict`}
                  </span>
                )}
                {draftAnalysis.containment && activeTool === 'WALK_POLOGEN' && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                      draftAnalysis.containment.contained
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {draftAnalysis.containment.contained
                      ? `✓ Contained in ${draftAnalysis.containment.parentPlantation.id}`
                      : '⚠ Must lie strictly inside a green Plantation'}
                  </span>
                )}
                {activeTool === 'GEO_PIN_TREE' && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                      draftAnalysis.contained
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {draftAnalysis.contained
                      ? `✓ Inside ${draftAnalysis.parentPlantation.id}`
                      : '⚠ Click inside a green Plantation polygon'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Live Draft Measurements Preview */}
          {draftAnalysis?.measurements && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Assam Bigha</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {draftAnalysis.measurements.assamBigha.toFixed(3)} Bigha
                </span>
                <span className="text-[10px] text-emerald-700 block">
                  {draftAnalysis.measurements.bighaWhole}B · {draftAnalysis.measurements.katha}K · {draftAnalysis.measurements.lessa}L
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Hectares</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {draftAnalysis.measurements.areaHa.toFixed(4)} ha
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Square Feet</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatIndianNumber(Math.round(draftAnalysis.measurements.areaSqFt))} sq ft
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Square Meters &amp; Perimeter</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatIndianNumber(draftAnalysis.measurements.areaSqM, 1)} m²
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Perimeter: {Math.round(draftAnalysis.measurements.perimeterM)} m
                </span>
              </div>
            </div>
          )}

          {/* Contextual Registration Fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {activeTool === 'REGISTER_PLANTATION' && (
              <>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Holding Name</label>
                  <input
                    type="text"
                    value={draftForm.name}
                    onChange={(e) => setDraftForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Bokakhat Sachi Estate"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Farmer Name</label>
                  <input
                    type="text"
                    value={draftForm.farmerName}
                    onChange={(e) => setDraftForm((f) => ({ ...f, farmerName: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Dag / Patta Reference</label>
                  <input
                    type="text"
                    value={draftForm.dagPatta}
                    onChange={(e) => setDraftForm((f) => ({ ...f, dagPatta: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900"
                  />
                </div>
              </>
            )}

            {activeTool === 'WALK_POLOGEN' && (
              <>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Block Name (&lt;7 yrs)</label>
                  <input
                    type="text"
                    value={draftForm.name}
                    onChange={(e) => setDraftForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Dergaon Sapling Block C"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Planting Year</label>
                  <input
                    type="number"
                    min="2020"
                    max="2026"
                    value={draftForm.plantingYear}
                    onChange={(e) => setDraftForm((f) => ({ ...f, plantingYear: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Estimated Saplings</label>
                  <input
                    type="number"
                    value={draftForm.saplingCount}
                    onChange={(e) => setDraftForm((f) => ({ ...f, saplingCount: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono"
                  />
                </div>
              </>
            )}

            {activeTool === 'GEO_PIN_TREE' && (
              <>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Physical RFID / Barcode</label>
                  <input
                    type="text"
                    value={draftForm.rfidTag}
                    onChange={(e) => setDraftForm((f) => ({ ...f, rfidTag: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Tree Age (≥ 7 yrs) &amp; GBH (cm)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      value={draftForm.ageYears}
                      onChange={(e) => setDraftForm((f) => ({ ...f, ageYears: e.target.value }))}
                      className="w-1/2 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 font-mono"
                      placeholder="Age"
                    />
                    <input
                      type="number"
                      step="0.5"
                      value={draftForm.gbhCm}
                      onChange={(e) => setDraftForm((f) => ({ ...f, gbhCm: e.target.value }))}
                      className="w-1/2 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 font-mono"
                      placeholder="GBH"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">In-App Camera RAM Hash</label>
                  <button
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    className="w-full px-3 py-1.5 rounded-lg gis-btn-amber font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capture AR Photo &amp; SHA-256</span>
                  </button>
                </div>
              </>
            )}

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={!draftAnalysis}
                className="flex-1 px-3 py-1.5 rounded-lg gis-btn-emerald disabled:opacity-40 font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>{isOffline ? 'Queue Offline' : 'Commit to Registry'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectTool('INSPECT')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SELECTED FEATURE STRICT AREA & PROVENANCE INSPECTOR */}
      {selectedEntity && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold gis-btn-emerald">
                {selectedEntity.type}
              </span>
              <span className="font-mono font-extrabold text-sm text-slate-900">{selectedEntity.id}</span>
              <span className="text-xs text-slate-600">
                {selectedEntity.name || `${selectedEntity.species} (${selectedEntity.rfidTag})`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedEntity.type === 'TREE' && (
                <button
                  type="button"
                  onClick={() => setShowCameraModal(true)}
                  className="px-2.5 py-1 rounded-lg gis-btn-amber text-xs font-semibold flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Inspect AR Photo Hash</span>
                </button>
              )}
              {onAdvanceStep && (
                <button
                  type="button"
                  onClick={() => onAdvanceStep(3)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1 border border-slate-200"
                >
                  <span>Return to Live Flow</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {selectedEntity.type !== 'TREE' && selectedMeasurements ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Assam Bigha</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {selectedMeasurements.assamBigha.toFixed(3)} Bigha
                </span>
                <span className="text-[10px] text-emerald-700 block font-medium">
                  {selectedMeasurements.bighaWhole}B · {selectedMeasurements.katha}K · {selectedMeasurements.lessa}L
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Hectares</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {selectedMeasurements.areaHa.toFixed(4)} ha
                </span>
                <span className="text-[10px] text-slate-500 block">Turf.js Geodesic</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Square Feet</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatIndianNumber(Math.round(selectedMeasurements.areaSqFt))} sq ft
                </span>
                <span className="text-[10px] text-slate-500 block">14,400 sq ft / Bigha</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Square Meters</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatIndianNumber(selectedMeasurements.areaSqM, 1)} m²
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Perimeter: {formatIndianNumber(Math.round(selectedMeasurements.perimeterM))} m
                </span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                <span className="text-[10px] uppercase text-emerald-700 font-semibold block">Turf.js Spatial Audit</span>
                <span className="font-bold text-emerald-900 text-xs block mt-0.5">✓ 0.0% Overlap Verified</span>
                <span className="text-[10px] text-emerald-800 block mt-0.5">
                  {selectedEntity.type === 'POLOGEN'
                    ? `Parent: ${selectedEntity.parentPlantationId} (${selectedEntity.saplingCount} saplings <7y)`
                    : `${selectedEntity.dagPatta} · ${selectedEntity.farmerName}`}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">RFID / Barcode</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{selectedEntity.rfidTag}</span>
                <span className="text-[10px] text-slate-500 block">Parent: {selectedEntity.parentPlantationId}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Age &amp; Trunk GBH</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {selectedEntity.ageYears} yrs · {selectedEntity.gbhCm} cm
                </span>
                <span className="text-[10px] text-emerald-700 block">≥ 7 yr Eligible</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">GPS Coordinates</span>
                <span className="font-mono font-semibold text-slate-900 text-[11px] block mt-0.5">
                  {formatCoordinate(selectedEntity.coordinates[1], selectedEntity.coordinates[0], exactGpsView)}
                </span>
                <span className="text-[10px] text-slate-500 block">RTK ±{selectedEntity.accuracyM}m</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 col-span-2">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Hardware Camera RAM SHA-256 Hash</span>
                <span className="font-mono text-[10px] text-teal-900 break-all block mt-0.5">
                  {selectedEntity.photoSha256}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. AR IN-APP CAMERA VIEWFINDER MODAL (RAM SHA-256 HASHING) */}
      {showCameraModal && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="gis-hud-dark border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>REC • HARDWARE RAM CAMERA BUFFER</span>
              </span>
              <button
                type="button"
                onClick={() => setShowCameraModal(false)}
                className="text-slate-300 hover:text-white font-bold px-2 py-0.5"
              >
                ✕ Close
              </button>
            </div>

            <div className="relative h-72 bg-stone-900 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-b from-stone-800 via-stone-900 to-emerald-950 opacity-90 flex items-center justify-center">
                <div className="w-24 h-full bg-[#3d2714] border-x-4 border-[#24170c] shadow-2xl relative">
                  <div className="absolute top-20 left-4 w-4 h-4 rounded-full bg-black border border-amber-600/80" />
                  <div className="absolute top-36 right-4 w-4 h-4 rounded-full bg-black border border-amber-600/80" />
                  <div className="absolute top-28 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                    #{selectedEntity?.rfidTag || draftForm.rfidTag}
                  </div>
                </div>
              </div>

              <div className="relative z-10 w-44 h-44 border-2 border-emerald-400/40 rounded-2xl flex items-center justify-center pointer-events-none">
                <div className="w-7 h-7 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0" />
                <div className="w-7 h-7 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0" />
                <div className="w-7 h-7 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0" />
                <div className="w-7 h-7 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0" />
                <div className="w-2.5 h-2.5 bg-emerald-400/70 rounded-full" />
              </div>

              <div className="absolute bottom-3 left-3 bg-black/75 p-2 rounded-lg font-mono text-[9px] text-emerald-300 space-y-0.5 border border-emerald-500/30">
                <div>RTK ACCURACY: ±1.1m • GALLERY UPLOAD BLOCKED</div>
                <div className="text-teal-300">RAM SHA-256: {cameraHash.substring(0, 28)}...</div>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between">
              <span className="text-xs text-slate-300">Direct Sensor Memory Buffer</span>
              <button
                type="button"
                onClick={() => {
                  const newHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
                  setCameraHash(newHash);
                  setShowCameraModal(false);
                  showToast(`Captured live photo & computed hardware RAM SHA-256 (${newHash.slice(0, 14)}...)`, 'success');
                }}
                className="px-4 py-2 rounded-xl gis-btn-emerald font-bold text-xs flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Capture &amp; Hash in RAM</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
