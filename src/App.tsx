import React, { Fragment, useEffect } from 'react';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

import Routing from './Routing';

const App = () => {
  const { updateDocumentTitle } = useChrome();

  useEffect(() => {
    updateDocumentTitle('Migration assessment');
  }, []);

  return (
    <Fragment>
      <Routing />
    </Fragment>
  );
};

export default App;