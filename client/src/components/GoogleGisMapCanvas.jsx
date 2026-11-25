import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, Minimize2 } from 'lucide-react';
import { computePolygonMeasurements, formatIndianNumber } from '../utils/spatialUtils';

// Direct Google Maps Tile Layers (No API key required)
const GOOGLE_MAP_LAYERS = {
  hybrid: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
  satellite: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  terrain: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
  roadmap: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
};

function makePinSvgDataUrl(bgColor, letter) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path d="M16 1C7.7 1 1 7.7 1 16c0 10.6 15 24.5 15 24.5S31 26.6 31 16C31 7.7 24.3 1 16 1z" fill="${bgColor}" stroke="#ffffff" stroke-width="2"/>
      <text x="16" y="21" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="13" font-weight="700">${letter}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getTreePinColor(pinColor) {
  if (pinColor === 'red') return '#dc2626';
  if (pinColor === 'slate') return '#334155';
  return '#15803d';
}

function getFacilityPinColor(code) {
  if (code === 'C') return '#0f172a';
  if (code === 'D') return '#1e293b';
  if (code === 'L') return '#0f766e';
  return '#1d4ed8';
}

function haversineMeters(ptA, ptB) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(ptB[1] - ptA[1]);
  const dLng = toRad(ptB[0] - ptA[0]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(ptA[1])) * Math.cos(toRad(ptB[1])) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function GoogleGisMapCanvas({
  mapType,
  onChangeMapType,
  viewport,
  registry,
  layers,
  activeTool,
  selectedEntity,
  onSelectEntity,
  draftPoints,
  onMapClickPoint,
  onUpdateDraftPoint,
  hudBanner
}) {
  const containerRef = useRef(null);
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const tileRef = useRef(null);
  const overlaysRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keep latest callback refs so map event listeners stay fresh
  const onMapClickRef = useRef(onMapClickPoint);
  const onUpdateDraftRef = useRef(onUpdateDraftPoint);
  const activeToolRef = useRef(activeTool);
  const onSelectEntityRef = useRef(onSelectEntity);

  useEffect(() => {
    onMapClickRef.current = onMapClickPoint;
    onUpdateDraftRef.current = onUpdateDraftPoint;
    activeToolRef.current = activeTool;
    onSelectEntityRef.current = onSelectEntity;
  }, [onMapClickPoint, onUpdateDraftPoint, activeTool, onSelectEntity]);

  // Initialize Google Maps Canvas
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;

    const map = L.map(mapElRef.current, {
      center: [viewport.lat, viewport.lng],
      zoom: viewport.zoom,
      maxZoom: 20,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ position: 'bottomleft', metric: true, imperial: false }).addTo(map);

    tileRef.current = L.tileLayer(GOOGLE_MAP_LAYERS[mapType] || GOOGLE_MAP_LAYERS.hybrid, {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: 'Map data &copy;2026 Google'
    }).addTo(map);

    overlaysRef.current = L.layerGroup().addTo(map);

    // Leaflet latlng uses numeric properties .lng and .lat (not functions!)
    map.on('click', (e) => {
      const tool = activeToolRef.current;
      if (['SELECT_AREA', 'REGISTER_PLANTATION', 'WALK_POLOGEN', 'GEO_PIN_TREE', 'DISTANCE'].includes(tool)) {
        const lng = +Number(e.latlng.lng).toFixed(6);
        const lat = +Number(e.latlng.lat).toFixed(6);
        onMapClickRef.current?.([lng, lat]);
      }
    });

    mapRef.current = map;

    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
      overlaysRef.current = null;
    };
  }, []);

  // Switch Google Map Layer (Hybrid / Satellite / Terrain / Roadmap)
  useEffect(() => {
    if (tileRef.current) {
      tileRef.current.setUrl(GOOGLE_MAP_LAYERS[mapType] || GOOGLE_MAP_LAYERS.hybrid);
    }
  }, [mapType]);

  // Smooth Fly-To on Cluster or Entity Selection
  useEffect(() => {
    if (mapRef.current && viewport) {
      mapRef.current.flyTo([viewport.lat, viewport.lng], viewport.zoom, { duration: 0.85 });
    }
  }, [viewport]);

  // Render All Spatial Overlays
  useEffect(() => {
    if (!mapRef.current || !overlaysRef.current) return;

    const group = overlaysRef.current;
    group.clearLayers();

    // 1. Plantations (PLT)
    if (layers.plantations) {
      (registry.plantations || []).forEach((plt) => {
        const isSelected = selectedEntity?.id === plt.id;
        const latlngs = (plt.coordinates?.[0] || []).map(([lng, lat]) => [lat, lng]);
        const m = computePolygonMeasurements(plt.coordinates);

        const poly = L.polygon(latlngs, {
          color: isSelected ? '#ffffff' : '#10b981',
          weight: isSelected ? 3.5 : 2,
          fillColor: '#10b981',
          fillOpacity: isSelected ? 0.38 : 0.24
        });

        poly.bindTooltip(
          `<b>${plt.id}</b> — ${plt.name}<br/>${m.areaHa.toFixed(4)} ha (${(m.areaHa * 2.47105).toFixed(2)} Acres) · ${formatIndianNumber(Math.round(m.areaSqFt))} sq ft`,
          { sticky: true }
        );

        poly.on('click', (e) => {
          const tool = activeToolRef.current;
          if (['REGISTER_PLANTATION', 'WALK_POLOGEN', 'GEO_PIN_TREE', 'DISTANCE'].includes(tool)) {
            L.DomEvent.stopPropagation(e);
            const lng = +Number(e.latlng.lng).toFixed(6);
            const lat = +Number(e.latlng.lat).toFixed(6);
            onMapClickRef.current?.([lng, lat]);
            return;
          }
          // In INSPECT or SELECT_AREA mode, clicking a Plantation selects & measures it strictly!
          L.DomEvent.stopPropagation(e);
          onSelectEntityRef.current?.({ type: 'PLANTATION', ...plt });
        });

        group.addLayer(poly);
      });
    }

    // 2. POLOGENs (PLG < 7 yrs)
    if (layers.pologens) {
      (registry.pologens || []).forEach((plg) => {
        const isSelected = selectedEntity?.id === plg.id;
        const latlngs = (plg.coordinates?.[0] || []).map(([lng, lat]) => [lat, lng]);
        const m = computePolygonMeasurements(plg.coordinates);

        const poly = L.polygon(latlngs, {
          color: isSelected ? '#ffffff' : '#f59e0b',
          weight: isSelected ? 3 : 2,
          dashArray: '4, 3',
          fillColor: '#f59e0b',
          fillOpacity: isSelected ? 0.48 : 0.34
        });

        poly.bindTooltip(
          `<b>${plg.id} (${plg.version || 'v1'})</b> — ${plg.name}<br/>${plg.saplingCount} saplings (&lt;7y) · ${m.areaHa.toFixed(3)} ha`,
          { sticky: true }
        );

        poly.on('click', (e) => {
          const tool = activeToolRef.current;
          if (['REGISTER_PLANTATION', 'WALK_POLOGEN', 'GEO_PIN_TREE', 'DISTANCE'].includes(tool)) {
            L.DomEvent.stopPropagation(e);
            const lng = +Number(e.latlng.lng).toFixed(6);
            const lat = +Number(e.latlng.lat).toFixed(6);
            onMapClickRef.current?.([lng, lat]);
            return;
          }
          L.DomEvent.stopPropagation(e);
          onSelectEntityRef.current?.({ type: 'POLOGEN', ...plg });
        });

        group.addLayer(poly);
      });
    }

    // 3. MOV Corridors
    if (layers.corridors) {
      (registry.corridors || []).forEach((cor) => {
        const latlngs = (cor.coordinates || []).map(([lng, lat]) => [lat, lng]);
        const line = L.polyline(latlngs, {
          color: '#2dd4bf',
          weight: 3,
          dashArray: '8, 7',
          opacity: 0.9
        });
        line.bindTooltip(`<b>${cor.id}</b><br/>${cor.name}<br/>Permit: ${cor.permitRef}`, { sticky: true });
        group.addLayer(line);
      });
    }

    // 4. Mature Trees (TRE >= 7 yrs)
    if (layers.trees) {
      (registry.trees || []).forEach((t) => {
        const pinUrl = makePinSvgDataUrl(getTreePinColor(t.pinColor), 'T');
        const icon = L.divIcon({
          className: 'gis-pin-marker',
          html: `<img src="${pinUrl}" style="width:30px;height:39px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.45));" />`,
          iconSize: [30, 39],
          iconAnchor: [15, 39]
        });

        const marker = L.marker([t.coordinates[1], t.coordinates[0]], { icon });
        marker.bindTooltip(
          `<b>${t.id}</b><br/>Tag: ${t.rfidTag} · Age: ${t.ageYears}y · GBH: ${t.gbhCm}cm<br/>Status: ${t.status}`
        );
        marker.on('click', (e) => {
          const tool = activeToolRef.current;
          if (['REGISTER_PLANTATION', 'WALK_POLOGEN', 'GEO_PIN_TREE', 'DISTANCE'].includes(tool)) {
            L.DomEvent.stopPropagation(e);
            const lng = +Number(e.latlng.lng).toFixed(6);
            const lat = +Number(e.latlng.lat).toFixed(6);
            onMapClickRef.current?.([lng, lat]);
            return;
          }
          L.DomEvent.stopPropagation(e);
          onSelectEntityRef.current?.({ type: 'TREE', ...t });
        });
        group.addLayer(marker);
      });
    }

    // 5. Facilities (CPC / Labs / Ports / DFO)
    if (layers.facilities) {
      (registry.facilities || []).forEach((f) => {
        const pinUrl = makePinSvgDataUrl(getFacilityPinColor(f.code), f.code);
        const icon = L.divIcon({
          className: 'gis-pin-marker',
          html: `<img src="${pinUrl}" style="width:30px;height:39px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));" />`,
          iconSize: [30, 39],
          iconAnchor: [15, 39]
        });

        const marker = L.marker([f.coordinates[1], f.coordinates[0]], { icon });
        marker.bindTooltip(`<b>${f.id}</b> — ${f.name}<br/>${f.details}`);
        group.addLayer(marker);
      });
    }

    // 6. Active Draft Geometry (Select Area / Register Plantation / Walk POLOGEN / Geo-Pin Tree / Distance)
    if (draftPoints && draftPoints.length > 0) {
      const latlngs = draftPoints.map(([lng, lat]) => [lat, lng]);
      const isPolygonTool = ['SELECT_AREA', 'REGISTER_PLANTATION', 'WALK_POLOGEN'].includes(activeTool);

      const strokeHex =
        activeTool === 'WALK_POLOGEN'
          ? '#f59e0b'
          : activeTool === 'SELECT_AREA'
          ? '#38bdf8'
          : activeTool === 'DISTANCE'
          ? '#38bdf8'
          : '#22c55e';

      if (isPolygonTool && latlngs.length >= 3) {
        group.addLayer(
          L.polygon(latlngs, {
            color: strokeHex,
            weight: 3,
            dashArray: activeTool === 'SELECT_AREA' ? '6, 4' : undefined,
            fillColor: strokeHex,
            fillOpacity: 0.35
          })
        );
      } else if (latlngs.length >= 2) {
        group.addLayer(
          L.polyline(latlngs, {
            color: strokeHex,
            weight: 3.5,
            dashArray: activeTool === 'DISTANCE' ? '7, 5' : '5, 4'
          })
        );
      }

      // Segment distance labels in DISTANCE mode
      if (activeTool === 'DISTANCE' && draftPoints.length >= 2) {
        for (let i = 0; i < draftPoints.length - 1; i++) {
          const a = draftPoints[i];
          const b = draftPoints[i + 1];
          const midLat = (a[1] + b[1]) / 2;
          const midLng = (a[0] + b[0]) / 2;
          const distM = haversineMeters(a, b);
          const distLabel = distM >= 1000 ? `${(distM / 1000).toFixed(2)} km` : `${distM} m`;

          const labelIcon = L.divIcon({
            className: 'gis-dist-label',
            html: `<div style="background:#0f172a;color:#ffffff;font-family:monospace;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;border:1px solid #38bdf8;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.4);">${distLabel}</div>`,
            iconSize: [60, 20],
            iconAnchor: [30, 10]
          });
          group.addLayer(L.marker([midLat, midLng], { icon: labelIcon, interactive: false }));
        }
      }

      // Draggable Vertex / Pin Markers
      draftPoints.forEach(([lng, lat], idx) => {
        const badgeBg =
          activeTool === 'GEO_PIN_TREE'
            ? '#d97706'
            : activeTool === 'WALK_POLOGEN'
            ? '#b45309'
            : activeTool === 'DISTANCE' || activeTool === 'SELECT_AREA'
            ? '#0284c7'
            : '#047857';

        const icon =
          activeTool === 'GEO_PIN_TREE'
            ? L.divIcon({
                className: 'gis-draft-tree-pin',
                html: `<img src="${makePinSvgDataUrl('#d97706', 'T')}" style="width:36px;height:46px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.55));" />`,
                iconSize: [36, 46],
                iconAnchor: [18, 46]
              })
            : L.divIcon({
                className: 'gis-draft-vertex',
                html: `
                  <div style="width:24px;height:24px;border-radius:50%;background:${badgeBg};color:#ffffff;border:2px solid #ffffff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.5);cursor:grab;">
                    ${idx + 1}
                  </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              });

        const marker = L.marker([lat, lng], { icon, draggable: true });
        marker.bindTooltip(
          activeTool === 'GEO_PIN_TREE'
            ? `<b>New Tree Pin</b><br/>Lat: ${lat}, Lng: ${lng}<br/><i>Drag to fine-tune position</i>`
            : `<b>Point ${idx + 1}</b><br/>Lat: ${lat}, Lng: ${lng}<br/><i>Drag to adjust</i>`
        );
        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          onUpdateDraftRef.current?.(idx, [+Number(pos.lng).toFixed(6), +Number(pos.lat).toFixed(6)]);
        });
        group.addLayer(marker);
      });
    }
  }, [registry, layers, selectedEntity, draftPoints, activeTool]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => {
        setIsFullscreen(true);
        setTimeout(() => mapRef.current?.invalidateSize(), 200);
      }).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => {
        setIsFullscreen(false);
        setTimeout(() => mapRef.current?.invalidateSize(), 200);
      }).catch(() => {});
    }
  };

  const isDrawingCursor = ['SELECT_AREA', 'REGISTER_PLANTATION', 'WALK_POLOGEN', 'GEO_PIN_TREE', 'DISTANCE'].includes(activeTool);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isFullscreen ? 'h-screen' : 'h-[530px]'} bg-slate-900 overflow-hidden ${
        isDrawingCursor ? 'gis-drawing-mode' : ''
      }`}
    >
      <div ref={mapElRef} className="w-full h-full z-0" />

      {/* Google Maps-style Map | Satellite Toggle Pill */}
      <div className="absolute top-2.5 left-2.5 z-[400] flex items-center bg-white rounded-sm shadow-md border border-slate-200 overflow-hidden text-xs font-medium">
        <button
          type="button"
          onClick={() => onChangeMapType('roadmap')}
          className={`px-3 py-1.5 transition ${
            mapType === 'roadmap' || mapType === 'terrain'
              ? 'font-bold text-slate-900 bg-slate-50'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Map
        </button>
        <div className="w-px h-5 bg-slate-200" />
        <button
          type="button"
          onClick={() => onChangeMapType('hybrid')}
          className={`px-3 py-1.5 transition ${
            mapType === 'hybrid' || mapType === 'satellite'
              ? 'font-bold text-slate-900 bg-slate-50'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Live Floating Tool Instruction & Turf.js Telemetry HUD */}
      {hudBanner && (
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-[400] gis-hud-dark px-3.5 py-1.5 rounded-lg border shadow-lg text-xs font-medium flex items-center gap-2 max-w-[68%] truncate pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="truncate">{hudBanner}</span>
        </div>
      )}

      {/* Fullscreen Button */}
      <button
        type="button"
        onClick={toggleFullscreen}
        title="Toggle Fullscreen"
        className="absolute top-2.5 right-2.5 z-[400] w-9 h-9 bg-white hover:bg-slate-50 text-slate-700 rounded-sm shadow-md border border-slate-200 flex items-center justify-center transition"
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
