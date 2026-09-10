import {
  Content,
  Stack,
  StackItem,
  Tab,
  TabContent,
  TabContentBody,
  Tabs,
  TabTitleText,
} from "@patternfly/react-core";
import React from "react";

import { routes } from "../../../routing/Routes";
import { AppPage } from "../../core/components/AppPage";
import { useExampleReportViewModel } from "../view-models/useExampleReportViewModel";
import { Dashboard } from "./assessment-report/Dashboard";
import { ReportFilterBar } from "./assessment-report/ReportFilterBar";
import { ReportSourceStatus } from "./assessment-report/ReportSourceStatus";
import { EXAMPLE_FORM_VALUES } from "./example-data/clusterSizingFixture";
import { MigrationRecommendations } from "./migration-recommendations/MigrationRecommendations";
import { reportTabsStyle } from "./migration-recommendations/styles";

const ExampleReport: React.FC = () => {
  const vm = useExampleReportViewModel();

  return (
    <AppPage
      breadcrumbs={[
        {
          key: 1,
          to: routes.assessments,
          children: "Migration advisor",
        },
        {
          key: 2,
          children: "RVTools example report",
          isActive: true,
        },
      ]}
      title="RVTools example report"
      caption={
        <Stack hasGutter>
          <StackItem>
            <ReportSourceStatus sourceType="rvtools" />
          </StackItem>
          <StackItem>
            This is an example report showcasing the migration advisor dashboard
            for RVTools file upload.
          </StackItem>
          <StackItem>{vm.detectedSummaryText}</StackItem>
          <StackItem>
            <ReportFilterBar
              clusterView={vm.clusterView}
              clusterSelectDisabled={vm.clusterSelectDisabled}
              isClusterSelectOpen={vm.isClusterSelectOpen}
              onClusterSelectOpenChange={vm.setIsClusterSelectOpen}
              onClusterSelect={vm.handleClusterSelect}
              groupView={vm.groupView}
              isGroupSelectOpen={vm.isGroupSelectOpen}
              onGroupSelectOpenChange={vm.setIsGroupSelectOpen}
              onGroupSelect={vm.handleGroupSelect}
              groupFilterComingSoon
            />
          </StackItem>
        </Stack>
      }
    >
      <Tabs
        activeKey={vm.activeReportTab}
        onSelect={(_event, tabIndex) => {
          if (tabIndex === "report" || tabIndex === "recommendations") {
            vm.setActiveReportTab(tabIndex);
          }
        }}
        aria-label="Assessment report sections"
        className={reportTabsStyle}
      >
        <Tab
          eventKey="report"
          title={<TabTitleText>Migration report</TabTitleText>}
          tabContentId="example-report-panel"
        />
        <Tab
          eventKey="recommendations"
          title={<TabTitleText>Migration recommendations</TabTitleText>}
          tabContentId="example-recommendations-panel"
        />
      </Tabs>

      <TabContent
        eventKey="report"
        id="example-report-panel"
        activeKey={vm.activeReportTab}
        hidden={vm.activeReportTab !== "report"}
        aria-label="Migration report"
      >
        <TabContentBody>
          {vm.clusterView.viewInfra &&
          vm.clusterView.viewVms &&
          vm.clusterView.cpuCores &&
          vm.clusterView.ramGB ? (
            <Dashboard
              infra={vm.clusterView.viewInfra}
              cpuCores={vm.clusterView.cpuCores}
              ramGB={vm.clusterView.ramGB}
              vms={vm.clusterView.viewVms}
              clusters={vm.clusterView.viewClusters}
              isAggregateView={vm.clusterView.isAggregateView}
              clusterFound={vm.clusterView.clusterFound}
            />
          ) : (
            <Content component="p">
              No data is available for the selected cluster.
            </Content>
          )}
        </TabContentBody>
      </TabContent>
      <TabContent
        eventKey="recommendations"
        id="example-recommendations-panel"
        activeKey={vm.activeReportTab}
        hidden={vm.activeReportTab !== "recommendations"}
        aria-label="Migration recommendations"
      >
        <TabContentBody>
          <MigrationRecommendations
            selectedTool={vm.selectedRecommendationTool}
            onSelectTool={vm.openRecommendationTool}
            onBack={vm.closeRecommendationTool}
            isAggregateView={vm.clusterView.isAggregateView}
            clusterName={vm.clusterView.selectionLabel}
            clusterId={vm.selectedClusterId}
            assessmentId="example"
            isReadOnly
            options={
              vm.exampleSizing
                ? {
                    initialSizerOutput: vm.exampleSizing.result,
                    initialFormValues: EXAMPLE_FORM_VALUES,
                    initialMigrationEstimation:
                      vm.exampleSizing.migrationEstimation,
                    initialComplexityEstimation:
                      vm.exampleSizing.complexityEstimation,
                    initialEstimationByComplexity:
                      vm.exampleSizing.estimationByComplexity,
                  }
                : undefined
            }
          />
        </TabContentBody>
      </TabContent>
    </AppPage>
  );
};

ExampleReport.displayName = "ExampleReport";

export default ExampleReport;
