import { useCallback } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { ROUTE_MAP, MODULE_TO_ROUTE } from './routeConfig';

export { ROUTE_MAP, MODULE_TO_ROUTE };

/**
 * Compatibility hook for TanStack React Router
 * Provides unified navigation and current active module state across the application
 */
export function useAppRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const activeModule = ROUTE_MAP[currentPath] || 'HOME';

  const navigateTo = useCallback((target) => {
    if (!target) return;
    if (typeof target === 'string') {
      if (target.startsWith('/')) {
        navigate({ to: target });
      } else if (MODULE_TO_ROUTE[target]) {
        navigate({ to: MODULE_TO_ROUTE[target] });
      } else {
        navigate({ to: '/' });
      }
    }
  }, [navigate]);

  return {
    currentPath,
    activeModule,
    routeParams: {},
    navigate: navigateTo
  };
}
