import React, { Fragment, useEffect, useMemo } from "react";
import { useChrome } from "@redhat-cloud-services/frontend-components/useChrome";
import { Spinner } from "@patternfly/react-core";
import { Container } from "@migration-planner-ui/ioc";
import { Provider as DependencyInjectionProvider } from "@migration-planner-ui/ioc";
import { Configuration } from "@migration-planner-ui/api-client/runtime";
import { AgentApi } from "@migration-planner-ui/agent-client/apis";
import { ImageApi, SourceApi } from "@migration-planner-ui/api-client/apis";
import Routing from "./Routing";
import { Symbols } from "./main/Symbols";
import { createAuthFetch } from "./utils/authFetch";

const App = () => {
  const chrome = useChrome(); // useChrome SÍ puede usarse acá
  const [container, setContainer] = React.useState<Container>();

  useEffect(() => {
    const configure = () => {
      const authFetch = createAuthFetch(chrome); // pasamos chrome

      const plannerApiConfig = new Configuration({
        basePath: process.env.PLANNER_API_BASE_URL || '/api/migration-assessment',
        fetchApi: authFetch,
      });

      const c = new Container();
      c.register(Symbols.ImageApi, new ImageApi(plannerApiConfig));
      c.register(Symbols.SourceApi, new SourceApi(plannerApiConfig));
      c.register(Symbols.AgentApi, new AgentApi(plannerApiConfig));

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
