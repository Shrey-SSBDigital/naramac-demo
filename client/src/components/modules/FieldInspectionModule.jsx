import React, { useState, useRef, useEffect } from 'react';
import {
  Users, Sprout, TreePine, Camera, Check, ChevronRight, ChevronLeft,
  MapPin, Footprints, AlertTriangle, CheckCircle2, X, Download, Upload,
  Video, VideoOff, ShieldCheck, Image as ImageIcon, RefreshCw,
  ArrowRight, Wifi, Info, Play, Pause, Square, Trash2, Undo2,
  Navigation, Layers, Sparkles, CloudCheck, ShieldAlert,
  Radio
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import { useEnterprise } from '../../context/EnterpriseContext';
import {
  generateSyntheticFieldPhoto,
  stampWatermarkOnCanvas,
  generateCryptoHash,
  computeRealSha256
} from '../../utils/photoCaptureUtils';

const STEPS = [
  { id: 1, label: 'Select Farmer', icon: Users },
  { id: 2, label: 'Choose Asset Type', icon: Sprout },
  { id: 3, label: 'Geo-Tag on Google Map', icon: MapPin },
  { id: 4, label: 'Capture Image', icon: Camera },
  { id: 5, label: 'Review & Submit', icon: Check }
];

const GPS_SAMPLE = {
  GOLAGHAT: { lat: 26.5207, lng: 93.9793, label: 'Golaghat, Assam (Dhekial Mouza)' },
  KADAMTALA: { lat: 24.4629, lng: 92.2068, label: 'Kadamtala, Tripura' }
};

// Google Tile URL Map
const GOOGLE_TILE_URLS = {
  hybrid: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
  satellite: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  roadmap: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
};

const createNumberedVertexIcon = (index) => L.divIcon({
  className: 'custom-vertex-pin',
  html: `<div style="background:#0d9488;color:#ffffff;border:2px solid #ffffff;border-radius:9999px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:11px;box-shadow:0 2px 5px rgba(0,0,0,0.3);">${index}</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const createTreePinIcon = () => L.divIcon({
  className: 'custom-tree-pin',
  html: `<div style="background:#15803d;color:#ffffff;border:2px solid #ffffff;border-radius:9999px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 19 21 5 21 12 2"/><line x1="12" y1="21" x2="12" y2="24"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

function haversineDistMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function FieldInspectionModule({ onNavigateToGisStudio }) {
  const {
    farmers,
    plantations,
    pologens,
    trees,
    addPologen: enterpriseAddPologen,
    addTree: enterpriseAddTree,
    addToast
  } = useEnterprise();

  // ── Wizard State ───────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0]?.id || '');
  const farmerPlantations = (plantations || []).filter(p => p.farmerId === selectedFarmerId);
  const [selectedPlantationId, setSelectedPlantationId] = useState(() => {
    const initialPlts = (plantations || []).filter(p => p.farmerId === (farmers[0]?.id || ''));
    return initialPlts[0]?.id || '';
  });

  useEffect(() => {
    const plts = (plantations || []).filter(p => p.farmerId === selectedFarmerId);
    if (plts.length > 0 && !plts.some(p => p.id === selectedPlantationId)) {
      setSelectedPlantationId(plts[0].id);
    } else if (plts.length === 0) {
      setSelectedPlantationId('');
    }
  }, [selectedFarmerId, plantations]);

  const selectedPlantation = (plantations || []).find(p => p.id === selectedPlantationId) || farmerPlantations[0] || null;
  const [assetType, setAssetType] = useState(null); // 'POLOGEN' | 'TREE'
  const [cluster, setCluster] = useState('GOLAGHAT');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [isGpsLocked, setIsGpsLocked] = useState(false);
  const [isAcquiring, setIsAcquiring] = useState(false);

  // Google Map type state
  const [googleMapType, setGoogleMapType] = useState('hybrid'); // 'hybrid' | 'satellite' | 'roadmap'

  // POLOGEN Geo-Tagging Options: 'WALK' | 'SELECT_AREA'
  const [pologenMode, setPologenMode] = useState('SELECT_AREA');
  const [walkPoints, setWalkPoints] = useState([]);
  const [isWalking, setIsWalking] = useState(false);
  const [isSimulatingWalk, setIsSimulatingWalk] = useState(false);
  const [walkStatusMessage, setWalkStatusMessage] = useState('Ready to walk perimeter');
  const [selectedAreaPoints, setSelectedAreaPoints] = useState([]);
  const [polygonCoords, setPolygonCoords] = useState(null);
  const [polygonStats, setPolygonStats] = useState(null);
  const [overlapResult, setOverlapResult] = useState(null);

  // Map references
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const polygonLayerGroupRef = useRef(null);
  const markersLayerGroupRef = useRef(null);
  const existingParcelsGroupRef = useRef(null);
  const walkWatchIdRef = useRef(null);
  const simIntervalRef = useRef(null);

  // Synchronized state refs to prevent stale closure in Leaflet event listeners
  const assetTypeRef = useRef(assetType);
  const pologenModeRef = useRef(pologenMode);
  const selectedAreaPointsRef = useRef(selectedAreaPoints);
  useEffect(() => { assetTypeRef.current = assetType; }, [assetType]);
  useEffect(() => { pologenModeRef.current = pologenMode; }, [pologenMode]);
  useEffect(() => { selectedAreaPointsRef.current = selectedAreaPoints; }, [selectedAreaPoints]);

  // POLOGEN form
  const [pologenForm, setPologenForm] = useState({
    name: '',
    saplingCount: 250,
    plantingYear: 2023
  });

  // Tree form
  const [treeForm, setTreeForm] = useState({
    rfidTag: 'AS-GLG-TAG-',
    ageYears: 10.5,
    gbhCm: 62.0,
    heightM: 11.0,
    treeStatus: 'VERIFIED_HEALTHY'
  });

  // Camera
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [photoHash, setPhotoHash] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [cameraHash, setCameraHash] = useState(() => generateCryptoHash());
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (text, tone = 'success') => {
    setToast({ text, tone });
    setTimeout(() => setToast(null), 5000);
  };

  const selectedFarmer = farmers.find(f => f.id === selectedFarmerId) || farmers[0];
  const farmerPologens = pologens.filter(p => p.farmerId === selectedFarmerId);
  const farmerTrees = trees.filter(t => t.farmerId === selectedFarmerId);

  // ── Turf.js Polygon Measurements & Overlap Detection (Scenario ii) ─────────
  const computeStatsAndOverlap = (pts) => {
    if (!pts || pts.length < 3) return null;
    try {
      const ring = pts.map(p => [p[1], p[0]]);
      if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
        ring.push([...ring[0]]);
      }
      const poly = turf.polygon([ring]);
      const areaSqM = turf.area(poly);
      const areaHa = areaSqM / 10000;
      const areaAcres = areaSqM / 4046.86;
      const assamBigha = areaSqM / 1337.8;
      const line = turf.lineString(ring);
      const perimeterM = Math.round(turf.length(line, { units: 'meters' }));
      const centerPt = turf.centerOfMass(poly)?.geometry?.coordinates;

      // Overlap Detection with existing registered parcels
      let overlapInfo = { hasOverlap: false, message: '✓ Clean boundary — 0.0% overlap with existing parcels' };
      for (const existing of pologens) {
        if (existing.boundaryPolygon && existing.boundaryPolygon.length >= 3) {
          const existRing = existing.boundaryPolygon.map(p => [p[1], p[0]]);
          if (existRing[0][0] !== existRing[existRing.length - 1][0] || existRing[0][1] !== existRing[existRing.length - 1][1]) {
            existRing.push([...existRing[0]]);
          }
          const existPoly = turf.polygon([existRing]);
          const intersect = turf.intersect(turf.featureCollection([poly, existPoly]));
          if (intersect) {
            const overlapArea = turf.area(intersect);
            if (overlapArea > 2.0) {
              let intersectPts = [];
              if (intersect.geometry) {
                if (intersect.geometry.type === 'Polygon' && intersect.geometry.coordinates?.[0]) {
                  intersectPts = intersect.geometry.coordinates[0].map(pt => [pt[1], pt[0]]);
                } else if (intersect.geometry.type === 'MultiPolygon' && intersect.geometry.coordinates?.[0]?.[0]) {
                  intersectPts = intersect.geometry.coordinates[0][0].map(pt => [pt[1], pt[0]]);
                }
              }
              overlapInfo = {
                hasOverlap: true,
                overlappingId: existing.id,
                overlappingName: existing.name,
                overlapAreaSqM: Math.round(overlapArea),
                intersectionCoords: intersectPts,
                message: `⚠ Overlap detected: ${Math.round(overlapArea)} m² intersects ${existing.id} (${existing.name})`
              };
              break;
            }
          }
        }
      }

      setOverlapResult(overlapInfo);

      return {
        areaSqM: Math.round(areaSqM),
        areaHa: areaHa.toFixed(2),
        areaAcres: areaAcres.toFixed(2),
        assamBigha: assamBigha.toFixed(2),
        perimeterM,
        centroid: centerPt ? { lat: centerPt[1], lng: centerPt[0] } : { lat: pts[0][0], lng: pts[0][1] }
      };
    } catch (e) {
      return null;
    }
  };

  // ── Initialize Google Maps Tiles on Step 3 ──────────────────────────────────
  useEffect(() => {
    if (step !== 3 || !mapContainerRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    if (!mapInstanceRef.current) {
      const baseLat = GPS_SAMPLE[cluster]?.lat || 26.5138;
      const baseLng = GPS_SAMPLE[cluster]?.lng || 93.9633;

      const map = L.map(mapContainerRef.current, {
        center: [baseLat, baseLng],
        zoom: 17,
        zoomControl: true,
        attributionControl: false
      });

      tileLayerRef.current = L.tileLayer(GOOGLE_TILE_URLS[googleMapType] || GOOGLE_TILE_URLS.hybrid, {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 21
      }).addTo(map);

      existingParcelsGroupRef.current = L.layerGroup().addTo(map);
      polygonLayerGroupRef.current = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = L.layerGroup().addTo(map);

      // Render existing registered parcels for context
      pologens.forEach(p => {
        if (p.boundaryPolygon && p.boundaryPolygon.length >= 3) {
          L.polygon(p.boundaryPolygon, {
            color: '#3b82f6',
            fillColor: '#60a5fa',
            fillOpacity: 0.20,
            weight: 2,
            dashArray: '4, 4'
          }).bindTooltip(`${p.id} (${p.name})`, { direction: 'center' }).addTo(existingParcelsGroupRef.current);
        }
      });

      // Map click handler using Refs to avoid closure staleness
      map.on('click', (e) => {
        if (assetTypeRef.current === 'POLOGEN') {
          handleMapAddVertex(e.latlng.lat, e.latlng.lng);
        } else if (assetTypeRef.current === 'TREE') {
          handleSetTreeGps(e.latlng.lat, e.latlng.lng);
        }
      });

      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [step, cluster, assetType, pologens]);

  // Handle Online Google Tiles layer update
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    tileLayerRef.current = L.tileLayer(GOOGLE_TILE_URLS[googleMapType] || GOOGLE_TILE_URLS.hybrid, {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 21
    }).addTo(mapInstanceRef.current);
  }, [googleMapType]);

  const handlePinCurrentGpsVertex = () => {
    const baseLat = gpsCoords?.lat || GPS_SAMPLE[cluster]?.lat || 26.5207;
    const baseLng = gpsCoords?.lng || GPS_SAMPLE[cluster]?.lng || 93.9793;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          handleMapAddVertex(lat, lng);
          if (mapInstanceRef.current) mapInstanceRef.current.panTo([lat, lng]);
          showToast(`✓ Corner Vertex #${selectedAreaPoints.length + 1} pinned via hardware GPS (${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E)`, 'success');
        },
        () => {
          // Fallback coordinate offset for desktop browser simulation
          const offsetLat = baseLat + (selectedAreaPoints.length === 0 ? 0.0003 : (Math.random() - 0.5) * 0.0006);
          const offsetLng = baseLng + (selectedAreaPoints.length === 0 ? -0.0002 : (Math.random() - 0.5) * 0.0006);
          handleMapAddVertex(offsetLat, offsetLng);
          if (mapInstanceRef.current) mapInstanceRef.current.panTo([offsetLat, offsetLng]);
          showToast(`✓ Corner Vertex #${selectedAreaPoints.length + 1} pinned via GPS fix (${offsetLat.toFixed(5)}°N, ${offsetLng.toFixed(5)}°E)`, 'success');
        },
        { enableHighAccuracy: true, timeout: 3500 }
      );
    } else {
      handleMapAddVertex(baseLat, baseLng);
    }
  };

  // Switch Google Map Type
  const handleSwitchGoogleMapType = (type) => {
    setGoogleMapType(type);
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(GOOGLE_TILE_URLS[type], {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 21
    }).addTo(mapInstanceRef.current);
    showToast(`Google Map switched to: ${type.toUpperCase()}`, 'info');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (walkWatchIdRef.current) navigator.geolocation?.clearWatch?.(walkWatchIdRef.current);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ── Redraw Map Layers when points change ────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonLayerGroupRef.current || !markersLayerGroupRef.current) return;

    polygonLayerGroupRef.current.clearLayers();
    markersLayerGroupRef.current.clearLayers();

    if (assetType === 'POLOGEN') {
      const activePts = pologenMode === 'WALK' ? walkPoints : selectedAreaPoints;

      activePts.forEach((pt, idx) => {
        const isFirstOfClosed = pologenMode === 'SELECT_AREA' && idx === 0 && activePts.length >= 3;
        const marker = L.marker(pt, { icon: createNumberedVertexIcon(idx + 1) })
          .bindTooltip(`Vertex #${idx + 1}<br/>${pt[0].toFixed(5)}, ${pt[1].toFixed(5)}${isFirstOfClosed ? '<br/><b class="text-teal-600">Click to close polygon</b>' : ''}`, { direction: 'top' })
          .addTo(markersLayerGroupRef.current);

        if (isFirstOfClosed) {
          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            closeAndCompleteArea();
          });
        }
      });

      if (polygonCoords && polygonCoords.length >= 3) {
        L.polygon(polygonCoords, {
          color: overlapResult?.hasOverlap ? '#e11d48' : '#0d9488',
          fillColor: overlapResult?.hasOverlap ? '#f43f5e' : '#14b8a6',
          fillOpacity: 0.35,
          weight: 3
        }).addTo(polygonLayerGroupRef.current);

        // Highlight intersection conflict geometry if overlap exists
        if (overlapResult?.hasOverlap && overlapResult.intersectionCoords && overlapResult.intersectionCoords.length >= 3) {
          L.polygon(overlapResult.intersectionCoords, {
            color: '#991b1b',
            fillColor: '#ef4444',
            fillOpacity: 0.70,
            weight: 2,
            dashArray: '3, 3'
          }).bindTooltip(`⚠ Boundary Conflict: ${overlapResult.overlapAreaSqM} m² Overlap with ${overlapResult.overlappingId}`, {
            permanent: true,
            direction: 'center',
            className: 'bg-rose-900 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow'
          }).addTo(polygonLayerGroupRef.current);
        }
      } else if (activePts.length >= 2) {
        L.polyline(activePts, {
          color: '#0d9488',
          weight: 3,
          dashArray: '6, 6'
        }).addTo(polygonLayerGroupRef.current);
      }
    } else if (assetType === 'TREE' && gpsCoords) {
      L.marker([gpsCoords.lat, gpsCoords.lng], { icon: createTreePinIcon() })
        .bindTooltip(`Tree Point (Tag: ${treeForm.rfidTag})<br/>${gpsCoords.lat.toFixed(5)}°N, ${gpsCoords.lng.toFixed(5)}°E`, { permanent: true, direction: 'top' })
        .addTo(markersLayerGroupRef.current);
    }
  }, [walkPoints, selectedAreaPoints, polygonCoords, assetType, pologenMode, gpsCoords, overlapResult]);

  // ── Scenario (ii): Boundary Walking ─────────────────────────────────────────
  const startWalkPologen = () => {
    setIsWalking(true);
    setWalkStatusMessage('🚶 Walking boundary active — Auto-detecting vertices...');
    const baseLat = GPS_SAMPLE[cluster]?.lat || 26.5138;
    const baseLng = GPS_SAMPLE[cluster]?.lng || 93.9633;

    let currentPts = walkPoints.length === 0 ? [[baseLat, baseLng]] : [...walkPoints];
    setWalkPoints(currentPts);

    if (navigator.geolocation) {
      walkWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          const lastPt = currentPts[currentPts.length - 1];

          if (lastPt) {
            const dist = haversineDistMeters(lastPt[0], lastPt[1], newLat, newLng);
            if (dist >= 3.0) {
              const updated = [...currentPts, [newLat, newLng]];
              currentPts = updated;
              setWalkPoints(updated);
              setWalkStatusMessage(`✓ Vertex #${updated.length} auto-detected (${dist.toFixed(1)}m step)`);
              if (mapInstanceRef.current) mapInstanceRef.current.panTo([newLat, newLng]);
            }
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }
    showToast('Boundary walking started: vertices log automatically as you walk perimeter', 'info');
  };

  const simulateWalkPerimeter = () => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setIsSimulatingWalk(true);
    setIsWalking(true);
    setWalkPoints([]);
    setPolygonCoords(null);
    setIsGpsLocked(false);

    const baseLat = GPS_SAMPLE[cluster]?.lat || 26.5138;
    const baseLng = GPS_SAMPLE[cluster]?.lng || 93.9633;

    const simRoute = [
      [baseLat, baseLng],
      [baseLat + 0.00045, baseLng + 0.00010],
      [baseLat + 0.00040, baseLng + 0.00055],
      [baseLat - 0.00008, baseLng + 0.00045],
      [baseLat, baseLng]
    ];

    let stepIndex = 0;
    setWalkStatusMessage(`🚶 Boundary walking simulation starting at corner #1...`);

    simIntervalRef.current = setInterval(() => {
      if (stepIndex < simRoute.length) {
        const nextPt = simRoute[stepIndex];
        setWalkPoints(prev => [...prev, nextPt]);
        if (mapInstanceRef.current) mapInstanceRef.current.panTo(nextPt);

        stepIndex++;
        if (stepIndex < simRoute.length) {
          setWalkStatusMessage(`🚶 Boundary vertex #${stepIndex} logged (+45m displacement)`);
        } else {
          clearInterval(simIntervalRef.current);
          setIsSimulatingWalk(false);
          setIsWalking(false);

          const closed = [...simRoute];
          setPolygonCoords(closed);
          const stats = computeStatsAndOverlap(closed);
          setPolygonStats(stats);
          if (stats?.centroid) {
            setGpsCoords({ lat: stats.centroid.lat, lng: stats.centroid.lng, accuracy: 1.1 });
          }
          setIsGpsLocked(true);
          setWalkStatusMessage(`✓ Perimeter walk complete! Closed 4-sided sapling parcel`);
          showToast(`✓ Boundary walked: ${stats?.areaHa} Ha (${stats?.areaAcres} Acres) • 0.0% Overlap`, 'success');
        }
      }
    }, 1100);
  };

  const finishAndCloseWalk = () => {
    if (walkWatchIdRef.current) {
      navigator.geolocation?.clearWatch?.(walkWatchIdRef.current);
      walkWatchIdRef.current = null;
    }
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setIsWalking(false);
    setIsSimulatingWalk(false);

    if (walkPoints.length < 3) {
      showToast('Need at least 3 vertices to enclose a POLOGEN parcel', 'error');
      return;
    }

    const first = walkPoints[0];
    const last = walkPoints[walkPoints.length - 1];
    let closed = [...walkPoints];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      closed.push([...first]);
    }

    setPolygonCoords(closed);
    const stats = computeStatsAndOverlap(closed);
    setPolygonStats(stats);
    if (stats?.centroid) {
      setGpsCoords({ lat: stats.centroid.lat, lng: stats.centroid.lng, accuracy: 1.2 });
    }
    setIsGpsLocked(true);
    showToast(`✓ Boundary locked: ${stats?.areaHa} Ha (${stats?.areaAcres} Acres)`, 'success');
  };

  // ── Scenario (i & ii): Select Area on Map (Works identical to Field GIS Studio) ─
  const handleMapAddVertex = (lat, lng) => {
    if (pologenModeRef.current !== 'SELECT_AREA') return;

    setSelectedAreaPoints(prev => {
      const updated = [...prev, [lat, lng]];
      selectedAreaPointsRef.current = updated;

      if (updated.length >= 3) {
        const stats = computeStatsAndOverlap(updated);
        setPolygonStats(stats);
      }
      showToast(`Added vertex #${updated.length} at ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`, 'info');
      return updated;
    });

    setPolygonCoords(null);
    setIsGpsLocked(false);
  };

  const closeAndCompleteArea = () => {
    setSelectedAreaPoints(currentPoints => {
      if (currentPoints.length < 3) {
        showToast('Click at least 3 boundary vertices on the map before enclosing', 'error');
        return currentPoints;
      }
      const first = currentPoints[0];
      const last = currentPoints[currentPoints.length - 1];
      let closed = [...currentPoints];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        closed.push([...first]);
      }
      setPolygonCoords(closed);
      const stats = computeStatsAndOverlap(closed);
      setPolygonStats(stats);
      if (stats?.centroid) {
        setGpsCoords({ lat: stats.centroid.lat, lng: stats.centroid.lng, accuracy: 1.4 });
      }
      setIsGpsLocked(true);
      showToast(`✓ Enclosed ${currentPoints.length}-sided Area: ${stats?.areaHa} Ha (${stats?.areaAcres} Acres)`, 'success');
      return currentPoints;
    });
  };

  const autoFillCadastralPreset = () => {
    // Clean parcel adjacent to PLG-AS-01-A (offset north) with 0.0% overlap
    const cadastralPoints = [
      [26.5215, 93.9784],
      [26.5223, 93.9790],
      [26.5220, 93.9802],
      [26.5214, 93.9798],
      [26.5215, 93.9784]
    ];
    setSelectedAreaPoints(cadastralPoints.slice(0, 4));
    setPolygonCoords(cadastralPoints);
    const stats = computeStatsAndOverlap(cadastralPoints);
    setPolygonStats(stats);
    if (stats?.centroid) {
      setGpsCoords({ lat: stats.centroid.lat, lng: stats.centroid.lng, accuracy: 1.0 });
    }
    setIsGpsLocked(true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([26.5218, 93.9793]);
    }
    showToast(`✓ Loaded cadastral title boundary for Dag 182, Patta 44 (${stats?.areaHa} Ha) — Clean 0.0% Overlap`, 'success');
  };

  const simulateOverlapPreset = () => {
    // Encroaching parcel that intersects PLG-AS-01-A by ~922 m²
    const overlapPoints = [
      [26.5207, 93.9778],
      [26.5215, 93.9788],
      [26.5211, 93.9791],
      [26.5203, 93.9781],
      [26.5207, 93.9778]
    ];
    setSelectedAreaPoints(overlapPoints.slice(0, 4));
    setPolygonCoords(overlapPoints);
    const stats = computeStatsAndOverlap(overlapPoints);
    setPolygonStats(stats);
    if (stats?.centroid) {
      setGpsCoords({ lat: stats.centroid.lat, lng: stats.centroid.lng, accuracy: 1.0 });
    }
    setIsGpsLocked(true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([26.5209, 93.9785]);
    }
    showToast(`⚠ Overlap Conflict Simulated: 922 m² boundary intersection detected with PLG-AS-01-A!`, 'warning');
  };

  // ── Scenario (iii): Tree Point & Maturity Rule ──────────────────────────────
  const handleSetTreeGps = (lat, lng) => {
    setGpsCoords({ lat, lng, accuracy: 1.0 });
    setIsGpsLocked(true);
    showToast(`Tree pinned at ${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E`, 'success');
  };

  const acquireTreeGps = () => {
    setIsAcquiring(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
          setIsGpsLocked(true);
          setIsAcquiring(false);
          showToast(`Tree RTK GPS locked: ${pos.coords.latitude.toFixed(5)}°N, ${pos.coords.longitude.toFixed(5)}°E`, 'success');
          if (mapInstanceRef.current) mapInstanceRef.current.panTo([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          const sample = GPS_SAMPLE[cluster];
          setGpsCoords({ lat: sample.lat + (Math.random() - 0.5) * 0.0004, lng: sample.lng + (Math.random() - 0.5) * 0.0004, accuracy: 1.2 });
          setIsGpsLocked(true);
          setIsAcquiring(false);
          showToast('RTK GPS coordinates locked for tree trunk', 'info');
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      const sample = GPS_SAMPLE[cluster];
      setGpsCoords({ lat: sample.lat, lng: sample.lng, accuracy: 1.2 });
      setIsGpsLocked(true);
      setIsAcquiring(false);
    }
  };

  // ── Camera capture ─────────────────────────────────────────────────────────
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
    } else {
      try {
        let stream = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
          });
        } catch (e1) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
        streamRef.current = stream;
        setIsWebcamActive(true);
      } catch (e) {
        setIsWebcamActive(false);
        showToast('Camera permission denied or hardware unavailable — using AR Photo Generator', 'warning');
      }
    }
  };

  const handleCaptureRealPhoto = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    const video = videoRef.current;
    if (video && isWebcamActive && video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } else {
      // If webcam stream is inactive/denied, draw the synthetic scene onto canvas
      const baseDataUrl = generateSyntheticFieldPhoto({
        kind: assetType === 'POLOGEN' ? 'POLOGEN' : 'TREE',
        farmerName: selectedFarmer?.name,
        farmerId: selectedFarmer?.id,
        plantationName: `${selectedFarmer?.name}'s Plantation`,
        rfidTag: assetType === 'TREE' ? treeForm.rfidTag : undefined,
        ageYears: treeForm.ageYears,
        gbhCm: treeForm.gbhCm,
        saplingCount: pologenForm.saplingCount,
        plantingYear: pologenForm.plantingYear,
        coordinates: gpsCoords ? [gpsCoords.lng, gpsCoords.lat] : [93.9793, 26.5207],
        photoSha256: generateCryptoHash()
      });
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        img.src = baseDataUrl;
      });
    }

    const hash = generateCryptoHash();
    setCameraHash(hash);

    // Stamp official forensic watermark with correct signature: (ctx, width, height, meta)
    stampWatermarkOnCanvas(ctx, canvas.width, canvas.height, {
      kind: assetType === 'POLOGEN' ? 'POLOGEN' : 'TREE',
      entityId: `FIELD-${assetType}-${Date.now().toString().slice(-6)}`,
      farmerName: selectedFarmer?.name,
      farmerId: selectedFarmer?.id,
      plantationName: `${selectedFarmer?.name}'s Plantation`,
      rfidTag: assetType === 'TREE' ? treeForm.rfidTag : undefined,
      ageYears: treeForm.ageYears,
      gbhCm: treeForm.gbhCm,
      saplingCount: pologenForm.saplingCount,
      plantingYear: pologenForm.plantingYear,
      coordinates: gpsCoords ? [gpsCoords.lng, gpsCoords.lat] : [93.9793, 26.5207],
      photoSha256: hash
    });

    const watermarkedUrl = canvas.toDataURL('image/jpeg', 0.92);
    const realHash = await computeRealSha256(watermarkedUrl);
    setCapturedPhoto(watermarkedUrl);
    setPhotoHash(realHash);

    if (video?.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
    setIsWebcamActive(false);
    setShowCamera(false);
    showToast(`✓ Photo captured & sealed with SHA-256 (${realHash.slice(0, 16)}...)`, 'success');
  };

  const handleCaptureSynthetic = async () => {
    const hash = generateCryptoHash();
    setCameraHash(hash);

    const photoDataUrl = generateSyntheticFieldPhoto({
      kind: assetType === 'POLOGEN' ? 'POLOGEN' : 'TREE',
      rfidTag: treeForm.rfidTag,
      ageYears: treeForm.ageYears,
      gbhCm: treeForm.gbhCm,
      saplingCount: pologenForm.saplingCount,
      plantingYear: pologenForm.plantingYear,
      farmerName: selectedFarmer?.name,
      farmerId: selectedFarmer?.id,
      plantationName: `${selectedFarmer?.name}'s Plantation`,
      entityId: `${assetType === 'POLOGEN' ? 'PLG' : 'TRE'}-FLD-${Date.now().toString().slice(-4)}`,
      coordinates: gpsCoords ? [gpsCoords.lng, gpsCoords.lat] : [93.9793, 26.5207],
      photoSha256: hash
    });

    const realHash = await computeRealSha256(photoDataUrl);
    setCapturedPhoto(photoDataUrl);
    setPhotoHash(realHash);
    setShowCamera(false);
    showToast(`✓ ${assetType === 'POLOGEN' ? 'Sapling grove' : 'Tree trunk'} photo generated & sealed with SHA-256`, 'success');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 1280;
        canvas.height = img.height || 720;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const hash = generateCryptoHash();
        setCameraHash(hash);

        stampWatermarkOnCanvas(ctx, canvas.width, canvas.height, {
          kind: assetType === 'POLOGEN' ? 'POLOGEN' : 'TREE',
          entityId: `FIELD-${assetType}-${Date.now().toString().slice(-6)}`,
          farmerName: selectedFarmer?.name,
          farmerId: selectedFarmer?.id,
          plantationName: `${selectedFarmer?.name}'s Plantation`,
          rfidTag: assetType === 'TREE' ? treeForm.rfidTag : undefined,
          ageYears: treeForm.ageYears,
          gbhCm: treeForm.gbhCm,
          saplingCount: pologenForm.saplingCount,
          plantingYear: pologenForm.plantingYear,
          coordinates: gpsCoords ? [gpsCoords.lng, gpsCoords.lat] : [93.9793, 26.5207],
          photoSha256: hash
        });

        const watermarkedUrl = canvas.toDataURL('image/jpeg', 0.92);
        const realHash = await computeRealSha256(watermarkedUrl);
        setCapturedPhoto(watermarkedUrl);
        setPhotoHash(realHash);
        showToast(`✓ Field photograph watermarked & sealed with SHA-256`, 'success');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // ── Submit Asset to Enterprise Ledger ────────────────────────────────
  const handleSubmit = () => {
    if (!gpsCoords || !capturedPhoto) return;

    if (assetType === 'POLOGEN') {
      const finalBoundary = polygonCoords || walkPoints;
      const hasConflict = !!overlapResult?.hasOverlap;
      const conflictPayload = hasConflict ? {
        overlappingId: overlapResult.overlappingId,
        overlappingName: overlapResult.overlappingName,
        overlapAreaSqM: overlapResult.overlapAreaSqM,
        routedTo: 'DFO Golaghat & Circle Officer Dispute Queue'
      } : null;

      enterpriseAddPologen({
        farmerId: selectedFarmer.id,
        farmerName: selectedFarmer.name,
        plantationId: selectedPlantation?.id || `PLT-FIELD-${selectedFarmer.id}`,
        plantationName: selectedPlantation?.name || `${selectedFarmer.name}'s Plantation`,
        name: pologenForm.name.trim() || `${selectedFarmer.name} Sapling Block ${new Date().getFullYear()}`,
        plantingYear: Number(pologenForm.plantingYear),
        ageYears: +(2026.5 - Number(pologenForm.plantingYear)).toFixed(1),
        saplingCount: Number(pologenForm.saplingCount),
        boundaryPolygon: finalBoundary,
        areaSquareMeters: polygonStats?.areaSqM || 2500,
        perimeterMeters: polygonStats?.perimeterM || 200,
        photoUrl: capturedPhoto,
        photoSha256: photoHash,
        status: hasConflict ? 'DISPUTE_OVERLAP_HELD' : 'WALKED_VERIFIED',
        overlapConflict: conflictPayload
      });
    } else {
      enterpriseAddTree({
        farmerId: selectedFarmer.id,
        farmerName: selectedFarmer.name,
        plantationId: selectedPlantation?.id || `PLT-FIELD-${selectedFarmer.id}`,
        plantationName: selectedPlantation?.name || `${selectedFarmer.name}'s Plantation`,
        qrTagCode: treeForm.rfidTag,
        ageYears: Number(treeForm.ageYears),
        girthCm: Number(treeForm.gbhCm),
        heightMeters: Number(treeForm.heightM),
        gpsLatitude: gpsCoords.lat,
        gpsLongitude: gpsCoords.lng,
        photoHash: `sha256:${photoHash}`,
        photoUrl: capturedPhoto
      });
    }

    setStep(5);
    showToast(`✓ ${assetType === 'POLOGEN' ? 'POLOGEN block' : 'Tree'} registered for Farmer ${selectedFarmer.name}`, 'success');
  };

  const resetWizard = () => {
    setStep(1);
    setAssetType(null);
    setGpsCoords(null);
    setIsGpsLocked(false);
    setWalkPoints([]);
    setSelectedAreaPoints([]);
    setPolygonCoords(null);
    setPolygonStats(null);
    setOverlapResult(null);
    setIsWalking(false);
    setIsSimulatingWalk(false);
    setCapturedPhoto(null);
    setPhotoHash(null);
    setPologenForm({ name: '', saplingCount: 250, plantingYear: 2023 });
    setTreeForm({ rfidTag: 'AS-GLG-TAG-', ageYears: 10.5, gbhCm: 62.0, heightM: 11.0, treeStatus: 'VERIFIED_HEALTHY' });
  };

  const canProceed = () => {
    if (step === 1) return !!selectedFarmerId;
    if (step === 2) return !!assetType;
    if (step === 3) {
      if (assetType === 'POLOGEN') {
        // Disallow proceeding if spatial boundary overlap is detected
        if (overlapResult?.hasOverlap) return false;
        if (polygonCoords && polygonCoords.length >= 3) return true;
        if (isGpsLocked) return true;
        if (selectedAreaPoints.length >= 3 || walkPoints.length >= 3) return true;
        return false;
      }
      if (assetType === 'TREE') {
        return !!gpsCoords && isGpsLocked;
      }
      return false;
    }
    if (step === 4) {
      if (assetType === 'POLOGEN' && overlapResult?.hasOverlap) return false;
      return !!capturedPhoto;
    }
    return false;
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Footprints className="w-5 h-5 text-emerald-700" />
              Field Inspection — Geo-Tagging & Asset Capture
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              RFP Scenarios (ii), (iii)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select farmer → choose POLOGEN or Tree → Google Map Area / Boundary Walking → SHA-256 sealed photo
          </p>
        </div>

        {onNavigateToGisStudio && (
          <button
            type="button"
            onClick={onNavigateToGisStudio}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 border border-emerald-200 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition whitespace-nowrap self-start sm:self-auto"
          >
            Open Full GIS Studio <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Scenario (iii) Statutory Maturity Rule Banner */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 text-xs flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-emerald-900 font-bold">RFP Scenario (iii) Maturity Rule: </strong>
          <span className="text-emerald-800">
            Agarwood trees <strong>&lt; 7 years</strong> are mapped as collective <strong>POLOGEN polygons</strong>. Once trees reach maturity (<strong>≥ 7 years &amp; GBH ≥ 50cm</strong>), they transition to <strong>Individual Tree Identity</strong> with permanent Tree QR tagging and DFO felling eligibility.
          </span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 shadow-xs ${
          toast.tone === 'error' ? 'bg-rose-50 border-rose-300 text-rose-900'
          : toast.tone === 'warning' ? 'bg-amber-50 border-amber-300 text-amber-900'
          : 'bg-emerald-50 border-emerald-300 text-emerald-900'
        }`}>
          <div className="flex items-center gap-2">
            {toast.tone === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
            <span>{toast.text}</span>
          </div>
          <button onClick={() => setToast(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Progress Steps Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs px-4 py-3">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <React.Fragment key={s.id}>
                <div className={`flex flex-col items-center gap-1 flex-1 min-w-0 ${active ? 'opacity-100' : done ? 'opacity-80' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    done ? 'bg-emerald-600 text-white'
                    : active ? 'bg-emerald-700 text-white ring-2 ring-emerald-300'
                    : 'bg-slate-100 text-slate-500'
                  }`}>
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] font-semibold text-center leading-tight hidden sm:block ${active ? 'text-emerald-800' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 mt-[-12px] sm:mt-[-20px] rounded ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── STEP 1: Select Farmer ─────────────────────────────────────────── */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            Step 1 — Select Farmer for Inspection
          </h2>
          <p className="text-xs text-slate-500">Choose the farmer whose plantation you are visiting today.</p>

          <div className="space-y-3">
            {farmers.map(f => {
              const selected = f.id === selectedFarmerId;
              const fPologens = pologens.filter(p => p.farmerId === f.id);
              const fTrees = trees.filter(t => t.farmerId === f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFarmerId(f.id)}
                  className={`w-full text-left p-3.5 rounded-xl border-2 transition ${
                    selected ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                        selected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {f.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 text-sm truncate">{f.name}</div>
                        <div className="text-xs text-slate-500 truncate">{f.village}, {f.district}</div>
                        <div className="text-[11px] font-mono text-slate-400">{f.id} • Title: {f.dagNumber}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-[10px] flex-shrink-0">
                      <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">{fPologens.length} POLOGEN</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">{fTrees.length} Trees</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Particular Plantation / Land Parcel & Farmer-Added Data */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>Select Particular Plantation / Land Parcel ({farmerPlantations.length})</span>
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                Farmer-Declared Parcels &amp; Assets
              </span>
            </div>

            {farmerPlantations.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                No plantation parcel registered yet for this farmer. Field Agent can still capture new POLOGEN or Tree assets below.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {farmerPlantations.map(plt => {
                  const isPltSelected = plt.id === selectedPlantation?.id;
                  const pltPologens = pologens.filter(p => p.plantationId === plt.id);
                  const pltTrees = trees.filter(t => t.plantationId === plt.id);
                  return (
                    <button
                      key={plt.id}
                      type="button"
                      onClick={() => setSelectedPlantationId(plt.id)}
                      className={`p-3 rounded-xl border-2 text-left transition space-y-1.5 ${
                        isPltSelected ? 'border-emerald-600 bg-emerald-50/80 shadow-xs' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-white border border-slate-200 text-emerald-900">
                          {plt.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          plt.status === 'PENDING_SURVEY' || !plt.geoVerified
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {plt.status === 'PENDING_SURVEY' ? 'Farmer Declared • Pending Survey' : 'Geo-Verified'}
                        </span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-xs">{plt.name}</div>
                      <div className="text-[11px] text-slate-600">
                        {plt.dagNumber || 'Revenue Parcel'} • {plt.landAreaAcres || (plt.areaHectares * 2.471).toFixed(1)} Acres
                      </div>
                      <div className="flex items-center gap-2 pt-1 text-[10px] font-bold">
                        <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900">
                          POLOGEN: {pltPologens.length} ({plt.youngTrees || pltPologens.reduce((s, p) => s + (p.saplingCount || 0), 0)} saplings)
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                          Mature Trees: {pltTrees.length} ({plt.matureTrees || pltTrees.length} declared)
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Farmer-Added POLOGEN & Mature Trees Detail Box for the Selected Plantation */}
            {selectedPlantation && (() => {
              const pltPologens = pologens.filter(p => p.plantationId === selectedPlantation.id);
              const pltTrees = trees.filter(t => t.plantationId === selectedPlantation.id);
              return (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-emerald-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                        Farmer-Added Data for {selectedPlantation.name} ({selectedPlantation.id})
                      </span>
                      <div className="text-[11px] text-slate-600">
                        {selectedPlantation.dagNumber} • {selectedPlantation.district}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-bold">
                      Total Declared: {selectedPlantation.youngTrees || 0} Saplings + {selectedPlantation.matureTrees || 0} Mature
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Farmer-Declared Saplings (< 7 yrs) */}
                    <div className="bg-white p-3 rounded-lg border border-teal-200 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-extrabold text-teal-900 flex items-center gap-1.5">
                          <Sprout className="w-3.5 h-3.5 text-teal-600" />
                          <span>Young Saplings (&lt; 7 yrs)</span>
                        </div>
                        <div className="text-xl font-black text-teal-950 font-mono mt-1">
                          {selectedPlantation.youngTrees ?? pltPologens.reduce((s, p) => s + (p.saplingCount || 0), 0)}
                        </div>
                      </div>
                      
                    </div>

                    {/* Farmer-Declared Mature Trees (>= 7 yrs) */}
                    <div className="bg-white p-3 rounded-lg border border-emerald-200 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                          <TreePine className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mature Trees (≥ 7 yrs)</span>
                        </div>
                        <div className="text-xl font-black text-emerald-950 font-mono mt-1">
                          {selectedPlantation.matureTrees ?? pltTrees.length}
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Inspection Cluster</label>
            <div className="flex gap-2">
              {Object.entries(GPS_SAMPLE).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCluster(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    cluster === key ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Choose Asset Type ─────────────────────────────────────── */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-700" />
            Step 2 — What are you tagging for <span className="text-emerald-700">{selectedFarmer?.name}</span>
            {selectedPlantation ? <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">{selectedPlantation.name} ({selectedPlantation.id})</span> : null}
            ?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* POLOGEN Block */}
            <button
              type="button"
              onClick={() => setAssetType('POLOGEN')}
              className={`p-5 rounded-2xl border-2 text-left transition space-y-3 ${
                assetType === 'POLOGEN' ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20' : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/40'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                assetType === 'POLOGEN' ? 'bg-teal-500 text-white' : 'bg-teal-100 text-teal-700'
              }`}>
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-sm">POLOGEN Block (&lt; 7 Years)</div>
                <div className="text-xs text-slate-500 mt-0.5">Young sapling block mapped as polygon</div>
                <div className="text-[11px] text-teal-700 font-semibold mt-1.5">Select Area on Google Map or Walk Boundary</div>
              </div>
              <div className="flex flex-wrap gap-1 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">Turf.js Area</span>
                <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">Overlap Detection</span>
                <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">Sapling Count</span>
              </div>
              {assetType === 'POLOGEN' && (
                <div className="flex items-center gap-1 text-xs font-bold text-teal-700">
                  <Check className="w-4 h-4" /> Selected
                </div>
              )}
            </button>

            {/* Individual Mature Tree */}
            <button
              type="button"
              onClick={() => setAssetType('TREE')}
              className={`p-5 rounded-2xl border-2 text-left transition space-y-3 ${
                assetType === 'TREE' ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                assetType === 'TREE' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'
              }`}>
                <TreePine className="w-6 h-6" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-sm">Individual Mature Tree (≥ 7 Years)</div>
                <div className="text-xs text-slate-500 mt-0.5">Crosses maturity rule into tree-level identity</div>
                <div className="text-[11px] text-amber-700 font-semibold mt-1.5">Stand at tree trunk → Tree QR tag &amp; RTK GPS</div>
              </div>
              <div className="flex flex-wrap gap-1 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">Point GPS</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">Tree QR Tag</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">Trunk Photo</span>
              </div>
              {assetType === 'TREE' && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-700">
                  <Check className="w-4 h-4" /> Selected
                </div>
              )}
            </button>
          </div>

          {/* Form Fields for Selected Type */}
          {assetType === 'POLOGEN' && (
            <div className="border border-teal-200 bg-teal-50/60 rounded-xl p-3.5 space-y-3">
              <div className="font-bold text-teal-800 text-xs uppercase tracking-wider">POLOGEN Sapling Count</div>
              <div className="max-w-xs">
                <label className="text-xs font-bold text-slate-700 block mb-1">Sapling Count *</label>
                <input
                  type="number"
                  value={pologenForm.saplingCount}
                  onChange={e => setPologenForm(p => ({ ...p, saplingCount: e.target.value }))}
                  className="w-full text-xs border border-teal-300 rounded-lg px-2.5 py-1.5 font-mono font-bold bg-white"
                />
              </div>
            </div>
          )}

          {assetType === 'TREE' && (
            <div className="border border-amber-200 bg-amber-50/60 rounded-xl p-3.5 space-y-3">
              <div className="font-bold text-amber-800 text-xs uppercase tracking-wider">Mature Tree Metadata (≥ 7 Years)</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tree QR Tag Code *</label>
                  <input
                    type="text"
                    value={treeForm.rfidTag}
                    onChange={e => setTreeForm(p => ({ ...p, rfidTag: e.target.value }))}
                    className="w-full text-xs border border-amber-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-amber-900 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Age (years) *</label>
                  <input
                    type="number" step="0.1" min="7"
                    value={treeForm.ageYears}
                    onChange={e => setTreeForm(p => ({ ...p, ageYears: e.target.value }))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">GBH (cm) *</label>
                  <input
                    type="number" step="0.5" min="50"
                    value={treeForm.gbhCm}
                    onChange={e => setTreeForm(p => ({ ...p, gbhCm: e.target.value }))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Height (m)</label>
                  <input
                    type="number" step="0.1"
                    value={treeForm.heightM}
                    onChange={e => setTreeForm(p => ({ ...p, heightM: e.target.value }))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: Google Maps Geo-Tagging (Select Area & Boundary Walking) ── */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                Step 3 — Geo-Tag on Google Maps
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  assetType === 'POLOGEN' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {assetType === 'POLOGEN' ? 'POLOGEN Polygon & Overlap Check' : 'Tree Point Tagging'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {assetType === 'POLOGEN'
                  ? 'Click points to Select Area on Google Map, or switch to Boundary Walking. Turf.js computes exact area and validates overlap.'
                  : 'Click on Google Map at tree trunk location or tap Lock RTK GPS.'}
              </p>
            </div>

            {isGpsLocked && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Boundary Locked</span>
              </span>
            )}
          </div>

          {/* Mode Switcher for POLOGEN */}
          {assetType === 'POLOGEN' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setPologenMode('SELECT_AREA'); setPolygonCoords(null); setIsGpsLocked(false); }}
                className={`p-3.5 rounded-xl border-2 text-left transition space-y-1 ${
                  pologenMode === 'SELECT_AREA'
                    ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900">
                    <Layers className="w-4 h-4 text-teal-600" />
                    <span>Select Area on Google Map</span>
                  </div>
                  {pologenMode === 'SELECT_AREA' && <span className="text-[10px] bg-teal-600 text-white font-bold px-2 py-0.5 rounded-full">Active</span>}
                </div>
                <p className="text-xs text-slate-500">
                  Tap or click corners directly on the Google Hybrid satellite map, or auto-fill Dag 182 / Patta 44.
                </p>
              </button>

              <button
                type="button"
                onClick={() => { setPologenMode('WALK'); setPolygonCoords(null); setIsGpsLocked(false); }}
                className={`p-3.5 rounded-xl border-2 text-left transition space-y-1 ${
                  pologenMode === 'WALK'
                    ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900">
                    <Footprints className="w-4 h-4 text-teal-600" />
                    <span>Walk POLOGEN (Auto-Detect Boundary)</span>
                  </div>
                  {pologenMode === 'WALK' && <span className="text-[10px] bg-teal-600 text-white font-bold px-2 py-0.5 rounded-full">Active</span>}
                </div>
                <p className="text-xs text-slate-500">
                  Walk around the sapling grove perimeter. GPS auto-detects and adds vertices as you move.
                </p>
              </button>
            </div>
          )}

          {/* Interactive Google Map Canvas with Type Switcher */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm">
            <div ref={mapContainerRef} className="w-full h-84 z-10" />

            {/* Map Layer Switcher */}
            <div className="absolute top-2 right-2 z-20 bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-slate-200 flex items-center gap-1 text-[11px] font-bold">
              {[
                { id: 'hybrid', label: 'Google Hybrid' },
                { id: 'satellite', label: 'Satellite' },
                { id: 'roadmap', label: 'Roadmap' }
              ].map(mt => (
                <button
                  key={mt.id}
                  type="button"
                  onClick={() => handleSwitchGoogleMapType(mt.id)}
                  className={`px-2.5 py-1 rounded-lg transition text-white ${
                    googleMapType === mt.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {mt.label}
                </button>
              ))}
            </div>

            {/* Overlap Status Banner */}
            {overlapResult && (
              <div className={`absolute bottom-2 right-2 z-20 px-3 py-1 rounded-xl text-[11px] font-bold shadow-md border ${
                overlapResult.hasOverlap ? 'bg-rose-600 text-white border-rose-700 animate-pulse' : 'bg-emerald-600 text-white border-emerald-700'
              }`}>
                {overlapResult.message}
              </div>
            )}
          </div>

          {/* SELECT AREA CONTROLS */}
          {assetType === 'POLOGEN' && pologenMode === 'SELECT_AREA' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    Select Area Actions ({selectedAreaPoints.length} points plotted)
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Click points on map to enclose sapling block, or auto-fill farmer's Dag 182 / Patta 44 holding.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handlePinCurrentGpsVertex}
                    className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    title="Stand at boundary corner and pin vertex using device GPS"
                  >
                    <MapPin className="w-3.5 h-3.5 text-sky-200" />
                    <span>Pin My GPS Corner</span>
                  </button>

                  <button
                    type="button"
                    onClick={autoFillCadastralPreset}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    title="Load clean cadastral boundary for Dag 182 / Patta 44 with 0.0% overlap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Fill Dag 182 (Clean 0.0%)</span>
                  </button>

                  <button
                    type="button"
                    onClick={simulateOverlapPreset}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    title="Simulate encroachment into existing parcel PLG-AS-01-A to test Turf.js & PostGIS overlap detection"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Simulate Overlap (Dag 183 Conflict)</span>
                  </button>

                  <button
                    type="button"
                    onClick={closeAndCompleteArea}
                    disabled={selectedAreaPoints.length < 3}
                    className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Enclose &amp; Lock Area</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAreaPoints(prev => {
                        const updated = prev.slice(0, -1);
                        if (updated.length >= 3) {
                          const stats = computeStatsAndOverlap(updated);
                          setPolygonStats(stats);
                        } else {
                          setPolygonStats(null);
                          setOverlapResult(null);
                        }
                        return updated;
                      });
                      setPolygonCoords(null);
                      setIsGpsLocked(false);
                    }}
                    disabled={selectedAreaPoints.length === 0}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition disabled:opacity-40"
                    title="Undo Point"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAreaPoints([]);
                      setPolygonCoords(null);
                      setPolygonStats(null);
                      setOverlapResult(null);
                      setIsGpsLocked(false);
                    }}
                    className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 rounded-xl text-xs font-bold transition"
                    title="Clear All"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Area Measurements Card */}
              {polygonStats && (
                <div className="bg-white rounded-xl border border-slate-200 p-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Area (Ha)</span>
                    <span className="font-extrabold text-slate-900 text-sm">{polygonStats.areaHa} Ha</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Area (Acres)</span>
                    <span className="font-extrabold text-slate-900 text-sm">{polygonStats.areaAcres} Acres</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Perimeter</span>
                    <span className="font-extrabold text-slate-900 text-sm">{polygonStats.perimeterM} meters</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WALK POLOGEN CONTROLS */}
          {assetType === 'POLOGEN' && pologenMode === 'WALK' && (
            <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-teal-900 flex items-center gap-1.5">
                    <Footprints className="w-4 h-4 text-teal-700" />
                    Boundary Walking Auto-Detection ({walkPoints.length} points logged)
                  </div>
                  <p className="text-[11px] text-teal-800">{walkStatusMessage}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {!isWalking ? (
                    <button
                      type="button"
                      onClick={startWalkPologen}
                      className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Walking</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (walkWatchIdRef.current) navigator.geolocation?.clearWatch?.(walkWatchIdRef.current);
                        setIsWalking(false);
                      }}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Walk</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={simulateWalkPerimeter}
                    disabled={isSimulatingWalk}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-60"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isSimulatingWalk ? 'Walking...' : 'Simulate Field Walk'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={finishAndCloseWalk}
                    disabled={walkPoints.length < 3}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-40"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Finish &amp; Auto-Close</span>
                  </button>
                </div>
              </div>

              {polygonStats && (
                <div className="bg-white rounded-xl border border-teal-200 p-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-teal-50/50 rounded-lg">
                    <span className="text-[10px] font-bold text-teal-700 uppercase block">Area (Ha)</span>
                    <span className="font-extrabold text-slate-900 text-sm">{polygonStats.areaHa} Ha</span>
                  </div>
                  <div className="p-2 bg-teal-50/50 rounded-lg">
                    <span className="text-[10px] font-bold text-teal-700 uppercase block">Area (Acres)</span>
                    <span className="font-extrabold text-slate-900 text-sm">{polygonStats.areaAcres} Acres</span>
                  </div>
                  <div className="p-2 bg-teal-50/50 rounded-lg">
                    <span className="text-[10px] font-bold text-teal-700 uppercase block">Perimeter</span>
                    <span className="font-extrabold text-slate-900 text-sm">{polygonStats.perimeterM} meters</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TREE POINT CONTROLS */}
          {assetType === 'TREE' && (
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                  <TreePine className="w-4 h-4 text-amber-700" />
                  Individual Tree GPS Geo-Tagging (≥ 7 Years)
                </div>
                <p className="text-[11px] text-amber-800">
                  Click directly on Google Map at tree trunk location or press Lock Tree RTK GPS while standing at the base.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={acquireTreeGps}
                  disabled={isAcquiring}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-60"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{isAcquiring ? 'Acquiring RTK...' : 'Lock Tree RTK GPS'}</span>
                </button>
              </div>
            </div>
          )}

          {/* VISUAL CAPTURE CONFIRMATION CARD FOR POLOGEN */}
          {assetType === 'POLOGEN' && (pologenMode === 'WALK' ? walkPoints : selectedAreaPoints).length > 0 && (
            <div className="rounded-2xl border-2 border-teal-500 bg-teal-50/90 p-4 space-y-3 shadow-xs animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-full bg-teal-600 text-white flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-xs font-black text-teal-950 uppercase tracking-wide">
                      POLOGEN Boundary Successfully Captured &amp; Buffered
                    </span>
                    <div className="text-[11px] text-teal-800">
                      {(pologenMode === 'WALK' ? walkPoints : selectedAreaPoints).length} vertices recorded • Connected to Enterprise Ledger
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${
                  overlapResult?.hasOverlap
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  {overlapResult?.hasOverlap ? '⚠ Overlap Detected' : '✓ Clean Boundary (0.0% Overlap)'}
                </span>
              </div>

              {/* Area Measurements Breakdown */}
              {polygonStats && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-teal-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Area (Ha / Acres)</span>
                    <span className="font-extrabold text-slate-900 text-xs font-mono">{polygonStats.areaHa} Ha ({polygonStats.areaAcres} Ac)</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-teal-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Perimeter</span>
                    <span className="font-extrabold text-slate-900 text-xs font-mono">{polygonStats.perimeterM} meters</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-teal-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Sapling Count</span>
                    <span className="font-extrabold text-emerald-800 text-xs">{pologenForm.saplingCount} Saplings</span>
                  </div>
                </div>
              )}

              {/* Vertex Coordinates Telemetry Table */}
              <div className="p-2 bg-white rounded-xl border border-teal-200 max-h-28 overflow-y-auto">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Captured Boundary Vertices (Geo-Coordinates):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 font-mono text-[10px] text-slate-700">
                  {(pologenMode === 'WALK' ? walkPoints : selectedAreaPoints).map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-center justify-between px-2 py-0.5 rounded bg-slate-50">
                      <span className="font-bold text-teal-800">V#{pIdx + 1}:</span>
                      <span>{pt[0].toFixed(5)}°N, {pt[1].toFixed(5)}°E</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VISUAL CAPTURE CONFIRMATION CARD FOR TREE */}
          {assetType === 'TREE' && gpsCoords && (
            <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/90 p-4 space-y-3 shadow-xs animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-full bg-emerald-600 text-white flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                      Tree Geo-Pinning Successfully Captured &amp; Locked
                    </span>
                    <div className="text-[11px] text-emerald-800">
                      High-precision RTK coordinates locked • Connected to Enterprise Ledger
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-emerald-200 text-emerald-900 border border-emerald-300">
                  RTK GPS Fix: ±{gpsCoords.accuracy ? gpsCoords.accuracy.toFixed(1) : '1.2'}m
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Latitude</span>
                  <span className="font-extrabold text-slate-900 font-mono text-xs">{gpsCoords.lat.toFixed(6)}° N</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Longitude</span>
                  <span className="font-extrabold text-slate-900 font-mono text-xs">{gpsCoords.lng.toFixed(6)}° E</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Tree QR Tag Code</span>
                  <span className="font-extrabold text-emerald-800 font-mono text-xs">{treeForm.rfidTag}</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Maturity Rule</span>
                  <span className="font-extrabold text-amber-700 text-xs">{treeForm.ageYears} yrs (&ge;7y mature)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 4: Capture Image ─────────────────────────────────────────── */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-700" />
            Step 4 — Capture Field Photograph &amp; SHA-256 Seal
          </h2>
          <p className="text-xs text-slate-500">
            Photograph the {assetType === 'POLOGEN' ? 'sapling grove' : 'tree trunk with Tree QR tag'}. The image is watermarked with farmer identity and sealed with Web Crypto SHA-256.
          </p>

          {capturedPhoto ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md">
                <img src={capturedPhoto} alt="Field capture" className="w-full max-h-72 object-cover" />
                <div className="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> SHA-256 Sealed
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs font-mono text-emerald-800 break-all">
                <span className="font-bold text-emerald-900">SHA-256: </span>{photoHash}
              </div>
              <button
                type="button"
                onClick={() => { setCapturedPhoto(null); setPhotoHash(null); setShowCamera(true); setTimeout(() => toggleWebcam(), 300); }}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Re-take photo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => { setShowCamera(true); setTimeout(() => toggleWebcam(), 300); }}
                className="p-5 border-2 border-dashed border-emerald-400 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition flex flex-col items-center text-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-emerald-900 text-sm">Open Device Camera</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Real mobile or laptop webcam capture</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-5 border-2 border-dashed border-sky-400 rounded-xl bg-sky-50 hover:bg-sky-100 transition flex flex-col items-center text-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-700 text-white flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-sky-950 text-sm">Upload Photo / Gallery</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Select image file from device storage</div>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />

            </div>
          )}
        </div>
      )}

      {/* ── STEP 5: Review & Success ── */}
      {step === 5 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Successfully Submitted &amp; Sealed!
            </h2>
            <p className="text-sm text-slate-500">
              {assetType === 'POLOGEN' ? 'POLOGEN block' : 'Mature tree'} attached to <strong>{selectedFarmer?.name}</strong>.
            </p>
          </div>

          {/* Scenario (ii) Cadastral Boundary Overlap Dispute Alert */}
          {overlapResult?.hasOverlap ? (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 space-y-2 text-xs text-rose-900 shadow-xs">
              <div className="flex items-center justify-between font-extrabold flex-wrap gap-2">
                <span className="flex items-center gap-1.5 text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  RFP Scenario (ii) Cadastral Overlap Flagged: {overlapResult.overlapAreaSqM} m² with {overlapResult.overlappingId}
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 text-[10px] font-black uppercase tracking-wider">
                  Routed to DFO Dispute Queue
                </span>
              </div>
              <p className="text-rose-800 leading-relaxed">
                In accordance with <strong>NERAMAC RFP Section 4.2 &amp; Assam Land Revenue Manual</strong>: Parcels with spatial boundary overlaps cannot receive automatic title registration. This record has been frozen and routed to the <strong>Divisional Forest Officer (DFO) &amp; Circle Officer Boundary Dispute Resolution Queue</strong> for ground verification and joint surveyor settlement.
              </p>
              <div className="p-2 rounded-lg bg-white/80 border border-rose-200 text-[11px] font-mono text-rose-950 flex items-center justify-between">
                <span>Intersects: {overlapResult.overlappingId} ({overlapResult.overlappingName})</span>
                <span className="font-bold">Encroached: {overlapResult.overlapAreaSqM} m²</span>
              </div>
            </div>
          ) : (
            assetType === 'POLOGEN' && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>Cadastral Verification Passed: </strong>0.0% overlap with existing registered plots. Clean boundary established.</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-bold text-[10px] rounded">
                  0.0% OVERLAP
                </span>
              </div>
            )
          )}

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 font-mono">
            <div className="flex justify-between"><span className="text-slate-500">Farmer:</span><span className="font-bold text-slate-900">{selectedFarmer?.name} ({selectedFarmer?.id})</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Asset Type:</span><span className="font-bold text-slate-900">{assetType}</span></div>
            {assetType === 'POLOGEN' ? (
              <>
                <div className="flex justify-between"><span className="text-slate-500">Saplings:</span><span className="font-bold text-teal-800">{pologenForm.saplingCount}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Enclosed Area:</span><span className="font-bold text-teal-800">{polygonStats?.areaHa || '0.25'} Ha ({polygonStats?.areaAcres || '0.62'} Acres)</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Perimeter:</span><span className="font-bold text-teal-800">{polygonStats?.perimeterM || '200'} m</span></div>
              </>
            ) : (
              <>
                <div className="flex justify-between"><span className="text-slate-500">Tree QR Tag:</span><span className="font-bold text-amber-800">{treeForm.rfidTag}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Age:</span><span className="font-bold text-amber-800">{treeForm.ageYears} yrs (Mature ≥7y Rule)</span></div>
                <div className="flex justify-between"><span className="text-slate-500">GBH / Height:</span><span className="font-bold text-amber-800">{treeForm.gbhCm} cm / {treeForm.heightM} m</span></div>
              </>
            )}
            <div className="flex justify-between"><span className="text-slate-500">GPS Location:</span><span className="font-bold text-slate-900">{gpsCoords?.lat.toFixed(5)}°N, {gpsCoords?.lng.toFixed(5)}°E</span></div>
            <div className="flex justify-between"><span className="text-slate-500">SHA-256 Seal:</span><span className="font-bold text-emerald-800 truncate max-w-xs">{photoHash}</span></div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={resetWizard}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Tag Another Asset
            </button>
            {onNavigateToGisStudio && (
              <button
                type="button"
                onClick={onNavigateToGisStudio}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200"
              >
                Inspect on Field GIS Studio
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons for Wizard */}
      {step < 5 && (
        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <div className="flex items-center gap-3 flex-wrap">
              {step === 3 && assetType === 'POLOGEN' && overlapResult?.hasOverlap && (
                <div className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>Boundary Overlap Detected ({overlapResult.overlapAreaSqM} m² with {overlapResult.overlappingId})</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  if (step === 3 && assetType === 'POLOGEN') {
                    if (overlapResult?.hasOverlap) {
                      showToast('Cannot proceed: Parcel boundary overlaps with an existing registered plot!', 'error');
                      return;
                    }
                    if (!isGpsLocked && (selectedAreaPoints.length >= 3 || walkPoints.length >= 3)) {
                      if (pologenMode === 'SELECT_AREA') closeAndCompleteArea();
                      else if (pologenMode === 'WALK') completeWalkPologen();
                    }
                  }
                  setStep(s => s + 1);
                }}
                disabled={!canProceed()}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                  step === 3 && assetType === 'POLOGEN' && overlapResult?.hasOverlap
                    ? 'bg-rose-100 text-rose-400 border border-rose-200 cursor-not-allowed opacity-60'
                    : 'text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
                title={
                  step === 3 && assetType === 'POLOGEN' && overlapResult?.hasOverlap
                    ? 'Cannot proceed: Parcel boundary overlaps with an existing plot. Modify vertices to resolve.'
                    : 'Proceed to next step'
                }
              >
                {step === 3 && assetType === 'POLOGEN' && overlapResult?.hasOverlap ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Next</span>
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed()}
              className="px-6 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              <Check className="w-4 h-4" /> Submit &amp; Seal Asset
            </button>
          )}
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-4 space-y-4 border border-slate-800 text-white">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                Live Camera Capture
              </span>
              <button
                onClick={() => {
                  if (streamRef.current) {
                    streamRef.current.getTracks().forEach(t => t.stop());
                    streamRef.current = null;
                  }
                  if (videoRef.current) {
                    videoRef.current.srcObject = null;
                  }
                  setIsWebcamActive(false);
                  setShowCamera(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
              <video
                ref={(el) => {
                  if (el && streamRef.current && el.srcObject !== streamRef.current) {
                    el.srcObject = streamRef.current;
                    el.play().catch(e => console.warn('Inspection video play error:', e));
                  }
                  videoRef.current = el;
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isWebcamActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                  <VideoOff className="w-8 h-8 opacity-60" />
                  <span>Camera not active</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleWebcam}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  {isWebcamActive ? 'Stop Stream' : 'Start Stream'}
                </button>
                
              </div>

              <button
                type="button"
                onClick={handleCaptureRealPhoto}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>{isWebcamActive ? 'Snap Photo & Seal' : 'Snap Scene & Seal'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
