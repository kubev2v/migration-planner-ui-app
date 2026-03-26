import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from "@patternfly/react-core";
import React from "react";

import CreateAssessmentDropdown from "../../core/components/CreateAssessmentDropdown";
import { CustomEnterpriseIcon } from "../../core/components/CustomEnterpriseIcon";
import type { AssessmentMode } from "./CreateAssessmentModal";

type Props = {
  onOpenModal: (mode: AssessmentMode) => void;
};

const AssessmentEmptyState: React.FC<Props> = ({ onOpenModal }) => {
  return (
    <EmptyState
      headingLevel="h4"
      icon={CustomEnterpriseIcon}
      titleText="Assess your VMware environment"
      variant="sm"
    >
      <EmptyStateBody>
        Begin by adding an environment, then download and import the OVA file
        into your VMware environment.
      </EmptyStateBody>

      <EmptyStateFooter>
        <EmptyStateActions>
          <CreateAssessmentDropdown
            toggleLabel="Create new assessment"
            onSelectRvtools={() => onOpenModal("rvtools")}
          />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

AssessmentEmptyState.displayName = "AssessmentEmptyState";

export default AssessmentEmptyState;
