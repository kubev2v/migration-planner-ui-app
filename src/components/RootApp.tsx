import '@patternfly/react-core/dist/styles/base.css';

import React from 'react';
import { routes } from './Router';
import { BrowserRouter } from 'react-router-dom';
import { Spinner } from '@patternfly/react-core';

function RootApp(): JSX.Element {
  return (
    <React.Suspense fallback={<Spinner />}>
      <BrowserRouter>
        {routes}
      </BrowserRouter>
    </React.Suspense>
  );
}

export default RootApp;
