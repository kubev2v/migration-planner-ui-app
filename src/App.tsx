import React, { Fragment, useEffect } from "react";
import { useChrome } from "@redhat-cloud-services/frontend-components/useChrome";
import { Spinner } from "@patternfly/react-core";
import {
  Container  
} from "@migration-planner-ui/ioc";
import { Provider as DependencyInjectionProvider } from "@migration-planner-ui/ioc";
import { Configuration } from "@migration-planner-ui/api-client/runtime";
import { AgentApi } from "@migration-planner-ui/agent-client/apis";
import Routing from "./Routing";
import { Symbols } from "./main/Symbols";

export const getConfigurationBasePath = (): string => {
  return `${window.location.origin}/agent/api/v1`;
};

function getConfiguredContainer(): Container {
  const agentApiConfig = new Configuration({
    basePath: getConfigurationBasePath(),
  });
  const container = new Container();
  container.register(Symbols.AgentApi, new AgentApi(agentApiConfig));

  return container;
}

const App = () => {
  const { updateDocumentTitle } = useChrome();

  useEffect(() => {
    updateDocumentTitle("Migration assessment");
  }, []);

  const container = getConfiguredContainer();

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
