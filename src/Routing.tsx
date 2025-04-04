import "@patternfly/react-core/dist/styles/base.css";

import React, { Suspense, lazy, useMemo } from "react";
import { Route as RouterRoute, Routes as RouterRoutes } from "react-router-dom";
import { InvalidObject } from "@redhat-cloud-services/frontend-components/InvalidObject";
import { Bullseye, Spinner } from "@patternfly/react-core";
import MigrationAssessmentPage from "./pages/MigrationAssessmentPage";
import MigrationWizardPage from "./pages/MigrationWizardPage";


const routes = [
  {
    path: "/",
    element: MigrationAssessmentPage,
  },
  {
    path: "/migrate/wizard",
    element: MigrationWizardPage,
  },
  {
    path: "*",
    element: InvalidObject,
  },
];

interface RouteType {
  path?: string;
  element: React.ComponentType;
  childRoutes?: RouteType[];
  elementProps?: Record<string, unknown>;
}

const renderRoutes = (routes: RouteType[] = []) =>
  routes.map(({ path, element: Element, childRoutes, elementProps }) => (
    <RouterRoute key={path} path={path} element={<Element {...elementProps} />}>
      {renderRoutes(childRoutes)}
    </RouterRoute>
  ));

const Routing = () => {
  const renderedRoutes = useMemo(() => renderRoutes(routes), [routes]);
  return (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      <RouterRoutes>{renderedRoutes}</RouterRoutes>
    </Suspense>
  );
};

export default Routing;
