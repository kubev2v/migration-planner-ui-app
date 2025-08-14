import React, { Suspense } from 'react';
import { Route as RouterRoute, Routes as RouterRoutes } from 'react-router-dom';
import { InvalidObject } from '@redhat-cloud-services/frontend-components/InvalidObject';
import { Bullseye, Spinner } from '@patternfly/react-core';
import AssessmentDetailsPage from './pages/AssessmentDetailsPage';
import MigrationAssessmentPage from './pages/MigrationAssessmentPage';
import MigrationWizardPage from './pages/MigrationWizardPage';

interface RouteType {
  path?: string;
  element: React.ComponentType<Record<string, unknown>>;
  childRoutes?: RouteType[];
  elementProps?: Record<string, unknown>;
}

const Routing: React.FC = () => {
  const routes: RouteType[] = [
    {
      path: '/',
      element: MigrationAssessmentPage,
    },
    {
      path: '/migrate/assessments/:id',
      element: AssessmentDetailsPage,
    },
    {
      path: '/migrate/wizard',
      element: MigrationWizardPage,
    },
    {
      path: '*',
      element: InvalidObject,
    },
  ];

  const renderRoutes = (routes: RouteType[] = []): JSX.Element[] =>
    routes.map(({ path, element: Element, childRoutes, elementProps }) => (
      <RouterRoute
        key={path}
        path={path}
        element={<Element {...elementProps} />}
      >
        {renderRoutes(childRoutes)}
      </RouterRoute>
    ));

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      <RouterRoutes>{renderRoutes(routes)}</RouterRoutes>
    </Suspense>
  );
};

export default Routing;
