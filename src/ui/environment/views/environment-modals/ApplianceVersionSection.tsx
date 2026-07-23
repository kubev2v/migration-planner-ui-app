import { css } from "@emotion/css";
import {
  Button,
  Content,
  ContentVariants,
  FormGroup,
  Spinner,
} from "@patternfly/react-core";
import { RhUiExternalLinkIcon } from "@patternfly/react-icons";
import React from "react";

const versionRowStyle = css`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: var(--pf-t--global--spacer--md);
`;

export interface ApplianceVersionSectionProps {
  displayVersion?: string;
  isLoading: boolean;
  releaseNotesUrl: string;
  labelVariant?: "form" | "definition";
}

export const ApplianceVersionSection: React.FC<
  ApplianceVersionSectionProps
> = ({ displayVersion, isLoading, releaseNotesUrl, labelVariant = "form" }) => {
  const versionContent = (
    <div className={versionRowStyle}>
      {isLoading ? (
        <Spinner size="sm" aria-label="Loading appliance version" />
      ) : (
        <span id="appliance-version">{displayVersion ?? "Unknown"}</span>
      )}
      <Button
        isInline
        variant="link"
        component="a"
        href={releaseNotesUrl}
        target="_blank"
        rel="noopener noreferrer"
        icon={<RhUiExternalLinkIcon />}
        iconPosition="end"
      >
        View release documentation
      </Button>
    </div>
  );

  if (labelVariant === "definition") {
    return (
      <>
        <Content component={ContentVariants.dt}>Appliance version</Content>
        <Content component={ContentVariants.dd}>{versionContent}</Content>
      </>
    );
  }

  return (
    <FormGroup label="Appliance version" fieldId="appliance-version">
      {versionContent}
    </FormGroup>
  );
};
