// src/standalone-entry.tsx

// Only declare global types in standalone mode to avoid conflicts with the main app
// We'll use direct assignment instead of interface declaration to avoid conflicts

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

import App from './App'; // Make sure this path is correct relative to standalone-entry.tsx

// --- Mock/Standalone Shell Components ---
const StandaloneHeader: React.FC = () => (
  <header>
    <h1>Migration Assessment App (Standalone)</h1>
    <nav>
      <Link to="/">Home</Link>
      <Link to="/inventory">Inventory</Link>
      <Link to="/assessments">Assessments</Link>
      <Link to="/issues">Issues</Link>
    </nav>
  </header>
);

const StandaloneFooter: React.FC = () => (
  <footer>
    <p>&copy; {new Date().getFullYear()} Red Hat, Inc. All Rights Reserved.</p>
  </footer>
);

// --- Standalone App Wrapper ---
const StandaloneAppWrapper: React.FC = () => {
  return (
    <BrowserRouter>
      <StandaloneHeader />
      <main>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </main>
      <StandaloneFooter />
    </BrowserRouter>
  );
};

// --- DOM Rendering ---
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <StandaloneAppWrapper />
    </React.StrictMode>,
  );
} else {
  console.error(
    'Root element #root not found in the DOM. Ensure public/standalone.html has <div id="root"></div>',
  );
}

// --- GLOBAL MOCKS for window.insights.chrome ---
if (process.env.STANDALONE_MODE) {
  // Use direct assignment to avoid TypeScript conflicts
  (window as Record<string, unknown>).insights = {
    chrome: {
      auth: {
        getUser: () =>
          Promise.resolve({
            identity: {
              account_number: '000000',
              type: 'User',
              org_id: 'standalone-org-id',
              user: {
                email: 'standalone@example.com',
                first_name: 'Standalone',
                last_name: 'User',
                is_active: true,
                is_org_admin: true,
                username: 'standalone-dev',
                is_internal: false,
                locale: 'en-US',
              },
            },
            entitlements: {
              'migration-assessment': { is_entitled: true, is_trial: false },
            },
            entitled: {
              'migration-assessment': true,
            },
          }),
<<<<<<< HEAD
        getToken: (): Promise<string> =>
          Promise.resolve('mock-standalone-token'),
        getOfflineToken: (): Promise<string> =>
          Promise.resolve('mock-offline-token'),
        getRefreshToken: (): Promise<string> =>
          Promise.resolve('mock-refresh-token'),
        login: (): Promise<void> => Promise.resolve(),
        logout: (): void => {},
||||||| parent of f8c7e08 (Implement assessment new design with RVTools creation flow only)
          },
          entitlements: {
            'migration-assessment': { is_entitled: true, is_trial: false },
          },
          entitled: {
            'migration-assessment': true
          }
        }),
        getToken: () => Promise.resolve('mock-standalone-token'),
        getOfflineToken: () => Promise.resolve('mock-offline-token'),
        getRefreshToken: () => Promise.resolve('mock-refresh-token'),
        login: () => Promise.resolve(),
        logout: () => {},
=======
        getToken: () => Promise.resolve('mock-standalone-token'),
        getOfflineToken: () => Promise.resolve('mock-offline-token'),
        getRefreshToken: () => Promise.resolve('mock-refresh-token'),
        login: () => Promise.resolve(),
        logout: () => {},
>>>>>>> f8c7e08 (Implement assessment new design with RVTools creation flow only)
        qe: {},
        reAuthWithScopes: (..._scopes: string[]): Promise<void> =>
          Promise.resolve(),
        doOffline: (): void => {},
      },
      is: {
        serviceAvailable: (): Promise<boolean> => Promise.resolve(true),
        entitled: (): Promise<boolean> => Promise.resolve(true),
        appNavAvailable: (): boolean => true,
        edge: (): boolean => false,
      },
      appNav: {
        get: (): unknown[] => [],
      },
      identifyApp: (appName: string): Promise<boolean> => {
        console.log(`[Standalone Mock] identifyApp called with: ${appName}`);
        return Promise.resolve(true);
      },
<<<<<<< HEAD
      on: (event: string, _callback: (...args: unknown[]) => void): void => {
        console.log(
          `[Standalone Mock] Event listener for "${event}" registered.`,
        );
        return (): void =>
||||||| parent of f8c7e08 (Implement assessment new design with RVTools creation flow only)
      on: (event: string, callback: Function) => {
        console.log(`[Standalone Mock] Event listener for "${event}" registered.`);
        return () => console.log(`[Standalone Mock] Event listener for "${event}" unregistered.`);
=======
      on: (event: string, callback: Function) => {
        console.log(
          `[Standalone Mock] Event listener for "${event}" registered.`,
        );
        return () =>
>>>>>>> f8c7e08 (Implement assessment new design with RVTools creation flow only)
          console.log(
            `[Standalone Mock] Event listener for "${event}" unregistered.`,
          );
      },
      init: (): void => {
        console.log('[Standalone Mock] insights.chrome.init() called.');
      },
<<<<<<< HEAD
      getUserPermissions: (): Promise<Record<string, unknown>[]> =>
||||||| parent of f8c7e08 (Implement assessment new design with RVTools creation flow only)
      getUserPermissions: () => Promise.resolve([
        { permission: 'app:read', resource: '*', resourceDefinitions: [] }
      ]),
=======
      getUserPermissions: () =>
>>>>>>> f8c7e08 (Implement assessment new design with RVTools creation flow only)
        Promise.resolve([
          { permission: 'app:read', resource: '*', resourceDefinitions: [] },
        ]),
    },
  };

  console.warn('Running in STANDALONE_MODE. Global insights.chrome is mocked.');
}
