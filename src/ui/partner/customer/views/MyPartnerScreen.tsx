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
        <Title headingLevel="h1">My partner</Title>
      </Content>
      {vm.isLoading && <LoadingSpinner />}
      {vm.error && <div>Error loading partner: {vm.error.message}</div>}
      {!vm.isLoading && !vm.error && !vm.partnerGroup && (
        <EmptyState
          headingLevel="h4"
          icon={WarningTriangleIcon}
          titleText="No partner available"
          variant="sm"
        >
          Please contact an administrator
        </EmptyState>
      )}
      {vm.partnerGroup && (
        <Card>
          <CardHeader>
            <img
              src={vm.partnerGroup.icon}
              alt={`${vm.partnerGroup.name} icon`}
              style={{ height: "80px", objectFit: "contain" }}
            />
          </CardHeader>
          <CardBody>
            <DescriptionList isHorizontal>
              <DescriptionListGroup>
                <DescriptionListTerm>ID</DescriptionListTerm>
                <DescriptionListDescription>
                  {vm.partnerGroup.id}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Name</DescriptionListTerm>
                <DescriptionListDescription>
                  {vm.partnerGroup.name}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Description</DescriptionListTerm>
                <DescriptionListDescription>
                  {vm.partnerGroup.description}
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
