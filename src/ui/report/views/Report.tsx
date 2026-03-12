import {
  Bullseye,
  Button,
  Content,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import React from "react";
import { Link } from "react-router-dom";

import { routes } from "../../../routing/Routes";
import { AppPage } from "../../core/components/AppPage";
import { AgentStatusView } from "../../environment/views/AgentStatusView";
import { useReportPageViewModel } from "../view-models/useReportPageViewModel";
import type { ClusterOption } from "./assessment-report/ClusterView";
import { Dashboard } from "./assessment-report/Dashboard";

const ReportContent: React.FC = () => {
  const vm = useReportPageViewModel();

  if (vm.isLoadingData && !vm.assessment) {
    return (
      <Bullseye>
        <Spinner size="lg" />
      </Bullseye>
    );
  }

  if (!vm.assessment) {
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
          { key: 3, children: "Assessment not found", isActive: true },
        ]}
        title="Assessment details"
      >
        <Stack hasGutter>
          <StackItem>
            <Content>
              <Content component="p">
                The requested assessment was not found.
              </Content>
            </Content>
          </StackItem>
          <StackItem>
            <Link to={routes.assessments}>
              <Button variant="primary">Back to assessments</Button>
            </Link>
          </StackItem>
        </Stack>
      </AppPage>
    );
  }

  const agent = vm.source?.agent;

  const handleClusterSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ): void => {
    if (typeof value === "string") {
      vm.selectCluster(value);
    }
    vm.setClusterSelectOpen(false);
  };

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
          children: `${vm.assessment.name || `Assessment ${vm.assessmentId}`} - vCenter report`,
          isActive: true,
        },
      ]}
      title={`${vm.assessment.name || `Assessment ${vm.assessmentId}`} - vCenter report`}
      caption={
        <Stack>
          <StackItem>
            {vm.assessment.sourceType === "rvtools" ? (
              "Source: RVTools file upload"
            ) : (
              <Split hasGutter>
                <SplitItem isFilled={false}>Discovery VM status:</SplitItem>
                <SplitItem isFilled={false}>
                  <AgentStatusView
                    status={vm.source?.displayStatus ?? "not-connected"}
                    statusInfo={
                      vm.source?.isReady
                        ? undefined
                        : agent
                          ? agent.statusInfo
                          : "Not connected"
                    }
                    credentialUrl={agent ? agent.credentialUrl : ""}
                    uploadedManually={
                      Boolean(vm.source?.onPremises) &&
                      vm.source?.inventory !== undefined
                    }
                    updatedAt={vm.source?.updatedAt as unknown as string}
                    disableInteractions
                  />
                </SplitItem>
              </Split>
            )}
          </StackItem>
          <StackItem>
            <p>
              Presenting the information we were able to fetch from the
              discovery process
            </p>
          </StackItem>

          <StackItem>
            {vm.lastUpdatedText !== "-"
              ? `Last updated: ${vm.lastUpdatedText}`
              : "[Last updated time stamp]"}
          </StackItem>
          <StackItem>
            {vm.clusterCount > 0 ? (
              typeof vm.vms?.total === "number" ? (
                <>
                  Detected <strong>{vm.vms?.total} VMS</strong> in{" "}
                  <strong>
                    {vm.clusterCount}{" "}
                    {vm.clusterCount === 1 ? "cluster" : "clusters"}
                  </strong>
                </>
              ) : (
                <>
                  Detected{" "}
                  <strong>
                    {vm.clusterCount}{" "}
                    {vm.clusterCount === 1 ? "cluster" : "clusters"}
                  </strong>
                </>
              )
            ) : (
              "No clusters detected"
            )}
          </StackItem>
          <StackItem>
            <Select
              isScrollable
              isOpen={vm.isClusterSelectOpen}
              selected={vm.clusterView.selectionId}
              onSelect={handleClusterSelect}
              onOpenChange={(isOpen: boolean) => {
                if (!vm.clusterSelectDisabled) vm.setClusterSelectOpen(isOpen);
              }}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  isExpanded={vm.isClusterSelectOpen}
                  onClick={() => {
                    if (!vm.clusterSelectDisabled) {
                      vm.setClusterSelectOpen(!vm.isClusterSelectOpen);
                    }
                  }}
                  isDisabled={vm.clusterSelectDisabled}
                  style={{ minWidth: "422px" }}
                >
                  {vm.clusterView.selectionLabel}
                </MenuToggle>
              )}
            >
              <SelectList>
                {vm.clusterView.clusterOptions.map((option: ClusterOption) => (
                  <SelectOption key={option.id} value={option.id}>
                    {option.label}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </StackItem>
        </Stack>
      }
    >
      {vm.scopedClusterView ? (
        <Dashboard
          infra={vm.scopedClusterView.viewInfra}
          vms={vm.scopedClusterView.viewVms}
          cpuCores={vm.scopedClusterView.cpuCores}
          ramGB={vm.scopedClusterView.ramGB}
          clusters={vm.scopedClusterView.viewClusters}
          isAggregateView={vm.scopedClusterView.isAggregateView}
          clusterFound={vm.scopedClusterView.clusterFound}
        />
      ) : (
        <Bullseye>
          <Content>
            <Content component="p">
              {vm.clusterView.isAggregateView
                ? "This assessment does not have report data yet."
                : "No data is available for the selected cluster."}
            </Content>
          </Content>
        </Bullseye>
      )}
    </AppPage>
  );
};

const Report: React.FC = () => <ReportContent />;

Report.displayName = "Report";

export default Report;
