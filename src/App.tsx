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
import { useAccountsAccessToken } from "./hooks/useAccountsAccessToken";

function getConfiguredContainer(accessToken: string): Container {
  const plannerApiConfig = new Configuration({
    basePath: "/planner",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const container = new Container();

  container.register(Symbols.ImageApi, new ImageApi(plannerApiConfig));
  container.register(Symbols.SourceApi, new SourceApi(plannerApiConfig));
  container.register(Symbols.AgentApi, new AgentApi(plannerApiConfig));

  //For UI testing we can use the mock Apis
  //container.register(Symbols.SourceApi, new MockSourceApi(plannerApiConfig));
  //container.register(Symbols.AgentApi, new MockAgentApi(plannerApiConfig));

  return container;
}

const App = () => {
  const { updateDocumentTitle } = useChrome();
  const { accessToken } = useAccountsAccessToken();

  useEffect(() => {
    updateDocumentTitle("Migration assessment");
  }, []);

  // Reconfigure the container only when the token changes
  const container = useMemo(() => {
    if (!accessToken) return undefined;
    return getConfiguredContainer(accessToken);
  }, [accessToken]);

  // While we wait for the token, we show loading
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
