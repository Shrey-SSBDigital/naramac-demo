import React from 'react';
import { EnterpriseProvider } from './context/EnterpriseContext';
import AppRouterProvider from './router/appRouter';

export default function App() {
  return (
    <EnterpriseProvider>
      <AppRouterProvider />
    </EnterpriseProvider>
  );
}
