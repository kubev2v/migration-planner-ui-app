import {
  Button,
  Content,
  EmptyState,
  Flex,
  FlexItem,
  PageSection,
  Title,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React from "react";

import { LoadingSpinner } from "../../../core/components/LoadingSpinner";
import { useGroupMembersViewModel } from "../view-models/useGroupMembersViewModel";

export const AuthorizedMembersSection: React.FC = () => {
  const vm = useGroupMembersViewModel();

  const addAuthorizedMember = () => {
    // TODO: Implement add authorized user logic
  };

  return (
    <PageSection>
      <Content>
        <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
          <FlexItem>
            <Title headingLevel="h1">Authorized members</Title>
          </FlexItem>
          <FlexItem>
            <Button onClick={addAuthorizedMember} isDisabled>
              Add authorized members
            </Button>
          </FlexItem>
        </Flex>
      </Content>
      {vm.isLoading && <LoadingSpinner />}
      {vm.error && (
        <div>
          Error loading members (id: {vm.id}): {vm.error.message}
        </div>
      )}
      {vm.members && vm.members.length === 0 && (
        <EmptyState
          headingLevel="h4"
          icon={SearchIcon}
          titleText={`No members in this group`}
          variant="sm"
        />
      )}
      {vm.members && vm.members.length > 0 && (
        <Table aria-label="Members table" variant="compact">
          <Thead>
            <Tr>
              <Th>Username</Th>
              <Th>Email</Th>
            </Tr>
          </Thead>
          <Tbody>
            {vm.members.map((member) => (
              <Tr key={member.username}>
                <Td dataLabel="Username">{member.username}</Td>
                <Td dataLabel="Email">{member.email}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </PageSection>
  );
};

AuthorizedMembersSection.displayName = "AuthorizedUsersSection";
