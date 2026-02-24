import { AssessmentApi } from "@migration-planner-ui/api-client/apis";
import { ResponseError } from "@migration-planner-ui/api-client/runtime";
import { useInjection } from "@migration-planner-ui/ioc";
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
import React, { useCallback, useState } from "react";

import { Symbols } from "../../../main/Symbols";
import { DEFAULT_FORM_VALUES, WORKER_NODE_PRESETS } from "./constants";
import { RecommendationTemplate } from "./RecommendationTemplate";
import { SizingInputForm } from "./SizingInputForm";
import { SizingResult } from "./SizingResult";
import type { ClusterRequirementsResponse, SizingFormValues } from "./types";
import { formValuesToRequest } from "./types";

interface ClusterSizingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  clusterName: string;
  clusterId: string;
  /** Assessment ID for the API endpoint */
  assessmentId: string;
}

type MenuItem = "architecture" | "time-estimation" | "complexity" | "plan";

export const ClusterSizingWizard: React.FC<ClusterSizingWizardProps> = ({
  isOpen,
  onClose,
  clusterName,
  clusterId,
  assessmentId,
}) => {
  const assessmentApi = useInjection<AssessmentApi>(Symbols.AssessmentApi);

  const [formValues, setFormValues] =
    useState<SizingFormValues>(DEFAULT_FORM_VALUES);
  const [sizerOutput, setSizerOutput] =
    useState<ClusterRequirementsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] =
    useState<MenuItem>("architecture");

  const handleClose = useCallback(() => {
    // Reset state when closing
    setFormValues(DEFAULT_FORM_VALUES);
    setSizerOutput(null);
    setError(null);
    setIsLoading(false);
    setSelectedMenuItem("architecture");
    onClose();
  }, [onClose]);

  const handleCalculate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get worker node CPU and memory based on preset or custom values
      const workerCpu =
        formValues.workerNodePreset !== "custom"
          ? WORKER_NODE_PRESETS[formValues.workerNodePreset].cpu
          : formValues.customCpu;
      const workerMemory =
        formValues.workerNodePreset !== "custom"
          ? WORKER_NODE_PRESETS[formValues.workerNodePreset].memoryGb
          : formValues.customMemoryGb;

      // Build the API request payload
      const clusterRequirementsRequest = formValuesToRequest(
        clusterId,
        formValues,
        workerCpu,
        workerMemory,
      );

      // POST /api/v1/assessments/{id}/cluster-requirements
      const result = await assessmentApi.calculateAssessmentClusterRequirements(
        {
          id: assessmentId,
          clusterRequirementsRequest,
        },
      );

      setSizerOutput(result);
    } catch (err) {
      if (err instanceof ResponseError) {
        const message = await err.response.text();
        setError(new Error(err.message, { cause: message }));
      } else {
        setError(
          err instanceof Error ? err : new Error("Failed to calculate sizing"),
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [assessmentApi, assessmentId, clusterId, formValues]);

  const renderContent = () => {
    switch (selectedMenuItem) {
      case "architecture":
        return (
          <RecommendationTemplate
            preferencesTitle="Migration preferences"
            preferencesContent={
              <SizingInputForm values={formValues} onChange={setFormValues} />
            }
            resultsContent={
              <SizingResult
                clusterName={clusterName}
                formValues={formValues}
                sizerOutput={sizerOutput}
                isLoading={isLoading}
                error={error}
              />
            }
            onGenerate={handleCalculate}
            isLoading={isLoading}
            hasResults={Boolean(sizerOutput || isLoading || error)}
            generateButtonText="Generate recommendation"
          />
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
      <ModalHeader title={`${clusterName} Recommendation`} />
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
                    style={{
                      fontWeight:
                        selectedMenuItem === "architecture" ? "bold" : "normal",
                    }}
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
                    style={{
                      fontWeight:
                        selectedMenuItem === "time-estimation"
                          ? "bold"
                          : "normal",
                    }}
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
