// Initial Seed Data for GIS Plantation, POLOGEN & Tree Registry
// Coordinates in GeoJSON standard [lng, lat] order for native Turf.js compatibility

const INITIAL_GIS_REGISTRY = {
  plantations: [
    {
      id: "PLT-AS-GLG-0001-X",
      name: "Nahorjan Homestead Sachi Estate",
      farmerId: "FRM-GH-0104",
      farmerName: "Bhaben Saikia",
      cluster: "GOLAGHAT",
      district: "Golaghat, Assam",
      dagPatta: "Dag 182, Patta 44",
      verifiedBy: "FA-ARUP-BORAH",
      createdAt: "2026-04-12T09:30:00Z",
      // ~16.17 ha (~120.9 Assam Bigha) near Jogibari Gaon, Golaghat
      coordinates: [
        [
          [93.9612, 26.5112],
          [93.9652, 26.5115],
          [93.9655, 26.5150],
          [93.9614, 26.5148],
          [93.9612, 26.5112]
        ]
      ]
    },
    {
      id: "PLT-AS-GLG-0002-9",
      name: "Dergaon North Sachi Block",
      farmerId: "FRM-GH-0118",
      farmerName: "Pranab Gogoi",
      cluster: "GOLAGHAT",
      district: "Golaghat, Assam",
      dagPatta: "Dag 214, Patta 61",
      verifiedBy: "FA-ARUP-BORAH",
      createdAt: "2026-04-14T11:15:00Z",
      // ~18.82 ha (~140.7 Assam Bigha) near Padumoni / Kachugaon along Dergaon-Golaghat Rd
      coordinates: [
        [
          [93.9932, 26.5458],
          [93.9977, 26.5461],
          [93.9980, 26.5499],
          [93.9935, 26.5496],
          [93.9932, 26.5458]
        ]
      ]
    },
    {
      id: "PLT-TR-KDM-0003-C",
      name: "Kadamtala Eastern Agar Garden",
      farmerId: "FRM-TR-0042",
      farmerName: "Ratan Debbarma",
      cluster: "KADAMTALA",
      district: "North Tripura, Tripura",
      dagPatta: "Dag 94, Khatian 18",
      verifiedBy: "FA-SUBRATA-DAS",
      createdAt: "2026-04-16T10:00:00Z",
      // ~19.67 ha (~147.0 Assam Bigha) near Kadamtala
      coordinates: [
        [
          [92.2035, 24.4602],
          [92.2080, 24.4604],
          [92.2083, 24.4643],
          [92.2037, 24.4641],
          [92.2035, 24.4602]
        ]
      ]
    },
    {
      id: "PLT-TR-KDM-0004-P",
      name: "Churaibari Hill Slope Block",
      farmerId: "FRM-TR-0059",
      farmerName: "Manik Reang",
      cluster: "KADAMTALA",
      district: "North Tripura, Tripura",
      dagPatta: "Dag 112, Khatian 29",
      verifiedBy: "FA-SUBRATA-DAS",
      createdAt: "2026-04-18T14:20:00Z",
      // ~17.10 ha (~127.8 Assam Bigha) near Churaibari
      coordinates: [
        [
          [92.2225, 24.4401],
          [92.2266, 24.4403],
          [92.2269, 24.4440],
          [92.2227, 24.4438],
          [92.2225, 24.4401]
        ]
      ]
    }
  ],

  pologens: [
    {
      id: "PLG-AS-GLG-0001-M",
      version: "v1",
      parentPlantationId: "PLT-AS-GLG-0001-X",
      name: "Nahorjan Sapling Block A (2022)",
      cluster: "GOLAGHAT",
      plantingYear: 2022,
      ageYears: 4.5,
      saplingCount: 340,
      spacing: "1.5m x 1.5m",
      status: "ACTIVE_COLLECTIVE",
      coordinates: [
        [
          [93.9631, 26.5117],
          [93.9648, 26.5118],
          [93.9649, 26.5131],
          [93.9632, 26.5130],
          [93.9631, 26.5117]
        ]
      ]
    },
    {
      id: "PLG-AS-GLG-0001-N",
      version: "v1",
      parentPlantationId: "PLT-AS-GLG-0001-X",
      name: "Nahorjan Nursery Extension (2023)",
      cluster: "GOLAGHAT",
      plantingYear: 2023,
      ageYears: 3.4,
      saplingCount: 180,
      spacing: "1.5m x 1.5m",
      status: "ACTIVE_COLLECTIVE",
      coordinates: [
        [
          [93.9616, 26.5133],
          [93.9630, 26.5134],
          [93.9631, 26.5144],
          [93.9617, 26.5143],
          [93.9616, 26.5133]
        ]
      ]
    },
    {
      id: "PLG-AS-GLG-0002-K",
      version: "v1",
      parentPlantationId: "PLT-AS-GLG-0002-9",
      name: "Dergaon Young Block B (2021)",
      cluster: "GOLAGHAT",
      plantingYear: 2021,
      ageYears: 5.2,
      saplingCount: 420,
      spacing: "1.5m x 1.5m",
      status: "ACTIVE_COLLECTIVE",
      coordinates: [
        [
          [93.9938, 26.5464],
          [93.9958, 26.5465],
          [93.9959, 26.5482],
          [93.9939, 26.5481],
          [93.9938, 26.5464]
        ]
      ]
    },
    {
      id: "PLG-TR-KDM-0003-R",
      version: "v1",
      parentPlantationId: "PLT-TR-KDM-0003-C",
      name: "Kadamtala Nursery Plot 1 (2022)",
      cluster: "KADAMTALA",
      plantingYear: 2022,
      ageYears: 4.1,
      saplingCount: 290,
      spacing: "1.5m x 1.5m",
      status: "ACTIVE_COLLECTIVE",
      coordinates: [
        [
          [92.2041, 24.4608],
          [92.2059, 24.4609],
          [92.2060, 24.4624],
          [92.2042, 24.4623],
          [92.2041, 24.4608]
        ]
      ]
    },
    {
      id: "PLG-TR-KDM-0004-S",
      version: "v1",
      parentPlantationId: "PLT-TR-KDM-0004-P",
      name: "Churaibari Slope Saplings (2023)",
      cluster: "KADAMTALA",
      plantingYear: 2023,
      ageYears: 3.2,
      saplingCount: 215,
      spacing: "1.5m x 1.5m",
      status: "ACTIVE_COLLECTIVE",
      coordinates: [
        [
          [92.2232, 24.4407],
          [92.2248, 24.4408],
          [92.2249, 24.4422],
          [92.2233, 24.4421],
          [92.2232, 24.4407]
        ]
      ]
    }
  ],

  trees: [
    {
      id: "TRE-AS-GLG-0001-01",
      parentPlantationId: "PLT-AS-GLG-0001-X",
      cluster: "GOLAGHAT",
      rfidTag: "AS-GLG-TAG-8941",
      species: "Aquilaria malaccensis Lam.",
      ageYears: 11.4,
      gbhCm: 64.5,
      heightM: 11.2,
      status: "INOCULATED",
      pinColor: "slate",
      elevation: "86.4 m MSL",
      accuracyM: 1.2,
      photoSha256: "7d4a2f8c5b9e1a3d6f0c8e2b4a7d9f1e3c5a7b9d0e2f4a6c8e0b2d4f6a8c0e2b",
      coordinates: [93.9621, 26.5125] // [lng, lat]
    },
    {
      id: "TRE-AS-GLG-0001-02",
      parentPlantationId: "PLT-AS-GLG-0001-X",
      cluster: "GOLAGHAT",
      rfidTag: "AS-GLG-TAG-8942",
      species: "Aquilaria malaccensis Lam.",
      ageYears: 10.2,
      gbhCm: 59.0,
      heightM: 10.6,
      status: "VERIFIED_HEALTHY",
      pinColor: "green",
      elevation: "86.9 m MSL",
      accuracyM: 1.1,
      photoSha256: "9a1c3e5f7b9d1a3c5e7f9b1d3a5c7e9f1b3d5a7c9e1f3b5d7a9c1e3f5b7d9a1c",
      coordinates: [93.9639, 26.5141]
    },
    {
      id: "TRE-AS-GLG-0002-01",
      parentPlantationId: "PLT-AS-GLG-0002-9",
      cluster: "GOLAGHAT",
      rfidTag: "AS-GLG-TAG-9014",
      species: "Aquilaria malaccensis Lam.",
      ageYears: 9.8,
      gbhCm: 56.4,
      heightM: 10.1,
      status: "VERIFIED_HEALTHY",
      pinColor: "green",
      elevation: "89.1 m MSL",
      accuracyM: 1.3,
      photoSha256: "4f6e8d2c1b3a5f7e9d1c3b5a7f9e1d3c5b7a9f1e3d5c7b9a1f3e5d7c9b1a3f5e",
      coordinates: [93.9950, 26.5488]
    },
    {
      id: "TRE-AS-GLG-0002-02",
      parentPlantationId: "PLT-AS-GLG-0002-9",
      cluster: "GOLAGHAT",
      rfidTag: "AS-GLG-TAG-9015",
      species: "Aquilaria malaccensis Lam.",
      ageYears: 12.8,
      gbhCm: 72.0,
      heightM: 12.8,
      status: "HARVEST_AUTHORIZED",
      pinColor: "red",
      elevation: "89.5 m MSL",
      accuracyM: 0.9,
      photoSha256: "e2d4c6b8a0f2e4d6c8b0a2f4e6d8c0b2a4f6e8d0c2b4a6f8e0d2c4b6a8f0e2d4",
      coordinates: [93.9968, 26.5472]
    },
    {
      id: "TRE-TR-KDM-0003-01",
      parentPlantationId: "PLT-TR-KDM-0003-C",
      cluster: "KADAMTALA",
      rfidTag: "TR-KDM-TAG-4102",
      species: "Aquilaria malaccensis Lam.",
      ageYears: 10.6,
      gbhCm: 61.5,
      heightM: 10.9,
      status: "INOCULATED",
      pinColor: "green",
      elevation: "52.3 m MSL",
      accuracyM: 1.4,
      photoSha256: "b1a3c5e7f9d1b3a5c7e9f1d3b5a7c9e1f3d5b7a9c1e3f5d7b9a1c3e5f7d9b1a3",
      coordinates: [92.2068, 24.4629]
    },
    {
      id: "TRE-TR-KDM-0004-01",
      parentPlantationId: "PLT-TR-KDM-0004-P",
      cluster: "KADAMTALA",
      rfidTag: "TR-KDM-TAG-4188",
      species: "Aquilaria malaccensis Lam.",
      ageYears: 13.1,
      gbhCm: 74.8,
      heightM: 13.0,
      status: "HARVEST_AUTHORIZED",
      pinColor: "red",
      elevation: "61.0 m MSL",
      accuracyM: 1.1,
      photoSha256: "c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5",
      coordinates: [92.2256, 24.4428]
    }
  ],

  facilities: [
    {
      id: "CPC-AS-GLG-01",
      code: "C",
      type: "CPC",
      name: "Golaghat Common Processing Centre (CPC Distillation)",
      cluster: "GOLAGHAT",
      details: "Hydro-distillation Stills #1-6 • Batch Custody Weight Scale",
      coordinates: [93.9742, 26.5245]
    },
    {
      id: "DFO-AS-GLG-01",
      code: "D",
      type: "DFO",
      name: "Golaghat Divisional Forest Office (DFO Hub)",
      cluster: "GOLAGHAT",
      details: "Statutory Felling Authorisations & Transit Pass Desk",
      coordinates: [93.9885, 26.5065]
    },
    {
      id: "CPC-TR-KDM-01",
      code: "C",
      type: "CPC",
      name: "Kadamtala Agarwood CPC & Grading Hub",
      cluster: "KADAMTALA",
      details: "North Tripura Distillation & CITES Pre-Export Quarantine",
      coordinates: [92.2145, 24.4530]
    },
    {
      id: "LAB-AS-GHY-01",
      code: "L",
      type: "LAB",
      name: "NERAMAC NABL GC-MS Quality Lab (Guwahati)",
      cluster: "CORRIDOR",
      details: "ISO/IEC 17025 Chemical Profiling & Sesquiterpene Certification",
      coordinates: [91.7362, 26.1445]
    },
    {
      id: "PRT-AS-GHY-01",
      code: "P",
      type: "PORT",
      name: "NE Export Gateway & Customs Bonded Terminal",
      cluster: "CORRIDOR",
      details: "CITES Appendix II Export Permit & Sealed Lot Dispatch",
      coordinates: [91.5859, 26.1061]
    }
  ],

  corridors: [
    {
      id: "MOV-AS-2026-0118",
      name: "Golaghat Cluster Harvest -> CPC -> DFO Transit Corridor",
      cluster: "GOLAGHAT",
      permitRef: "TP-AS-GLG-2026-441",
      coordinates: [
        [93.9632, 26.5130],
        [93.9742, 26.5245],
        [93.9885, 26.5065],
        [93.9958, 26.5478]
      ]
    },
    {
      id: "MOV-TR-2026-0092",
      name: "Kadamtala Cluster Harvest -> CPC Transit Corridor",
      cluster: "KADAMTALA",
      permitRef: "TP-TR-KDM-2026-112",
      coordinates: [
        [92.2060, 24.4622],
        [92.2145, 24.4530],
        [92.2248, 24.4420]
      ]
    },
    {
      id: "MOV-NE-NODAL-01",
      name: "NE Nodal Corridor: Golaghat -> Guwahati NABL Lab -> Kadamtala",
      cluster: "CORRIDOR",
      permitRef: "NERAMAC-INTERSTATE-2026-09",
      coordinates: [
        [93.9742, 26.5245],
        [91.7362, 26.1445],
        [91.5859, 26.1061],
        [92.2145, 24.4530]
      ]
    }
  ]
};

module.exports = INITIAL_GIS_REGISTRY;
