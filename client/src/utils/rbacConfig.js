/**
 * Role-Based Access Control (RBAC) Configuration for NERAMAC ASCTS
 * Strict segregation of operational permissions and module access for all 10 stakeholders
 */

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: {
    id: 'SUPER_ADMIN',
    name: 'Super Admin',
    authority: 'Governing Technology Authority',
    badge: 'Full Unrestricted Access',
    color: 'emerald',
    defaultRoute: '/dashboard',
    allowedModules: [
      'HOME',
      'DASHBOARD',
      'FARMERS',
      'FARMER_REGISTER',
      'FARMER_APPROVALS',
      'PLANTATIONS',
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
      'Full governance of cryptographic ledgers and system configurations',
      'Master management of all 10 stakeholder credentials and access rights',
      'End-to-end statutory audit trails, mass balance overrides, and system reset'
    ]
  },

  NERAMAC_ADMIN: {
    id: 'NERAMAC_ADMIN',
    name: 'NERAMAC Administrator',
    authority: 'North Eastern Regional Agricultural Marketing Corp.',
    badge: 'Sanctioning Authority',
    color: 'emerald',
    defaultRoute: '/dashboard',
    allowedModules: [
      'HOME',
      'DASHBOARD',
      'FARMERS',
      'FARMER_APPROVALS',
      'PLANTATIONS',
      'GEO_STUDIO',
      'HARVEST',
      'PERMITS',
      'AGGREGATION',
      'PROCESSING',
      'INVENTORY',
      'FINISHED_PRODUCTS',
      'EXPORT',
      'TRACEABILITY',
      'AUDIT_REPORTS'
    ],
    responsibilities: [
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
    defaultRoute: '/field-gis-studio',
    allowedModules: [
      'HOME',
      'GEO_STUDIO',
      'FARMERS',
      'PLANTATIONS',
      'INOCULATION',
      'HARVEST',
      'TRACEABILITY'
    ],
    responsibilities: [
      'On-site physical inspection of homestead land, Dag/Patta, and Lat Mandal revenue records',
      'Walking POLOGEN perimeter boundaries (< 7 yrs) and geo-pinning mature trees (≥ 7 yrs)',
      'Forensic photo capture stamped with Web Crypto SHA-256 buffer hashes and RTK GPS coordinates',
      'Recording fungal drill inoculation interventions and felling supervision'
    ]
  },

  FARMER: {
    id: 'FARMER',
    name: 'Registered Farmer / Grower',
    authority: 'Homestead Agarwood Cultivator',
    badge: 'Primary Producer',
    color: 'green',
    defaultRoute: '/farmers/register',
    allowedModules: [
      'HOME',
      'FARMER_REGISTER',
      'FARMERS',
      'PLANTATIONS',
      'HARVEST',
      'TRACEABILITY'
    ],
    responsibilities: [
      'Submission of formal farmer registration with masked DPDP Aadhaar & Jamabandi records',
      'Declaration of homestead trees, saplings, and Dag/Patta land revenue titles',
      'Submitting harvest permission applications and receiving digital procurement receipts'
    ]
  },

  COLLECTION_OPERATOR: {
    id: 'COLLECTION_OPERATOR',
    name: 'Collection Centre Operator',
    authority: 'NERAMAC Cluster Depots (Golaghat / Hojai / Kadamtala)',
    badge: 'Depot Intake & Aggregation',
    color: 'teal',
    defaultRoute: '/movement',
    allowedModules: [
      'HOME',
      'MOVEMENT',
      'AGGREGATION',
      'INVENTORY',
      'PERMITS',
      'TRACEABILITY'
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
      'PROCESSING',
      'INVENTORY',
      'MOVEMENT',
      'TRACEABILITY'
    ],
    responsibilities: [
      'Grading, chipping, and mechanical pulverization of aggregated agarwood logs',
      'Loading calibrated hydro-distillation stills (Boilers ST-01 to ST-08) for 72-96 hr runs',
      'Yield recording of Grade-1 Dehn Al Oudh, Grade-2, hydrosol water, and exhausted residue',
      'Strict mass balance computation ensuring raw wood to essential oil conservation'
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
      'FINISHED_PRODUCTS',
      'TRACEABILITY',
      'AUDIT_REPORTS'
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
    defaultRoute: '/permits',
    allowedModules: [
      'HOME',
      'PERMITS',
      'FARMER_APPROVALS',
      'HARVEST',
      'PLANTATIONS',
      'TRACEABILITY',
      'AUDIT_REPORTS'
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
      'PERMITS',
      'TRACEABILITY'
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
      'FINISHED_PRODUCTS'
    ],
    responsibilities: [
      'Instant smartphone scan of Laser QR codes etched on 12ml luxury attar crystal flacons',
      'Inspection of complete immutable supply chain timeline from farmer homestead to packaging',
      'Verification of DPDP Act compliant masked origin data and NABL laboratory purity certificate'
    ]
  }
};

/**
 * Checks whether a module is permitted for the given role
 */
export function isModuleAllowedForRole(roleId, moduleId) {
  if (!roleId || !moduleId) return false;
  if (roleId === 'SUPER_ADMIN') return true;
  const config = ROLE_PERMISSIONS[roleId];
  if (!config) return false;
  return config.allowedModules.includes(moduleId);
}

/**
 * Gets default route for a role
 */
export function getDefaultRouteForRole(roleId) {
  const config = ROLE_PERMISSIONS[roleId];
  return config ? config.defaultRoute : '/dashboard';
}
