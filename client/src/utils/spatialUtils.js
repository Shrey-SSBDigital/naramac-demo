import * as turf from '@turf/turf';

// Assam Revenue Land Unit Constants
// 1 Assam Bigha = 5 Katha = 100 Lessa = 14,400 sq ft = 1,337.803776 sq meters
export const SQM_PER_ASSAM_BIGHA = 1337.803776;
export const SQFT_PER_SQM = 10.7639104;

export function formatIndianNumber(num, decimals = 0) {
  if (typeof num !== 'number' || Number.isNaN(num)) return '0';
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

// Ensure a polygon ring is closed ([lng, lat])
export function closeRing(ring) {
  if (!ring || ring.length < 3) return ring || [];
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return ring;
  return [...ring, [...first]];
}

// Compute exact Turf.js polygon area and perimeter in Assam Bigha, Hectares, sq ft, and m²
export function computePolygonMeasurements(coordinates) {
  try {
    const outerRing = Array.isArray(coordinates?.[0]?.[0])
      ? closeRing(coordinates[0])
      : closeRing(coordinates);

    if (!outerRing || outerRing.length < 4) {
      return {
        areaSqM: 0,
        areaHa: 0,
        areaSqFt: 0,
        assamBigha: 0,
        bighaWhole: 0,
        katha: 0,
        lessa: 0,
        perimeterM: 0,
        center: null
      };
    }

    const poly = turf.polygon([outerRing]);
    const areaSqM = turf.area(poly);
    const areaHa = areaSqM / 10000;
    const areaSqFt = areaSqM * SQFT_PER_SQM;
    const assamBigha = areaSqM / SQM_PER_ASSAM_BIGHA;

    const totalLessa = Math.round(assamBigha * 100);
    const bighaWhole = Math.floor(totalLessa / 100);
    const katha = Math.floor((totalLessa % 100) / 20);
    const lessa = totalLessa % 20;

    const line = turf.lineString(outerRing);
    const perimeterM = turf.length(line, { units: 'meters' });

    const centerFeat = turf.centerOfMass(poly);
    const center = centerFeat?.geometry?.coordinates || outerRing[0];

    return {
      areaSqM,
      areaHa,
      areaSqFt,
      assamBigha,
      bighaWhole,
      katha,
      lessa,
      perimeterM,
      center
    };
  } catch {
    return {
      areaSqM: 0,
      areaHa: 0,
      areaSqFt: 0,
      assamBigha: 0,
      bighaWhole: 0,
      katha: 0,
      lessa: 0,
      perimeterM: 0,
      center: null
    };
  }
}

// Safe Turf.js intersection wrapper compatible with both Turf v6 and v7
function safeIntersect(polyA, polyB) {
  try {
    const fc = turf.featureCollection([polyA, polyB]);
    const res = turf.intersect(fc);
    if (res) return res;
  } catch {
    try {
      return turf.intersect(polyA, polyB);
    } catch {
      return null;
    }
  }
  return null;
}

// Validate Overlap against a list of existing polygon features (Plantations or POLOGENs)
export function validatePolygonOverlap(candidateCoords, existingList) {
  try {
    const ring = Array.isArray(candidateCoords?.[0]?.[0])
      ? closeRing(candidateCoords[0])
      : closeRing(candidateCoords);
    if (!ring || ring.length < 4) {
      return { valid: false, overlapPct: 0, conflicts: [], reason: 'At least 3 vertices required.' };
    }

    const candidatePoly = turf.polygon([ring]);
    const candidateArea = turf.area(candidatePoly);
    if (candidateArea <= 0) {
      return { valid: false, overlapPct: 0, conflicts: [], reason: 'Polygon has zero area.' };
    }

    let maxOverlapArea = 0;
    const conflicts = [];

    for (const item of existingList || []) {
      const existingRing = closeRing(item.coordinates?.[0] || []);
      if (existingRing.length < 4) continue;
      const existingPoly = turf.polygon([existingRing]);
      const inter = safeIntersect(candidatePoly, existingPoly);
      if (inter) {
        const interArea = turf.area(inter);
        if (interArea > 1) {
          maxOverlapArea += interArea;
          conflicts.push({
            id: item.id,
            name: item.name,
            overlapSqM: Math.round(interArea),
            overlapPct: +((interArea / candidateArea) * 100).toFixed(2)
          });
        }
      }
    }

    const totalOverlapPct = Math.min(100, +((maxOverlapArea / candidateArea) * 100).toFixed(2));
    return {
      valid: conflicts.length === 0,
      overlapPct: totalOverlapPct,
      conflicts
    };
  } catch (err) {
    return { valid: true, overlapPct: 0, conflicts: [], error: err.message };
  }
}

// Validate Boundary Containment: checks if a POLOGEN polygon is strictly contained inside a registered Plantation
export function validatePologenContainment(pologenCoords, plantations) {
  try {
    const ring = Array.isArray(pologenCoords?.[0]?.[0])
      ? closeRing(pologenCoords[0])
      : closeRing(pologenCoords);
    if (!ring || ring.length < 4) {
      return { contained: false, parentPlantation: null };
    }
    const candidatePoly = turf.polygon([ring]);

    for (const plt of plantations || []) {
      const pltRing = closeRing(plt.coordinates?.[0] || []);
      if (pltRing.length < 4) continue;
      const pltPoly = turf.polygon([pltRing]);

      // Check every vertex lies inside or on boundary of parent plantation
      const allPointsInside = ring.slice(0, -1).every((pt) =>
        turf.booleanPointInPolygon(turf.point(pt), pltPoly)
      );
      if (allPointsInside || turf.booleanContains(pltPoly, candidatePoly)) {
        return { contained: true, parentPlantation: plt };
      }
    }

    return { contained: false, parentPlantation: null };
  } catch {
    return { contained: false, parentPlantation: null };
  }
}

// Validate Tree Point Containment inside a registered Plantation
export function findContainingPlantation(lngLat, plantations) {
  try {
    const pt = turf.point(lngLat);
    for (const plt of plantations || []) {
      const pltRing = closeRing(plt.coordinates?.[0] || []);
      if (pltRing.length < 4) continue;
      const pltPoly = turf.polygon([pltRing]);
      if (turf.booleanPointInPolygon(pt, pltPoly)) {
        return plt;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Compute Geodesic Path Distance in meters & km
export function computePathDistance(pointsLngLat) {
  if (!pointsLngLat || pointsLngLat.length < 2) {
    return { meters: 0, km: 0, segments: [] };
  }
  const line = turf.lineString(pointsLngLat);
  const meters = turf.length(line, { units: 'meters' });
  const segments = [];
  for (let i = 0; i < pointsLngLat.length - 1; i++) {
    const segM = turf.distance(turf.point(pointsLngLat[i]), turf.point(pointsLngLat[i + 1]), {
      units: 'meters'
    });
    segments.push(Math.round(segM));
  }
  return {
    meters: Math.round(meters),
    km: +(meters / 1000).toFixed(3),
    segments
  };
}

// Format GPS Coordinate respecting Exact vs Redacted View
export function formatCoordinate(lat, lng, exactView = true) {
  if (exactView) {
    return `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;
  }
  return `${lat.toFixed(2)}***° N, ${lng.toFixed(2)}***° E (Redacted)`;
}

// Build RFC 7946 GeoJSON FeatureCollection for client-side download
export function buildRegistryGeoJSON(registry) {
  const features = [];

  (registry.plantations || []).forEach((p) => {
    const m = computePolygonMeasurements(p.coordinates);
    features.push({
      type: 'Feature',
      properties: {
        entityType: 'PLANTATION',
        id: p.id,
        name: p.name,
        farmerId: p.farmerId,
        cluster: p.cluster,
        dagPatta: p.dagPatta,
        areaSqM: +m.areaSqM.toFixed(1),
        areaHa: +m.areaHa.toFixed(4),
        assamBigha: +m.assamBigha.toFixed(3),
        areaSqFt: Math.round(m.areaSqFt)
      },
      geometry: { type: 'Polygon', coordinates: p.coordinates }
    });
  });

  (registry.pologens || []).forEach((plg) => {
    const m = computePolygonMeasurements(plg.coordinates);
    features.push({
      type: 'Feature',
      properties: {
        entityType: 'POLOGEN',
        id: plg.id,
        version: plg.version,
        parentPlantationId: plg.parentPlantationId,
        name: plg.name,
        plantingYear: plg.plantingYear,
        saplingCount: plg.saplingCount,
        areaSqM: +m.areaSqM.toFixed(1),
        assamBigha: +m.assamBigha.toFixed(3)
      },
      geometry: { type: 'Polygon', coordinates: plg.coordinates }
    });
  });

  (registry.trees || []).forEach((t) => {
    features.push({
      type: 'Feature',
      properties: {
        entityType: 'MATURE_TREE',
        id: t.id,
        parentPlantationId: t.parentPlantationId,
        rfidTag: t.rfidTag,
        ageYears: t.ageYears,
        gbhCm: t.gbhCm,
        status: t.status,
        photoSha256: t.photoSha256
      },
      geometry: { type: 'Point', coordinates: t.coordinates }
    });
  });

  (registry.corridors || []).forEach((c) => {
    features.push({
      type: 'Feature',
      properties: {
        entityType: 'MOV_CORRIDOR',
        id: c.id,
        name: c.name,
        permitRef: c.permitRef
      },
      geometry: { type: 'LineString', coordinates: c.coordinates }
    });
  });

  return {
    type: 'FeatureCollection',
    name: 'NERAMAC_ASCTS_GIS_REGISTRY',
    generatedAt: new Date().toISOString(),
    features
  };
}
