import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from "@patternfly/react-core";
import { ExternalLinkAltIcon, PlusCircleIcon } from "@patternfly/react-icons";
import React from "react";
import { useNavigate } from "react-router-dom";

import { routes } from "../../../routing/Routes";
import type { AssessmentMode } from "./CreateAssessmentModal";

type Props = {
  onOpenModal: (mode: AssessmentMode) => void;
};

const RVTOOLS_LEARN_MORE_URL =
  "https://kubev2v.github.io/openshift-migration-advisor-docs/docs/tutorial/#prerequisites-rvtools-file-requirements";

const AssessmentEmptyState: React.FC<Props> = ({ onOpenModal }) => {
  const navigate = useNavigate();

  return (
    <EmptyState
      headingLevel="h2"
      icon={PlusCircleIcon}
      titleText="No RVTools assessments yet"
    >
      <EmptyStateBody>
        Generate an assessment from an environment you&apos;ve already set up,
        or upload an RVTools inventory file.
      </EmptyStateBody>

      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="primary" onClick={() => onOpenModal("rvtools")}>
            Upload RVTools file
          </Button>
        </EmptyStateActions>
        <EmptyStateActions>
          <Button
            variant="link"
            component="a"
            href={RVTOOLS_LEARN_MORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            icon={<ExternalLinkAltIcon />}
            iconPosition="end"
          >
            Learn more about RVTools requirements
          </Button>
          <Button
            variant="link"
            onClick={() => {
              void navigate(routes.exampleReport);
            }}
          >
            View example report
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

AssessmentEmptyState.displayName = "AssessmentEmptyState";

export default AssessmentEmptyState;
