import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import {
  FileText,
  User,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Trees,
  Landmark,
  Eye,
  EyeOff,
  Upload,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Clock,
  ExternalLink,
  Crosshair,
  Navigation,
  Compass
} from 'lucide-react';

export default function FarmerRegistrationModule({ onNavigate }) {
  const { submitFarmerApplication, farmerApplications, addToast, activeRole } = useEnterprise();

  // Form state
  const [formData, setFormData] = useState({
    farmerName: '',
    fatherName: '',
    gender: 'Male',
    age: '',
    phone: '',
    residentialAddress: '',
    latitude: '',
    longitude: '',
    gpsAccuracy: '',
    state: 'Assam',
    cluster: 'Golaghat Cluster',
    district: 'Golaghat',
    subdivision: 'Bokakhat',
    village: '',
    dagNumber: '',
    landAreaAcres: '',
    jamabandiDoc: 'Jamabandi_GLT_Dag_Patta.pdf',
    bankName: 'State Bank of India',
    bankAccountNumber: '',
    ifscCode: 'SBIN0000083',
    plantingYear: '2020',
    saplingsCount: '',
    matureTreesCount: '',
    plantationName: '',
    declarationAccepted: false
  });

  const [isLocating, setIsLocating] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const accuracy = Math.round(position.coords.accuracy);

        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          gpsAccuracy: `± ${accuracy}m`
        }));
        setIsLocating(false);
        addToast(`Captured GPS location: ${lat}, ${lng} (±${accuracy}m)`, 'success');
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Unable to capture GPS coordinates.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location access denied. You can enter lat/lng manually or click a cluster preset.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again or click a cluster preset.';
        }
        addToast(msg, 'warning');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const applyCoordinatePreset = (clusterName, lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      gpsAccuracy: '± 3.5m (Cluster Preset)'
    }));
    addToast(`Applied ${clusterName} Homestead coordinates: ${lat}, ${lng}`, 'info');
  };

  const handleQuickPreFill = () => {
    setFormData({
      farmerName: 'Deepak Borah',
      fatherName: 'Late Khagen Borah',
      gender: 'Male',
      age: '49',
      phone: '+91 94351 77201',
      residentialAddress: 'Mohuramukh Gaon, Bokakhat Circle',
      latitude: '26.520412',
      longitude: '93.978245',
      gpsAccuracy: '± 4.2m',
      state: 'Assam',
      cluster: 'Golaghat Cluster',
      district: 'Golaghat',
      subdivision: 'Bokakhat',
      village: 'Mohuramukh Gaon, Mouza Bokakhat',
      dagNumber: 'Dag 388, Patta 72',
      landAreaAcres: '3.5',
      jamabandiDoc: 'Jamabandi_GLT_Dag388_Patta72.pdf',
      bankName: 'State Bank of India',
      bankAccountNumber: '30981249910',
      ifscCode: 'SBIN0000083',
      plantingYear: '2015',
      saplingsCount: '240',
      matureTreesCount: '120',
      plantationName: 'Mohuramukh Agarwood Estate',
      declarationAccepted: true
    });
    addToast('Pre-filled fresh applicant data with GPS coordinates (Deepak Borah)', 'info');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.farmerName.trim()) {
      addToast('Please enter Farmer Full Name', 'error');
      return;
    }
    if (!formData.dagNumber.trim()) {
      addToast('Please enter Revenue Dag & Patta Number', 'error');
      return;
    }
    if (!formData.declarationAccepted) {
      addToast('Please accept the statutory declaration undertaking', 'error');
      return;
    }

    const latNum = parseFloat(formData.latitude) || 26.520412;
    const lngNum = parseFloat(formData.longitude) || 93.978245;

    const application = submitFarmerApplication({
      ...formData,
      latitude: latNum,
      longitude: lngNum,
      coordinates: [latNum, lngNum],
      gpsAccuracyMeters: formData.gpsAccuracy || '± 4.5m',
      jamabandiHash: `sha256:${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
    });

    setSubmittedApp(application);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Module 02 • Value-Chain Stage 1
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              /farmers/register
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-1">
            Farmer & Homestead Plantation Registration Form
          </h1>
          <p className="text-xs text-slate-500">
            Assam Agarwood Policy 2020 • Land Revenue Jamabandi Title & Farmer Profile Onboarding
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleQuickPreFill}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Pre-fill Sample Application</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/farmers/approvals')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <span>NERAMAC Approvals Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Success Confirmation Banner if submitted */}
      {submittedApp && (
        <div className="bg-emerald-50 border-2 border-emerald-500 p-5 rounded-2xl text-emerald-900 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black text-emerald-950">
                  Application Submitted Successfully: {submittedApp.id}
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  Grower application for <span className="font-bold">{submittedApp.farmerName}</span> has been logged in the State ASCTS registry with status <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">SUBMITTED_PENDING_INSPECTION</span>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSubmittedApp(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-950"
            >
              Dismiss
            </button>
          </div>

          <div className="bg-white/80 p-3.5 rounded-xl border border-emerald-200 text-xs space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Next Workflow Step: Field Agent & Lat Mandal Inspection</span>
            </div>
            <p className="text-slate-600">
              A Field Agent will visit <span className="font-semibold">{submittedApp.village}</span> ({submittedApp.dagNumber}) to walk the POLOGEN perimeter, geo-pin mature trees, and capture SHA-256 stamped photos in the Field GIS Studio.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => onNavigate('/field-gis-studio')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Simulate Field Agent Inspection in Field GIS Studio</span>
              </button>
              <button
                onClick={() => onNavigate('/farmers/approvals')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Go to NERAMAC Farmer Approvals</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Farmer Personal & Demographic Details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-black text-slate-900">
              Section 1: Farmer Personal & Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Farmer Full Name (As per Land Title) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tarun Chandra Das"
                value={formData.farmerName}
                onChange={e => setFormData({ ...formData, farmerName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Father / Husband Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Late Bipin Chandra Das"
                value={formData.fatherName}
                onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gender & Age
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="number"
                  placeholder="Age"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                  className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Mobile Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 94350 00000"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Residential Village / Landmark Address
              </label>
              <input
                type="text"
                placeholder="e.g. Habigaon, Near Namghar, Bokakhat"
                value={formData.residentialAddress}
                onChange={e => setFormData({ ...formData, residentialAddress: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Section 1B: Farmer Homestead Geolocation (Lat, Lng) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <Navigation className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-black text-slate-900">
                  Home Location Geotagging (Latitude &amp; Longitude) *
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Capture device GPS or enter homestead coordinates for statutory land plot registration and supply chain verification.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCaptureLocation}
              disabled={isLocating}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs whitespace-nowrap self-start sm:self-auto"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Capturing Device GPS...' : 'Take Current GPS Location'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Homestead Latitude (Lat) *
              </label>
              <input
                type="number"
                step="0.000001"
                required
                placeholder="e.g. 26.520412"
                value={formData.latitude}
                onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-900"
              />
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                Assam / NE region range: ~24.0° to 28.0° N
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Homestead Longitude (Lng) *
              </label>
              <input
                type="number"
                step="0.000001"
                required
                placeholder="e.g. 93.978245"
                value={formData.longitude}
                onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-900"
              />
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                Assam / Tripura region range: ~91.0° to 95.0° E
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                GPS Accuracy &amp; Verification
              </label>
              <div className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between text-xs min-h-[38px]">
                <span className="font-mono text-slate-800 font-black text-xs">
                  {formData.gpsAccuracy || (formData.latitude ? '± 5.0m (Manual)' : 'Awaiting GPS')}
                </span>
                {formData.latitude && formData.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Map</span>
                  </a>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                Live browser GNSS / Mobile satellite fix
              </span>
            </div>
          </div>

        </div>

        {/* Section 2: Land Revenue & Title Details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-black text-slate-900">
              Section 2: Land Revenue Title & Jamabandi Records (Assam / Tripura)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                State & Agro-Climatic Cluster *
              </label>
              <select
                value={formData.cluster}
                onChange={e => {
                  const val = e.target.value;
                  const isTr = val.includes('Tripura');
                  setFormData({
                    ...formData,
                    cluster: val,
                    state: isTr ? 'Tripura' : 'Assam',
                    district: isTr ? 'North Tripura' : 'Golaghat'
                  });
                }}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="Golaghat Cluster">Assam - Golaghat Cluster</option>
                <option value="Hojai Cluster">Assam - Hojai Cluster</option>
                <option value="Kadamtala Cluster">Tripura - Kadamtala Cluster</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                District & Revenue Circle
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="District"
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
                <input
                  type="text"
                  placeholder="Circle / Subdivision"
                  value={formData.subdivision}
                  onChange={e => setFormData({ ...formData, subdivision: e.target.value })}
                  className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Village / Gaon & Mouza *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Habigaon, Mouza Moukhowa"
                value={formData.village}
                onChange={e => setFormData({ ...formData, village: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Revenue Dag Number & Patta Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dag 245, Patta 61"
                value={formData.dagNumber}
                onChange={e => setFormData({ ...formData, dagNumber: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Land Area (Acres) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="e.g. 3.8"
                value={formData.landAreaAcres}
                onChange={e => setFormData({ ...formData, landAreaAcres: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jamabandi Land Record Document (PDF / Scan)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={formData.jamabandiDoc}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-mono truncate"
                />
                <button
                  type="button"
                  onClick={() => addToast('Simulated Jamabandi PDF upload with SHA-256 integrity seal', 'info')}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 flex-shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Bank Account & DBT Details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Landmark className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-black text-slate-900">
              Section 3: Direct Benefit Transfer (DBT) Bank Account
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                placeholder="e.g. 30981245671"
                value={formData.bankAccountNumber}
                onChange={e => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                placeholder="e.g. SBIN0000083"
                value={formData.ifscCode}
                onChange={e => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Statutory Self-Declaration & Submit Action */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="declarationAccepted"
              required
              checked={formData.declarationAccepted}
              onChange={e => setFormData({ ...formData, declarationAccepted: e.target.checked })}
              className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor="declarationAccepted" className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900">Statutory Declaration under Assam Agarwood Policy 2020:</span>
              {' '}I hereby declare that the Agarwood trees entered above are grown exclusively on my homestead / private revenue land (Dag & Patta specified above) and are not extracted from Reserve Forests or Protected Areas. I consent to NERAMAC Field Agent inspection, POLOGEN perimeter walk, and mature tree QR tagging under Assam Agarwood Policy 2020 guidelines.
            </label>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              * Required fields. All submissions undergo official verification and approval by NERAMAC and Forest Dept.
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Submit Formal Farmer Registration Application</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
