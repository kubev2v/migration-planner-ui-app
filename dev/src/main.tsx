import "./mocks/insights";

import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import App from "../../src/App"; // Make sure this path is correct relative to standalone-entry.tsx

const APP_BASE = "/openshift/migration-assessment";

// --- Mock/Standalone Shell Components ---
export const StandaloneHeader: React.FC = () => (
  <header>
    <h1>Migration Assessment App (Standalone) </h1>
    <nav>
      <Link to={APP_BASE}> Home </Link>
      <Link to={`${APP_BASE}/environments`}> Inventory </Link>
      <Link to={`${APP_BASE}/assessments`}> Assessments </Link>
      <Link to={APP_BASE}> Issues </Link>
    </nav>
  </header>
);

export const StandaloneFooter: React.FC = () => (
  <footer>
    <p>&copy; {new Date().getFullYear()} Red Hat, Inc. All Rights Reserved.</p>
  </footer>
);

// --- Standalone App Wrapper ---
export const StandaloneAppWrapper: React.FC = () => {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <StandaloneHeader />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <Navigate to="/openshift/migration-assessment" replace />
            }
          />
          <Route path="/openshift/migration-assessment/*" element={<App />} />
        </Routes>
      </main>
      <StandaloneFooter />
    </BrowserRouter>
  );
};

// --- DOM Rendering ---
const rootElement = document.getElementById("root");
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
