import { Tab, TabContent, Tabs, TabTitleText } from "@patternfly/react-core";
import React from "react";
import { Outlet } from "react-router-dom";

import { AppPage } from "../../core/components/AppPage";
import { PartnerTab } from "../components/PartnerTab";
import { useHomeScreenViewModel } from "../view-models/useHomeScreenViewModel";
import HomeScreenSubtitle from "./HomeScreenSubtitle";

export const HomeScreen: React.FC = () => {
  const vm = useHomeScreenViewModel();

  return (
    <AppPage
      breadcrumbs={vm.breadcrumbs}
      title="Assess your migration from vCenter to OpenShift"
      subtitle={<HomeScreenSubtitle />}
    >
      <Tabs
        activeKey={vm.activeTabKey}
        onSelect={vm.handleTabClick}
        aria-label="Migration tabs"
        role="region"
      >
        <Tab
          eventKey={0}
          title={<TabTitleText>RVTools assessments</TabTitleText>}
          aria-label="RVTools assessments tab"
        />
        <Tab
          eventKey={1}
          title={<TabTitleText>Discovery appliances</TabTitleText>}
          aria-label="Discovery appliances tab"
        />
        <Tab
          eventKey={2}
          title={<TabTitleText>Tools</TabTitleText>}
          aria-label="Tools tab"
        />
        {vm.partnerTab && (
          <PartnerTab
            eventKey={vm.partnerTab.key}
            label={vm.partnerTab.label}
            pendingRequestsCount={vm.pendingRequestsCount}
            shouldShowBadge={vm.shouldShowBadge}
            isLoading={vm.isLoadingPartnerRequests}
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
