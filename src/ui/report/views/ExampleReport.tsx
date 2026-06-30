import {
  Button,
  Content,
  Icon,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { RhUiCheckCircleIcon } from "@patternfly/react-icons";
import { t_global_color_status_success_default as globalSuccessColor100 } from "@patternfly/react-tokens/dist/js/t_global_color_status_success_default";
import React from "react";

import { routes } from "../../../routing/Routes";
import { AppPage } from "../../core/components/AppPage";
import { useExampleReportViewModel } from "../view-models/useExampleReportViewModel";
import { Dashboard } from "./assessment-report/Dashboard";
import { ReportFilterBar } from "./assessment-report/ReportFilterBar";
import { ClusterSizingWizard } from "./cluster-sizer/ClusterSizingWizard";
import { EXAMPLE_FORM_VALUES } from "./example-data/clusterSizingFixture";

const ExampleReport: React.FC = () => {
  const vm = useExampleReportViewModel();

  return (
    <AppPage
      breadcrumbs={[
        {
          key: 1,
          children: "Migration advisor",
        },
        {
          key: 2,
          to: routes.assessments,
          children: "assessments",
        },
        {
          key: 3,
          children: "RVTools example report",
          isActive: true,
        },
      ]}
      title="RVTools example report"
      headerActions={
        vm.exampleSizing ? (
          <Split hasGutter>
            <SplitItem>
              <Button
                variant="primary"
                onClick={() => vm.setIsSizingWizardOpen(true)}
              >
                View recommendation for {vm.exampleSizing.clusterName}
              </Button>
            </SplitItem>
          </Split>
        ) : undefined
      }
      caption={
        <Stack hasGutter>
          <StackItem>
            Discovery VM status :{" "}
            <Icon size="md" isInline>
              <RhUiCheckCircleIcon color={globalSuccessColor100.var} />
            </Icon>{" "}
            Ready
            <br />
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
