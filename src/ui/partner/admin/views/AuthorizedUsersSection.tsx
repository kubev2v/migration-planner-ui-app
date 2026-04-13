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
import { useOrganizationUsersViewModel } from "../view-models/useOrganizationUsersViewModel";

export const AuthorizedUsersSection: React.FC = () => {
  const vm = useOrganizationUsersViewModel();

  const addAuthorizedUser = () => {
    // TODO: Implement add authorized user logic
  };

  return (
    <PageSection>
      <Content>
        <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
          <FlexItem>
            <Title headingLevel="h1">Authorized users</Title>
          </FlexItem>
          <FlexItem>
            <Button onClick={addAuthorizedUser} isDisabled>
              Add authorized user
            </Button>
          </FlexItem>
        </Flex>
      </Content>
      {vm.isLoading && <LoadingSpinner />}
      {vm.error && (
        <div>
          Error loading users (id: {vm.id}): {vm.error.message}
        </div>
      )}
      {vm.users && vm.users.length === 0 && (
        <EmptyState
          headingLevel="h4"
          icon={SearchIcon}
          titleText={`No users in this organization`}
          variant="sm"
        />
      )}
      {vm.users && vm.users.length > 0 && (
        <Table aria-label="Users table" variant="compact">
          <Thead>
            <Tr>
              <Th>Username</Th>
            </Tr>
          </Thead>
          <Tbody>
            {vm.users.map((user) => (
              <Tr key={user.username}>
                <Td dataLabel="Username">{user.username}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </PageSection>
  );
};

AuthorizedUsersSection.displayName = "AuthorizedUsersSection";
