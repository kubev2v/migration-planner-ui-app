import { css } from "@emotion/css";
import {
  Button,
  Content,
  Flex,
  FlexItem,
  Icon,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { CheckCircleIcon } from "@patternfly/react-icons";
import { t_global_color_status_success_default as globalSuccessColor100 } from "@patternfly/react-tokens/dist/js/t_global_color_status_success_default";
import React from "react";

import { routes } from "../../../routing/Routes";
import { AppPage } from "../../core/components/AppPage";
import { useExampleReportViewModel } from "../view-models/useExampleReportViewModel";
import type { ClusterOption } from "./assessment-report/ClusterView";
import { ClusterDrsConfiguration } from "./assessment-report/ClusterDrsConfiguration";
import { Dashboard } from "./assessment-report/Dashboard";
import { ClusterSizingWizard } from "./cluster-sizer/ClusterSizingWizard";
import { EXAMPLE_FORM_VALUES } from "./example-data/clusterSizingFixture";

const clusterToggleStyle = css`
  min-width: 422px;
`;

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
            <Content component="p">
              Discovery VM status:{" "}
              <Icon size="sm" isInline>
                <CheckCircleIcon color={globalSuccessColor100.var} />
              </Icon>{" "}
              Ready
            </Content>
            <Content component="small">
              This is an example report showcasing the migration advisor
              dashboard for RVTools file upload.
            </Content>
          </StackItem>
          <StackItem>
            <Content component="p">{vm.detectedSummaryText}</Content>
          </StackItem>
          {vm.vcenterVersion && (
            <StackItem>
              <Content component="p">
                vCenter version: <strong>{vm.vcenterVersion}</strong>
              </Content>
            </StackItem>
          )}
          <StackItem>
            <Flex
              gap={{ default: "gapLg" }}
              alignItems={{ default: "alignItemsFlexStart" }}
              flexWrap={{ default: "wrap" }}
            >
              <FlexItem>
                <Select
                  isScrollable
                  isOpen={vm.isClusterSelectOpen}
                  selected={vm.clusterView.selectionId}
                  onSelect={vm.handleClusterSelect}
                  onOpenChange={(isOpen: boolean) => {
                    if (!vm.clusterSelectDisabled)
                      vm.setIsClusterSelectOpen(isOpen);
                  }}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      isExpanded={vm.isClusterSelectOpen}
                      onClick={() => {
                        if (!vm.clusterSelectDisabled) {
                          vm.setIsClusterSelectOpen(!vm.isClusterSelectOpen);
                        }
                      }}
                      isDisabled={vm.clusterSelectDisabled}
                      className={clusterToggleStyle}
                    >
                      {vm.clusterView.selectionLabel}
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    {vm.clusterView.clusterOptions.map(
                      (option: ClusterOption) => (
                        <SelectOption key={option.id} value={option.id}>
                          {option.label}
                        </SelectOption>
                      ),
                    )}
                  </SelectList>
                </Select>
              </FlexItem>
              {vm.selectedClusterId !== "all" ? (
                <FlexItem flex={{ default: "flex_1" }}>
                  <ClusterDrsConfiguration
                    clusters={vm.clusters}
                    selectedClusterId={vm.selectedClusterId}
                  />
                </FlexItem>
              ) : null}
            </Flex>
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
