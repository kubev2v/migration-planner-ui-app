import { css } from "@emotion/css";
import {
  Button,
  Flex,
  FlexItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavList,
} from "@patternfly/react-core";
import React, { useCallback, useEffect, useState } from "react";

import { useClusterSizingWizardViewModel } from "../../view-models/useClusterSizingWizardViewModel";
import { RecommendationTemplate } from "./RecommendationTemplate";
import { SizingInputForm } from "./SizingInputForm";
import { SizingResult } from "./SizingResult";
import { TimeEstimationForm } from "./TimeEstimationForm";
import { TimeEstimationResult } from "./TimeEstimationResult";

interface ClusterSizingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  clusterName: string;
  clusterId: string;
  /** Assessment ID for the API endpoint */
  assessmentId: string;
}

type MenuItem =
  | "architecture"
  | "time-estimation"
  | "complexity"
  | "plan"
  | null;

const navListStyle = css`
  .pf-v6-c-nav__item {
    margin-bottom: 0;
    padding: 0;
  }

  .pf-v6-c-nav__link {
    padding: var(--pf-t--global--spacer--100) var(--pf-t--global--spacer--300);
    margin-bottom: var(--pf-t--global--spacer--100);
  }

  .pf-v6-c-nav__link.pf-m-current {
    font-weight: var(--pf-t--global--font--weight--body--bold);
  }
`;

const welcomeMessageStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  font-size: var(--pf-t--global--font--size--2xl);
  color: var(--pf-t--global--text--color--regular);
  padding: var(--pf-t--global--spacer--600);
  font-weight: var(--pf-t--global--font--weight--body--default);
  line-height: var(--pf-t--global--font--line-height--body);
`;

export const ClusterSizingWizard: React.FC<ClusterSizingWizardProps> = ({
  isOpen,
  onClose,
  clusterName,
  clusterId,
  assessmentId,
}) => {
  const vm = useClusterSizingWizardViewModel(assessmentId, clusterId);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem>(null);

  const handleClose = useCallback(() => {
    vm.reset();
    setSelectedMenuItem(null);
    onClose();
  }, [onClose, vm]);

  const handleCalculate = useCallback(() => {
    void vm.calculate();
  }, [vm]);

  const handleCalculateEstimation = useCallback(() => {
    void vm.calculateEstimation();
  }, [vm]);

  useEffect(() => {
    if (
      selectedMenuItem === "time-estimation" &&
      !vm.migrationEstimation &&
      !vm.isCalculatingEstimation &&
      !vm.estimationError
    ) {
      void vm.calculateEstimation();
    }
  }, [
    selectedMenuItem,
    vm.migrationEstimation,
    vm.isCalculatingEstimation,
    vm.estimationError,
    vm,
  ]);

  const renderContent = () => {
    switch (selectedMenuItem) {
      case null:
        return (
          <div className={welcomeMessageStyle}>
            The following recommendations are designed to facilitate the
            migration of vCenter {clusterName}
          </div>
        );
      case "architecture":
        return (
          <RecommendationTemplate
            preferencesTitle="Migration preferences"
            preferencesContent={
              <SizingInputForm
                values={vm.formValues}
                onChange={vm.setFormValues}
              />
            }
            resultsContent={
              <SizingResult
                clusterName={clusterName}
                formValues={vm.formValues}
                sizerOutput={vm.sizerOutput}
                isLoading={vm.isCalculating}
                error={vm.calculateError ?? null}
              />
            }
            onGenerate={handleCalculate}
            isLoading={vm.isCalculating}
            hasResults={Boolean(
              vm.sizerOutput || vm.isCalculating || vm.calculateError,
            )}
            generateButtonText="Generate recommendation"
          />
        );
      case "time-estimation":
        return (
          <RecommendationTemplate
            preferencesTitle="Migration estimation parameters"
            preferencesContent={<TimeEstimationForm values={vm.formValues} />}
            resultsContent={
              <TimeEstimationResult
                clusterName={clusterName}
                estimationOutput={vm.migrationEstimation}
                isLoading={vm.isCalculatingEstimation}
                error={vm.estimationError ?? null}
              />
            }
            onGenerate={handleCalculateEstimation}
            isLoading={vm.isCalculatingEstimation}
            hasResults={Boolean(
              vm.migrationEstimation ||
              vm.isCalculatingEstimation ||
              vm.estimationError,
            )}
            generateButtonText="Calculate time estimation"
            resultsTitle=""
            showAlert={false}
            hidePreferences={true}
          />
        );
      case "complexity":
        return <div>Migration Complexity content (coming soon)</div>;
      case "plan":
        return <div>Migration Plan content (coming soon)</div>;
      default:
        return null;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      aria-label="Target cluster recommendations modal"
      onEscapePress={handleClose}
      variant="large"
    >
      <ModalHeader title={`${clusterName} - Recommendation`} />
      <ModalBody>
        <Flex style={{ height: "680px", alignItems: "stretch" }}>
          <FlexItem
            style={{
              width: "250px",
              borderRight:
                "1px solid var(--pf-t--global--border--color--default)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Nav style={{ flex: 0.3 }}>
              <NavList className={navListStyle}>
                <NavItem
                  itemId="architecture"
                  isActive={selectedMenuItem === "architecture"}
                  onClick={() => setSelectedMenuItem("architecture")}
                >
                  Openshift Cluster Architecture
                </NavItem>
                <NavItem
                  itemId="time-estimation"
                  isActive={selectedMenuItem === "time-estimation"}
                  onClick={() => setSelectedMenuItem("time-estimation")}
                >
                  Migration Time Estimation
                </NavItem>
                <NavItem
                  itemId="complexity"
                  isActive={false}
                  onClick={(e) => e.preventDefault()}
                  style={{ opacity: 0.5, pointerEvents: "none" }}
                  component="button"
                  aria-disabled="true"
                >
                  Migration Complexity
                </NavItem>
                <NavItem
                  itemId="plan"
                  isActive={false}
                  onClick={(e) => e.preventDefault()}
                  style={{ opacity: 0.5, pointerEvents: "none" }}
                  component="button"
                  aria-disabled="true"
                >
                  Migration Plan
                </NavItem>
              </NavList>
            </Nav>
          </FlexItem>
          <FlexItem
            flex={{ default: "flex_1" }}
            style={{
              overflow: "auto",
              padding: "var(--pf-t--global--spacer--300)",
            }}
          >
            {renderContent()}
          </FlexItem>
        </Flex>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

ClusterSizingWizard.displayName = "ClusterSizingWizard";

export default ClusterSizingWizard;
