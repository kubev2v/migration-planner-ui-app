import { Tab, TabContent, Tabs, TabTitleText } from "@patternfly/react-core";
import React from "react";
import { Outlet } from "react-router-dom";

import { AppPage } from "../../core/components/AppPage";
import { useHomeScreenViewModel } from "../view-models/useHomeScreenViewModel";
import HowDoesItWork from "./HowDoesItWork";

export const HomeScreen: React.FC = () => {
  const vm = useHomeScreenViewModel();

  return (
    <AppPage
      breadcrumbs={vm.breadcrumbs}
      title="Start Your VMWare to OpenShift Migration"
      caption={<HowDoesItWork />}
    >
      <Tabs
        activeKey={vm.activeTabKey}
        onSelect={vm.handleTabClick}
        aria-label="Migration tabs"
        role="region"
      >
        <Tab
          eventKey={0}
          title={<TabTitleText>Assessments</TabTitleText>}
          aria-label="Assessments tab"
        />
        <Tab
          eventKey={1}
          title={<TabTitleText>Environments</TabTitleText>}
          aria-label="Environments tab"
        />
        {vm.partnerTab && (
          <Tab
            eventKey={vm.partnerTab.key}
            title={<TabTitleText>{vm.partnerTab.label}</TabTitleText>}
            aria-label={`${vm.partnerTab.label} tab`}
          />
        )}
      </Tabs>

      <TabContent id="home-screen-content">
        <Outlet context={{ rvtoolsOpenToken: vm.rvtoolsOpenToken }} />
      </TabContent>
    </AppPage>
  );
};

HomeScreen.displayName = "HomeScreen";

export default HomeScreen;
