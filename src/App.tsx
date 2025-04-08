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
import { SourceApi } from "@migration-planner-ui/api-client/apis";
import { useAccountsAccessToken } from "./hooks/useAccountsAccessToken";

function getConfiguredContainer(accessToken: string): Container {
  const plannerApiConfig = new Configuration({
    basePath: `https://migration-planner-assisted-migration-stage.apps.crcs02ue1.urby.p1.openshiftapps.com`,
    headers: {
      Authorization: `Bearer ${accessToken}`, // Use access token here
    },
  });

  const container = new Container();
  
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

  const container = getConfiguredContainer(accessToken);

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
