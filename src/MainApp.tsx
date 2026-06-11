import { Bullseye, Spinner } from "@patternfly/react-core";
import { useChrome } from "@redhat-cloud-services/frontend-components/useChrome";
import { Provider } from "@y0n1/react-ioc";
import { Suspense, useMemo } from "react";

import { createContainer } from "./config/Dependencies";
import { FeatureGateContextProvider } from "./features/featureGate";
import { getFeatureFlagsFromChrome } from "./features/getFeatureFlags";
import { AppRoutes } from "./routing/AppRoutes";
import { ChatWidget } from "./ui/chat-widget";
import { VersionInfoView } from "./ui/version-info/views/VersionInfoView";

const MainApp: React.FC = () => {
  const chrome = useChrome();
  const { auth } = chrome;
  const features = useMemo(() => getFeatureFlagsFromChrome(chrome), [chrome]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const container = useMemo(() => createContainer(auth), []);

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      <FeatureGateContextProvider features={features}>
        <Provider container={container}>
          <VersionInfoView />
          <AppRoutes />
          {features["oma-chatbot"] && <ChatWidget />}
        </Provider>
      </FeatureGateContextProvider>
    </Suspense>
  );
};
MainApp.displayName = "MainApp";

export default MainApp;
