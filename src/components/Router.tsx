import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import MigrationAssessmentPage from '../pages/MigrationAssessmentPage';

export const router = createBrowserRouter([
  {
    path: '/',
    index: true,
    element: <Navigate to="/migrate" />,
  },
  {
    path: '/migrate',
    lazy: async () => {
      return {
        Component: MigrationAssessmentPage,
      };
    },
  },
]);
