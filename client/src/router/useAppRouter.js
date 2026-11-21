import { useState, useEffect, useCallback } from 'react';

// Path to Module ID mapping with full support for singular/plural routes and aliases
export const ROUTE_MAP = {
  '/': 'HOME',
  '/home': 'HOME',
  '/dashboard': 'DASHBOARD',
  '/farmer': 'FARMERS',
  '/farmers': 'FARMERS',
  '/farmer/register': 'FARMER_REGISTER',
  '/farmers/register': 'FARMER_REGISTER',
  '/farmer/approvals': 'FARMER_APPROVALS',
  '/farmers/approvals': 'FARMER_APPROVALS',
  '/field-agent': 'FIELD_INSPECTION',
  '/field-inspection': 'FIELD_INSPECTION',
  '/field-gis-studio': 'GEO_STUDIO',
  '/plantations': 'PLANTATIONS',
  '/inoculation': 'INOCULATION',
  '/harvest': 'HARVEST',
  '/permits': 'PERMITS',
  '/dfo': 'PERMITS',
  '/movement': 'MOVEMENT',
  '/aggregation': 'AGGREGATION',
  '/processing': 'PROCESSING',
  '/cpc': 'PROCESSING',
  '/laboratory': 'LABORATORY',
  '/lab': 'LABORATORY',
  '/inventory': 'INVENTORY',
  '/finished-products': 'FINISHED_PRODUCTS',
  '/export': 'EXPORT',
  '/shipments': 'SHIPMENT',
  '/shipment': 'SHIPMENT',
  '/domestic-sales': 'DOMESTIC_SALES',
  '/traceability': 'TRACEABILITY',
  '/verify': 'TRACEABILITY',
  '/audit-reports': 'AUDIT_REPORTS',
  '/flow': 'FLOW'
};

// Module ID to canonical Path mapping
export const MODULE_TO_ROUTE = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  FARMERS: '/farmer',
  FARMER_REGISTER: '/farmer/register',
  FARMER_APPROVALS: '/farmer/approvals',
  PLANTATIONS: '/plantations',
  FIELD_INSPECTION: '/field-inspection',
  GEO_STUDIO: '/field-gis-studio',
  INOCULATION: '/inoculation',
  HARVEST: '/harvest',
  PERMITS: '/permits',
  MOVEMENT: '/movement',
  AGGREGATION: '/aggregation',
  PROCESSING: '/processing',
  LABORATORY: '/laboratory',
  INVENTORY: '/inventory',
  FINISHED_PRODUCTS: '/finished-products',
  EXPORT: '/export',
  SHIPMENT: '/shipments',
  DOMESTIC_SALES: '/domestic-sales',
  TRACEABILITY: '/traceability',
  AUDIT_REPORTS: '/audit-reports',
  FLOW: '/flow'
};

/**
 * Parses the current browser URL to find matching module ID and query params
 */
function resolveCurrentRoute() {
  if (typeof window === 'undefined') {
    return { path: '/', module: 'HOME', params: {} };
  }

  // Check hash fallback (e.g. #/farmer/register) or pathname
  let path = window.location.pathname || '/';
  if (window.location.hash && window.location.hash.startsWith('#/')) {
    path = window.location.hash.slice(1);
  }

  // Handle direct verify routes like /verify/PCK-NER-2026-001
  if (path.startsWith('/verify/')) {
    const code = path.split('/verify/')[1] || '';
    return { path: '/traceability', module: 'TRACEABILITY', params: { verifyCode: code } };
  }

  // Exact match
  if (ROUTE_MAP[path]) {
    return { path, module: ROUTE_MAP[path], params: {} };
  }

  // Strip trailing slash if any
  const normalized = path.replace(/\/$/, '');
  if (ROUTE_MAP[normalized]) {
    return { path: normalized, module: ROUTE_MAP[normalized], params: {} };
  }

  // Default to HOME if at root or unknown
  return { path: '/', module: 'HOME', params: {} };
}

/**
 * Custom lightweight browser router hook with HTML5 History API integration
 */
export function useAppRouter() {
  const [routeState, setRouteState] = useState(() => resolveCurrentRoute());

  // Listen to browser Back / Forward history events
  useEffect(() => {
    const handlePopState = () => {
      setRouteState(resolveCurrentRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  /**
   * Navigate to a path or module ID with pushState
   */
  const navigate = useCallback((target, params = {}) => {
    let targetPath = '/';
    let targetModule = 'HOME';

    if (MODULE_TO_ROUTE[target]) {
      // Called with module ID (e.g. 'FARMER_REGISTER')
      targetModule = target;
      targetPath = MODULE_TO_ROUTE[target];
    } else if (ROUTE_MAP[target]) {
      // Called with path (e.g. '/farmer/register')
      targetPath = target;
      targetModule = ROUTE_MAP[target];
    } else if (typeof target === 'string' && target.startsWith('/')) {
      targetPath = target;
      const cleanPath = target.split('?')[0].replace(/\/$/, '') || '/';
      targetModule = ROUTE_MAP[cleanPath] || 'HOME';
    }

    try {
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ module: targetModule }, '', targetPath);
      }
    } catch (e) {
      window.location.hash = targetPath;
    }

    setRouteState({ path: targetPath, module: targetModule, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    currentPath: routeState.path,
    activeModule: routeState.module,
    routeParams: routeState.params,
    navigate
  };
}
