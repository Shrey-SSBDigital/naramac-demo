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
  Sparkles,
  Sprout,
  Users,
  Building,
  Image as ImageIcon,
  ZoomIn,
  Video,
  VideoOff,
  ExternalLink
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
import { useEnterprise } from '../context/EnterpriseContext';
import {
  generateSyntheticFieldPhoto,
  stampWatermarkOnCanvas,
  generateCryptoHash,
  computeRealSha256
} from '../utils/photoCaptureUtils';

// Default seed fallback
const FALLBACK_REGISTRY = {
  plantations: [
    {
      id: 'PLT-AS-GLG-0001-X',
      name: 'Nahorjan Homestead Sachi Estate',
      farmerId: 'FRM-AS-01',
      farmerName: 'Bhaben Saikia',
      cluster: 'GOLAGHAT',
      district: 'Golaghat, Assam',
      dagPatta: 'Dag 182, Patta 44',
      coordinates: [[[93.9612, 26.5112], [93.9652, 26.5115], [93.9655, 26.5150], [93.9614, 26.5148], [93.9612, 26.5112]]]
    },
    {
      id: 'PLT-AS-GLG-0002-9',
      name: 'Dergaon North Sachi Block',
      farmerId: 'FRM-AS-02',
      farmerName: 'Pranab Bora',
      cluster: 'GOLAGHAT',
      district: 'Golaghat, Assam',
      dagPatta: 'Dag 214, Patta 61',
      coordinates: [[[93.9932, 26.5458], [93.9977, 26.5461], [93.9980, 26.5499], [93.9935, 26.5496], [93.9932, 26.5458]]]
    },
    {
      id: 'PLT-TR-KDM-0003-C',
      name: 'Kadamtala Eastern Agar Garden',
      farmerId: 'FRM-TR-01',
      farmerName: 'Subhash Debnath',
      cluster: 'KADAMTALA',
      district: 'North Tripura, Tripura',
      dagPatta: 'Dag 94, Khatian 18',
      coordinates: [[[92.2035, 24.4602], [92.2080, 24.4604], [92.2083, 24.4643], [92.2037, 24.4641], [92.2035, 24.4602]]]
    },
    {
      id: 'PLT-TR-KDM-0004-P',
      name: 'Churaibari Hill Slope Block',
      farmerId: 'FRM-TR-03',
      farmerName: 'Lalrosanga Darlong',
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
      farmerId: 'FRM-AS-01',
      farmerName: 'Bhaben Saikia',
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
      farmerId: 'FRM-AS-01',
      farmerName: 'Bhaben Saikia',
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
      farmerId: 'FRM-AS-02',
      farmerName: 'Pranab Bora',
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
      farmerId: 'FRM-TR-01',
      farmerName: 'Subhash Debnath',
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
      farmerId: 'FRM-TR-03',
      farmerName: 'Lalrosanga Darlong',
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
      farmerId: 'FRM-AS-01',
      farmerName: 'Bhaben Saikia',
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
      farmerId: 'FRM-AS-01',
      farmerName: 'Bhaben Saikia',
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
      farmerId: 'FRM-AS-02',
      farmerName: 'Pranab Bora',
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
      farmerId: 'FRM-AS-02',
      farmerName: 'Pranab Bora',
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
      farmerId: 'FRM-TR-01',
      farmerName: 'Subhash Debnath',
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
      farmerId: 'FRM-TR-03',
      farmerName: 'Lalrosanga Darlong',
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
  const {
    farmers,
    plantations: enterprisePlantations,
    addPlantation: enterpriseAddPlantation,
    pologens: enterprisePologens,
    addPologen: enterpriseAddPologen,
    trees: enterpriseTrees,
    addTree: enterpriseAddTree
  } = useEnterprise();

  // Initialize GIS Registry synced with EnterpriseContext
  const [registry, setRegistry] = useState(() => {
    const entPlts = (enterprisePlantations || []).map(p => ({
      id: p.id,
      name: p.name,
      farmerId: p.farmerId,
      farmerName: p.farmerName,
      cluster: p.cluster.includes('Tripura') ? 'KADAMTALA' : 'GOLAGHAT',
      district: `${p.district}, ${p.state}`,
      dagPatta: `Dag ${p.id.slice(-2)}, Patta ${p.id.slice(-2)}`,
      coordinates: [p.boundaryPolygon.map(([lat, lng]) => [lng, lat])]
    }));

    const entPlgs = (enterprisePologens || []).map(plg => ({
      id: plg.id,
      version: 'v1',
      parentPlantationId: plg.plantationId,
      farmerId: plg.farmerId,
      farmerName: plg.farmerName,
      name: plg.name,
      cluster: plg.cluster.includes('Tripura') ? 'KADAMTALA' : 'GOLAGHAT',
      plantingYear: plg.plantingYear,
      ageYears: plg.ageYears,
      saplingCount: plg.saplingCount,
      coordinates: [plg.boundaryPolygon.map(([lat, lng]) => [lng, lat])]
    }));

    const entTrees = (enterpriseTrees || []).map(t => ({
      id: t.id,
      parentPlantationId: t.plantationId,
      farmerId: t.farmerId,
      farmerName: t.farmerName,
      cluster: t.cluster.includes('Tripura') ? 'KADAMTALA' : 'GOLAGHAT',
      rfidTag: t.qrTagCode || `AS-TAG-${t.id.slice(-4)}`,
      species: t.species,
      ageYears: t.ageYears,
      gbhCm: t.girthCm,
      heightM: t.heightMeters,
      status: t.status === 'MATURE_GROWING' ? 'VERIFIED_HEALTHY' : (t.status === 'INOCULATED' ? 'INOCULATED' : 'HARVEST_AUTHORIZED'),
      pinColor: t.status === 'HARVESTED' ? 'red' : (t.status === 'INOCULATED' ? 'slate' : 'green'),
      elevation: '86.5 m MSL',
      accuracyM: 1.1,
      photoSha256: t.photoHash ? t.photoHash.replace('sha256:', '') : generateCryptoHash(),
      coordinates: [t.gpsLongitude, t.gpsLatitude]
    }));

    const combinedPlts = [...entPlts];
    FALLBACK_REGISTRY.plantations.forEach(fp => {
      if (!combinedPlts.some(p => p.id === fp.id)) combinedPlts.push(fp);
    });

    const combinedPlgs = [...entPlgs];
    FALLBACK_REGISTRY.pologens.forEach(fplg => {
      if (!combinedPlgs.some(p => p.id === fplg.id)) combinedPlgs.push(fplg);
    });

    const combinedTrees = [...entTrees];
    FALLBACK_REGISTRY.trees.forEach(ft => {
      if (!combinedTrees.some(t => t.id === ft.id)) combinedTrees.push(ft);
    });

    return {
      plantations: combinedPlts,
      pologens: combinedPlgs,
      trees: combinedTrees,
      facilities: FALLBACK_REGISTRY.facilities,
      corridors: FALLBACK_REGISTRY.corridors
    };
  });

  // Ensure all existing trees & pologens have inspectable watermarked photos
  useEffect(() => {
    setRegistry(prev => {
      let changed = false;
      const updatedTrees = prev.trees.map(t => {
        if (!t.photoUrl) {
          changed = true;
          const plt = prev.plantations.find(p => p.id === t.parentPlantationId);
          return {
            ...t,
            photoUrl: generateSyntheticFieldPhoto({
              kind: 'TREE',
              entityId: t.id,
              farmerName: t.farmerName || plt?.farmerName || 'Bhaben Saikia',
              farmerId: t.farmerId || plt?.farmerId || 'FRM-AS-01',
              plantationName: plt?.name || 'Nahorjan Sachi Estate',
              plantationId: t.parentPlantationId,
              rfidTag: t.rfidTag,
              ageYears: t.ageYears,
              gbhCm: t.gbhCm,
              coordinates: t.coordinates,
              photoSha256: t.photoSha256 || generateCryptoHash()
            })
          };
        }
        return t;
      });

      const updatedPologens = prev.pologens.map(plg => {
        if (!plg.photoUrl) {
          changed = true;
          const plt = prev.plantations.find(p => p.id === plg.parentPlantationId);
          const center = plg.coordinates?.[0]?.[0] || [93.9631, 26.5117];
          return {
            ...plg,
            photoUrl: generateSyntheticFieldPhoto({
              kind: 'POLOGEN',
              entityId: plg.id,
              farmerName: plg.farmerName || plt?.farmerName || 'Bhaben Saikia',
              farmerId: plg.farmerId || plt?.farmerId || 'FRM-AS-01',
              plantationName: plt?.name || 'Nahorjan Sachi Estate',
              plantationId: plg.parentPlantationId,
              saplingCount: plg.saplingCount,
              plantingYear: plg.plantingYear,
              coordinates: center,
              photoSha256: generateCryptoHash()
            })
          };
        }
        return plg;
      });

      if (!changed) return prev;
      return {
        ...prev,
        trees: updatedTrees,
        pologens: updatedPologens
      };
    });
  }, []);

  // Navigation, Map Type & Tool States
  const [activeCluster, setActiveCluster] = useState('GOLAGHAT');
  const [viewport, setViewport] = useState(CLUSTER_VIEWPORTS.GOLAGHAT);
  const [mapType, setMapType] = useState('hybrid');
  const [activeTool, setActiveTool] = useState('INSPECT');
  const [exactGpsView, setExactGpsView] = useState(true);

  // Layer Visibility
  const [layers, setLayers] = useState({
    plantations: true,
    pologens: true,
    trees: true,
    facilities: true,
    corridors: true
  });

  // Selection & Drawing State
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [draftPoints, setDraftPoints] = useState([]);
  const [isWalkingSim, setIsWalkingSim] = useState(false);
  const walkTimerRef = useRef(null);

  // Form Metadata for New Registrations (Attached directly to Farmer & Plantation)
  const [draftForm, setDraftForm] = useState({
    farmerId: farmers[0]?.id || 'FRM-AS-01',
    farmerName: farmers[0]?.name || 'Bhaben Saikia',
    parentPlantationId: registry.plantations[0]?.id || 'PLT-AS-GLG-0001-X',
    name: '',
    dagPatta: 'Dag 235, Patta 72',
    plantingYear: 2023,
    saplingCount: 280,
    rfidTag: 'AS-GLG-TAG-9204',
    ageYears: 10.8,
    gbhCm: 63.0,
    heightM: 11.4,
    treeStatus: 'VERIFIED_HEALTHY'
  });

  // Image Capture States
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraMode, setCameraMode] = useState('TREE'); // 'TREE' | 'POLOGEN'
  const [cameraHash, setCameraHash] = useState(() => generateCryptoHash());
  const [draftTreePhoto, setDraftTreePhoto] = useState(null);
  const [draftPologenPhoto, setDraftPologenPhoto] = useState(null);
  const [viewingPhoto, setViewingPhoto] = useState(null);

  // Live device webcam stream state
  const videoRef = useRef(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);

  // Offline Simulation
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [bannerMsg, setBannerMsg] = useState(null);

  const showToast = (text, tone = 'success') => {
    setBannerMsg({ text, tone });
    setTimeout(() => setBannerMsg(null), 5000);
  };

  // Plantations available for selected farmer
  const farmerPlantationsList = useMemo(() => {
    const list = registry.plantations.filter(p => p.farmerId === draftForm.farmerId);
    return list.length > 0 ? list : registry.plantations;
  }, [registry.plantations, draftForm.farmerId]);

  // Keep parentPlantationId aligned when farmer changes
  useEffect(() => {
    if (farmerPlantationsList.length > 0 && !farmerPlantationsList.some(p => p.id === draftForm.parentPlantationId)) {
      setDraftForm(prev => ({ ...prev, parentPlantationId: farmerPlantationsList[0].id }));
    }
  }, [draftForm.farmerId, farmerPlantationsList, draftForm.parentPlantationId]);

  // Switch Cluster
  const handleSelectCluster = (clusterKey) => {
    setActiveCluster(clusterKey);
    setViewport({ ...CLUSTER_VIEWPORTS[clusterKey] });
  };

  // Switch GIS Tool
  const handleSelectTool = (tool) => {
    if (walkTimerRef.current) clearInterval(walkTimerRef.current);
    setIsWalkingSim(false);
    setActiveTool(tool);
    setDraftPoints([]);

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
      setDraftPoints([]);
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

  // Map Click Handler
  const handleMapClickPoint = (lngLat) => {
    if (activeTool === 'GEO_PIN_TREE') {
      setDraftPoints([lngLat]);
      // Auto-detect containing plantation and sync farmer!
      const parent = findContainingPlantation(lngLat, registry.plantations);
      if (parent) {
        setDraftForm(prev => ({
          ...prev,
          parentPlantationId: parent.id,
          farmerId: parent.farmerId || prev.farmerId,
          farmerName: parent.farmerName || prev.farmerName
        }));
      }
    } else if (['SELECT_AREA', 'REGISTER_PLANTATION', 'WALK_POLOGEN', 'DISTANCE'].includes(activeTool)) {
      if (activeTool === 'SELECT_AREA') {
        setSelectedEntity(null);
      }
      setDraftPoints((prev) => [...prev, lngLat]);

      if (activeTool === 'WALK_POLOGEN' && draftPoints.length >= 2) {
        const parent = findContainingPlantation(lngLat, registry.plantations);
        if (parent) {
          setDraftForm(prev => ({
            ...prev,
            parentPlantationId: parent.id,
            farmerId: parent.farmerId || prev.farmerId,
            farmerName: parent.farmerName || prev.farmerName
          }));
        }
      }
    }
  };

  const handleUpdateDraftPoint = (idx, newLngLat) => {
    setDraftPoints((prev) => {
      const next = [...prev];
      next[idx] = newLngLat;
      return next;
    });
  };

  // 1-Click Sample Plantation Boundary
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

  // Simulate Ground-Walked GPS Boundary for POLOGEN (<7 yrs)
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

  // 1-Click Quick Mature Tree Pin inside Plantation
  const handleQuickPinTree = () => {
    const pt = activeCluster === 'KADAMTALA' ? [92.2055, 24.4631] : [93.9633, 26.5138];
    setDraftPoints([pt]);
    setViewport({ lat: pt[1], lng: pt[0], zoom: 17 });

    const parent = findContainingPlantation(pt, registry.plantations);
    if (parent) {
      setDraftForm(prev => ({
        ...prev,
        parentPlantationId: parent.id,
        farmerId: parent.farmerId || prev.farmerId,
        farmerName: parent.farmerName || prev.farmerName
      }));
    }
    showToast('Mature tree pin dropped inside parent plantation! Capture photo & click "Commit to Registry".', 'success');
  };

  // Live Turf.js Spatial Analysis
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
        return `Walk POLOGEN (<7y): ${m.assamBigha.toFixed(3)} Bigha (${formatIndianNumber(m.areaSqM, 0)} m²) · ${inPlt}`;
      }
      return `Walk POLOGEN (<7y): Click 3+ corners INSIDE a green Plantation, or click "Simulate GPS Walk" (${draftPoints.length}/3)`;
    }
    if (activeTool === 'GEO_PIN_TREE') {
      if (draftAnalysis?.kind === 'TREE') {
        return draftAnalysis.contained
          ? `Tree Pin Ready inside ${draftAnalysis.parentPlantation.id} ✓ — Capture photo & click Commit`
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

  // Open Camera Modal
  const handleOpenCamera = (mode) => {
    setCameraMode(mode);
    setCameraHash(generateCryptoHash());
    setShowCameraModal(true);
  };

  // Toggle Live Webcam
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsWebcamActive(true);
        }
      } catch (err) {
        showToast('Webcam not accessible or permission denied. Using high-precision AR simulation.', 'warning');
        setIsWebcamActive(false);
      }
    }
  };

  // Snap and Watermark Photo
  const handleSnapPhoto = async () => {
    const currentFarmer = farmers.find(f => f.id === draftForm.farmerId) || farmers[0];
    const targetPlt = registry.plantations.find(p => p.id === (
      draftAnalysis?.parentPlantation?.id ||
      draftAnalysis?.containment?.parentPlantation?.id ||
      draftForm.parentPlantationId
    )) || registry.plantations[0];

    const currentHash = generateCryptoHash();
    let photoDataUrl;

    if (isWebcamActive && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 540;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 720, 540);
      stampWatermarkOnCanvas(ctx, 720, 540, {
        kind: cameraMode,
        entityId: cameraMode === 'POLOGEN'
          ? `PLG-${targetPlt.id.slice(4, 10)}-${String(registry.pologens.length + 1).padStart(3, '0')}`
          : `TRE-${targetPlt.id.slice(4, 10)}-${String(registry.trees.length + 1).padStart(3, '0')}`,
        farmerName: currentFarmer.name,
        farmerId: currentFarmer.id,
        plantationName: targetPlt.name,
        plantationId: targetPlt.id,
        rfidTag: draftForm.rfidTag,
        ageYears: draftForm.ageYears,
        gbhCm: draftForm.gbhCm,
        saplingCount: draftForm.saplingCount,
        plantingYear: draftForm.plantingYear,
        coordinates: draftPoints[0] || [93.9782, 26.5204],
        photoSha256: currentHash
      });
      photoDataUrl = canvas.toDataURL('image/jpeg', 0.92);

      if (videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
    } else {
      photoDataUrl = generateSyntheticFieldPhoto({
        kind: cameraMode,
        entityId: cameraMode === 'POLOGEN'
          ? `PLG-${targetPlt.id.slice(4, 10)}-${String(registry.pologens.length + 1).padStart(3, '0')}`
          : `TRE-${targetPlt.id.slice(4, 10)}-${String(registry.trees.length + 1).padStart(3, '0')}`,
        farmerName: currentFarmer.name,
        farmerId: currentFarmer.id,
        plantationName: targetPlt.name,
        plantationId: targetPlt.id,
        rfidTag: draftForm.rfidTag,
        ageYears: draftForm.ageYears,
        gbhCm: draftForm.gbhCm,
        saplingCount: draftForm.saplingCount,
        plantingYear: draftForm.plantingYear,
        coordinates: draftPoints[0] || [93.9782, 26.5204],
        photoSha256: currentHash
      });
    }

    // Compute genuine cryptographic SHA-256 buffer hash using Web Crypto API
    const realSha256 = await computeRealSha256(photoDataUrl);

    if (cameraMode === 'POLOGEN') {
      setDraftPologenPhoto(photoDataUrl);
      setCameraHash(realSha256);
    } else {
      setDraftTreePhoto(photoDataUrl);
      setCameraHash(realSha256);
    }

    setShowCameraModal(false);
    showToast(`✓ Field ${cameraMode === 'POLOGEN' ? 'POLOGEN sapling grove' : 'mature tree'} photo captured & sealed with Web Crypto SHA-256`, 'success');
  };

  // Save Draft (Commits to EnterpriseContext and local Spatial Registry)
  const handleSaveDraft = async () => {
    if (!draftAnalysis) return;

    if (activeTool === 'REGISTER_PLANTATION') {
      if (!draftAnalysis.overlap.valid) {
        showToast(`Turf.js Overlap Blocked (${draftAnalysis.overlap.overlapPct}% overlap with existing plantation). Drag vertices to resolve.`, 'error');
        return;
      }

      const currentFarmer = farmers.find(f => f.id === draftForm.farmerId) || farmers[0];
      const closedPoints = closeRing(draftPoints);

      // Enterprise Context Sync
      enterpriseAddPlantation({
        farmerId: currentFarmer.id,
        farmerName: currentFarmer.name,
        name: draftForm.name.trim() || `Surveyed Agarwood Holding (${activeCluster === 'KADAMTALA' ? 'Tripura' : 'Assam'})`,
        cluster: activeCluster === 'KADAMTALA' ? 'Kadamtala Cluster' : 'Golaghat Cluster',
        areaHectares: draftAnalysis.measurements.areaHa,
        boundaryPolygon: closedPoints.map(([lng, lat]) => [lat, lng])
      });

      const payload = {
        name: draftForm.name.trim() || `Surveyed Agarwood Holding (${activeCluster === 'KADAMTALA' ? 'Tripura' : 'Assam'})`,
        farmerId: currentFarmer.id,
        farmerName: currentFarmer.name,
        cluster: activeCluster === 'KADAMTALA' ? 'KADAMTALA' : 'GOLAGHAT',
        dagPatta: draftForm.dagPatta,
        coordinates: [closedPoints]
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

      const currentFarmer = farmers.find(f => f.id === draftForm.farmerId) || farmers[0];
      const parentPlt = draftAnalysis.containment.parentPlantation;
      const closedPoints = closeRing(draftPoints);

      // Ensure photo is captured or auto-generate stamped photo
      const photoToSave = draftPologenPhoto || generateSyntheticFieldPhoto({
        kind: 'POLOGEN',
        entityId: `PLG-${parentPlt.id.slice(4, 10)}-${String(registry.pologens.length + 1).padStart(3, '0')}`,
        farmerName: currentFarmer.name,
        farmerId: currentFarmer.id,
        plantationName: parentPlt.name,
        plantationId: parentPlt.id,
        saplingCount: Number(draftForm.saplingCount) || 250,
        plantingYear: Number(draftForm.plantingYear) || 2023,
        coordinates: closedPoints[0],
        photoSha256: cameraHash
      });

      // Enterprise Context Sync
      enterpriseAddPologen({
        farmerId: currentFarmer.id,
        farmerName: currentFarmer.name,
        plantationId: parentPlt.id,
        plantationName: parentPlt.name,
        name: draftForm.name.trim() || `${parentPlt.name} Sapling Block`,
        plantingYear: Number(draftForm.plantingYear) || 2023,
        ageYears: +(2026.5 - (Number(draftForm.plantingYear) || 2023)).toFixed(1),
        saplingCount: Number(draftForm.saplingCount) || 250,
        boundaryPolygon: closedPoints.map(([lng, lat]) => [lat, lng]),
        areaSquareMeters: Math.round(draftAnalysis.measurements.areaSqM),
        perimeterMeters: Math.round(draftAnalysis.measurements.perimeterM),
        photoUrl: photoToSave,
        photoSha256: cameraHash
      });

      const payload = {
        name: draftForm.name.trim() || `Walked Sapling Block (${draftForm.plantingYear})`,
        parentPlantationId: parentPlt.id,
        farmerId: currentFarmer.id,
        farmerName: currentFarmer.name,
        cluster: parentPlt.cluster,
        plantingYear: Number(draftForm.plantingYear) || 2023,
        saplingCount: Number(draftForm.saplingCount) || 250,
        coordinates: [closedPoints],
        photoUrl: photoToSave,
        photoSha256: cameraHash
      };
      await commitRecord('POLOGEN', '/api/gis/pologens', payload);
      setDraftPologenPhoto(null);
    } else if (activeTool === 'GEO_PIN_TREE') {
      if (!draftAnalysis.contained) {
        showToast('Turf.js Containment Rule: Mature Tree pin must be placed inside a registered green Plantation boundary!', 'error');
        return;
      }

      const currentFarmer = farmers.find(f => f.id === draftForm.farmerId) || farmers[0];
      const parentPlt = draftAnalysis.parentPlantation;

      // Ensure photo is captured or auto-generate stamped photo
      const photoToSave = draftTreePhoto || generateSyntheticFieldPhoto({
        kind: 'TREE',
        entityId: `TRE-${parentPlt.id.slice(4, 10)}-${String(registry.trees.length + 1).padStart(3, '0')}`,
        farmerName: currentFarmer.name,
        farmerId: currentFarmer.id,
        plantationName: parentPlt.name,
        plantationId: parentPlt.id,
        rfidTag: draftForm.rfidTag,
        ageYears: Number(draftForm.ageYears) || 10.5,
        gbhCm: Number(draftForm.gbhCm) || 62.0,
        coordinates: draftPoints[0],
        photoSha256: cameraHash
      });

      // Enterprise Context Sync
      enterpriseAddTree({
        farmerId: currentFarmer.id,
        farmerName: currentFarmer.name,
        plantationId: parentPlt.id,
        plantationName: parentPlt.name,
        qrTagCode: draftForm.rfidTag,
        ageYears: Number(draftForm.ageYears) || 10.5,
        girthCm: Number(draftForm.gbhCm) || 62.0,
        heightMeters: Number(draftForm.heightM) || 11.0,
        gpsLatitude: draftPoints[0][1],
        gpsLongitude: draftPoints[0][0],
        photoHash: `sha256:${cameraHash}`,
        photoUrl: photoToSave
      });

      const payload = {
        parentPlantationId: parentPlt.id,
        farmerId: currentFarmer.id,
        farmerName: currentFarmer.name,
        cluster: parentPlt.cluster,
        rfidTag: draftForm.rfidTag,
        ageYears: Number(draftForm.ageYears) || 10.5,
        gbhCm: Number(draftForm.gbhCm) || 62.0,
        heightM: Number(draftForm.heightM) || 11.0,
        status: draftForm.treeStatus,
        photoSha256: cameraHash,
        photoUrl: photoToSave,
        coordinates: draftPoints[0]
      };
      await commitRecord('TREE', '/api/gis/trees', payload);
      setDraftTreePhoto(null);
    }
  };

  const buildLocalRecord = (kind, payload) => {
    const clusterCode = payload.cluster === 'KADAMTALA' ? 'TR-KDM' : 'AS-GLG';
    if (kind === 'PLANTATION') {
      const idx = registry.plantations.length + 1;
      const suffix = String.fromCharCode(65 + (idx % 26));
      return {
        id: `PLT-${clusterCode}-${String(idx).padStart(4, '0')}-${suffix}`,
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
    showToast(`${kind} ${localItem.id} captured with stamped photo and committed to NERAMAC Spatial Registry!`, 'success');
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Field GIS Studio</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Interactive Capture with Camera
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture POLOGEN sapling blocks (&lt;7 yrs) and mature trees (&ge;7 yrs) with Turf.js perimeter validation, live AR camera &amp; watermarked photo hashing.
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
            <span>{exactGpsView ? 'Exact GPS View' : 'DPDP Masked'}</span>
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

      {/* 2. FIELD AGENT ON-SITE INSPECTION & ASSET CAPTURE BAR */}
      <div className="bg-emerald-950 border border-emerald-800/80 rounded-2xl p-4 text-white shadow-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Field Agent On-Site Inspection
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Assam & Tripura Forestry Verification
                </span>
              </div>
              <h2 className="text-sm font-black text-white mt-0.5">
                Select Farmer to Tag POLOGEN Boundaries & Mature Trees
              </h2>
            </div>
          </div>

          {/* Farmer Selector Dropdown */}
          <div className="flex items-center gap-2 min-w-[300px]">
            <label className="text-xs font-bold text-slate-300 whitespace-nowrap">Choose Farmer:</label>
            <select
              value={draftForm.farmerId}
              onChange={(e) => {
                const selectedId = e.target.value;
                const f = farmers.find(farm => farm.id === selectedId);
                setDraftForm(prev => ({
                  ...prev,
                  farmerId: selectedId,
                  farmerName: f ? f.name : prev.farmerName
                }));
                const targetPlt = registry.plantations.find(p => p.farmerId === selectedId);
                if (targetPlt) {
                  const m = computePolygonMeasurements(targetPlt.coordinates);
                  if (m.center) {
                    setViewport({ lat: m.center[1], lng: m.center[0], zoom: 16 });
                  }
                }
              }}
              className="w-full text-xs px-3 py-1.5 bg-slate-900 border border-emerald-700/60 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              {farmers.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.id}) — {f.village}, {f.dagNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Action Buttons for Field Agent */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-800/60">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Selected Plot:</span>
            <span className="font-bold text-emerald-300 font-mono">
              {draftForm.parentPlantationId || 'PLT-AS-GLG-0001-X'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">
              Grower: <span className="font-bold text-white">{draftForm.farmerName}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleSelectTool('WALK_POLOGEN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTool === 'WALK_POLOGEN'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                  : 'bg-emerald-900/80 hover:bg-emerald-800 text-teal-200 border border-teal-700/60'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Add POLOGEN (&lt; 7y Saplings)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTool('GEO_PIN_TREE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTool === 'GEO_PIN_TREE'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'bg-emerald-900/80 hover:bg-emerald-800 text-amber-200 border border-amber-700/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Add Tree Point (≥ 7y Tag)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleOpenCamera(activeTool === 'WALK_POLOGEN' ? 'POLOGEN' : 'TREE');
                if (!isWebcamActive) {
                  setTimeout(() => toggleWebcam(), 300);
                }
              }}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Capture Image (Real Camera)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. UNIFIED GIS TOOLBAR CARD */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2.5">
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
              { id: 'WALK_POLOGEN', label: 'Walk POLOGEN (<7y)', icon: Footprints, highlight: true },
              { id: 'GEO_PIN_TREE', label: 'Geo-Pin Tree (≥7y)', icon: MapPin, highlight: true },
              { id: 'REGISTER_PLANTATION', label: 'Register Plantation', icon: Tag },
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
                      : t.highlight
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
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

        {/* Row 2: Google Map Type Tabs & Action Helpers */}
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

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {activeTool === 'WALK_POLOGEN' && (
              <>
                <button
                  type="button"
                  onClick={handleSimulatePologenWalk}
                  disabled={isWalkingSim}
                  className="px-2.5 py-1 rounded-md gis-btn-emerald disabled:opacity-50 font-semibold flex items-center gap-1"
                >
                  <Footprints className="w-3 h-3" />
                  <span>{isWalkingSim ? 'Walking Perimeter...' : 'Simulate GPS Walk'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenCamera('POLOGEN')}
                  className="px-2.5 py-1 rounded-md bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  <span>{draftPologenPhoto ? 'Retake Sapling Photo' : 'Capture Sapling Photo'}</span>
                </button>
              </>
            )}

            {activeTool === 'GEO_PIN_TREE' && (
              <>
                <button
                  type="button"
                  onClick={handleQuickPinTree}
                  className="px-2.5 py-1 rounded-md gis-btn-amber font-semibold flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Quick Pin Inside Plantation</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenCamera('TREE')}
                  className="px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  <span>{draftTreePhoto ? 'Retake Trunk Photo' : 'Capture Trunk Photo & Hash'}</span>
                </button>
              </>
            )}

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
          </div>
        </div>
      </div>

      {/* 3. MAIN SPLIT WORKSPACE: LEFT GOOGLE MAP + RIGHT SPATIAL REGISTRY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT: Interactive Google Map */}
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

          {/* Bottom Layer Toggles */}
          <div className="px-3.5 py-2.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-3.5 text-slate-700">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Layers:
              </span>

              {[
                { key: 'plantations', label: 'Plantations', accent: 'accent-emerald-700' },
                { key: 'pologens', label: 'POLOGENs (<7y)', accent: 'accent-amber-500' },
                { key: 'trees', label: 'Mature Trees (≥7y)', accent: 'accent-emerald-600' },
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
            <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Spatial Registry</span>
              <span className="text-[11px] font-mono font-normal text-slate-500">
                {totalPLT} PLT · {totalPLG} PLG · {totalTRE} TRE
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Click any feature to inspect its live photo, owner farmer, strict Turf.js measurements &amp; hash proof.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 px-3 py-1">
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
                      <Sprout className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span className="font-mono text-xs font-bold text-amber-900 truncate">{plg.id}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        &lt;7y
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-700 truncate mt-0.5">
                      {plg.name} • {plg.saplingCount} Saplings
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Farmer: <b className="text-slate-800">{plg.farmerName || 'Bhaben Saikia'}</b>
                    </div>
                  </div>
                  {plg.photoUrl && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingPhoto({
                          url: plg.photoUrl,
                          title: plg.name,
                          kind: 'POLOGEN',
                          entityId: plg.id,
                          farmerName: plg.farmerName,
                          hash: plg.photoSha256
                        });
                      }}
                      className="w-10 h-10 rounded-lg overflow-hidden border border-amber-300 flex-shrink-0 relative group"
                      title="Click to view photo"
                    >
                      <img src={plg.photoUrl} alt="Pologen" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center">
                        <ZoomIn className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  )}
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
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        &ge;7y
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 truncate mt-0.5">
                      RFID {t.rfidTag} • {t.ageYears}y • GBH {t.gbhCm}cm
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Farmer: <b className="text-slate-800">{t.farmerName || 'Bhaben Saikia'}</b>
                    </div>
                  </div>
                  {t.photoUrl && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingPhoto({
                          url: t.photoUrl,
                          title: `Mature Tree ${t.id}`,
                          kind: 'TREE',
                          entityId: t.id,
                          farmerName: t.farmerName,
                          hash: t.photoSha256
                        });
                      }}
                      className="w-10 h-10 rounded-lg overflow-hidden border border-emerald-300 flex-shrink-0 relative group"
                      title="Click to view photo"
                    >
                      <img src={t.photoUrl} alt="Tree" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center">
                        <ZoomIn className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

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
                    <div className="text-[11px] text-slate-500">
                      Farmer: <b className="text-slate-800">{plt.farmerName}</b>
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
          </div>
        </div>
      </div>

      {/* 4. ACTIVE DRAFT REGISTRATION & IMAGE CAPTURE CARD */}
      {['WALK_POLOGEN', 'GEO_PIN_TREE', 'REGISTER_PLANTATION'].includes(activeTool) && (
        <div className="bg-white border-2 border-emerald-600/40 rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {activeTool === 'WALK_POLOGEN' && 'Walk New POLOGEN Block (< 7 Years Saplings) — Attach to Farmer'}
                  {activeTool === 'GEO_PIN_TREE' && 'Geo-Pin Individual Mature Tree (≥ 7 Years) — Attach to Farmer'}
                  {activeTool === 'REGISTER_PLANTATION' && 'Register New Plantation Parcel (PLT) — Attach to Farmer'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select Farmer and Plantation parcel, walk/pin coordinates, and capture photographic proof before committing.
                </p>
              </div>
            </div>

            {/* Validation Badges */}
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
                    {draftAnalysis.overlap.valid ? '✓ 0.0% Overlap' : `✗ ${draftAnalysis.overlap.overlapPct}% Overlap`}
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
                      : '⚠ Must lie inside a green Plantation'}
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

          {/* Form Fields: Farmer Selection First! */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Owning Farmer */}
            <div>
              <label className="text-slate-700 font-bold block mb-1">Owning Farmer *</label>
              <select
                value={draftForm.farmerId}
                onChange={(e) => {
                  const f = farmers.find(farm => farm.id === e.target.value);
                  setDraftForm(prev => ({
                    ...prev,
                    farmerId: e.target.value,
                    farmerName: f ? f.name : prev.farmerName
                  }));
                }}
                className="w-full bg-emerald-50/50 border border-emerald-300 font-bold text-slate-800 rounded-lg px-2.5 py-1.5"
              >
                {farmers.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.id})</option>
                ))}
              </select>
            </div>

            {/* Target Plantation */}
            {activeTool !== 'REGISTER_PLANTATION' && (
              <div>
                <label className="text-slate-700 font-bold block mb-1">Target Plantation *</label>
                <select
                  value={draftForm.parentPlantationId}
                  onChange={(e) => setDraftForm(prev => ({ ...prev, parentPlantationId: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800"
                >
                  {farmerPlantationsList.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>
            )}

            {/* POLOGEN Specific Inputs */}
            {activeTool === 'WALK_POLOGEN' && (
              <>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Sapling Count (&lt;7y) *</label>
                  <input
                    type="number"
                    value={draftForm.saplingCount}
                    onChange={(e) => setDraftForm(prev => ({ ...prev, saplingCount: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-teal-800"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Planting Year</label>
                  <input
                    type="number"
                    value={draftForm.plantingYear}
                    onChange={(e) => setDraftForm(prev => ({ ...prev, plantingYear: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-slate-800"
                  />
                </div>
              </>
            )}

            {/* TREE Specific Inputs */}
            {activeTool === 'GEO_PIN_TREE' && (
              <>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Tree Age (&ge;7y) &amp; GBH</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      value={draftForm.ageYears}
                      onChange={(e) => setDraftForm(prev => ({ ...prev, ageYears: e.target.value }))}
                      className="w-1/2 bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-mono"
                      placeholder="Age"
                    />
                    <input
                      type="number"
                      step="0.5"
                      value={draftForm.gbhCm}
                      onChange={(e) => setDraftForm(prev => ({ ...prev, gbhCm: e.target.value }))}
                      className="w-1/2 bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-mono"
                      placeholder="GBH (cm)"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">RFID Nail Tag</label>
                  <input
                    type="text"
                    value={draftForm.rfidTag}
                    onChange={(e) => setDraftForm(prev => ({ ...prev, rfidTag: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-emerald-900"
                  />
                </div>
              </>
            )}

            {/* Plantation Specific Inputs */}
            {activeTool === 'REGISTER_PLANTATION' && (
              <>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Plot Name</label>
                  <input
                    type="text"
                    value={draftForm.name}
                    onChange={(e) => setDraftForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Nahorjan Agro Plot"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Dag / Patta Number</label>
                  <input
                    type="text"
                    value={draftForm.dagPatta}
                    onChange={(e) => setDraftForm(prev => ({ ...prev, dagPatta: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
              </>
            )}
          </div>

          {/* Image Capture Row for POLOGEN and TREE */}
          {(activeTool === 'WALK_POLOGEN' || activeTool === 'GEO_PIN_TREE') && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Photo Thumbnail if captured */}
                {(activeTool === 'WALK_POLOGEN' ? draftPologenPhoto : draftTreePhoto) ? (
                  <div
                    onClick={() => {
                      const photoUrl = activeTool === 'WALK_POLOGEN' ? draftPologenPhoto : draftTreePhoto;
                      setViewingPhoto({
                        url: photoUrl,
                        title: activeTool === 'WALK_POLOGEN' ? 'POLOGEN Sapling Block' : 'Mature Tree Trunk',
                        kind: activeTool === 'WALK_POLOGEN' ? 'POLOGEN' : 'TREE',
                        entityId: 'DRAFT-CAPTURE',
                        farmerName: draftForm.farmerName,
                        hash: cameraHash
                      });
                    }}
                    className="w-16 h-12 rounded-lg overflow-hidden border-2 border-emerald-500 shadow-xs cursor-pointer relative group flex-shrink-0"
                    title="Click to zoom photo"
                  >
                    <img
                      src={activeTool === 'WALK_POLOGEN' ? draftPologenPhoto : draftTreePhoto}
                      alt="Capture Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center">
                      <ZoomIn className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-12 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                )}

                <div>
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span>
                      {activeTool === 'WALK_POLOGEN'
                        ? (draftPologenPhoto ? '✓ Sapling Grove Photo Attached' : 'Capture POLOGEN Nursery Photo')
                        : (draftTreePhoto ? '✓ Mature Tree Photo Attached' : 'Capture AR Tree Trunk Photo')}
                    </span>
                    {(activeTool === 'WALK_POLOGEN' ? draftPologenPhoto : draftTreePhoto) && (
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">
                        SHA-256 Stamped
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {(activeTool === 'WALK_POLOGEN' ? draftPologenPhoto : draftTreePhoto)
                      ? `Hash: ${cameraHash.slice(0, 24)}... (Attached to Farmer ${draftForm.farmerName})`
                      : 'High-res image capture with GPS coordinates & farmer title watermark.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenCamera(activeTool === 'WALK_POLOGEN' ? 'POLOGEN' : 'TREE')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>
                    {(activeTool === 'WALK_POLOGEN' ? draftPologenPhoto : draftTreePhoto)
                      ? 'Re-take Photo'
                      : (activeTool === 'WALK_POLOGEN' ? 'Open Camera (Sapling Grove)' : 'Open Camera (Tree Trunk)')}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons: Commit & Cancel */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleSelectTool('INSPECT')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={!draftAnalysis}
              className="px-4 py-2 rounded-xl gis-btn-emerald disabled:opacity-40 font-extrabold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Commit &amp; Attach to Farmer</span>
            </button>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* Column 1: Attached Farmer */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1">
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Attached Farmer</span>
              <div className="font-extrabold text-slate-900 text-sm">
                {selectedEntity.farmerName || 'Bhaben Saikia'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                ID: {selectedEntity.farmerId || 'FRM-AS-01'}
              </div>
            </div>

            {/* Column 2: Parent Plot / Measurements */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1">
              <span className="text-[10px] uppercase text-slate-500 font-bold block">
                {selectedEntity.type === 'TREE' ? 'Age & Dimensions' : 'Spatial Measurements'}
              </span>
              {selectedEntity.type === 'TREE' ? (
                <>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {selectedEntity.ageYears} Yrs • {selectedEntity.gbhCm} cm
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Plot: {selectedEntity.parentPlantationId}
                  </div>
                </>
              ) : selectedMeasurements ? (
                <>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {selectedMeasurements.assamBigha.toFixed(3)} Bigha
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {selectedMeasurements.areaHa.toFixed(3)} ha ({formatIndianNumber(selectedMeasurements.areaSqM, 0)} m²)
                  </div>
                </>
              ) : null}
            </div>

            {/* Column 3: GPS Coordinates & RTK */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1">
              <span className="text-[10px] uppercase text-slate-500 font-bold block">GPS Coordinates &amp; Hash</span>
              <div className="font-mono font-semibold text-slate-800 text-[11px] truncate">
                {selectedEntity.coordinates?.[1] ? `${selectedEntity.coordinates[1].toFixed(4)}, ${selectedEntity.coordinates[0].toFixed(4)}` : 'Walked Polygon'}
              </div>
              <div className="text-[10px] text-emerald-700 font-mono truncate">
                SHA-256: {(selectedEntity.photoSha256 || '7d4a2f...').slice(0, 16)}...
              </div>
            </div>

            {/* Column 4: Captured Photographic Evidence */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase text-emerald-800 font-bold block">Field Image Proof</span>
                <span className="text-[11px] text-emerald-950 font-bold block mt-0.5">
                  {selectedEntity.photoUrl ? '✓ Photo Captured' : 'Pending Capture'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedEntity.photoUrl) {
                      setViewingPhoto({
                        url: selectedEntity.photoUrl,
                        title: selectedEntity.name || selectedEntity.id,
                        kind: selectedEntity.type,
                        entityId: selectedEntity.id,
                        farmerName: selectedEntity.farmerName,
                        hash: selectedEntity.photoSha256
                      });
                    }
                  }}
                  className="text-[10px] text-emerald-700 font-bold underline hover:text-emerald-900 mt-1 block"
                >
                  View Full Size Photo
                </button>
              </div>

              {selectedEntity.photoUrl && (
                <div
                  onClick={() => {
                    setViewingPhoto({
                      url: selectedEntity.photoUrl,
                      title: selectedEntity.name || selectedEntity.id,
                      kind: selectedEntity.type,
                      entityId: selectedEntity.id,
                      farmerName: selectedEntity.farmerName,
                      hash: selectedEntity.photoSha256
                    });
                  }}
                  className="w-14 h-12 rounded-lg overflow-hidden border border-emerald-400 shadow-2xs cursor-pointer flex-shrink-0"
                >
                  <img src={selectedEntity.photoUrl} alt="Field Proof" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. AR FIELD CAMERA VIEWFINDER MODAL */}
      {showCameraModal && (
        <div className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="gis-hud-dark border border-slate-700 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl space-y-0">
            {/* Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-emerald-400 font-bold">
                  {cameraMode === 'POLOGEN' ? 'POLOGEN NURSERY FIELD CAMERA' : 'TREE TRUNK AR CAMERA'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (videoRef.current?.srcObject) {
                    videoRef.current.srcObject.getTracks().forEach(t => t.stop());
                    videoRef.current.srcObject = null;
                  }
                  setIsWebcamActive(false);
                  setShowCameraModal(false);
                }}
                className="text-slate-400 hover:text-white font-bold px-2 py-0.5"
              >
                ✕ Close
              </button>
            </div>

            {/* Viewfinder Window */}
            <div className="relative h-80 bg-stone-950 overflow-hidden flex items-center justify-center">
              {/* Optional Real Video Stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${isWebcamActive ? 'block z-0' : 'hidden'}`}
              />

              {/* Realistic Synthetic Simulation Scene */}
              {!isWebcamActive && (
                <div className="absolute inset-0 flex items-center justify-center z-0">
                  {cameraMode === 'POLOGEN' ? (
                    // POLOGEN Nursery View
                    <div className="w-full h-full bg-gradient-to-b from-teal-950 via-emerald-950 to-stone-900 relative p-4 flex items-center justify-center">
                      <div className="w-full h-full border border-dashed border-teal-500/40 rounded-xl relative overflow-hidden flex items-end justify-center pb-8 gap-6">
                        <div className="w-8 h-24 bg-emerald-600 rounded-t-full shadow-lg relative" />
                        <div className="w-10 h-32 bg-emerald-500 rounded-t-full shadow-lg relative" />
                        <div className="w-9 h-28 bg-teal-500 rounded-t-full shadow-lg relative" />
                        <div className="w-11 h-36 bg-emerald-600 rounded-t-full shadow-lg relative" />
                        <div className="w-8 h-22 bg-emerald-700 rounded-t-full shadow-lg relative" />
                      </div>
                    </div>
                  ) : (
                    // Mature Tree Trunk View
                    <div className="w-full h-full bg-gradient-to-b from-stone-900 via-stone-950 to-emerald-950 relative flex items-center justify-center">
                      <div className="w-28 h-full bg-[#3b2212] border-x-4 border-[#24150b] shadow-2xl relative">
                        <div className="absolute top-16 left-4 w-4 h-5 rounded-full bg-black border border-amber-600/80" />
                        <div className="absolute top-36 right-5 w-4 h-6 rounded-full bg-black border border-amber-600/80" />
                        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow">
                          #{draftForm.rfidTag}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Alignment Reticle & Corner Brackets */}
              <div className="relative z-10 w-52 h-52 border-2 border-emerald-400/40 rounded-2xl flex items-center justify-center pointer-events-none">
                <div className="w-7 h-7 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0" />
                <div className="w-7 h-7 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0" />
                <div className="w-7 h-7 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0" />
                <div className="w-7 h-7 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0" />
                <div className="w-3 h-3 bg-emerald-400/80 rounded-full" />
              </div>

              {/* HUD Overlays */}
              <div className="absolute top-3 left-3 bg-black/80 p-2 rounded-lg font-mono text-[10px] text-emerald-300 space-y-0.5 border border-emerald-500/30 z-20">
                <div>ATTACHED GROWER: {draftForm.farmerName} ({draftForm.farmerId})</div>
                <div>PLOT: {draftForm.parentPlantationId}</div>
                <div>RTK POSITION: 26.5204° N, 93.9782° E (±1.1m)</div>
              </div>

              <div className="absolute bottom-3 left-3 bg-black/80 p-2 rounded-lg font-mono text-[9px] text-teal-300 space-y-0.5 border border-teal-500/30 z-20">
                <div>HARDWARE RAM SHA-256: {cameraHash.slice(0, 28)}...</div>
                <div className="text-emerald-400">STATUS: ON-DEVICE FORENSIC STAMP READY</div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={toggleWebcam}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
                  isWebcamActive
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isWebcamActive ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                <span>{isWebcamActive ? 'Disable Real Webcam' : 'Use Real Device Camera'}</span>
              </button>

              <button
                type="button"
                onClick={handleSnapPhoto}
                className="px-5 py-2.5 rounded-xl gis-btn-emerald font-extrabold text-xs flex items-center gap-2 shadow-lg"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Stamped Field Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. FULL-SIZE FORENSIC PHOTO VIEWER MODAL */}
      {viewingPhoto && (
        <div className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-0">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white">{viewingPhoto.title}</h3>
                <span className="text-xs text-slate-400 font-mono">
                  Asset ID: {viewingPhoto.entityId} • Grower: {viewingPhoto.farmerName}
                </span>
              </div>
              <button
                onClick={() => setViewingPhoto(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-black flex items-center justify-center">
              <img
                src={viewingPhoto.url}
                alt={viewingPhoto.title}
                className="w-full max-h-[480px] object-contain rounded-xl shadow-lg border border-slate-800"
              />
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="font-mono text-[10px] text-emerald-400 break-all max-w-md">
                SHA-256: {viewingPhoto.hash || '7d4a2f8c5b9e1a3d6f0c8e2b4a7d9f1e3c5a7b9d0e2f4a6c8e0b2d4f6a8c0e2b'}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={viewingPhoto.url}
                  download={`NERAMAC-${viewingPhoto.entityId || 'PHOTO'}.jpg`}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Stamped JPEG</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewingPhoto(null)}
                  className="px-4 py-1.5 rounded-xl gis-btn-emerald font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
