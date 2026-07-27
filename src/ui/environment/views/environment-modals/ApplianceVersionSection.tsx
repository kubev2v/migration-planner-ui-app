import { css } from "@emotion/css";
import {
  Button,
  Content,
  ContentVariants,
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
  displayVersion: string;
  isLoading: boolean;
  releaseNotesUrl: string;
}

export const ApplianceVersionSection: React.FC<
  ApplianceVersionSectionProps
> = ({ displayVersion, isLoading, releaseNotesUrl }) => {
  return (
    <div className={versionRowStyle}>
      {isLoading ? (
        <Spinner size="sm" aria-label="Loading appliance version" />
      ) : (
        <span id="appliance-version">{displayVersion}</span>
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
};

export const ApplianceVersionDefinitionList: React.FC<
  ApplianceVersionSectionProps
> = (props) => {
  return (
    <dl>
      <Content component={ContentVariants.dt}>Appliance version</Content>
      <Content component={ContentVariants.dd}>
        <ApplianceVersionSection {...props} />
      </Content>
    </dl>
  );
};
