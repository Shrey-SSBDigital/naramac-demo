# NERAMAC Agarwood Supply Chain Traceability System (ASCTS)
### Full-Stack MERN Demonstration: Stakeholder Responsibilities & Supply Chain Flow
**Nodal Agency:** North Eastern Regional Agricultural Marketing Corporation Limited (NERAMAC)  
*(A Government of India Enterprise under Ministry of Development of North Eastern Region - MDoNER)*  
**RFP Reference:** `NER/PROJECT/AGAR/RESEARCH AND DEVELOPMENT/06/31`  
**Geographical Scope:** Golaghat Cluster (Assam) & Kadamtala Cluster (North Tripura)

---

## 🌟 Executive Overview
This full-stack application models the complete digital traceability system defined in the 117-page NERAMAC Request for Proposal (RFP). It is engineered to make it **effortless to understand and explain to anyone** how work, digital identities, and physical custody flow through every participant in the agarwood value chain.

### 🎯 Dual-Mode Sidebar Architecture
- **Mode 1: Interactive Live Workflow (14 Real-World Stages)**
  - Fully functional end-to-end interactive journey starting with the farmer's self-registration portal.
  - Interactive forms for all 14 stages: Field Agent offline geo-pinning, plantation age rule verification, inoculation logging with SHA-256 photo hash, farmer harvest application, DFO & Maker-Checker felling sanction, harvest scale weighing, movement tolerance checking (≤ 1.5%), aggregation depot pooling, CPC distillation mass balance, NABL lab GC-MS release, packaging serialized QR code, export customs dispatch, and buyer smartphone verification with DPDP Act 2023 masking.
  - Interactive buttons to advance step-by-step, reset to Step 1, or jump to "Load Full Demo".
- **Mode 2: Stakeholder Roles Directory (11 Roles)**
  - Clear, isolated responsibility breakdown for every participant in the agarwood value chain:
    1. **Primary Operational Duties:** Physical, operational, and field actions owned.
    2. **Mandatory Digital Identifiers:** Which of the 15 mandatory IDs (`FRM`, `PLT`, `TRE`, etc.) they create or govern.
    3. **Statutory & Regulatory Limits:** What legal powers they hold vs. what is prohibited.
    4. **Custody Handoffs:** Upstream inputs received and downstream handoffs passed.
    5. **Reciprocal Interactions:** Plain-language matrix of how each other stakeholder interacts with this role.

---

## 🏢 11 Covered Stakeholders & Sequential Flow
1. **1. Registered Farmer / Grower (`FARMER`)**
   - *Primary Producer & Plot Custodian*
   - Registers homestead location; declares trees; applies to DFO for felling permission; receives digital weighment receipts.
2. **2. NERAMAC Field Agent (`FIELD_AGENT`)**
   - *Field Operations & Mobile App*
   - Walks closed boundaries for young plantings (`PLG` < 7 yrs); geo-pins mature trees (`TRE` ≥ 7 yrs); logs menu-driven inoculations with **on-device SHA-256 photo hashing**.
3. **3. NERAMAC Nodal Authority / Admin (`NERAMAC_ADMIN`)**
   - *Governing Authority & Platform Owner*
   - Administers all 15 digital IDs; approves master data; conducts Maker-Checker verification on DFO orders; monitors exception dashboards.
4. **4. Divisional Forest Officer / DFO (`DFO_FOREST_DEPT`)**
   - *Statutory Forest Regulator*
   - Sole legal authority to grant felling permissions and transit passes under State Forest Acts; uploads signed orders and sets quotas.
5. **5. Collection & Aggregation Operator (`AGGREGATOR`)**
   - *Cluster Depots (10 in Assam, 10 in Tripura)*
   - Receives raw harvest batches; weighs consignments; enforces **≤ 1.5% transit variance tolerance**; pools into Aggregation Consignments (`AGG`).
6. **6. CPC & Distillation Operator (`CPC_OPERATOR`)**
   - *Common Processing Centres (10 per cluster)*
   - Hydro-distillation and steam distillation; calculates material balance ($\text{Wood in} = \text{Pure Oud Oil} + \text{Hydrosol} + \text{Spent Biomass} + \text{Loss}$).
7. **7. Accredited Laboratory Officer (`LAB_OFFICER`)**
   - *Independent NABL Quality Testing*
   - GC-MS chemical profiling (agarospirol %, purity); screens for adulterants; conducts wood-anatomy testing for **CITES species confirmation** (`Aquilaria malaccensis`).
8. **8. Packaging & Serialization Officer (`PACKAGING_OFFICER`)**
   - *Finished Goods & Packaging*
   - Bottles released oil (12ml flacons); generates cryptographically signed, serialised QR codes; aggregates into shipper cartons.
9. **9. Exporter & Logistics Operator (`EXPORTER_LOGISTICS`)**
   - *Global Trade & Dispatch*
   - Assembles export batches into terminal shipping lots (`ELT`); links CITES export permits, DGFT licenses, and airway bills to Dubai/EU.
10. **10. Auditor & Vigilance Officer (`AUDITOR`)**
    - *Statutory & Compliance Oversight*
    - Inspects the unbroken 15-identity graph; validates SHA-256 photograph hashes against camera buffers; checks system access trails.
11. **11. Approved Buyer & Public Verifier (`BUYER_PUBLIC`)**
    - *Perfumery Houses & Consumers*
    - Scans pack QR code with any smartphone to inspect verified provenance, CITES origin, and GC-MS purity with **DPDP Act privacy protection** (grower personal data masked).

---

## 🏷️ The 15 Mandatory Digital Identifiers (RFP Section 3.2)
| Code | Identity Name | Parent Link | Downward Link | Mandatory Geospatial / Control Requirement |
|:---:|:---|:---|:---|:---|
| **`FRM`** | Farmer Identity | Root (None) | `PLT` | Homestead geo-pinned; strictly decoupled from Aadhaar (DPDP Act) |
| **`PLT`** | Plantation Identity | `FRM` | `PLG`, `TRE` | Geo-referenced boundary, computed area, verified land tenure |
| **`PLG`** | POLOGEN Identity | `PLT` | `TRE`, `HBT` | Closed polygon for trees < 7 yrs; walked boundary vertices |
| **`TRE`** | Tree Identity | `PLT` / `PLG` | `INO`, `HAU`, `HBT` | Individual mature tree ≥ 7 yrs; point geo-pinned coordinate & tag photo |
| **`INO`** | Inoculation Event | `TRE` / `PLG` | `HBT` | Method, compound batch, supplier, in-app SHA-256 photo hash |
| **`HAU`** | Harvest Authorisation | `FRM`, `PLT`, `TRE` | `HBT` | Grower application + NERAMAC verification + DFO signed statutory order |
| **`HBT`** | Harvest Batch | `HAU`, `TRE` | `MOV`, `AGG`, `DST` | Net weight, stump photo SHA-256 hash, portable printer tag |
| **`MOV`** | Movement Identity | `HBT` / `AGG` / `DST` | Receiving End | Paired dispatch & receipt; tolerance check (≤ 1.5% variance) |
| **`AGG`** | Aggregation Consignment | `HBT` (multi-parent) | `MOV`, `DST` | Pooled wood at collection depot; parent-child genealogy preserved |
| **`DST`** | Distillation Batch | `AGG` / `HBT` | `LAB`, `PCK`, `EBT` | Still charge run; mass balance (oil yield, hydrosol, spent residue) |
| **`LAB`** | Laboratory Test | `HBT` / `DST` | Release / Quarantine | GC-MS profile, agarospirol %, specific gravity, CITES species check |
| **`PMT`** | Permit Identity | Entity covered | Derivative IDs | DFO felling permit, transit pass, CITES Appendix II certificate |
| **`PCK`** | Pack Identity | `DST` | `EBT`, QR Scan | Serialized finished flacon; cryptographically signed QR code |
| **`EBT`** | Export Batch | `PCK` (multiple) | `ELT` | Consolidated commercial batch approved for international trade |
| **`ELT`** | Export Lot | `EBT` | Buyer / Customs | Terminal shipping unit; linked to customs shipping bill and buyer |

---

## 🏗️ Backend Architecture (Clean MVC Separation)
```
server/
├── index.js                     # Express app & static server
├── controllers/
│   ├── liveWorkflowController.js# State-driven 14-step real-world flow controller
│   ├── stakeholderController.js # Handles role listings, details & structured duties
│   ├── workflowController.js    # Handles role actions (DFO orders, tolerance, distillation)
│   ├── traceabilityController.js# Bidirectional 15-identity graph lookups
│   └── qrController.js          # QR resolver (Public masked vs Internal unmasked)
├── routes/
│   ├── liveWorkflowRoutes.js    # /api/live-workflow (state, advance, reset, load-sample)
│   ├── stakeholderRoutes.js     # /api/stakeholders
│   ├── workflowRoutes.js        # /api/workflow
│   ├── traceabilityRoutes.js    # /api/traceability
│   ├── qrRoutes.js              # /api/qr
│   ├── identifiers.js           # /api/identifiers
│   └── stats.js                 # /api/stats
└── data/
    ├── stakeholdersData.js      # Definitions of roles, duties & RACI flow
    └── seedData.js              # Authentic Assam & Tripura seed datasets
```

---

## 🚀 How to Run the Demonstration

### Quick Start
In your terminal, navigate to the project root:
```powershell
cd c:\Users\SSBD-202305-09\Desktop\neramac_demo
npm start
```
Open your browser at:
👉 **`http://localhost:5000`**

- **Click any stakeholder in the left sidebar** to present their role, responsibilities, upstream inputs, downstream handoffs, and run their live action.
- **Click "End-to-End Flow (15 Steps)"** at the top of the sidebar to present the complete macro-level supply chain from plantation to export.
