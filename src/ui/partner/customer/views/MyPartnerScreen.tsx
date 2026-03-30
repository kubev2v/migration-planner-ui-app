import { css } from "@emotion/css";
import {
  Card,
  CardBody,
  CardHeader,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  EmptyState,
  PageSection,
  Title,
} from "@patternfly/react-core";
import { WarningTriangleIcon } from "@patternfly/react-icons";
import type React from "react";

import { LoadingSpinner } from "../../../core/components/LoadingSpinner";
import { useMyPartnerViewModel } from "../view-models/useMyPartnerViewModel";

const headerStyle = css`
  padding-bottom: 1em;
`;

export const MyPartnerScreen: React.FC = () => {
  const vm = useMyPartnerViewModel();

  return (
    <PageSection>
      <Content className={headerStyle}>
        <Title headingLevel="h1">My Partner Team</Title>
      </Content>
      {vm.isLoading && <LoadingSpinner />}
      {vm.error && (
        <div>Error loading partner organization: {vm.error.message}</div>
      )}
      {!vm.isLoading && !vm.error && !vm.partnerOrganization && (
        <EmptyState
          headingLevel="h4"
          icon={WarningTriangleIcon}
          titleText="No partner organization available"
          variant="sm"
        >
          Please contact an administrator
        </EmptyState>
      )}
      {vm.partnerOrganization && (
        <Card>
          <CardHeader>
            <img
              src={vm.partnerOrganization.icon}
              alt={`${vm.partnerOrganization.name} icon`}
              style={{ height: "80px", objectFit: "contain" }}
            />
          </CardHeader>
          <CardBody>
            <DescriptionList isHorizontal>
              <DescriptionListGroup>
                <DescriptionListTerm>ID</DescriptionListTerm>
                <DescriptionListDescription>
                  {vm.partnerOrganization.id}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Name</DescriptionListTerm>
                <DescriptionListDescription>
                  {vm.partnerOrganization.name}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Description</DescriptionListTerm>
                <DescriptionListDescription>
                  {vm.partnerOrganization.description}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      )}
    </PageSection>
  );
};

MyPartnerScreen.displayName = "MyPartnerScreen";
