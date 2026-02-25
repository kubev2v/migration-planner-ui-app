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
  Stack,
  StackItem,
} from "@patternfly/react-core";
import React, { useCallback, useState } from "react";

import { useClusterSizingWizardViewModel } from "../../view-models/useClusterSizingWizardViewModel";
import { SizingInputForm } from "./SizingInputForm";
import { SizingResult } from "./SizingResult";

interface ClusterSizingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  clusterName: string;
  clusterId: string;
  /** Assessment ID for the API endpoint */
  assessmentId: string;
}

type MenuItem = "architecture" | "time-estimation" | "complexity" | "plan";

const boldTextStyle = css`
  font-weight: var(--pf-v5-global--FontWeight--bold);
`;

export const ClusterSizingWizard: React.FC<ClusterSizingWizardProps> = ({
  isOpen,
  onClose,
  clusterName,
  clusterId,
  assessmentId,
}) => {
  const vm = useClusterSizingWizardViewModel(assessmentId, clusterId);
  const [selectedMenuItem, setSelectedMenuItem] =
    useState<MenuItem>("architecture");

  const handleClose = useCallback(() => {
    vm.reset();
    setSelectedMenuItem("architecture");
    onClose();
  }, [onClose, vm]);

  const handleCalculate = useCallback(() => {
    void vm.calculate();
  }, [vm]);

  const renderContent = () => {
    switch (selectedMenuItem) {
      case "architecture":
        return (
          <Stack hasGutter>
            <StackItem>
              <SizingInputForm
                values={vm.formValues}
                onChange={vm.setFormValues}
              />
            </StackItem>
            <StackItem>
              <Button
                variant="primary"
                onClick={handleCalculate}
                isLoading={vm.isCalculating}
              >
                Generate recommendation
              </Button>
            </StackItem>
            {(vm.sizerOutput || vm.isCalculating || vm.calculateError) && (
              <StackItem>
                <SizingResult
                  clusterName={clusterName}
                  formValues={vm.formValues}
                  sizerOutput={vm.sizerOutput}
                  isLoading={vm.isCalculating}
                  error={vm.calculateError ?? null}
                />
              </StackItem>
            )}
          </Stack>
        );
      case "time-estimation":
        return <div>Migration Time Estimation content (coming soon)</div>;
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
        <Flex style={{ height: "600px" }}>
          <FlexItem
            style={{ width: "250px", borderRight: "1px solid #d2d2d2" }}
          >
            <Nav>
              <NavList>
                <NavItem
                  itemId="architecture"
                  isActive={selectedMenuItem === "architecture"}
                  onClick={() => setSelectedMenuItem("architecture")}
                >
                  <span
                    className={
                      selectedMenuItem === "architecture"
                        ? boldTextStyle
                        : undefined
                    }
                  >
                    Openshift Cluster Architecture
                  </span>
                </NavItem>
                <NavItem
                  itemId="time-estimation"
                  isActive={selectedMenuItem === "time-estimation"}
                  onClick={() => setSelectedMenuItem("time-estimation")}
                >
                  <span
                    className={
                      selectedMenuItem === "time-estimation"
                        ? boldTextStyle
                        : undefined
                    }
                  >
                    Migration Time Estimation
                  </span>
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
              padding: "var(--pf-v5-global--spacer--md)",
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
