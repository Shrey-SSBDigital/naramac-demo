import React, { useState, useRef, useEffect,useMemo } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { generateSyntheticFieldPhoto, computeRealSha256 } from '../../utils/photoCaptureUtils';
import { useAppRouter } from '../../router/useAppRouter';
import {
  Axe,
  CheckCircle2,
  Plus,
  Scale,
  ShieldCheck,
  QrCode,
  Camera,
  Video,
  VideoOff,
  Clock,
  FileCheck,
  User,
  Trees,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Calendar,
  MapPin,
  Sprout,
  Building,
  FileText,
  CheckSquare,
  Upload,
  Truck,
  Loader2,
  FileBadge2,
  RotateCcw
} from 'lucide-react';

export default function HarvestModule() {
  const {
    harvests,
    harvestBatches,
    applyHarvest,
    neramacVerifyHarvest,
    dfoApproveHarvest,
    dfoRejectHarvest,
    resubmitHarvest,
    fieldAgentConfirmAndFell,
    trees,
    farmers,
    plantations,
    pologens,
    inoculations,
    permits,
    activeRole,
    setDispatchIntent,
    rearmFarmerTrees,
    resetToInitialData,
    addToast
  } = useEnterprise();
  const { navigate } = useAppRouter();

  const getDefaultTab = (role) => {
    if (role === 'FARMER') return 'FARMER_MY_APPS';
    if (role === 'FIELD_AGENT') return 'FA_PRE_HARVEST';
    if (role === 'FOREST_DEPT') return 'DFO_PENDING_SANCTIONS';
    return 'QUEUE';
  };
  const [activeTab, setActiveTab] = useState(() => getDefaultTab(activeRole));
  const [adminStageFilter, setAdminStageFilter] = useState('ALL');

  useEffect(() => {
    setActiveTab(getDefaultTab(activeRole));
  }, [activeRole]);

  const [selectedHarvest, setSelectedHarvest] = useState(null);
  const [selectedBatchForPass, setSelectedBatchForPass] = useState(null);

  // NERAMAC Verification Modal State
  const [isNeramacModalOpen, setIsNeramacModalOpen] = useState(false);
  const [neramacTarget, setNeramacTarget] = useState(null);
  const [neramacForm, setNeramacForm] = useState({
    officerName: 'NERAMAC-FA-04 (Dipankar Neog)',
    notes: 'On-site homestead origin & tree RFID tag verified. Private revenue Dag/Patta confirmed. Recommended for DFO felling sanction.'
  });

  // DFO Decision Modal State (Approved? Yes -> Authorisation ID / No -> Back to Harvest Application)
  const [isDfoModalOpen, setIsDfoModalOpen] = useState(false);
  const [dfoTarget, setDfoTarget] = useState(null);
  const [dfoDecisionTab, setDfoDecisionTab] = useState('APPROVE'); // 'APPROVE' | 'REJECT'
  const [dfoForm, setDfoForm] = useState({
    harvestAuthorisationId: '',
    dfoSanctionNumber: '',
    approvedMaxWeightKg: 42.0,
    dfoOfficerName: 'S. K. Bordoloi, IFS (DFO Golaghat)',
    permitDoc: 'DFO_Felling_Sanction_Permit.pdf',
    remarks: 'Private homestead origin verified. Non-forest land clearance confirmed. Approved under Assam Agarwood Policy 2020.',
    rejectionReason: 'Land Revenue Jamabandi discrepancy: Homestead Patta title documentation needs updated Lat Mandal certification.'
  });

  // Resubmit Modal State
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [resubmitTarget, setResubmitTarget] = useState(null);
  const [resubmitForm, setResubmitForm] = useState({
    estimatedWeightKg: 38.0,
    correctedNotes: 'Attached updated Lat Mandal verification copy and confirmed revenue Dag/Patta coordinates.'
  });

  // Field Agent Felling & Weighment Modal State
  const [isFellModalOpen, setIsFellModalOpen] = useState(false);
  const [fellingTarget, setFellingTarget] = useState(null);
  const [fellForm, setFellForm] = useState({
    cleanedHeartwoodKg: 38.5,
    sapwoodChipsKg: 12.0,
    resinGrade: 'GRADE_A_DARK_RESIN',
    inspectorName: 'NERAMAC-FA-04 (Dipankar Neog)',
    treeConfirmed: true,
    inspectionNotes: 'Tree trunk RFID verified on-site. Spiral inoculation drill plugs inspected. Heartwood resin saturation dense and dark brown.'
  });

  // Camera & Photo Capture in Felling Modal
  const videoRef = useRef(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [capturedStumpPhoto, setCapturedStumpPhoto] = useState(null);
  const [stumpPhotoHash, setStumpPhotoHash] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);

  // RFP Scenario (v): Harvest Authorisation Application Form State
  const [applicantMode, setApplicantMode] = useState('FIELD_AGENT'); // 'FIELD_AGENT' | 'GROWER'
  const [fieldAgentName, setFieldAgentName] = useState('NERAMAC-FA-04 (Dipankar Neog)');
  const [dfoDivision, setDfoDivision] = useState('DFO Golaghat Forest Division, Assam');
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0]?.id || 'FRM-AS-01');
  const [selectedPlantationId, setSelectedPlantationId] = useState(plantations[0]?.id || 'PLT-AS-01');
  const [targetAssetType, setTargetAssetType] = useState('TREE'); // 'TREE' | 'POLOGEN'
  const [selectedTreeIds, setSelectedTreeIds] = useState(['TRE-AS-001']);
  const [selectedPologenId, setSelectedPologenId] = useState(pologens[0]?.id || 'PLG-2026-001');
  const [customTreeCount, setCustomTreeCount] = useState(1);
  const [harvestWindowStart, setHarvestWindowStart] = useState('2026-03-15');
  const [harvestWindowEnd, setHarvestWindowEnd] = useState('2026-03-31');
  const [estimatedQuantity, setEstimatedQuantity] = useState('38.5');
  const [quantityUnit, setQuantityUnit] = useState('kg (Cleaned Heartwood)');
  const [reasonForHarvest, setReasonForHarvest] = useState(
    'Resin maturity reached 24 months post-inoculation. Core drill test reveals dense oleoresin heartwood saturation.'
  );

  // Inoculation History Relied Upon
  const [inoculationForm, setInoculationForm] = useState({
    eventId: 'INO-2024-032',
    date: '2024-01-15',
    method: 'Spiral Drill Inoculation',
    compound: 'Bio-Inoculant Formulation AS-9 (CSIR-NEIST licensed)',
    supplier: 'NERAMAC Approved Bio-Inputs Ltd., Jorhat',
    verificationStatus: 'Verified by Field Agent (Dense dark oleoresin confirmed)'
  });

  // Statutory Permission
  const [statutoryPermissionRef, setStatutoryPermissionRef] = useState('REV/GLT/PATTA-78/NOC-2025/112');
  const [statutoryUndertaking, setStatutoryUndertaking] = useState(true);

  // Geo-Tagged Photo Capture for Harvest Application
  const appPhotoInputRef = useRef(null);
  const [appPhotoUrl, setAppPhotoUrl] = useState(null);
  const [appPhotoSha256, setAppPhotoSha256] = useState('9a3ecbe5ed12ab4d8e11ba873c2f11161202b945e3b0c44298fc1c149afbf4c8');

  // Application Form Live Webcam State
  const [isAppWebcamActive, setIsAppWebcamActive] = useState(false);
  const [isAppCameraLoading, setIsAppCameraLoading] = useState(false);
  const appStreamRef = useRef(null);
  const appVideoRef = useRef(null);

  // Available collections synced with selected farmer
  const availablePlantations = plantations.filter(p => p.farmerId === selectedFarmerId);
  const availableTrees = trees.filter(t => t.farmerId === selectedFarmerId && t.status !== 'HARVESTED');

  // Synced Farmer & Dedicated Form State
  const currentFarmer = useMemo(() => {
    return farmers.find(f => f.id === selectedFarmerId) || farmers[0];
  }, [farmers, selectedFarmerId]);

  const farmerMatureTrees = useMemo(() => {
    return trees.filter(t => t.farmerId === currentFarmer?.id && (t.ageYears >= 7 || (t.plantingYear && t.plantingYear <= 2019)) && t.status !== 'HARVESTED');
  }, [trees, currentFarmer]);

  const [farmerSelectedTreeId, setFarmerSelectedTreeId] = useState('');
  const [farmerHarvestDate, setFarmerHarvestDate] = useState('2026-03-25');
  const [farmerEstimatedWeight, setFarmerEstimatedWeight] = useState('38.5');
  const [farmerReason, setFarmerReason] = useState('Resin maturity reached 24 months post-inoculation (AAU certified strain).');
  const [farmerDeclaration, setFarmerDeclaration] = useState(true);

  useEffect(() => {
    if (farmerMatureTrees.length > 0 && (!farmerSelectedTreeId || !farmerMatureTrees.some(t => t.id === farmerSelectedTreeId))) {
      setFarmerSelectedTreeId(farmerMatureTrees[0].id);
    }
  }, [farmerMatureTrees, farmerSelectedTreeId]);

  const farmerHarvests = useMemo(() => {
    return harvests.filter(h => h.farmerId === currentFarmer?.id || h.farmerName === currentFarmer?.name);
  }, [harvests, currentFarmer]);

  const farmerBatches = useMemo(() => {
    return harvestBatches.filter(b => b.farmerId === currentFarmer?.id || b.farmerName === currentFarmer?.name);
  }, [harvestBatches, currentFarmer]);

  const handleFarmerDirectSubmit = (e) => {
    e.preventDefault();
    if (!farmerDeclaration) {
      addToast('Please confirm the homestead non-forest declaration', 'error');
      return;
    }
    const targetTree = trees.find(t => t.id === farmerSelectedTreeId) || farmerMatureTrees[0];
    if (!targetTree) {
      addToast('Please select an eligible mature tree', 'error');
      return;
    }
    const targetPlt = plantations.find(p => p.id === targetTree.plantationId) || plantations[0];

    applyHarvest({
      applicantMode: 'GROWER',
      fieldAgent: 'Assigned to NERAMAC-FA-04 (Dipankar Neog)',
      dfoDivision: 'DFO Golaghat Forest Division, Assam',
      farmerId: currentFarmer.id,
      farmerName: currentFarmer.name,
      plantationId: targetPlt ? targetPlt.id : 'PLT-AS-01',
      plantationName: targetPlt?.name || `${currentFarmer.name} Homestead Plot`,
      cluster: currentFarmer.cluster || 'Golaghat Cluster',
      targetAssetType: 'TREE',
      treeId: targetTree.id,
      proposedTreeIds: [targetTree.id],
      treeCount: 1,
      plantingYear: targetTree.plantingYear || 2015,
      treeAgeYears: targetTree.ageYears || 11,
      pologenId: null,
      harvestWindowStart: farmerHarvestDate,
      harvestWindowEnd: farmerHarvestDate,
      harvestWindowText: farmerHarvestDate,
      estimatedQuantity: parseFloat(farmerEstimatedWeight) || 38.0,
      estimatedWeightKg: parseFloat(farmerEstimatedWeight) || 38.0,
      quantityUnit: 'kg (Cleaned Heartwood)',
      reasonForHarvest: farmerReason,
      inoculationHistory: {
        method: 'Spiral Drill Inoculation',
        compound: 'AAU Certified Fusarium solani (Strain AS-44)',
        supplier: 'Assam Agricultural University, Jorhat'
      },
      statutoryPermissionRef: `HOMESTEAD/REV/${currentFarmer.id}/2026`,
      photoUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80',
      photoSha256: '9a3ecbe5ed12ab4d8e11ba873c2f11161202b945e3b0c44298fc1c149afbf4c8'
    });

    addToast(`Harvest application for Tree ${targetTree.id} submitted! Sent to Field Agent.`, 'success');
    setActiveTab('FARMER_MY_APPS');
  };
  const availablePologens = pologens.filter(p => p.farmerId === selectedFarmerId);

  // Selected Target Asset for Harvest Application (Tree or POLOGEN)
  const selectedTreeObj = trees.find(t => selectedTreeIds.includes(t.id)) || availableTrees[0] || trees[0];
  const selectedPologenObj = pologens.find(p => p.id === selectedPologenId) || availablePologens[0] || pologens[0];

  // Dynamic coordinates auto-fetched from selected tree or POLOGEN
  const targetCoordinates = useMemo(() => {
    if (targetAssetType === 'TREE' && selectedTreeObj) {
      const lat = selectedTreeObj.gpsLatitude || (selectedTreeObj.coordinates ? selectedTreeObj.coordinates[0] : 26.5204);
      const lng = selectedTreeObj.gpsLongitude || (selectedTreeObj.coordinates ? selectedTreeObj.coordinates[1] : 93.9782);
      const acc = selectedTreeObj.accuracyM || 0.9;
      return { lat, lng, acc, source: `Registered Tree Tag ${selectedTreeObj.id}` };
    }
    if (targetAssetType === 'POLOGEN' && selectedPologenObj) {
      const firstVertex = selectedPologenObj.boundaryPolygon?.[0] || [26.5205, 93.9784];
      return { lat: firstVertex[0], lng: firstVertex[1], acc: 1.2, source: `Registered POLOGEN ${selectedPologenObj.id}` };
    }
    return { lat: 26.5204, lng: 93.9782, acc: 1.1, source: 'Default Cadastral Fix' };
  }, [targetAssetType, selectedTreeObj, selectedPologenObj]);

  // Resolves tree planting year and tree age for any harvest, batch, or tree object
  const getTreeAgeInfo = (item) => {
    if (!item) return { plantingYear: 2014, ageYears: 12, isMature: true, label: 'Planted 2014 • 12 yrs' };

    // If item is POLOGEN asset
    if (item.targetAssetType === 'POLOGEN' || (item.pologenId && !item.treeId)) {
      const pol = pologens.find(p => p.id === (item.pologenId || item.treeId));
      const plantingYear = item.plantingYear || pol?.plantingYear || 2022;
      const ageYears = item.treeAgeYears || pol?.ageYears || (2026 - plantingYear);
      return {
        plantingYear,
        ageYears,
        isMature: ageYears >= 7,
        label: `Planted in ${plantingYear} • ${ageYears} yrs old (POLOGEN block)`
      };
    }

    // Individual Tree target
    const targetTreeId = item.treeId || item.id;
    const tree = trees.find(t => t.id === targetTreeId);
    const plantingYear = item.plantingYear || tree?.plantingYear || (tree?.ageYears ? 2026 - tree.ageYears : 2014);
    const ageYears = item.treeAgeYears || tree?.ageYears || (2026 - plantingYear);
    return {
      plantingYear,
      ageYears,
      isMature: ageYears >= 7,
      label: `Planted in ${plantingYear} • ${ageYears} yrs old`
    };
  };

  // Resolves official DFO Felling Sanction Order for any harvest batch or linked tree
  const resolveBatchFellingOrder = (batch) => {
    if (!batch) return 'DFO/GLT/2026/HARV-379';
    if (batch.fellingOrderNumber) return batch.fellingOrderNumber;
    const linkedPermit = permits?.find(p =>
      (p.permitType?.toLowerCase().includes('felling') || p.permitNumber?.startsWith('DFO/')) &&
      (p.batchId === batch.id || p.treeId === batch.treeId)
    );
    if (linkedPermit?.permitNumber) return linkedPermit.permitNumber;
    const linkedHarvest = harvests?.find(h => h.treeId === batch.treeId || h.id === batch.harvestAuthId);
    if (linkedHarvest?.dfoSanctionNumber) return linkedHarvest.dfoSanctionNumber;
    return 'DFO/GLT/2026/HARV-379';
  };

  // Clean up app webcam
  const stopAppWebcam = () => {
    if (appStreamRef.current) {
      appStreamRef.current.getTracks().forEach(t => t.stop());
      appStreamRef.current = null;
    }
    if (appVideoRef.current) {
      appVideoRef.current.srcObject = null;
    }
    setIsAppWebcamActive(false);
  };

  // Toggle live webcam in Harvest Application
  const toggleAppWebcam = async () => {
    if (isAppWebcamActive) {
      stopAppWebcam();
    } else {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        addToast('Camera hardware API unavailable — generating simulated photo', 'warning');
        handleCaptureAppSyntheticPhoto();
        return;
      }
      setIsAppCameraLoading(true);
      try {
        let stream = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
          });
        } catch (e1) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
        appStreamRef.current = stream;
        setIsAppWebcamActive(true);
      } catch (err) {
        console.error("Camera access error:", err);
        addToast(`Camera access failed: ${err.message || 'Permission denied'} — using simulated photo`, 'warning');
        handleCaptureAppSyntheticPhoto();
      } finally {
        setIsAppCameraLoading(false);
      }
    }
  };

  // Capture real photo from live video in Harvest Application
  const captureAppWebcamPhoto = async () => {
    if (!appVideoRef.current) return;
    const video = appVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Overlay Watermark
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
    ctx.fillRect(0, 0, canvas.width, 54);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('NERAMAC ASCTS • PRE-FELLING HARVEST INSPECTION', 20, 24);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px monospace';
    const targetLabel = targetAssetType === 'TREE' ? `TREE: ${selectedTreeIds.join(', ')}` : `POLOGEN: ${selectedPologenId}`;
    ctx.fillText(`${targetLabel} • GROWER: ${farmers.find(f => f.id === selectedFarmerId)?.name || selectedFarmerId}`, 20, 44);

    // Bottom HUD
    ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
    ctx.fillRect(0, canvas.height - 56, canvas.width, 56);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`GPS: ${targetCoordinates.lat.toFixed(4)}°N, ${targetCoordinates.lng.toFixed(4)}°E (±${targetCoordinates.acc}m) • PATTA: ${statutoryPermissionRef}`, 20, canvas.height - 32);
    ctx.fillStyle = '#34d399';
    ctx.font = '10px monospace';
    ctx.fillText(`STAMP: ${new Date().toLocaleString()} IST • AGENT: ${fieldAgentName}`, 20, canvas.height - 14);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const hash = await computeRealSha256(dataUrl);

    setAppPhotoUrl(dataUrl);
    setAppPhotoSha256(hash);
    stopAppWebcam();
    addToast('Pre-felling tree photograph captured & SHA-256 sealed!', 'success');
  };

  // Dynamic updates on Farmer selection change
  useEffect(() => {
    if (availablePlantations.length > 0 && !availablePlantations.some(p => p.id === selectedPlantationId)) {
      setSelectedPlantationId(availablePlantations[0].id);
    }
    if (availableTrees.length > 0 && !selectedTreeIds.some(id => availableTrees.some(t => t.id === id))) {
      setSelectedTreeIds([availableTrees[0].id]);
    }
    if (availablePologens.length > 0 && !availablePologens.some(p => p.id === selectedPologenId)) {
      setSelectedPologenId(availablePologens[0].id);
    }
  }, [selectedFarmerId, availablePlantations, availableTrees, availablePologens]);

  // Capture synthetic field photo with GPS watermark
  const handleCaptureAppSyntheticPhoto = async () => {
    const farmer = farmers.find(f => f.id === selectedFarmerId);
    const photo = generateSyntheticFieldPhoto({
      kind: targetAssetType === 'TREE' ? 'TREE' : 'POLOGEN',
      farmerName: farmer?.name || 'Grower',
      farmerId: selectedFarmerId,
      plantationName: selectedPlantationId || 'Plot 01',
      plantationId: selectedPlantationId || 'PLT-01'
    });
    const hash = await computeRealSha256(photo);
    setAppPhotoUrl(photo);
    setAppPhotoSha256(hash);
    addToast('Supporting tree inspection photo captured & sealed with SHA-256', 'success');
  };

  const handleAppPhotoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target.result;
      const hash = await computeRealSha256(dataUrl);
      setAppPhotoUrl(dataUrl);
      setAppPhotoSha256(hash);
      addToast('Supporting photograph uploaded & sealed with SHA-256', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Handle Full Harvest Application Submission
  const handleFarmerSubmit = (e) => {
    e.preventDefault();
    if (!statutoryUndertaking) {
      addToast('Statutory undertaking must be confirmed prior to submission', 'error');
      return;
    }

    const farmer = farmers.find(f => f.id === selectedFarmerId) || farmers[0];
    const plantation = plantations.find(p => p.id === selectedPlantationId) || plantations[0];

    const targetTree = trees.find(t => t.id === (targetAssetType === 'TREE' ? (selectedTreeIds[0] || 'TRE-AS-001') : null));
    const targetPologen = pologens.find(p => p.id === selectedPologenId);
    const plantingYear = targetAssetType === 'TREE'
      ? (targetTree?.plantingYear || 2014)
      : (targetPologen?.plantingYear || 2022);
    const treeAgeYears = targetAssetType === 'TREE'
      ? (targetTree?.ageYears || 12)
      : (targetPologen?.ageYears || 4.5);

    applyHarvest({
      applicantMode,
      fieldAgent: applicantMode === 'FIELD_AGENT' ? fieldAgentName : 'Direct Grower Application',
      dfoDivision,
      farmerId: farmer.id,
      farmerName: farmer.name,
      plantationId: plantation ? plantation.id : 'PLT-AS-01',
      plantationName: plantation ? plantation.name : `${farmer.name} Agro-Parcel`,
      cluster: farmer.cluster || plantation?.cluster || 'Golaghat Cluster',
      targetAssetType,
      treeId: targetAssetType === 'TREE' ? (selectedTreeIds[0] || 'TRE-AS-001') : (selectedPologenId || 'PLG-2026-001'),
      proposedTreeIds: targetAssetType === 'TREE' ? selectedTreeIds : [],
      treeCount: targetAssetType === 'TREE' ? selectedTreeIds.length : parseInt(customTreeCount) || 1,
      plantingYear,
      treeAgeYears,
      pologenId: targetAssetType === 'POLOGEN' ? selectedPologenId : null,
      harvestWindowStart,
      harvestWindowEnd,
      harvestWindowText: `${harvestWindowStart} – ${harvestWindowEnd}`,
      estimatedQuantity: parseFloat(estimatedQuantity) || 38.0,
      estimatedWeightKg: parseFloat(estimatedQuantity) || 38.0,
      quantityUnit,
      reasonForHarvest,
      inoculationHistory: inoculationForm,
      statutoryPermissionRef,
      photoUrl: appPhotoUrl,
      photoSha256: appPhotoSha256 || '9a3ecbe5ed12ab4d8e11ba873c2f11161202b945e3b0c44298fc1c149afbf4c8'
    });

    setActiveTab('QUEUE');
  };

  // Open NERAMAC Verification Modal
  const handleOpenNeramacModal = (harvest) => {
    setNeramacTarget(harvest);
    setNeramacForm({
      officerName: 'NERAMAC-FA-04 (Dipankar Neog)',
      notes: `Verified homestead land title for farmer ${harvest.farmerName}. Inspected Tree ${harvest.treeId} and verified RFID tag on-site.`
    });
    setIsNeramacModalOpen(true);
  };

  const handleNeramacSubmit = (e) => {
    e.preventDefault();
    if (!neramacTarget) return;
    neramacVerifyHarvest(neramacTarget.id, neramacForm);
    setIsNeramacModalOpen(false);
    setNeramacTarget(null);
  };

  // Open DFO Decision Modal
  const handleOpenDfoModal = (harvest) => {
    setDfoTarget(harvest);
    setDfoDecisionTab('APPROVE');
    const authId = `HA-AS-GLG-2026-${Math.floor(200 + Math.random() * 800)}`;
    setDfoForm({
      harvestAuthorisationId: authId,
      dfoSanctionNumber: `DFO/GLT/2026/HARV-${Math.floor(200 + Math.random() * 800)}`,
      approvedMaxWeightKg: harvest.estimatedWeightKg || 42.0,
      dfoOfficerName: 'S. K. Bordoloi, IFS (DFO Golaghat)',
      permitDoc: `DFO_Sanction_Permit_${harvest.id}.pdf`,
      remarks: `Homestead land Dag & Patta checked with Revenue Mandal. Felling sanctioned for Tree ${harvest.treeId}.`,
      rejectionReason: 'Land Revenue Jamabandi discrepancy: Homestead Patta title documentation needs updated Lat Mandal certification.'
    });
    setIsDfoModalOpen(true);
  };

  // Submit DFO Approval or Rejection
  const handleDfoSubmit = (e) => {
    e.preventDefault();
    if (!dfoTarget) return;
    if (dfoDecisionTab === 'APPROVE') {
      dfoApproveHarvest(dfoTarget.id, dfoForm);
    } else {
      dfoRejectHarvest(dfoTarget.id, {
        reason: dfoForm.rejectionReason,
        dfoOfficerName: dfoForm.dfoOfficerName
      });
    }
    setIsDfoModalOpen(false);
    setDfoTarget(null);
  };

  // Open Resubmit Modal (when DFO rejected and looped back)
  const handleOpenResubmitModal = (harvest) => {
    setResubmitTarget(harvest);
    setResubmitForm({
      estimatedWeightKg: harvest.estimatedWeightKg || 38.0,
      correctedNotes: 'Attached updated Lat Mandal verification copy and confirmed revenue Dag/Patta coordinates.'
    });
    setIsResubmitModalOpen(true);
  };

  const handleResubmitSubmit = (e) => {
    e.preventDefault();
    if (!resubmitTarget) return;
    resubmitHarvest(resubmitTarget.id, {
      estimatedWeightKg: parseFloat(resubmitForm.estimatedWeightKg) || 38.0,
      reasonForHarvest: `Resubmitted: ${resubmitForm.correctedNotes}`
    });
    setIsResubmitModalOpen(false);
    setResubmitTarget(null);
  };

  // Open Field Agent Felling Modal
  const handleOpenFellModal = (harvest) => {
    setFellingTarget(harvest);
    setFellForm({
      cleanedHeartwoodKg: harvest.estimatedWeightKg || 38.5,
      sapwoodChipsKg: 12.0,
      resinGrade: 'GRADE_A_DARK_RESIN',
      inspectorName: 'NERAMAC-FA-04 (Dipankar Neog)',
      treeConfirmed: true,
      inspectionNotes: `On-site tree ${harvest.treeId} physically confirmed with handheld RFID scanner. Felling supervised.`
    });
    setCapturedStumpPhoto(null);
    setStumpPhotoHash('');
    setIsFellModalOpen(true);
  };

  const fellStreamRef = useRef(null);

  // Toggle Live Webcam
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (fellStreamRef.current) {
        fellStreamRef.current.getTracks().forEach(t => t.stop());
        fellStreamRef.current = null;
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
        fellStreamRef.current = stream;
        setIsWebcamActive(true);
      } catch (err) {
        addToast('Camera hardware not accessible. Using high-resolution AR field camera.', 'warning');
        setIsWebcamActive(false);
      }
    }
  };

  // Capture Stump / Felled Log Photo
  const handleCapturePhoto = async () => {
    let photoDataUrl;
    if (isWebcamActive && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 540;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 720, 540);
      photoDataUrl = canvas.toDataURL('image/jpeg', 0.92);

      if (fellStreamRef.current) {
        fellStreamRef.current.getTracks().forEach(t => t.stop());
        fellStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
    } else {
      photoDataUrl = generateSyntheticFieldPhoto({
        kind: 'TREE',
        entityId: fellingTarget ? `STUMP-${fellingTarget.treeId}` : 'STUMP-TRE-01',
        farmerName: fellingTarget?.farmerName || 'Grower',
        farmerId: fellingTarget?.farmerId || 'FRM-AS-01',
        plantationName: fellingTarget?.plantationId || 'Plot',
        plantationId: 'PLT-01'
      });
    }

    const sha256 = await computeRealSha256(photoDataUrl);
    setCapturedStumpPhoto(photoDataUrl);
    setStumpPhotoHash(sha256);
    addToast('Stump inspection photo captured and sealed with Web Crypto SHA-256', 'success');
  };

  // Submit Field Agent Felling
  const handleFellSubmit = (e) => {
    e.preventDefault();
    if (!fellingTarget) return;

    fieldAgentConfirmAndFell(fellingTarget.id, {
      cleanedHeartwoodKg: fellForm.cleanedHeartwoodKg,
      sapwoodChipsKg: fellForm.sapwoodChipsKg,
      resinGrade: fellForm.resinGrade,
      inspectorName: fellForm.inspectorName,
      stumpPhotoSha256: stumpPhotoHash || `sha256:${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`,
      stumpPhotoUrl: capturedStumpPhoto
    });

    setIsFellModalOpen(false);
    setFellingTarget(null);
  };

  const handleCopySha = (hash) => {
    if (!hash) return;
    navigator.clipboard?.writeText(hash);
    setCopiedHash(true);
    addToast('SHA-256 hash copied to clipboard', 'info');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Table Columns
  const columns = [
    {
      header: 'Application ID',
      accessor: 'id',
      render: (h) => (
        <div>
          <span className="font-extrabold text-slate-900 font-mono text-xs">{h.id}</span>
          <div className="text-[10px] text-slate-500 font-mono">{h.applicationDate}</div>
        </div>
      )
    },
    {
      header: 'Target Asset & Grower',
      accessor: 'treeId',
      render: (h) => {
        const info = getTreeAgeInfo(h);
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-emerald-800 font-mono text-xs">
                {h.targetAssetType === 'POLOGEN' ? (h.pologenId || h.treeId) : h.treeId}
              </span>
              {h.treeCount > 1 && (
                <span className="text-[9px] bg-slate-100 px-1 rounded font-bold text-slate-700">
                  {h.treeCount} trees
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-800 font-bold">{h.farmerName} ({h.farmerId})</div>
            <div className="text-[10px] text-slate-500 font-mono">{h.plantationName || h.plantationId}</div>
            <div className="mt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                🌱 Planted {info.plantingYear} • {info.ageYears} yrs
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Planting Year & Tree Age',
      accessor: 'treeAgeYears',
      render: (h) => {
        const info = getTreeAgeInfo(h);
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-extrabold text-slate-900 text-xs">
                Planted: {info.plantingYear}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                info.isMature 
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                Age: {info.ageYears} yrs {info.isMature ? '(≥7y Mature)' : '(<7y Young)'}
              </span>
            </div>
            <div className="text-[9px] text-slate-500 font-medium">
              Assam 7-Year Rule: {info.isMature ? '✓ Felling Permitted' : '⚠ Immature / Excluded'}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Addressed DFO Division & Applicant',
      accessor: 'dfoDivision',
      render: (h) => (
        <div className="space-y-0.5">
          <div className="font-bold text-xs text-slate-900 flex items-center gap-1">
            <Building className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="truncate max-w-[190px]" title={h.dfoDivision || 'DFO Golaghat Forest Division, Assam'}>
              {h.dfoDivision || 'DFO Golaghat Forest Division'}
            </span>
          </div>
          <div className="text-[10px] text-teal-800 font-semibold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 inline-block">
            {h.applicantMode === 'FIELD_AGENT' ? (
              <span>Agent on Behalf: {h.fieldAgent?.split(' ')[0] || 'Dipankar'}</span>
            ) : (
              <span>Grower Self-Application</span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Harvest Window & Estimated Qty',
      accessor: 'estimatedWeightKg',
      render: (h) => (
        <div>
          <div className="font-black text-slate-900 text-xs">
            {h.cleanedHeartwoodKg ? `${h.cleanedHeartwoodKg} kg (Actual Heartwood)` : `${h.estimatedQuantity || h.estimatedWeightKg || 38.0} ${h.quantityUnit ? h.quantityUnit.split(' ')[0] : 'kg'} (Est.)`}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{h.harvestWindowText || (h.harvestWindowStart ? `${h.harvestWindowStart} to ${h.harvestWindowEnd}` : 'Standard Window')}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Authorisation & DFO Order',
      accessor: 'dfoSanctionNumber',
      render: (h) => (
        <div>
          {h.harvestAuthorisationId && (
            <div className="font-mono font-black text-xs text-emerald-800">
              Auth: {h.harvestAuthorisationId}
            </div>
          )}
          <span className={`font-mono text-[11px] font-bold ${h.dfoSanctionNumber ? 'text-blue-900' : 'text-amber-800'}`}>
            {h.dfoSanctionNumber || 'Pending DFO Review'}
          </span>
          <div className="text-[10px] text-slate-500">
            {h.dfoSanctionDate ? `Sanctioned: ${h.dfoSanctionDate}` : (h.neramacVerifiedDate ? `NERAMAC Verified: ${h.neramacVerifiedDate}` : 'Under Initial Scrutiny')}
          </div>
        </div>
      )
    },
    {
      header: 'Workflow Stage (Approval Loop)',
      accessor: 'status',
      render: (h) => {
        if (h.status === 'SUBMITTED_AWAITING_NERAMAC') {
          return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
              1. AWAITING NERAMAC VERIFY
            </span>
          );
        }
        if (h.status === 'NERAMAC_VERIFIED_AWAITING_DFO' || h.status === 'SUBMITTED_AWAITING_DFO' || h.status === 'PENDING_DFO_SANCTION') {
          return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300">
              2. NERAMAC VERIFIED • AWAITING DFO
            </span>
          );
        }
        if (h.status === 'DFO_REJECTED_RETURNED_TO_FARMER') {
          return (
            <div className="space-y-0.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1 w-max">
                ✗ DFO REJECTED • LOOPED BACK
              </span>
              <div className="text-[9px] text-rose-700 italic max-w-xs truncate" title={h.rejectionReason}>
                {h.rejectionReason}
              </div>
            </div>
          );
        }
        if (h.status === 'DFO_APPROVED_AWAITING_FELLING') {
          return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-900 border border-teal-300">
              3. APPROVED • AUTHORISATION ISSUED
            </span>
          );
        }
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
            4. FELL COMPLETED • BATCH MINTED
          </span>
        );
      }
    },
    {
      header: 'Operational Actions',
      accessor: 'id',
      render: (h) => {
        const isFarmer = activeRole === 'FARMER';
        const isFieldAgent = activeRole === 'FIELD_AGENT';
        const isDfo = activeRole === 'FOREST_DEPT';
        const isAdmin = activeRole === 'NERAMAC_ADMIN' || activeRole === 'SUPER_ADMIN';

        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* STAGE 1: SUBMITTED -> AWAITING NERAMAC VERIFICATION */}
            {h.status === 'SUBMITTED_AWAITING_NERAMAC' && (
              <>
                {(isFieldAgent || isAdmin) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenNeramacModal(h);
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>NERAMAC Verify</span>
                  </button>
                )}
                {isFarmer && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ⏳ Awaiting Field Inspection
                  </span>
                )}
                {isDfo && (
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Pre-DFO Scrutiny
                  </span>
                )}
              </>
            )}

            {/* STAGE 2: NERAMAC VERIFIED -> AWAITING DFO SANCTION */}
            {(h.status === 'NERAMAC_VERIFIED_AWAITING_DFO' || h.status === 'SUBMITTED_AWAITING_DFO' || h.status === 'PENDING_DFO_SANCTION') && (
              <>
                {(isDfo || isAdmin) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDfoModal(h);
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition flex items-center gap-1 animate-pulse"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Issue DFO Sanction Order</span>
                  </button>
                )}
                {isFarmer && (
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    ⏳ Under DFO Review
                  </span>
                )}
                {isFieldAgent && (
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    ✓ Forwarded to DFO
                  </span>
                )}
              </>
            )}

            {/* STAGE 2b: DFO REJECTED -> RETURNED TO FARMER */}
            {h.status === 'DFO_REJECTED_RETURNED_TO_FARMER' && (
              <>
                {(isFarmer || isFieldAgent || isAdmin) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenResubmitModal(h);
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Correct &amp; Resubmit</span>
                  </button>
                )}
                {isDfo && (
                  <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Returned for Correction
                  </span>
                )}
              </>
            )}

            {/* STAGE 3: DFO APPROVED -> AWAITING FELLING */}
            {h.status === 'DFO_APPROVED_AWAITING_FELLING' && (
              <>
                {(isFieldAgent || isAdmin) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenFellModal(h);
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition flex items-center gap-1"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Record Felling &amp; Weigh</span>
                  </button>
                )}
                {isFarmer && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ DFO Sanctioned — Awaiting Felling
                  </span>
                )}
                {isDfo && (
                  <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    ✓ Sanctioned: {h.dfoSanctionNumber}
                  </span>
                )}
              </>
            )}

            {/* STAGE 4: FELL COMPLETED -> BATCH MINTED & e-TP */}
            {h.status === 'FELL_COMPLETED' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHarvest(h);
                  }}
                  className="px-2 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center gap-1"
                >
                  <QrCode className="w-3 h-3" />
                  <span>Batch Tag</span>
                </button>
                {(() => {
                  const b = harvestBatches.find(x => x.harvestId === h.id || x.treeId === h.treeId);
                  return b ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBatchForPass(b);
                      }}
                      className="px-2 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition flex items-center gap-1"
                    >
                      <FileBadge2 className="w-3 h-3" />
                      <span>State e-TP</span>
                    </button>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        );
      }
    }
  ];

  const isFarmerRole = activeRole === 'FARMER';
  const isFaRole = activeRole === 'FIELD_AGENT';
  const isDfoRole = activeRole === 'FOREST_DEPT';
  const isAdminRole = activeRole === 'NERAMAC_ADMIN' || activeRole === 'SUPER_ADMIN';

  // Filtered dataset subsets for role-specific queues
  const faPreHarvestData = harvests.filter(h => h.status === 'SUBMITTED_AWAITING_NERAMAC');
  const faFellingData = harvests.filter(h => h.status === 'DFO_APPROVED_AWAITING_FELLING');
  const dfoPendingData = harvests.filter(h => h.status === 'NERAMAC_VERIFIED_AWAITING_DFO' || h.status === 'SUBMITTED_AWAITING_DFO' || h.status === 'PENDING_DFO_SANCTION');
  const dfoSanctionedData = harvests.filter(h => h.status === 'DFO_APPROVED_AWAITING_FELLING' || h.status === 'FELL_COMPLETED' || h.dfoSanctionNumber);

  return (
    <div className="space-y-5">
      {/* 1. Master Role-Segregated Hero Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Phase 2: Statutory Approval &amp; Harvest Gate
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                /harvest
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-1">
              {isFarmerRole && 'Farmer Harvest Desk • Homestead Trees & Sanction Requests'}
              {isFaRole && 'Field Operations Desk • Pre-Harvest Verification & Supervised Felling'}
              {isDfoRole && 'DFO Statutory Desk • Agarwood Felling Sanctions & Transit Clearances'}
              {isAdminRole && 'Central Control Room • End-to-End Harvest Pipeline & Maker-Checker'}
              {!isFarmerRole && !isFaRole && !isDfoRole && !isAdminRole && 'Harvest Management & Custody Verification'}
            </h1>
            <p className="text-xs text-slate-500">
              {isFarmerRole && 'Submit harvest sanction applications for your mature trees (≥ 7 yrs), track DFO review status, and view your official State Forest e-Transit Passes.'}
              {isFaRole && 'On-ground biometric inspection of farmer homestead trees, verifying 7-year age rule & RFID barcodes, and supervising physical felling with digital scale weighment.'}
              {isDfoRole && 'Statutory felling authorization gate under Assam Agarwood Policy 2020. Review field agent verified dossiers and issue formal felling orders or return for deficiency rectification.'}
              {isAdminRole && 'Complete lifecycle governance: Farmer Application → NERAMAC Field Verification → DFO Statutory Sanction → Supervised Felling & Scale Weighment.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => resetToInitialData()}
              className="px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 shadow-xs"
              title="Restore demo database to clean initial baseline"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Demo State</span>
            </button>

            {(isFarmerRole || isAdminRole || isFaRole) && (
              <button
                onClick={() => setActiveTab('NEW_APP')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                  activeTab === 'NEW_APP'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{isFarmerRole ? 'Apply for Tree Harvest' : 'New Harvest Application'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Four-Stage Linear Chain of Custody Tracker */}
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 flex items-center gap-2 text-[11px] overflow-x-auto">
          <span className="font-bold text-amber-300 whitespace-nowrap">Chain of Custody:</span>
          
          <div className={`px-2.5 py-1 rounded font-semibold whitespace-nowrap flex items-center gap-1.5 ${isFarmerRole ? 'bg-emerald-800 text-white ring-2 ring-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
            <span>1. Farmer Application</span>
            {isFarmerRole && <span className="text-[9px] bg-emerald-600 px-1 py-0.2 rounded font-bold">You</span>}
          </div>
          <span className="text-slate-600">→</span>

          <div className={`px-2.5 py-1 rounded font-semibold whitespace-nowrap flex items-center gap-1.5 ${isFaRole ? 'bg-amber-800 text-white ring-2 ring-amber-400' : 'bg-slate-800 text-slate-300'}`}>
            <span>2. Field Agent Verification</span>
            {isFaRole && <span className="text-[9px] bg-amber-600 px-1 py-0.2 rounded font-bold">You</span>}
          </div>
          <span className="text-slate-600">→</span>

          <div className={`px-2.5 py-1 rounded font-semibold whitespace-nowrap flex items-center gap-1.5 ${isDfoRole ? 'bg-blue-800 text-white ring-2 ring-blue-400' : 'bg-slate-800 text-slate-300'}`}>
            <span>3. DFO Statutory Sanction</span>
            {isDfoRole && <span className="text-[9px] bg-blue-600 px-1 py-0.2 rounded font-bold">You</span>}
          </div>
          <span className="text-slate-600">→</span>

          <div className={`px-2.5 py-1 rounded font-semibold whitespace-nowrap flex items-center gap-1.5 ${isFaRole ? 'bg-teal-800 text-white ring-2 ring-teal-400' : 'bg-slate-800 text-slate-300'}`}>
            <span>4. Felling &amp; e-TP</span>
            {isFaRole && <span className="text-[9px] bg-teal-600 px-1 py-0.2 rounded font-bold">Field Execution</span>}
          </div>
        </div>

        {/* Role-Specific Perspective Pill */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-emerald-950 uppercase tracking-wider text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded">
              Role: {activeRole}
            </span>
            <span className="text-slate-700 font-semibold text-[11px]">
              {isFarmerRole && `Active Grower: ${currentFarmer?.name || 'Grower'} (${currentFarmer?.id || ''}) • Homestead ${currentFarmer?.dagNumber || ''}`}
              {isFaRole && 'Field Agent: Verify farmer applications and supervise digital scale felling'}
              {isDfoRole && 'Divisional Forest Officer: Review verified dossiers and issue felling sanctions'}
              {isAdminRole && 'Executive Maker-Checker: Real-time oversight across all harvest stages'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold">
            Rule: ≥ 7 Yrs Mature
          </span>
        </div>
      </div>

      {/* 2. Role-Segregated Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {/* FARMER TABS */}
        {isFarmerRole && (
          <>
            <button
              onClick={() => setActiveTab('FARMER_MY_APPS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'FARMER_MY_APPS'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Trees className="w-3.5 h-3.5" />
              <span>My Harvest Applications &amp; Status ({harvests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('NEW_APP')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'NEW_APP'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Apply for Tree Harvest</span>
            </button>

            <button
              onClick={() => setActiveTab('BATCHES')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'BATCHES'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileBadge2 className="w-3.5 h-3.5" />
              <span>My Felled Wood &amp; e-Transit Passes ({harvestBatches.length})</span>
            </button>
          </>
        )}

        {/* FIELD AGENT TABS */}
        {isFaRole && (
          <>
            <button
              onClick={() => setActiveTab('FA_PRE_HARVEST')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'FA_PRE_HARVEST'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Pre-Harvest Verification Queue ({faPreHarvestData.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('FA_FELLING')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'FA_FELLING'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Supervised Felling &amp; Scale Desk ({faFellingData.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('BATCHES')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'BATCHES'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>3. Mined Batches &amp; e-TPs ({harvestBatches.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('NEW_APP')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'NEW_APP'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assisted Harvest Filing</span>
            </button>
          </>
        )}

        {/* DFO STATUTORY TABS */}
        {isDfoRole && (
          <>
            <button
              onClick={() => setActiveTab('DFO_PENDING_SANCTIONS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'DFO_PENDING_SANCTIONS'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>1. Pending Statutory Felling Sanctions ({dfoPendingData.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('DFO_SANCTIONED')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'DFO_SANCTIONED'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>2. Sanctioned Orders Registry ({dfoSanctionedData.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('BATCHES')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'BATCHES'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileBadge2 className="w-3.5 h-3.5" />
              <span>3. State Forest e-Transit Passes ({harvestBatches.length})</span>
            </button>
          </>
        )}

        {/* ADMIN & OTHERS TABS */}
        {!isFarmerRole && !isFaRole && !isDfoRole && (
          <>
            <button
              onClick={() => setActiveTab('QUEUE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'QUEUE'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Axe className="w-3.5 h-3.5" />
              <span>All Harvest Operations ({harvests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('NEW_APP')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'NEW_APP'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Step 1: Farmer Harvest Application</span>
            </button>

            <button
              onClick={() => setActiveTab('BATCHES')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'BATCHES'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Mined Harvest Batches ({harvestBatches.length})</span>
            </button>
          </>
        )}
      </div>

      {/* VIEW: FARMER MY APPLICATIONS */}
      {activeTab === 'FARMER_MY_APPS' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 bg-white rounded-xl border border-emerald-200 flex-shrink-0">👨‍🌾</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-emerald-950 text-sm block">
                    {currentFarmer?.name}'s Harvest Applications ({farmerHarvests.length})
                  </span>
                  {farmers.length > 1 && (
                    <select
                      value={selectedFarmerId}
                      onChange={(e) => setSelectedFarmerId(e.target.value)}
                      className="text-[11px] font-semibold px-2 py-0.5 bg-white border border-emerald-300 rounded-md text-emerald-900"
                    >
                      {farmers.map(f => (
                        <option key={f.id} value={f.id}>Grower: {f.name} ({f.id})</option>
                      ))}
                    </select>
                  )}
                </div>
                <span className="text-slate-600 text-[11px]">
                  Plot: {currentFarmer?.village} ({currentFarmer?.dagNumber}) • {farmerMatureTrees.length} unharvested mature trees remaining
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {farmerMatureTrees.length === 0 && (
                <button
                  type="button"
                  onClick={() => rearmFarmerTrees(currentFarmer.id)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
                >
                  ↻ Re-arm 4 Trees
                </button>
              )}
              <button
                onClick={() => setActiveTab('NEW_APP')}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs transition"
              >
                + Apply for Mature Tree
              </button>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={farmerHarvests}
            searchKey="treeId"
            searchPlaceholder="Search your harvest applications..."
            onRowClick={(h) => setSelectedHarvest(h)}
          />
        </div>
      )}

      {/* VIEW: FIELD AGENT PRE-HARVEST VERIFICATION QUEUE */}
      {activeTab === 'FA_PRE_HARVEST' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <div>
              <span className="font-extrabold text-amber-950 block">Step 2: Pre-Harvest Field Verification Queue</span>
              <span className="text-slate-600 text-[11px]">
                Inspect on-site homestead origin, verify tree RFID tag barcode, measure girth at breast height (GBH), and verify Assam 7-year non-forest maturity prior to endorsing for DFO sanction.
              </span>
            </div>
          </div>
          {faPreHarvestData.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-bold text-slate-800">All Field Verifications Completed</div>
              <p className="text-xs text-slate-500">There are no pending harvest applications awaiting on-ground inspection.</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={faPreHarvestData}
              searchKey="treeId"
              searchPlaceholder="Search trees awaiting field verification..."
              onRowClick={(h) => setSelectedHarvest(h)}
            />
          )}
        </div>
      )}

      {/* VIEW: FIELD AGENT FELLING & WEIGHMENT DESK */}
      {activeTab === 'FA_FELLING' && (
        <div className="space-y-4">
          <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 text-xs flex items-center gap-3">
            <Scale className="w-5 h-5 text-teal-700 flex-shrink-0" />
            <div>
              <span className="font-extrabold text-teal-950 block">Step 4: Supervised Felling &amp; Net Scale Weighment</span>
              <span className="text-slate-600 text-[11px]">
                Trees with official DFO statutory sanction orders ready for execution. Supervise physical tree felling, capture stump photo with SHA-256 seal, record gross tare and heartwood kg, and mint physical RFID Harvest Batch Tag.
              </span>
            </div>
          </div>
          {faFellingData.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-bold text-slate-800">No Trees Awaiting Felling</div>
              <p className="text-xs text-slate-500">Once the DFO issues a statutory felling sanction order, approved applications will appear here for supervised weighment.</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={faFellingData}
              searchKey="treeId"
              searchPlaceholder="Search DFO sanctioned trees ready to fell..."
              onRowClick={(h) => setSelectedHarvest(h)}
            />
          )}
        </div>
      )}

      {/* VIEW: DFO PENDING SANCTIONS */}
      {activeTab === 'DFO_PENDING_SANCTIONS' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-blue-700 flex-shrink-0" />
            <div>
              <span className="font-extrabold text-blue-950 block">Step 3: DFO Statutory Decision Gate (Assam Agarwood Policy 2020)</span>
              <span className="text-slate-600 text-[11px]">
                Applications verified by NERAMAC Field Agents. Review land revenue title (Jamabandi/Dag/Patta), Lat Mandal certificate, verified planting year, and issue formal order (e.g. DFO/GLT/2026/HARV-...) or reject with legal grounds.
              </span>
            </div>
          </div>
          {dfoPendingData.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-bold text-slate-800">No Applications Pending DFO Decision</div>
              <p className="text-xs text-slate-500">All field-verified dossiers have been reviewed and sanctioned.</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={dfoPendingData}
              searchKey="treeId"
              searchPlaceholder="Search applications awaiting DFO sanction..."
              onRowClick={(h) => setSelectedHarvest(h)}
            />
          )}
        </div>
      )}

      {/* VIEW: DFO SANCTIONED ORDERS REGISTRY */}
      {activeTab === 'DFO_SANCTIONED' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <div>
              <span className="font-extrabold text-slate-900 block">DFO Sanctioned Orders &amp; Quota Registry</span>
              <span className="text-slate-600 text-[11px]">Official repository of all statutory felling authorizations issued under the Assam Forest Regulation &amp; 2020 Policy.</span>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={dfoSanctionedData}
            searchKey="treeId"
            searchPlaceholder="Search sanctioned felling orders..."
            onRowClick={(h) => setSelectedHarvest(h)}
          />
        </div>
      )}

      {/* VIEW: ADMIN / GENERAL OPERATIONAL QUEUE */}
      {activeTab === 'QUEUE' && (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={harvests}
            searchKey="treeId"
            searchPlaceholder="Search by Tree ID, Farmer, or DFO Sanction Order..."
            onRowClick={(h) => setSelectedHarvest(h)}
          />
        </div>
      )}

      {/* TAB 2: SEPARATE ROLE-SPECIFIC HARVEST FORMS */}
      {/* 2A. FARMER DIRECT APPLICATION (CLEAN & SINGLE-PURPOSE) */}
      {activeTab === 'NEW_APP' && isFarmerRole && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                Grower Harvest Request
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Assam 7-Yr Maturity Rule
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1">
              Apply for Agarwood Tree Felling Sanction
            </h2>
            <p className="text-xs text-slate-500">
              Request felling clearance for your mature tree. Your request will be verified on-site by the Field Agent before DFO approval.
            </p>
          </div>

          <form onSubmit={handleFarmerDirectSubmit} className="space-y-4 text-xs">
            {/* 1. Verified Grower & Plot Info (Pre-filled & Locked) */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-emerald-950 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>Registered Homestead Titleholder</span>
                </span>
                {farmers.length > 1 && (
                  <select
                    value={selectedFarmerId}
                    onChange={(e) => setSelectedFarmerId(e.target.value)}
                    className="text-[11px] font-semibold px-2 py-0.5 bg-white border border-emerald-300 rounded-md text-emerald-900"
                  >
                    {farmers.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.id})</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Grower Name:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{currentFarmer?.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Farmer ID:</span>
                  <span className="font-mono font-bold text-emerald-800">{currentFarmer?.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Village / Mouza:</span>
                  <span className="font-bold text-slate-800">{currentFarmer?.village}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Revenue Title:</span>
                  <span className="font-bold text-slate-800">{currentFarmer?.dagNumber}</span>
                </div>
              </div>
            </div>

            {/* 2. Select Mature Tree */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                  <Trees className="w-4 h-4 text-emerald-700" />
                  <span>Select Mature Tree to Fell (≥ 7 Years) *</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {farmerMatureTrees.length} Mature Available
                </span>
              </div>

              {farmerMatureTrees.length === 0 ? (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 flex items-center justify-between">
                  <span>All mature trees for this homestead have been harvested or are in queue.</span>
                  <button
                    type="button"
                    onClick={() => rearmFarmerTrees(currentFarmer.id)}
                    className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-bold text-xs hover:bg-amber-700"
                  >
                    ↻ Re-arm 4 Trees
                  </button>
                </div>
              ) : (
                <select
                  value={farmerSelectedTreeId}
                  onChange={(e) => setFarmerSelectedTreeId(e.target.value)}
                  className="w-full text-xs font-mono font-bold px-3 py-2.5 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                >
                  {farmerMatureTrees.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.id} — Planted {t.plantingYear} ({t.ageYears} yrs) • {t.variety || 'Aquilaria malaccensis'}
                    </option>
                  ))}
                </select>
              )}

              {(() => {
                const sel = farmerMatureTrees.find(t => t.id === farmerSelectedTreeId) || farmerMatureTrees[0];
                if (!sel) return null;
                return (
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-400 block font-bold">Age</span>
                      <span className="font-bold text-emerald-800">{sel.ageYears} Years Old</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">Species</span>
                      <span className="font-bold text-slate-700 italic">{sel.variety || 'Aquilaria malaccensis'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">Resin Core</span>
                      <span className="font-bold text-slate-700">Dense Oleoresin</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 3. Harvest Date & Estimated Cleaned Heartwood Weight */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Proposed Harvest Date *
                </label>
                <input
                  type="date"
                  required
                  value={farmerHarvestDate}
                  onChange={(e) => setFarmerHarvestDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Estimated Cleaned Heartwood (kg) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="150"
                  required
                  value={farmerEstimatedWeight}
                  onChange={(e) => setFarmerEstimatedWeight(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white font-bold text-emerald-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Reason for Felling *
                </label>
                <select
                  value={farmerReason}
                  onChange={(e) => setFarmerReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white font-medium text-slate-800"
                >
                  <option value="Resin maturity reached 24 months post-inoculation (AAU certified strain).">
                    Resin maturity reached 24 months post-inoculation (AAU certified strain)
                  </option>
                  <option value="Core drill test reveals dense dark oleoresin heartwood saturation.">
                    Core drill test reveals dense dark oleoresin heartwood saturation
                  </option>
                  <option value="Tree mature (≥ 7 yrs); scheduled harvest for cluster aggregation depot.">
                    Tree mature (≥ 7 yrs); scheduled harvest for cluster aggregation depot
                  </option>
                </select>
              </div>
            </div>

            {/* Confirmation & Submit */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={farmerDeclaration}
                  onChange={(e) => setFarmerDeclaration(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>I confirm this mature tree is grown on my private homestead plot under Assam Agarwood Policy 2020.</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('FARMER_MY_APPS')}
                className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-xs transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Submit Harvest Application</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2B. FIELD AGENT / ADMIN ASSISTED APPLICATION */}
      {activeTab === 'NEW_APP' && !isFarmerRole && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded">
                Field Operations Desk
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Assisted Application
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1">
              File Assisted Harvest Request on Grower's Behalf
            </h2>
            <p className="text-xs text-slate-500">
              Submit a formal harvest authorization dossier for a registered grower homestead plot.
            </p>
          </div>

          <form onSubmit={handleFarmerSubmit} className="space-y-4 text-xs">
            {/* Select Farmer */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Registered Grower *
                </label>
                <select
                  value={selectedFarmerId}
                  onChange={(e) => setSelectedFarmerId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border rounded-lg bg-white font-bold text-slate-900"
                >
                  {farmers.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.id}) — {f.village} ({f.dagNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Tree */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Grower's Mature Tree (≥ 7 Yrs) *
                </label>
                <select
                  value={selectedTreeIds[0] || ''}
                  onChange={(e) => setSelectedTreeIds([e.target.value])}
                  className="w-full text-xs font-mono font-bold px-3 py-2.5 border rounded-lg bg-white text-slate-900"
                >
                  {availableTrees.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.id} — Planted {t.plantingYear} ({t.ageYears} yrs) • {t.variety || 'Aquilaria malaccensis'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Harvest Window & Estimated Volume */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Harvest Window Start *</label>
                <input
                  type="date"
                  required
                  value={harvestWindowStart}
                  onChange={e => setHarvestWindowStart(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Estimated Cleaned Heartwood (kg) *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={estimatedQuantity}
                  onChange={e => setEstimatedQuantity(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('FA_PRE_HARVEST')}
                className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-xs transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Submit Assisted Application</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: HARVEST BATCHES REGISTRY */}
      {activeTab === 'BATCHES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(isFarmerRole ? farmerBatches : harvestBatches).map(batch => (
            <div key={batch.id} className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <span className="font-mono font-black text-sm text-emerald-900">{batch.id}</span>
                  <div className="text-[10px] text-slate-500 font-mono">From Tree: {batch.treeId}</div>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {batch.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Grower:</span>
                  <span className="font-bold text-slate-800">{batch.farmerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tree Origin & Age:</span>
                  <span className="font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {(() => {
                      const info = getTreeAgeInfo(batch);
                      return `Planted ${info.plantingYear} • ${info.ageYears} yrs`;
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Certified Net Weight:</span>
                  <span className="font-black text-slate-900 text-sm">{batch.netWeightKg} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Resin Grade:</span>
                  <span className="font-semibold text-emerald-800">{batch.resinGrade}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">DFO Felling Sanction:</span>
                  <span className="font-mono text-slate-800 font-bold">{resolveBatchFellingOrder(batch)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Transit Pass (e-TP):</span>
                  <span className="font-mono text-emerald-800 font-bold">{batch.transitPassNumber}</span>
                </div>
              </div>

              {batch.stumpPhotoSha256 && (
                <div className="p-2 bg-slate-50 rounded-lg font-mono text-[10px] text-slate-600 truncate border border-slate-200">
                  <span className="text-slate-400">Stump SHA: </span>{batch.stumpPhotoSha256}
                </div>
              )}

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedBatchForPass(batch)}
                  className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-850 border border-emerald-300 rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>View Official e-Transit Pass (e-TP)</span>
                </button>

                {batch.status !== 'DISTILLED' && (
                  <button
                    type="button"
                    onClick={() => {
                      const fellingNo = resolveBatchFellingOrder(batch);
                      setDispatchIntent({
                        type: 'FARM_TO_AGGREGATOR',
                        batchId: batch.id,
                        transitPassNumber: batch.transitPassNumber,
                        fellingOrderNumber: fellingNo,
                        treeId: batch.treeId
                      });
                      navigate('/movement');
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Dispatch Farm to Aggregator (Step 14)</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NERAMAC VERIFICATION MODAL */}
      {isNeramacModalOpen && neramacTarget && (
        <Modal
          isOpen={isNeramacModalOpen}
          onClose={() => setIsNeramacModalOpen(false)}
          title={`NERAMAC Field Verification • Tree ${neramacTarget.treeId}`}
          subtitle={`Applicant: ${neramacTarget.farmerName} • Application ID: ${neramacTarget.id}`}
        >
          <form onSubmit={handleNeramacSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="font-bold text-amber-900">Field Agent Verification Step:</span>
              <p className="text-[11px] text-amber-800">
                Confirm on-site physical inspection of homestead agarwood tree, RFID tag, and Jamabandi land revenue Patta before forwarding to the Divisional Forest Officer (DFO).
              </p>
            </div>

            {/* Tree Age & Planting Year Verification Card */}
            {(() => {
              const info = getTreeAgeInfo(neramacTarget);
              return (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-950 text-xs">Tree Age & Planting Year Audit:</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {info.isMature ? '✓ Statutory Age Qualified (≥7 Yrs)' : '⚠ Underage (<7 Yrs)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-white p-2 rounded-lg border border-emerald-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Target Tree ID:</span>
                      <span className="font-bold text-slate-800">{neramacTarget.treeId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Planting Year:</span>
                      <span className="font-bold text-blue-900">{info.plantingYear}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tree Age:</span>
                      <span className="font-bold text-emerald-800">{info.ageYears} Years Old</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-emerald-800 font-medium">
                    Verified against grower's registration baseline. Confirmed private homestead plantation.
                  </div>
                </div>
              );
            })()}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Verifying NERAMAC Officer Name & Designation *
              </label>
              <input
                type="text"
                required
                value={neramacForm.officerName}
                onChange={e => setNeramacForm({ ...neramacForm, officerName: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Field Inspection & Tree Verification Notes *
              </label>
              <textarea
                rows={3}
                required
                value={neramacForm.notes}
                onChange={e => setNeramacForm({ ...neramacForm, notes: e.target.value })}
                className="w-full text-xs p-3 border rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNeramacModalOpen(false)}
                className="px-4 py-2 border rounded-xl font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Forward to DFO</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DFO APPROVAL DECISION GATE MODAL (Approved? Yes -> Authorisation ID / No -> Back to Harvest Application) */}
      {isDfoModalOpen && dfoTarget && (
        <Modal
          isOpen={isDfoModalOpen}
          onClose={() => setIsDfoModalOpen(false)}
          title={`DFO Statutory Approval Decision Gate • Tree ${dfoTarget.treeId}`}
          subtitle={`Forest Department Authority • Application ID: ${dfoTarget.id}`}
        >
          <form onSubmit={handleDfoSubmit} className="space-y-4 text-xs">
            {/* Target Application Summary */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-700" />
                  <span>Addressed Forest Division:</span>
                </span>
                <span className="font-bold text-emerald-800">{dfoTarget.dfoDivision || 'DFO Golaghat Forest Division, Assam'}</span>
              </div>

              {/* DFO Tree Age & Planting Year Statutory Audit Gate */}
              {(() => {
                const info = getTreeAgeInfo(dfoTarget);
                return (
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-blue-950 text-xs flex items-center gap-1.5">
                        <Trees className="w-4 h-4 text-blue-700" />
                        <span>DFO Tree Age & Planting Statutory Audit Gate</span>
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        info.isMature ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300'
                      }`}>
                        {info.isMature ? '✓ AGE COMPLIANT (≥ 7 YRS)' : '✗ INSUFFICIENT AGE'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs bg-white p-2 rounded-lg border border-blue-100">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Target Tree</span>
                        <span className="font-mono font-bold text-slate-900">{dfoTarget.treeId}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Year Planted</span>
                        <span className="font-mono font-bold text-blue-900">{info.plantingYear}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Verified Tree Age</span>
                        <span className="font-mono font-black text-emerald-800">{info.ageYears} Years Old</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-blue-900">
                      <strong>Assam Agarwood Policy 2020 Clause 2.6:</strong> Tree planted in <strong>{info.plantingYear}</strong> ({info.ageYears} years old) meets the mandatory 7-year age rule for legal felling on private revenue land.
                    </div>
                  </div>
                );
              })()}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Applicant Capacity:</span>
                  <span className="font-bold text-slate-800">
                    {dfoTarget.applicantMode === 'FIELD_AGENT' ? `Field Agent: ${dfoTarget.fieldAgent}` : 'Grower Direct'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Grower / Custodian:</span>
                  <span className="font-bold text-slate-800">{dfoTarget.farmerName} ({dfoTarget.farmerId})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Plantation Parcel:</span>
                  <span className="font-bold text-slate-800">{dfoTarget.plantationName || dfoTarget.plantationId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Target Asset:</span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {dfoTarget.targetAssetType === 'POLOGEN' ? `POLOGEN: ${dfoTarget.pologenId || dfoTarget.treeId}` : `Tree: ${dfoTarget.treeId} (${dfoTarget.treeCount || 1} trees)`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Proposed Window:</span>
                  <span className="font-bold text-slate-800">{dfoTarget.harvestWindowText || (dfoTarget.harvestWindowStart ? `${dfoTarget.harvestWindowStart} to ${dfoTarget.harvestWindowEnd}` : 'Next 15 Days')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Est. Cleaned Qty:</span>
                  <span className="font-black text-slate-900">{dfoTarget.estimatedQuantity || dfoTarget.estimatedWeightKg || 38.0} {dfoTarget.quantityUnit || 'kg'}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-700">Reason / Justification: </span>
                {dfoTarget.reasonForHarvest}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200">
                <div>
                  <span className="text-slate-500 font-bold block">Inoculation History Relied:</span>
                  <span className="text-slate-700">{dfoTarget.inoculationHistory?.compound || 'Bio-Inoculant Formulation AS-9'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Statutory Patta NOC Ref:</span>
                  <span className="font-mono text-emerald-800">{dfoTarget.statutoryPermissionRef || 'REV/GLT/PATTA-78/NOC-2025/112'}</span>
                </div>
              </div>
              {dfoTarget.photoSha256 && (
                <div className="p-2 bg-slate-900 rounded-lg text-white flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Photo SHA-256: {dfoTarget.photoSha256.slice(0, 24)}...</span>
                  <span className="text-emerald-400 font-bold">✓ Geo-Watermarked</span>
                </div>
              )}
            </div>

            {/* Decision Gateway Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setDfoDecisionTab('APPROVE')}
                className={`py-2 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 ${
                  dfoDecisionTab === 'APPROVE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Decision: YES (Issue Authorisation ID)</span>
              </button>

              <button
                type="button"
                onClick={() => setDfoDecisionTab('REJECT')}
                className={`py-2 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 ${
                  dfoDecisionTab === 'REJECT'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>Decision: NO (Loop Back to App)</span>
              </button>
            </div>

            {dfoDecisionTab === 'APPROVE' ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-900">Sanction Approval & Authorisation ID Generation:</span>
                  <p className="text-[11px] text-emerald-800">
                    Homestead revenue land validated. Generating statutory Harvest Authorisation ID and felling clearance order.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Harvest Authorisation ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={dfoForm.harvestAuthorisationId}
                      onChange={e => setDfoForm({ ...dfoForm, harvestAuthorisationId: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-emerald-300 bg-emerald-50/50 rounded-lg font-mono font-bold text-emerald-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Official DFO Sanction Order Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={dfoForm.dfoSanctionNumber}
                      onChange={e => setDfoForm({ ...dfoForm, dfoSanctionNumber: e.target.value })}
                      className="w-full text-xs px-3 py-2 border rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Approved Harvest Quota (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={dfoForm.approvedMaxWeightKg}
                      onChange={e => setDfoForm({ ...dfoForm, approvedMaxWeightKg: e.target.value })}
                      className="w-full text-xs px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Sanctioning Forest Officer Name & Title
                    </label>
                    <input
                      type="text"
                      value={dfoForm.dfoOfficerName}
                      onChange={e => setDfoForm({ ...dfoForm, dfoOfficerName: e.target.value })}
                      className="w-full text-xs px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Statutory Felling Clearance Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={dfoForm.remarks}
                    onChange={e => setDfoForm({ ...dfoForm, remarks: e.target.value })}
                    className="w-full text-xs p-2.5 border rounded-lg"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <span className="font-bold text-rose-900">Decision: Rejected & Return to Harvest Application:</span>
                  <p className="text-[11px] text-rose-800">
                    If revenue documents, homestead boundaries, or tree RFID records have discrepancies, the application loops back to the farmer for correction.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-rose-900 mb-1">
                    Deficiency Note / Rejection Reason (Returned to Farmer) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={dfoForm.rejectionReason}
                    onChange={e => setDfoForm({ ...dfoForm, rejectionReason: e.target.value })}
                    className="w-full text-xs p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDfoModalOpen(false)}
                className="px-4 py-2 border rounded-xl font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs ${
                  dfoDecisionTab === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-700 hover:bg-rose-800'
                }`}
              >
                {dfoDecisionTab === 'APPROVE' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Issue Authorisation ID</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Reject & Loop Back to Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* FARMER RESUBMIT APPLICATION MODAL (Loop-back resolution) */}
      {isResubmitModalOpen && resubmitTarget && (
        <Modal
          isOpen={isResubmitModalOpen}
          onClose={() => setIsResubmitModalOpen(false)}
          title={`Correct & Resubmit Harvest Application • ${resubmitTarget.id}`}
          subtitle={`Tree: ${resubmitTarget.treeId} • Grower: ${resubmitTarget.farmerName}`}
        >
          <form onSubmit={handleResubmitSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <span className="font-bold text-rose-900">DFO Stated Deficiency:</span>
              <p className="text-[11px] text-rose-800 italic">
                "{resubmitTarget.rejectionReason}"
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Estimated Cleaned Heartwood (kg) *
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={resubmitForm.estimatedWeightKg}
                onChange={e => setResubmitForm({ ...resubmitForm, estimatedWeightKg: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Correction & Updated Revenue Document Notes *
              </label>
              <textarea
                rows={3}
                required
                value={resubmitForm.correctedNotes}
                onChange={e => setResubmitForm({ ...resubmitForm, correctedNotes: e.target.value })}
                className="w-full text-xs p-3 border rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResubmitModalOpen(false)}
                className="px-4 py-2 border rounded-xl font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Resubmit to NERAMAC</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* FIELD AGENT FELLING & WEIGHMENT MODAL (Step 3) */}
      {isFellModalOpen && fellingTarget && (
        <Modal
          isOpen={isFellModalOpen}
          onClose={() => {
            if (fellStreamRef.current) {
              fellStreamRef.current.getTracks().forEach(t => t.stop());
              fellStreamRef.current = null;
            }
            if (videoRef.current) {
              videoRef.current.srcObject = null;
            }
            setIsWebcamActive(false);
            setIsFellModalOpen(false);
          }}
          title={`Field Agent Felling & Certified Scale Weighment`}
          subtitle={`Target Tree: ${fellingTarget.treeId} • DFO Order: ${fellingTarget.dfoSanctionNumber}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleFellSubmit} className="space-y-4 text-xs">
            {/* Tree RFID Confirmation */}
            {(() => {
              const info = getTreeAgeInfo(fellingTarget);
              return (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Tree RFID & Age Confirmation</span>
                    <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      Planted {info.plantingYear} • {info.ageYears} yrs old
                    </span>
                  </div>
                  <div className="font-mono font-bold text-emerald-950 text-xs">
                    ✓ Verified on-site: Tree {fellingTarget.treeId} (Planted in {info.plantingYear}, Age {info.ageYears} yrs)
                  </div>
                  <div className="text-[10px] text-slate-600">
                    DFO Felling Order: <span className="font-mono font-bold text-blue-900">{fellingTarget.dfoSanctionNumber}</span>
                  </div>
                </div>
              );
            })()}

            {/* Weighment inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Certified Cleaned Heartwood Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={fellForm.cleanedHeartwoodKg}
                  onChange={e => setFellForm({ ...fellForm, cleanedHeartwoodKg: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg font-mono font-bold text-emerald-900"
                />
                <span className="text-[10px] text-slate-500">Digital scale reading at farm gate</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Extracted Sapwood & Chips (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fellForm.sapwoodChipsKg}
                  onChange={e => setFellForm({ ...fellForm, sapwoodChipsKg: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Resin Visual Grade
                </label>
                <select
                  value={fellForm.resinGrade}
                  onChange={e => setFellForm({ ...fellForm, resinGrade: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="GRADE_A_DARK_RESIN">Grade-A Dark Resinous Slices</option>
                  <option value="GRADE_B_BROWN_CHIPS">Grade-B Brown Heartwood Chips</option>
                  <option value="MIXED_DISTILLATION_GRADE">Mixed Distillation Grade</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Supervising Field Officer Name
                </label>
                <input
                  type="text"
                  value={fellForm.inspectorName}
                  onChange={e => setFellForm({ ...fellForm, inspectorName: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* REAL CAMERA CAPTURE SECTION */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs">Stump & Felled Log Photographic Proof (Real Camera)</span>
                </div>
                <button
                  type="button"
                  onClick={toggleWebcam}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                    isWebcamActive ? 'bg-red-900 text-red-200' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {isWebcamActive ? <VideoOff className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                  <span>{isWebcamActive ? 'Stop Camera' : 'Start Real Camera'}</span>
                </button>
              </div>

              {/* Viewport container */}
              <div className="relative h-48 bg-stone-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                <video
                  ref={(el) => {
                    if (el && fellStreamRef.current && el.srcObject !== fellStreamRef.current) {
                      el.srcObject = fellStreamRef.current;
                      el.play().catch(e => console.warn('Harvest camera play error:', e));
                    }
                    videoRef.current = el;
                  }}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover ${isWebcamActive ? 'block' : 'hidden'}`}
                />

                {!isWebcamActive && !capturedStumpPhoto && (
                  <div className="text-center text-slate-400 space-y-1">
                    <Camera className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-[11px]">Click "Capture Photo" below to record tamper-evident stump proof</p>
                  </div>
                )}

                {capturedStumpPhoto && !isWebcamActive && (
                  <img src={capturedStumpPhoto} alt="Captured Stump" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{capturedStumpPhoto ? 'Retake Photo' : 'Capture Stump Photo'}</span>
                </button>

                {stumpPhotoHash && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-300 truncate max-w-xs">
                    <span className="text-slate-400">SHA-256:</span>
                    <span className="truncate">{stumpPhotoHash.slice(0, 16)}...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFellModalOpen(false)}
                className="px-4 py-2 border rounded-xl font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Felling & Mint Harvest Batch</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Detail Harvest Application & Batch Record Modal */}
      {selectedHarvest && (
        <Modal
          isOpen={!!selectedHarvest}
          onClose={() => setSelectedHarvest(null)}
          title={`Harvest Application & Felling Approval Record: ${selectedHarvest.id}`}
          subtitle={`Target: ${selectedHarvest.treeId} • Grower: ${selectedHarvest.farmerName} (${selectedHarvest.farmerId})`}
        >
          <div className="space-y-4 text-xs">
            {/* Division and Status */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Addressed Forest Division</span>
                <span className="font-extrabold text-slate-900 text-xs">{selectedHarvest.dfoDivision || 'DFO Golaghat Forest Division, Assam'}</span>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                {selectedHarvest.status}
              </span>
            </div>

            {/* Core Attributes Grid */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Applicant Mode</span>
                <div className="font-bold text-slate-800">{selectedHarvest.applicantMode === 'FIELD_AGENT' ? `Field Agent (${selectedHarvest.fieldAgent?.split(' ')[0] || 'Dipankar'})` : 'Grower Direct'}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Plantation Parcel</span>
                <div className="font-bold text-slate-800">{selectedHarvest.plantationName || selectedHarvest.plantationId}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Target Asset</span>
                <div className="font-mono font-bold text-emerald-800">{selectedHarvest.treeId} ({selectedHarvest.treeCount || 1} tree)</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Planting Year & Age</span>
                <div className="font-bold text-emerald-800">
                  {(() => {
                    const info = getTreeAgeInfo(selectedHarvest);
                    return `Planted ${info.plantingYear} (${info.ageYears} yrs)`;
                  })()}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Harvest Window</span>
                <div className="font-bold text-slate-800">{selectedHarvest.harvestWindowText || (selectedHarvest.harvestWindowStart ? `${selectedHarvest.harvestWindowStart} to ${selectedHarvest.harvestWindowEnd}` : 'Standard Window')}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Cleaned Weight</span>
                <div className="font-black text-slate-900 text-sm">
                  {selectedHarvest.cleanedHeartwoodKg ? `${selectedHarvest.cleanedHeartwoodKg} kg (Actual)` : `${selectedHarvest.estimatedQuantity || selectedHarvest.estimatedWeightKg || 38.0} ${selectedHarvest.quantityUnit || 'kg'} (Est.)`}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">DFO Sanction Order</span>
                <div className="font-mono font-bold text-blue-900">{selectedHarvest.dfoSanctionNumber || 'Pending DFO Review'}</div>
              </div>
            </div>

            {/* Inoculation & Reason */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Reason for Harvest & Maturity Rule:</span>
                <p className="text-[11px] text-slate-700 mt-0.5">{selectedHarvest.reasonForHarvest}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="font-bold text-slate-500 block">Inoculation Compound:</span>
                  <span className="text-slate-800">{selectedHarvest.inoculationHistory?.compound || 'Bio-Inoculant AS-9'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">Statutory Patta NOC:</span>
                  <span className="font-mono text-emerald-800">{selectedHarvest.statutoryPermissionRef || 'REV/GLT/PATTA-78/NOC-2025/112'}</span>
                </div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Hashes */}
            <div className="space-y-1.5 font-mono text-[10px]">
              {selectedHarvest.photoSha256 && (
                <div className="p-2 bg-slate-900 text-white rounded-lg flex items-center justify-between">
                  <span className="text-slate-400">Tree Photo SHA-256: {selectedHarvest.photoSha256.slice(0, 24)}...</span>
                  <span className="text-emerald-400 font-bold">✓ Geo-Tagged</span>
                </div>
              )}
              {selectedHarvest.stumpPhotoHash && (
                <div className="p-2 bg-slate-900 text-white rounded-lg flex items-center justify-between">
                  <span className="text-slate-400">Stump Photo SHA-256: {selectedHarvest.stumpPhotoHash.slice(0, 24)}...</span>
                  <span className="text-emerald-400 font-bold">✓ Felling Stamped</span>
                </div>
              )}
              {selectedHarvest.batchGeneratedId && (
                <div className="p-2.5 bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-lg flex items-center justify-between">
                  <span className="font-bold">Minted Harvest Batch: {selectedHarvest.batchGeneratedId}</span>
                  <span className="font-bold text-emerald-700">Ready for Aggregation / CPC</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedHarvest(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700"
              >
                Close Record
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Official State Forest e-Transit Pass (Form II) Certificate */}
      {selectedBatchForPass && (
        <Modal
          isOpen={!!selectedBatchForPass}
          onClose={() => setSelectedBatchForPass(null)}
          title={`State Forest e-Transit Pass (e-TP) • ${selectedBatchForPass.transitPassNumber}`}
          subtitle={`Form II Transit Clearance under Assam Forest Regulation 1891 • Batch ${selectedBatchForPass.id}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Official Pass Header */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white space-y-2 shadow-sm border border-emerald-700">
              <div className="flex items-center justify-between border-b border-emerald-700/70 pb-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-black block">
                    Government of Assam • Environment and Forest Department
                  </span>
                  <h3 className="text-sm font-black mt-0.5 text-white">
                    Electronic State Forest Transit Pass (e-TP) — Form II
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded bg-emerald-500/30 text-emerald-100 border border-emerald-400">
                  STATUTORY VALID
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between text-[11px] text-emerald-100 pt-1 font-semibold">
                <span><strong className="text-white">Pass No:</strong> {selectedBatchForPass.transitPassNumber}</span>
                <span><strong className="text-white">Legal Ref:</strong> Assam Forest Regulation 1891 & Agarwood Policy 2020 Clause 2.6</span>
              </div>
            </div>

            {/* Tree & Batch Provenance Linked Grid */}
            {(() => {
              const info = getTreeAgeInfo(selectedBatchForPass);
              return (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <Trees className="w-4 h-4 text-emerald-700" />
                      <span>Linked Tree & Provenance Verification</span>
                    </span>
                    <span className="text-[10px] font-mono font-black bg-white text-emerald-900 px-2 py-0.5 rounded border border-emerald-400 shadow-2xs">
                      Maturity Verified (≥7 Yrs)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white p-3 rounded-xl border border-emerald-200 text-xs shadow-2xs">
                    <div>
                      <span className="text-[10px] text-slate-600 block font-bold">Origin Tree ID:</span>
                      <span className="font-mono font-black text-emerald-950">{selectedBatchForPass.treeId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 block font-bold">Planting Year & Age:</span>
                      <span className="font-extrabold text-slate-900">
                        {info.plantingYear} ({info.ageYears} Years)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 block font-bold">Harvest Batch ID:</span>
                      <span className="font-mono font-black text-slate-900">{selectedBatchForPass.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 block font-bold">Certified Net Weight:</span>
                      <span className="font-mono font-black text-emerald-950">{selectedBatchForPass.netWeightKg} kg</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-800 bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                    <div>
                      <span className="text-slate-600 block text-[10px] font-bold">Grower / Beneficiary:</span>
                      <span className="font-extrabold text-slate-900">{selectedBatchForPass.farmerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[10px] font-bold">DFO Felling Sanction Order:</span>
                      <span className="font-mono font-black text-teal-900">
                        {resolveBatchFellingOrder(selectedBatchForPass)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[10px] font-bold">Origin Point:</span>
                      <span className="font-bold text-slate-900">{selectedBatchForPass.farmerName} Homestead (Golaghat)</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[10px] font-bold">Permitted Destination:</span>
                      <span className="font-extrabold text-emerald-950">Golaghat Cluster Aggregation Depot</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Cryptographic Security Seal */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-[10px]">
              <div className="flex items-center justify-between text-slate-700 font-sans font-bold">
                <span>Cryptographic Security & Anti-Poaching Seal</span>
                <span className="text-emerald-800 font-extrabold">✓ Digitally Signed by RFO</span>
              </div>
              <div className="p-2.5 bg-slate-900 text-emerald-300 rounded-lg truncate font-mono text-[11px] font-bold border border-slate-800">
                Hash: {selectedBatchForPass.stumpPhotoSha256 || '9a3ecbe5ed12ab4d8e11ba873c2f11161202b945e3b0c44298fc1c149afbf4c8'}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedBatchForPass(null)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
              >
                Close Pass
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addToast(`Printing State Forest e-Transit Pass ${selectedBatchForPass.transitPassNumber}...`, 'info')}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Print e-TP Copy</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const batchId = selectedBatchForPass.id;
                    const tpNumber = selectedBatchForPass.transitPassNumber;
                    const fellingNo = resolveBatchFellingOrder(selectedBatchForPass);
                    setSelectedBatchForPass(null);
                    setDispatchIntent({
                      type: 'FARM_TO_AGGREGATOR',
                      batchId,
                      transitPassNumber: tpNumber,
                      fellingOrderNumber: fellingNo,
                      treeId: selectedBatchForPass.treeId
                    });
                    navigate('/movement');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-xs transition flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Proceed to Gate Dispatch (Step 14)</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
