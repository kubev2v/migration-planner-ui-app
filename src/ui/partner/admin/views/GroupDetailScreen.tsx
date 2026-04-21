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
import { EditGroupModal } from "../components/EditGroupModal";
import type { EditGroupFormValues } from "../components/GroupForm";
import { useGroupDetailsViewModel } from "../view-models/useGroupDetailsViewModel";
import { GroupMembersSection } from "./GroupMembersSection";

const introStyle = css`
  padding-bottom: 1em;
`;

export const GroupDetailScreen: React.FC = () => {
  const vm = useGroupDetailsViewModel();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditSubmit = async (values: EditGroupFormValues) => {
    const { id: _id, ...updateData } = values;
    await vm.updateGroup(updateData);
    setIsEditModalOpen(false);
  };

  return (
    <>
      <PageSection>
        <Content className={introStyle}>
          <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
            <FlexItem>
              <Title headingLevel="h1">Group {vm.group?.name}</Title>
            </FlexItem>
            <FlexItem>
              <Button
                onClick={() => setIsEditModalOpen(true)}
                isDisabled={!vm.group || vm.isLoading || Boolean(vm.error)}
              >
                Edit
              </Button>
            </FlexItem>
          </Flex>
        </Content>
        {vm.isLoading && <LoadingSpinner />}
        {vm.error && (
          <div>
            Error loading partner (id: {vm.id}): {vm.error.message}
          </div>
        )}
        {!vm.isLoading && !vm.error && !vm.group && (
          <EmptyState
            headingLevel="h4"
            icon={SearchIcon}
            titleText={`No partner with id ${vm.id} available`}
            variant="sm"
          />
        )}
        {vm.group && (
          <>
            <Card>
              <CardHeader>
                <img
                  src={vm.group.icon}
                  alt={`${vm.group.name} icon`}
                  style={{ height: "80px", objectFit: "contain" }}
                />
              </CardHeader>
              <CardBody>
                <DescriptionList isHorizontal>
                  <DescriptionListGroup>
                    <DescriptionListTerm>ID</DescriptionListTerm>
                    <DescriptionListDescription>
                      {vm.group.id}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Name</DescriptionListTerm>
                    <DescriptionListDescription>
                      {vm.group.name}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Company</DescriptionListTerm>
                    <DescriptionListDescription>
                      {vm.group.company}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Kind</DescriptionListTerm>
                    <DescriptionListDescription>
                      {vm.group.kind}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Description</DescriptionListTerm>
                    <DescriptionListDescription>
                      {vm.group.description}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
            {isEditModalOpen && (
              <EditGroupModal
                isOpen={isEditModalOpen}
                group={vm.group}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={(values) => {
                  void handleEditSubmit(values);
                }}
              />
            )}
          </>
        )}
      </PageSection>
      {vm.group && <GroupMembersSection group={vm.group} />}
    </>
  );
};

GroupDetailScreen.displayName = "GroupDetailScreen";

export default GroupDetailScreen;
