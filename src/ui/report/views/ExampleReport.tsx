import { css } from "@emotion/css";
import {
  Button,
  Content,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import React from "react";

import { routes } from "../../../routing/Routes";
import { AppPage } from "../../core/components/AppPage";
import { useExampleReportViewModel } from "../view-models/useExampleReportViewModel";
import { Dashboard } from "./assessment-report/Dashboard";
import { ReportFilterBar } from "./assessment-report/ReportFilterBar";
import { ReportSourceStatus } from "./assessment-report/ReportSourceStatus";
import { ClusterSizingWizard } from "./cluster-sizer/ClusterSizingWizard";
import { EXAMPLE_FORM_VALUES } from "./example-data/clusterSizingFixture";

const reservedHeaderActionStyle = css`
  visibility: hidden;
  pointer-events: none;
`;

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
      headerActions={
        <Split hasGutter>
          <SplitItem
            className={vm.exampleSizing ? undefined : reservedHeaderActionStyle}
            aria-hidden={!vm.exampleSizing}
          >
            <Button
              variant="primary"
              tabIndex={vm.exampleSizing ? undefined : -1}
              onClick={() => vm.setIsSizingWizardOpen(true)}
            >
              View recommendation for{" "}
              {vm.exampleSizing?.clusterName ?? "Cluster domain-c146658"}
            </Button>
          </SplitItem>
        </Split>
      }
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

      {vm.exampleSizing && (
        <ClusterSizingWizard
          key={vm.selectedClusterId}
          isOpen={vm.isSizingWizardOpen}
          onClose={() => vm.setIsSizingWizardOpen(false)}
          clusterName={vm.exampleSizing.clusterName}
          clusterId={vm.selectedClusterId}
          assessmentId="example"
          options={{
            initialSizerOutput: vm.exampleSizing.result,
            initialFormValues: EXAMPLE_FORM_VALUES,
            initialMigrationEstimation: vm.exampleSizing.migrationEstimation,
            initialComplexityEstimation: vm.exampleSizing.complexityEstimation,
            initialEstimationByComplexity:
              vm.exampleSizing.estimationByComplexity,
          }}
          isReadOnly
        />
      )}
    </AppPage>
  );
};

ExampleReport.displayName = "ExampleReport";

export default ExampleReport;
