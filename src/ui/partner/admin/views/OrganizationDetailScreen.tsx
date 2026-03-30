import { css } from "@emotion/css";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  EmptyState,
  Flex,
  FlexItem,
  PageSection,
  Title,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import React, { useState } from "react";

import { LoadingSpinner } from "../../../core/components/LoadingSpinner";
import {
  type EditOrganizationFormValues,
  EditOrganizationModal,
} from "../components/EditOrganizationModal";
import { useOrganizationDetailsViewModel } from "../view-models/useOrganizationDetailsViewModel";
import { AuthorizedUsersSection } from "./AuthorizedUsersSection";

const introStyle = css`
  padding-bottom: 1em;
`;

export const OrganizationDetailScreen: React.FC = () => {
  const vm = useOrganizationDetailsViewModel();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditSubmit = (values: EditOrganizationFormValues) => {
    console.log("Edit organization:", values);
    // TODO: Implement organization update logic
    // vm.editOrganization(values)
  };

  return (
    <>
      <PageSection>
        <Content className={introStyle}>
          <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
            <FlexItem>
              <Title headingLevel="h1">Partner {vm.organization?.name}</Title>
            </FlexItem>
            <FlexItem>
              <Button onClick={() => setIsEditModalOpen(true)}>Edit</Button>
            </FlexItem>
          </Flex>
        </Content>
        {vm.isLoading && <LoadingSpinner />}
        {vm.error && (
          <div>
            Error loading partner (id: {vm.id}): {vm.error.message}
          </div>
        )}
        {!vm.isLoading && !vm.error && !vm.organization && (
          <EmptyState
            headingLevel="h4"
            icon={SearchIcon}
            titleText={`No partner with id ${vm.id} available`}
            variant="sm"
          />
        )}
        {vm.organization && (
          <>
            <Card>
              <CardHeader>
                <img
                  src={vm.organization.icon}
                  alt={`${vm.organization.name} icon`}
                  style={{ height: "80px", objectFit: "contain" }}
                />
              </CardHeader>
              <CardBody>
                <DescriptionList isHorizontal>
                  <DescriptionListGroup>
                    <DescriptionListTerm>ID</DescriptionListTerm>
                    <DescriptionListDescription>
                      {vm.organization.id}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Name</DescriptionListTerm>
                    <DescriptionListDescription>
                      {vm.organization.name}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Description</DescriptionListTerm>
                    <DescriptionListDescription>
                      {vm.organization.description}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
            {isEditModalOpen && (
              <EditOrganizationModal
                isOpen={isEditModalOpen}
                organization={vm.organization}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
              />
            )}
          </>
        )}
      </PageSection>
      {vm.organization && <AuthorizedUsersSection />}
    </>
  );
};

OrganizationDetailScreen.displayName = "OrganizationDetailScreen";

export default OrganizationDetailScreen;
