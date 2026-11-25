import { useSyncExternalStore } from 'react';
import {
  MOCK_FARMERS,
  MOCK_PLANTATIONS,
  MOCK_POLOGENS,
  MOCK_TREES,
  MOCK_INOCULATIONS,
  MOCK_HARVESTS,
  MOCK_HARVEST_BATCHES,
  MOCK_PERMITS,
  MOCK_MOVEMENTS,
  MOCK_AGGREGATIONS,
  MOCK_DISTILLATIONS,
  MOCK_LAB_TESTS,
  MOCK_FINISHED_PRODUCTS,
  MOCK_EXPORT_BATCHES,
  MOCK_SHIPMENT_LOTS,
  MOCK_DOMESTIC_SALES,
  MOCK_INVENTORY,
  MOCK_AUDIT_LOGS,
  MOCK_COLLECTION_CENTRES,
  MOCK_PROCESSING_CENTRES,
  MOCK_FACILITIES,
  MOCK_FARMER_APPLICATIONS,
  ROLE_CREDENTIALS
} from '../data/mockEnterpriseData';

export const STORAGE_KEY = 'NERAMAC_ASCTS_DATA_V8';

const PERSISTED_COLLECTIONS = [
  'farmers',
  'farmerApplications',
  'plantations',
  'pologens',
  'trees',
  'inoculations',
  'harvests',
  'harvestBatches',
  'permits',
  'movements',
  'aggregations',
  'distillations',
  'labTests',
  'finishedProducts',
  'exportBatches',
  'shipmentLots',
  'domesticSales',
  'inventory',
  'auditLogs'
];

function getInitialCollections() {
  return {
    farmers: [...MOCK_FARMERS],
    farmerApplications: [...MOCK_FARMER_APPLICATIONS],
    plantations: [...MOCK_PLANTATIONS],
    pologens: [...MOCK_POLOGENS],
    trees: [...MOCK_TREES],
    inoculations: [...MOCK_INOCULATIONS],
    harvests: [...MOCK_HARVESTS],
    harvestBatches: [...MOCK_HARVEST_BATCHES],
    permits: [...MOCK_PERMITS],
    movements: [...MOCK_MOVEMENTS],
    aggregations: [...MOCK_AGGREGATIONS],
    distillations: [...MOCK_DISTILLATIONS],
    labTests: [...MOCK_LAB_TESTS],
    finishedProducts: [...MOCK_FINISHED_PRODUCTS],
    exportBatches: [...MOCK_EXPORT_BATCHES],
    shipmentLots: [...MOCK_SHIPMENT_LOTS],
    domesticSales: [...MOCK_DOMESTIC_SALES],
    inventory: [...MOCK_INVENTORY],
    auditLogs: [...MOCK_AUDIT_LOGS]
  };
}

function hydrateCollectionsFromStorage() {
  const base = getInitialCollections();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      persistCollections(base);
      return base;
    }
    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed.farmers)) base.farmers = parsed.farmers;
    if (Array.isArray(parsed.farmerApplications)) base.farmerApplications = parsed.farmerApplications;
    if (Array.isArray(parsed.plantations)) base.plantations = parsed.plantations;
    if (Array.isArray(parsed.pologens)) base.pologens = parsed.pologens;
    if (Array.isArray(parsed.trees)) base.trees = parsed.trees;
    if (Array.isArray(parsed.inoculations)) base.inoculations = parsed.inoculations;
    if (Array.isArray(parsed.harvests)) base.harvests = parsed.harvests;
    if (Array.isArray(parsed.harvestBatches)) base.harvestBatches = parsed.harvestBatches;
    if (Array.isArray(parsed.permits)) base.permits = parsed.permits;
    if (Array.isArray(parsed.movements)) base.movements = parsed.movements;
    if (Array.isArray(parsed.aggregations)) base.aggregations = parsed.aggregations;
    if (Array.isArray(parsed.distillations)) base.distillations = parsed.distillations;
    if (Array.isArray(parsed.labTests)) base.labTests = parsed.labTests;
    if (Array.isArray(parsed.finishedProducts)) base.finishedProducts = parsed.finishedProducts;
    if (Array.isArray(parsed.exportBatches)) base.exportBatches = parsed.exportBatches;
    if (Array.isArray(parsed.shipmentLots)) base.shipmentLots = parsed.shipmentLots;
    if (Array.isArray(parsed.domesticSales)) base.domesticSales = parsed.domesticSales;
    if (Array.isArray(parsed.inventory)) base.inventory = parsed.inventory;
    if (Array.isArray(parsed.auditLogs)) base.auditLogs = parsed.auditLogs;
  } catch (e) {
    console.warn('Failed to parse saved store state:', e);
  }
  return base;
}

function getInitialUser() {
  try {
    const savedUser = localStorage.getItem('NERAMAC_CURRENT_USER');
    if (savedUser) return JSON.parse(savedUser);
  } catch (e) {}
  const defaultCred = ROLE_CREDENTIALS.find(r => r.role === 'NERAMAC_ADMIN') || ROLE_CREDENTIALS[0];
  return {
    role: defaultCred.role,
    username: defaultCred.username,
    name: defaultCred.roleName,
    badge: defaultCred.badge,
    defaultRoute: defaultCred.defaultRoute,
    farmerId: defaultCred.farmerId || null,
    farmerName: defaultCred.farmerName || null,
    isAuthenticated: true
  };
}

function getInitialRole() {
  try {
    return localStorage.getItem('NERAMAC_ACTIVE_ROLE') || 'NERAMAC_ADMIN';
  } catch (e) {
    return 'NERAMAC_ADMIN';
  }
}

function stripOversizedMedia(value) {
  if (typeof value === 'string') {
    if ((value.startsWith('data:') || value.startsWith('blob:')) && value.length > 40000) {
      return '';
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(stripOversizedMedia);
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = stripOversizedMedia(v);
    }
    return out;
  }
  return value;
}

function persistCollections(nextState) {
  const payload = {};
  for (const key of PERSISTED_COLLECTIONS) {
    payload[key] = nextState[key];
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    // Fallback if large base64 files exceed localStorage quota
    try {
      const compactPayload = stripOversizedMedia(payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compactPayload));
    } catch (innerErr) {
      console.warn('LocalStorage save error:', innerErr);
    }
  }
}

const listeners = new Set();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

let state = {
  ...hydrateCollectionsFromStorage(),
  activeRole: getInitialRole(),
  currentUser: getInitialUser(),
  searchQuery: '',
  dispatchIntent: null,
  toasts: [],
  collectionCentres: MOCK_COLLECTION_CENTRES,
  processingCentres: MOCK_PROCESSING_CENTRES,
  facilities: MOCK_FACILITIES
};

const storeApi = {
  getState: () => state,

  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setState: (partialOrUpdater, shouldPersist = true) => {
    const partial = typeof partialOrUpdater === 'function' ? partialOrUpdater(state) : partialOrUpdater;
    if (!partial || typeof partial !== 'object') return state;
    state = { ...state, ...partial };
    if (shouldPersist) {
      const touchesCollection = PERSISTED_COLLECTIONS.some(k => Object.prototype.hasOwnProperty.call(partial, k));
      if (touchesCollection) {
        persistCollections(state);
      }
      if (Object.prototype.hasOwnProperty.call(partial, 'activeRole') && state.activeRole) {
        try {
          localStorage.setItem('NERAMAC_ACTIVE_ROLE', state.activeRole);
        } catch (e) {}
      }
      if (Object.prototype.hasOwnProperty.call(partial, 'currentUser') && state.currentUser) {
        try {
          localStorage.setItem('NERAMAC_CURRENT_USER', JSON.stringify(state.currentUser));
        } catch (e) {}
      }
    }
    emitChange();
    return state;
  },

  // ── Generic CRUD Operations ──────────────────────────────────────────────────

  // READ
  readAll: (collection) => state[collection] || [],

  readById: (collection, id) => (state[collection] || []).find(item => item.id === id) || null,

  query: (collection, predicate) => (state[collection] || []).filter(predicate),

  // CREATE (Write)
  create: (collection, item, { prepend = true } = {}) => {
    const list = state[collection] || [];
    const nextList = prepend ? [item, ...list] : [...list, item];
    storeApi.setState({ [collection]: nextList }, true);
    return item;
  },

  // UPDATE
  update: (collection, id, updates) => {
    const list = state[collection] || [];
    const nextList = list.map(item => {
      if (item.id !== id) return item;
      return typeof updates === 'function' ? updates(item) : { ...item, ...updates };
    });
    storeApi.setState({ [collection]: nextList }, true);
    return nextList.find(item => item.id === id) || null;
  },

  updateWhere: (collection, predicate, updater) => {
    const list = state[collection] || [];
    const nextList = list.map(item => {
      if (!predicate(item)) return item;
      return typeof updater === 'function' ? updater(item) : { ...item, ...updater };
    });
    storeApi.setState({ [collection]: nextList }, true);
    return nextList;
  },

  // DELETE
  remove: (collection, id) => {
    const list = state[collection] || [];
    const nextList = list.filter(item => item.id !== id);
    storeApi.setState({ [collection]: nextList }, true);
    return nextList;
  },

  removeWhere: (collection, predicate) => {
    const list = state[collection] || [];
    const nextList = list.filter(item => !predicate(item));
    storeApi.setState({ [collection]: nextList }, true);
    return nextList;
  },

  // REPLACE COLLECTION
  setCollection: (collection, itemsOrUpdater) => {
    const current = state[collection];
    const nextValue = typeof itemsOrUpdater === 'function' ? itemsOrUpdater(current) : itemsOrUpdater;
    storeApi.setState({ [collection]: nextValue }, PERSISTED_COLLECTIONS.includes(collection));
    return nextValue;
  },

  // BATCH PATCH & PERSIST
  patchState: (partialUpdate = {}) => {
    return storeApi.setState(partialUpdate, true);
  },

  persistState: (partialUpdate = {}) => {
    return storeApi.setState(partialUpdate, true);
  },

  // RESET
  resetStore: () => {
    const initial = getInitialCollections();
    persistCollections(initial);
    return storeApi.setState(initial, false);
  }
};

// Cross-tab persistence sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      storeApi.setState(hydrateCollectionsFromStorage(), false);
    }
  });
}

/**
 * Central reactive store hook backed by useSyncExternalStore.
 * Supports optional selector: const farmers = useStore(s => s.farmers);
 */
export function useStore(selector) {
  const snapshot = useSyncExternalStore(
    storeApi.subscribe,
    storeApi.getState,
    storeApi.getState
  );
  return selector ? selector(snapshot) : { ...snapshot, ...storeApi };
}

Object.assign(useStore, storeApi);
export default useStore;
