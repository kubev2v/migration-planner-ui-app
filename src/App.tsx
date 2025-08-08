import React, { Fragment, useEffect, useMemo } from 'react';

import { AgentApi } from '@migration-planner-ui/agent-client/apis';
import {
  AssessmentApi,
  ImageApi,
  SourceApi,
} from '@migration-planner-ui/api-client/apis';

import { AgentApi } from '@migration-planner-ui/agent-client/apis';
import { Configuration } from '@migration-planner-ui/api-client/runtime';
import { Container } from '@migration-planner-ui/ioc';
import { Provider as DependencyInjectionProvider } from '@migration-planner-ui/ioc';
import { Spinner } from '@patternfly/react-core';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

import { Symbols } from './main/Symbols';
import { createAuthFetch } from './utils/authFetch';
import Routing from './Routing';

const App = (): JSX.Element => {
  const chrome = useChrome(); // useChrome SÍ puede usarse acá
  const [container, setContainer] = React.useState<Container>();

  useEffect(() => {
    const configure = (): void => {
      const authFetch = createAuthFetch(chrome); // pasamos chrome

      const plannerApiConfig = new Configuration({
        basePath:
          process.env.PLANNER_API_BASE_URL || '/api/migration-assessment',
        fetchApi: authFetch,
      });

      const c = new Container();
      c.register(Symbols.ImageApi, new ImageApi(plannerApiConfig));
      c.register(Symbols.SourceApi, new SourceApi(plannerApiConfig));
      c.register(Symbols.AgentApi, new AgentApi(plannerApiConfig));
      c.register(Symbols.AssessmentApi, new AssessmentApi(plannerApiConfig));

      setContainer(c);
    };

    configure();
  }, [chrome]);

  if (!container) {
    return <Spinner />;
  }

  return (
    <Fragment>
      <DependencyInjectionProvider container={container}>
        <React.Suspense fallback={<Spinner />}>
          <Routing />
        </React.Suspense>
      </DependencyInjectionProvider>
    </Fragment>
  );
};

export default App;
