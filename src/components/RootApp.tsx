import '@patternfly/react-core/dist/styles/base.css';

import React from 'react';
import { router } from './Router';
import { RouterProvider } from 'react-router-dom';
import { Spinner } from '@patternfly/react-core';

function RootApp(): JSX.Element {
  return (
    <React.Suspense fallback={<Spinner />}>
      <RouterProvider router={router} />
    </React.Suspense>
  );
}

export default RootApp;
