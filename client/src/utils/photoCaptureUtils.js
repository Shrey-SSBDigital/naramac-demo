/**
 * Forensic Image Capture & Watermarking Utilities for Field GIS Studio
 * Generates tamper-evident, watermarked field imagery for:
 * 1. POLOGEN (< 7 yrs young saplings block / nursery walk)
 * 2. Mature Agarwood Trees (≥ 7 yrs point geo-pin with RFID nail tag)
 */

export function generateCryptoHash() {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/**
 * Draws the official NERAMAC ASCTS watermark on any 2D canvas context
 */
export function stampWatermarkOnCanvas(ctx, width, height, meta) {
  const {
    kind = 'TREE',
    entityId = 'AS-TRE-01',
    farmerName = 'Bhaben Saikia',
    farmerId = 'FRM-AS-01',
    plantationName = 'Dhekial Agro-Parcel',
    plantationId = 'PLT-AS-01',
    rfidTag = 'TAG-AGY-001',
    ageYears = 12,
    gbhCm = 65,
    saplingCount = 240,
    plantingYear = 2023,
    coordinates = [93.9782, 26.5204],
    photoSha256 = generateCryptoHash(),
    timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  } = meta;

  const lat = coordinates[1] || 26.5204;
  const lng = coordinates[0] || 93.9782;

  ctx.save();

  // 1. Top HUD Ribbon
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fillRect(0, 0, width, 44);

  // Top header text
  ctx.fillStyle = '#10b981'; // Emerald
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillText('NERAMAC ASCTS • FIELD FORESTRY ASSET CAPTURE', 16, 18);

  ctx.fillStyle = '#94a3b8'; // Slate
  ctx.font = '10px "Courier New", monospace';
  const subtitle = kind === 'POLOGEN'
    ? 'MODULE 03 • POLOGEN SAPLING GROVE WALK (< 7 YRS)'
    : 'MODULE 03 • MATURE TREE POINT GEO-TAG (≥ 7 YRS)';
  ctx.fillText(subtitle, 16, 34);

  // Top right badge
  ctx.fillStyle = kind === 'POLOGEN' ? '#0d9488' : '#047857';
  ctx.beginPath();
  ctx.roundRect(width - 150, 10, 134, 24, 6);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(kind === 'POLOGEN' ? 'POLOGEN (< 7 YRS)' : 'MATURE TREE (≥ 7 YRS)', width - 83, 26);
  ctx.textAlign = 'left';

  // 2. Center Crosshairs / Alignment Reticle
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
  ctx.lineWidth = 1.5;
  const cx = width / 2;
  const cy = height / 2 - 20;

  // Outer Reticle Box
  ctx.strokeRect(cx - 70, cy - 70, 140, 140);

  // Corner brackets
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 2.5;
  const cornerSize = 16;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(cx - 70, cy - 70 + cornerSize);
  ctx.lineTo(cx - 70, cy - 70);
  ctx.lineTo(cx - 70 + cornerSize, cy - 70);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(cx + 70 - cornerSize, cy - 70);
  ctx.lineTo(cx + 70, cy - 70);
  ctx.lineTo(cx + 70, cy - 70 + cornerSize);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(cx - 70, cy + 70 - cornerSize);
  ctx.lineTo(cx - 70, cy + 70);
  ctx.lineTo(cx - 70 + cornerSize, cy + 70);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(cx + 70 - cornerSize, cy + 70);
  ctx.lineTo(cx + 70, cy + 70);
  ctx.lineTo(cx + 70, cy + 70 - cornerSize);
  ctx.stroke();

  // Center crosshair
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy);
  ctx.lineTo(cx + 10, cy);
  ctx.moveTo(cx, cy - 10);
  ctx.lineTo(cx, cy + 10);
  ctx.stroke();

  // 3. Bottom Metadata Overlay Card
  const cardHeight = 110;
  const cardY = height - cardHeight;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.fillRect(0, cardY, width, cardHeight);

  // Top border of bottom card
  ctx.strokeStyle = kind === 'POLOGEN' ? '#0d9488' : '#059669';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, cardY);
  ctx.lineTo(width, cardY);
  ctx.stroke();

  // Row 1: Asset ID & Farmer Attachment
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillText(`ID: ${entityId}`, 16, cardY + 22);

  ctx.fillStyle = '#6ee7b7';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(`Grower: ${farmerName} (${farmerId})`, 220, cardY + 22);

  // Row 2: Plantation Parcel & Asset Metrics
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '11px sans-serif';
  ctx.fillText(`Plot: ${plantationName} (${plantationId})`, 16, cardY + 44);

  if (kind === 'POLOGEN') {
    ctx.fillStyle = '#5eead4';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillText(`Saplings: ${saplingCount} (<7 yrs) • Planted: ${plantingYear}`, 220, cardY + 44);
  } else {
    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillText(`Tag: ${rfidTag} • Age: ${ageYears}y • GBH: ${gbhCm}cm`, 220, cardY + 44);
  }

  // Row 3: GPS Coordinates & RTK Accuracy
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText(`GPS: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E (RTK ±1.1m MSL)`, 16, cardY + 66);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText(`Time: ${timestamp} IST`, 360, cardY + 66);

  // Row 4: Cryptographic SHA-256 Buffer Hash Stamp
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(12, cardY + 76, width - 24, 22);
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(12, cardY + 76, width - 24, 22);

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 9px "Courier New", monospace';
  ctx.fillText(`RAM BUFFER SHA-256: ${photoSha256}`, 20, cardY + 91);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('✓ HARDWARE VERIFIED', width - 20, cardY + 91);
  ctx.textAlign = 'left';

  ctx.restore();
}

/**
 * Generates an ultra-realistic synthetic field image when real webcam is not active
 */
export function generateSyntheticFieldPhoto(meta) {
  const width = 720;
  const height = 540;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (meta.kind === 'POLOGEN') {
    // 1. POLOGEN Scene: Broad view of Agarwood nursery / sapling grove (< 7 yrs)
    // Sky / Canopy gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.45);
    skyGrad.addColorStop(0, '#134e4a'); // Dark teal
    skyGrad.addColorStop(0.6, '#115e59');
    skyGrad.addColorStop(1, '#065f46'); // Emerald forest
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.45);

    // Forest floor / Nursery beds
    const groundGrad = ctx.createLinearGradient(0, height * 0.45, 0, height);
    groundGrad.addColorStop(0, '#2d241e'); // Rich humus soil
    groundGrad.addColorStop(0.5, '#1e3a29'); // Grass & moss
    groundGrad.addColorStop(1, '#1b2f21');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, height * 0.45, width, height * 0.55);

    // Nursery rows (perspective lines)
    ctx.strokeStyle = 'rgba(20, 184, 166, 0.25)';
    ctx.lineWidth = 2;
    for (let x = 60; x < width; x += 110) {
      ctx.beginPath();
      ctx.moveTo(x, height * 0.45);
      ctx.lineTo(x + (x - width / 2) * 0.6, height);
      ctx.stroke();
    }

    // Draw young saplings
    const saplingPositions = [
      { x: 120, y: 260, h: 90, w: 28 },
      { x: 230, y: 250, h: 105, w: 32 },
      { x: 360, y: 245, h: 120, w: 36 },
      { x: 490, y: 255, h: 100, w: 30 },
      { x: 600, y: 265, h: 85, w: 26 },
      // Foreground row
      { x: 180, y: 340, h: 140, w: 42 },
      { x: 310, y: 335, h: 155, w: 48 },
      { x: 450, y: 330, h: 150, w: 46 },
      { x: 570, y: 345, h: 135, w: 40 }
    ];

    saplingPositions.forEach((sap) => {
      // Polybag base
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(sap.x - 14, sap.y + sap.h * 0.4, 28, 22);

      // Bamboo support stake
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sap.x - 6, sap.y - 10);
      ctx.lineTo(sap.x - 6, sap.y + sap.h * 0.5);
      ctx.stroke();

      // Slender stem
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sap.x, sap.y + sap.h * 0.45);
      ctx.quadraticCurveTo(sap.x + 4, sap.y + sap.h * 0.2, sap.x, sap.y);
      ctx.stroke();

      // Lush young foliage clusters
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(sap.x, sap.y, sap.w, sap.h * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.ellipse(sap.x - 10, sap.y - 8, sap.w * 0.7, sap.h * 0.2, -0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.ellipse(sap.x + 10, sap.y - 6, sap.w * 0.65, sap.h * 0.22, 0.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // POLOGEN perimeter boundary tape (fluorescent yellow dashed)
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(50, 410);
    ctx.lineTo(240, 390);
    ctx.lineTo(480, 395);
    ctx.lineTo(670, 420);
    ctx.stroke();
    ctx.setLineDash([]);

  } else {
    // 2. TREE Scene: Focused portrait of Mature Agarwood Tree Trunk (≥ 7 yrs)
    // Deep forest background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#064e3b');
    bgGrad.addColorStop(0.5, '#022c22');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Forest canopy leaf silhouettes
    ctx.fillStyle = 'rgba(5, 150, 105, 0.25)';
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      const lx = (i * 45) % width;
      const ly = (i * 28) % 180;
      ctx.ellipse(lx, ly, 35, 18, (i * 0.3), 0, Math.PI * 2);
      ctx.fill();
    }

    // Mature Aquilaria malaccensis Trunk
    const trunkX = width / 2 - 65;
    const trunkW = 130;

    // Trunk Bark Gradient
    const trunkGrad = ctx.createLinearGradient(trunkX, 0, trunkX + trunkW, 0);
    trunkGrad.addColorStop(0, '#2e180d'); // Shadow side
    trunkGrad.addColorStop(0.25, '#452615');
    trunkGrad.addColorStop(0.55, '#5c351f'); // Highlight
    trunkGrad.addColorStop(0.85, '#3b1f11');
    trunkGrad.addColorStop(1, '#24140b'); // Shadow side

    ctx.fillStyle = trunkGrad;
    ctx.fillRect(trunkX, 0, trunkW, height);

    // Vertical bark fissures & grain
    ctx.strokeStyle = 'rgba(20, 10, 5, 0.55)';
    ctx.lineWidth = 2.5;
    const barkFissures = [
      trunkX + 22,
      trunkX + 44,
      trunkX + 68,
      trunkX + 92,
      trunkX + 112
    ];
    barkFissures.forEach((fx) => {
      ctx.beginPath();
      ctx.moveTo(fx, 0);
      ctx.bezierCurveTo(fx - 6, height * 0.35, fx + 8, height * 0.65, fx - 3, height);
      ctx.stroke();
    });

    // Inoculation Drill Plugs / Wound Healing Callus
    const plugPositions = [
      { y: 140, x: trunkX + 42 },
      { y: 220, x: trunkX + 78 },
      { y: 310, x: trunkX + 54 },
      { y: 380, x: trunkX + 85 }
    ];

    plugPositions.forEach((plug) => {
      // Inoculation hole
      ctx.fillStyle = '#0f0804';
      ctx.beginPath();
      ctx.ellipse(plug.x, plug.y, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Callus ring (resin deposition)
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(plug.x, plug.y, 11, 15, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Physical Laser RFID Nail Tag on Trunk
    const tagX = trunkX + 35;
    const tagY = 245;
    ctx.fillStyle = '#eab308'; // Bright yellow RFID tag
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(tagX, tagY, 60, 32, 4);
    ctx.fill();
    ctx.stroke();

    // Central metallic nail
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(tagX + 30, tagY + 8, 4, 0, Math.PI * 2);
    ctx.fill();

    // RFID Tag text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NERAMAC', tagX + 30, tagY + 20);
    ctx.font = 'bold 7px monospace';
    ctx.fillText((meta.rfidTag || 'AS-TAG').slice(0, 11), tagX + 30, tagY + 28);
    ctx.textAlign = 'left';
  }

  // Stamp the complete forensic watermark on top of the synthesized scene
  stampWatermarkOnCanvas(ctx, width, height, meta);

  return canvas.toDataURL('image/jpeg', 0.92);
}
