const INITIAL_GIS_REGISTRY = require('../data/gisRegistryData');

// In-memory state cloned from initial seed (resets cleanly on restart or via /reset)
let gisState = JSON.parse(JSON.stringify(INITIAL_GIS_REGISTRY));

exports.getRegistry = (req, res) => {
  res.json({
    success: true,
    counts: {
      plantations: gisState.plantations.length,
      pologens: gisState.pologens.length,
      trees: gisState.trees.length
    },
    data: gisState
  });
};

exports.createPlantation = (req, res) => {
  const { name, farmerId, farmerName, cluster, district, dagPatta, coordinates } = req.body;
  if (!coordinates || !Array.isArray(coordinates)) {
    return res.status(400).json({ error: 'Valid GeoJSON polygon coordinates are required' });
  }
  const idx = gisState.plantations.length + 1;
  const clusterCode = cluster === 'KADAMTALA' ? 'TR-KDM' : 'AS-GLG';
  const suffix = String.fromCharCode(65 + (idx % 26));
  const id = `PLT-${clusterCode}-${String(idx).padStart(4, '0')}-${suffix}`;

  const newPlantation = {
    id,
    name: name || `Surveyed Agarwood Holding #${idx}`,
    farmerId: farmerId || `FRM-${clusterCode}-${String(idx + 100)}`,
    farmerName: farmerName || 'Registered Smallholder',
    cluster: cluster || 'GOLAGHAT',
    district: district || (cluster === 'KADAMTALA' ? 'North Tripura, Tripura' : 'Golaghat, Assam'),
    dagPatta: dagPatta || `Dag ${180 + idx * 7}, Patta ${40 + idx}`,
    verifiedBy: 'FA-ARUP-BORAH',
    createdAt: new Date().toISOString(),
    coordinates
  };

  gisState.plantations.unshift(newPlantation);
  res.status(201).json({ success: true, plantation: newPlantation, data: gisState });
};

exports.createPologen = (req, res) => {
  const { name, parentPlantationId, cluster, plantingYear, saplingCount, coordinates } = req.body;
  if (!coordinates || !Array.isArray(coordinates)) {
    return res.status(400).json({ error: 'Valid GeoJSON polygon coordinates are required' });
  }
  const idx = gisState.pologens.length + 1;
  const clusterCode = cluster === 'KADAMTALA' ? 'TR-KDM' : 'AS-GLG';
  const suffix = String.fromCharCode(75 + (idx % 15));
  const id = `PLG-${clusterCode}-${String(idx).padStart(4, '0')}-${suffix}`;
  const yr = Number(plantingYear) || 2022;

  const newPologen = {
    id,
    version: 'v1',
    parentPlantationId: parentPlantationId || gisState.plantations[0]?.id,
    name: name || `Walked Sapling Block #${idx} (${yr})`,
    cluster: cluster || 'GOLAGHAT',
    plantingYear: yr,
    ageYears: +(2026.5 - yr).toFixed(1),
    saplingCount: Number(saplingCount) || 260,
    spacing: '1.5m x 1.5m',
    status: 'ACTIVE_COLLECTIVE',
    createdAt: new Date().toISOString(),
    coordinates
  };

  gisState.pologens.unshift(newPologen);
  res.status(201).json({ success: true, pologen: newPologen, data: gisState });
};

exports.createTree = (req, res) => {
  const { parentPlantationId, cluster, rfidTag, ageYears, gbhCm, heightM, status, photoSha256, coordinates } = req.body;
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    return res.status(400).json({ error: 'Valid [lng, lat] coordinates are required' });
  }
  const idx = gisState.trees.length + 1;
  const clusterCode = cluster === 'KADAMTALA' ? 'TR-KDM' : 'AS-GLG';
  const id = `TRE-${clusterCode}-0001-${String(idx).padStart(2, '0')}`;

  const newTree = {
    id,
    parentPlantationId: parentPlantationId || gisState.plantations[0]?.id,
    cluster: cluster || 'GOLAGHAT',
    rfidTag: rfidTag || `${clusterCode}-TAG-${9100 + idx}`,
    species: 'Aquilaria malaccensis Lam.',
    ageYears: Number(ageYears) || 10.5,
    gbhCm: Number(gbhCm) || 62.0,
    heightM: Number(heightM) || 11.0,
    status: status || 'VERIFIED_HEALTHY',
    pinColor: status === 'HARVEST_AUTHORIZED' ? 'red' : status === 'INOCULATED' ? 'slate' : 'green',
    elevation: '87.2 m MSL',
    accuracyM: 1.1,
    photoSha256: photoSha256 || '8c3a5e7f9b1d3a5c7e9f1b3d5a7c9e1f3b5d7a9c1e3f5b7d9a1c3e5f7b9d1a3c',
    createdAt: new Date().toISOString(),
    coordinates
  };

  gisState.trees.unshift(newTree);
  res.status(201).json({ success: true, tree: newTree, data: gisState });
};

exports.exportGeoJSON = (req, res) => {
  const features = [];

  gisState.plantations.forEach((p) => {
    features.push({
      type: 'Feature',
      properties: {
        entityType: 'PLANTATION',
        id: p.id,
        name: p.name,
        farmerId: p.farmerId,
        cluster: p.cluster,
        dagPatta: p.dagPatta
      },
      geometry: { type: 'Polygon', coordinates: p.coordinates }
    });
  });

  gisState.pologens.forEach((plg) => {
    features.push({
      type: 'Feature',
      properties: {
        entityType: 'POLOGEN',
        id: plg.id,
        version: plg.version,
        parentPlantationId: plg.parentPlantationId,
        name: plg.name,
        plantingYear: plg.plantingYear,
        saplingCount: plg.saplingCount
      },
      geometry: { type: 'Polygon', coordinates: plg.coordinates }
    });
  });

  gisState.trees.forEach((t) => {
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

  gisState.corridors.forEach((c) => {
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

  res.setHeader('Content-Disposition', 'attachment; filename="neramac-ascts-gis-registry.geojson"');
  res.json({
    type: 'FeatureCollection',
    name: 'NERAMAC_ASCTS_SPATIAL_REGISTRY',
    generatedAt: new Date().toISOString(),
    features
  });
};

exports.resetRegistry = (req, res) => {
  gisState = JSON.parse(JSON.stringify(INITIAL_GIS_REGISTRY));
  res.json({ success: true, data: gisState });
};
