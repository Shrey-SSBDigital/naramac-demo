/**
 * Role-Based Access Control (RBAC) Configuration for NERAMAC ASCTS
 * Strict segregation of operational permissions and module access for all 9 stakeholders
 */

export const ROLE_PERMISSIONS = {
  NERAMAC_ADMIN: {
    id: 'NERAMAC_ADMIN',
    name: 'NERAMAC Administrator',
    authority: 'North Eastern Regional Agricultural Marketing Corp.',
    badge: 'Full System Access',
    color: 'emerald',
    defaultRoute: '/dashboard',
    allowedModules: [
      'HOME',
      'DASHBOARD',
      'FARMERS',
      'FARMER_REGISTER',
      'FARMER_APPROVALS',
      'PLANTATIONS',
      'FIELD_INSPECTION',
      'GEO_STUDIO',
      'INOCULATION',
      'HARVEST',
      'PERMITS',
      'MOVEMENT',
      'AGGREGATION',
      'PROCESSING',
      'LABORATORY',
      'INVENTORY',
      'FINISHED_PRODUCTS',
      'EXPORT',
      'SHIPMENT',
      'DOMESTIC_SALES',
      'TRACEABILITY',
      'AUDIT_REPORTS',
      'FLOW'
    ],
    responsibilities: [
      'Unrestricted system governance, configuration, and audit access across all modules',
      'Maker-checker approval of Farmer Onboarding applications and Land Revenue titles',
      'Statutory sanction of harvest quotas and Common Processing Centre (CPC) operations',
      'Issuance of official NERAMAC QR Identity Cards and Export Consignment approvals'
    ]
  },

  FIELD_AGENT: {
    id: 'FIELD_AGENT',
    name: 'NERAMAC Field Agent',
    authority: 'Cluster Field Verification Office',
    badge: 'On-Ground Biometric & GIS Capture',
    color: 'amber',
    defaultRoute: '/field-inspection',
    allowedModules: [
      'HOME',
      'FIELD_INSPECTION',
      'GEO_STUDIO',
      'FARMERS',
      'PLANTATIONS',
      'INOCULATION',
      'HARVEST_FELLING',
      'HARVEST_BATCHES',
      'MOVEMENT_FARM_TO_DEPOT'
    ],
    responsibilities: [
      'On-site physical inspection of homestead land, Dag/Patta, and Lat Mandal revenue records',
      'Walking POLOGEN perimeter boundaries (< 7 yrs) and geo-pinning mature trees (≥ 7 yrs)',
      'Forensic photo capture stamped with Web Crypto SHA-256 buffer hashes and RTK GPS coordinates',
      'Recording fungal drill inoculation interventions and felling supervision',
      'Recording Farm-to-Aggregator dispatch transit manifest and felling net weighment on behalf of Farmer'
    ]
  },

  FARMER: {
    id: 'FARMER',
    name: 'Registered Farmer / Grower',
    authority: 'Homestead Agarwood Grower',
    badge: 'Primary Producer',
    color: 'green',
    defaultRoute: '/plantation',
    allowedModules: [
      'HOME',
      'FARMER_REGISTER',
      'PLANTATIONS',
      'HARVEST_APPLY',
      'HARVEST_MY_APPS',
      'HARVEST_BATCHES',
      'MOVEMENT_FARM_TO_DEPOT'
    ],
    responsibilities: [
      'Submission of formal farmer registration with grower profile & Jamabandi records',
      'Declaration of homestead trees, saplings, and Dag/Patta land revenue titles',
      'Submitting harvest permission applications and receiving digital procurement receipts',
      'Dispatching felled wood to Cluster Aggregation Depot (Farm-to-Aggregator first-mile transit)',
      'Tracking Gate Weighment Reconciliation (≤ ±1.5%) and receiving digital Goods Receipt Notes (GRN) with payment credit advice'
    ]
  },

  COLLECTION_OPERATOR: {
    id: 'COLLECTION_OPERATOR',
    name: 'Collection Centre Operator',
    authority: 'NERAMAC Cluster Depots (Golaghat / Hojai / Kadamtala)',
    badge: 'Depot Intake & Aggregation',
    color: 'teal',
    defaultRoute: '/movement/depot-gate-check',
    allowedModules: [
      'HOME',
      'MOVEMENT_DEPOT_GATE_CHECK',
      'AGGREGATION',
      'MOVEMENT_DEPOT_TO_CPC',
      'INVENTORY',
      'PERMITS'
    ],
    responsibilities: [
      'Physical weighment of green wood dispatches from registered farmers',
      'Enforcing mandatory gate tolerance verification (maximum ±1.5% discrepancy threshold)',
      'Assembling homogenous Aggregation Batches while preserving source farmer lineage',
      'Issuing tamper-evident depot transit manifests to Common Processing Centres'
    ]
  },

  CPC_OPERATOR: {
    id: 'CPC_OPERATOR',
    name: 'Processing Centre Operator',
    authority: 'Common Facility Centre (CFC / CPC Distillation Plant)',
    badge: 'Hydro-Distillation Operations',
    color: 'cyan',
    defaultRoute: '/processing',
    allowedModules: [
      'HOME',
      'MOVEMENT_CPC_GATE_CHECK',
      'PROCESSING',
      'FINISHED_PRODUCTS',
      'INVENTORY'
    ],
    responsibilities: [
      'Grading, chipping, and mechanical pulverization of aggregated agarwood logs',
      'Loading calibrated hydro-distillation stills (Boilers ST-01 to ST-08) for 72-96 hr runs',
      'Yield recording of Agarwood Oil, Chips, Raw Wood, and custom By-Products',
      'Post-lab packaging & tamper-evident QR serialization of released batches at CPC'
    ]
  },

  LAB_OFFICER: {
    id: 'LAB_OFFICER',
    name: 'Accredited Laboratory Officer',
    authority: 'NABL Certified Quality Testing Laboratory (Guwahati)',
    badge: 'Chemical Purity & CITES Certification',
    color: 'violet',
    defaultRoute: '/laboratory',
    allowedModules: [
      'HOME',
      'LABORATORY',
      'MASS_BALANCE'
    ],
    responsibilities: [
      'Gas Chromatography - Mass Spectrometry (GC-MS) chemical profile fingerprinting',
      'Verification of active sesquiterpene markers (Agarospirol, Jinkoh-eremol, Guaiol)',
      'Botanical validation of Aquilaria malaccensis species compliance with CITES Appendix II',
      'Issuance of cryptographically signed Certificate of Analysis (CoA) and Quality Release'
    ]
  },

  FOREST_DEPT: {
    id: 'FOREST_DEPT',
    name: 'Forest Department / DFO',
    authority: 'Divisional Forest Officer (Assam & Tripura Forest Dept.)',
    badge: 'Statutory Regulator',
    color: 'emerald',
    defaultRoute: '/harvest/dfo-sanctions',
    allowedModules: [
      'HOME',
      'FARMER_APPROVALS',
      'HARVEST_DFO_SANCTIONS',
      'HARVEST_DFO_APPROVED',
      'HARVEST_BATCHES',
      'PERMITS',
      'PLANTATIONS',
      'CITES_REPORTS'
    ],
    responsibilities: [
      'Verification of land non-encroachment against Reserve Forest and Protected Area boundaries',
      'Statutory sanction of Felling Orders under Assam Agarwood Policy 2020',
      'Issuance of Barcoded Transit Passes (Form II) for intra-state and inter-state timber movement',
      'Oversight of non-detriment findings (NDF) and national CITES export quotas'
    ]
  },

  EXPORTER: {
    id: 'EXPORTER',
    name: 'Exporter & Logistics Operator',
    authority: 'Registered Agarwood Trading & Export House',
    badge: 'International Commerce',
    color: 'blue',
    defaultRoute: '/export',
    allowedModules: [
      'HOME',
      'EXPORT',
      'SHIPMENT',
      'FINISHED_PRODUCTS',
      'DOMESTIC_SALES',
      'PERMITS'
    ],
    responsibilities: [
      'Assembly of Export Batches from released finished flacons and certified chips',
      'Coordination of CITES Export Permits with Wildlife Crime Control Bureau (WCCB)',
      'Shipment Lot consolidation, port terminal logistics (Guwahati ICD / Kolkata Port / Mumbai Air Cargo)',
      'Fulfilling international buyer contracts across UAE, Saudi Arabia, EU, and Japan'
    ]
  },

  BUYER_PUBLIC: {
    id: 'BUYER_PUBLIC',
    name: 'Buyer & Public Verifier',
    authority: 'Global Consumer & Luxury Perfumery Houses',
    badge: 'Public Provenance Verification',
    color: 'indigo',
    defaultRoute: '/traceability',
    allowedModules: [
      'HOME',
      'TRACEABILITY',
    ],
    responsibilities: [
      'Instant smartphone scan of Laser QR codes etched on 12ml luxury attar crystal flacons',
      'Inspection of complete immutable supply chain timeline from farmer homestead to packaging',
      'Verification of verified origin provenance data and NABL laboratory purity certificate'
    ]
  }
};

/**
 * Checks whether a module is permitted for the given role
 */
export function isModuleAllowedForRole(roleId, moduleId) {
  if (!roleId || !moduleId) return false;
  if (moduleId === 'HARVEST_PRE_INSPECT') return false;
  if (moduleId === 'HARVEST_APPLY' && roleId === 'NERAMAC_ADMIN') return false;
  if (roleId === 'NERAMAC_ADMIN') return true;
  if (moduleId === 'HOME') return true;
  const config = ROLE_PERMISSIONS[roleId];
  if (!config) return false;
  return config.allowedModules ? config.allowedModules.includes(moduleId) : false;
}

/**
 * Gets default route for a role
 */
export function getDefaultRouteForRole(roleId) {
  const config = ROLE_PERMISSIONS[roleId];
  return config ? config.defaultRoute : '/dashboard';
}
