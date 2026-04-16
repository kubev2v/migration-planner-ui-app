import { css } from "@emotion/css";
import {
  Button,
  Content,
  EmptyState,
  PageSection,
  Title,
  Truncate,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import {
  Table,
  TableText,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import React from "react";
import { useNavigate } from "react-router-dom";

import { routes } from "../../../../routing/Routes";
import { LoadingSpinner } from "../../../core/components/LoadingSpinner";
import { useGroupsViewModel } from "../view-models/useGroupsViewModel";

const introStyle = css`
  padding-bottom: 1em;
`;

export const GroupsScreen: React.FC = () => {
  const vm = useGroupsViewModel();
  const navigate = useNavigate();

  return (
    <PageSection>
      <Content className={introStyle}>
        <Title headingLevel="h1">Groups administration</Title>
      </Content>
      {vm.isLoading && <LoadingSpinner />}
      {vm.error && <div>Error loading groups: {vm.error.message}</div>}
      {!vm.isLoading && !vm.error && vm.groups.length === 0 && (
        <EmptyState
          headingLevel="h4"
          icon={SearchIcon}
          titleText="No groups available"
          variant="sm"
        />
      )}
      {!vm.isLoading && !vm.error && vm.groups.length > 0 && (
        <Table aria-label="Groups table" variant="compact">
          <Thead>
            <Tr>
              <Th>Icon</Th>
              <Th width={10}>ID</Th>
              <Th>Name</Th>
              <Th>Kind</Th>
              <Th>Description</Th>
            </Tr>
          </Thead>
          <Tbody>
            {vm.groups.map((group) => (
              <Tr key={group.id}>
                <Td dataLabel="Group icon" textCenter>
                  <img
                    src={group.icon}
                    alt={`${group.name} icon`}
                    style={{
                      height: "60px",
                    }}
                  />
                </Td>
                <Td dataLabel="ID">
                  <TableText>
                    <Truncate content={group.id} />
                  </TableText>
                </Td>
                <Td dataLabel="Name">
                  <Button
                    variant="link"
                    onClick={(): void =>
                      navigate(routes.adminGroupById(group.id))
                    }
                  >
                    {group.name}
                  </Button>
                </Td>
                <Td dataLabel="Kind">{group.kind}</Td>
                <Td dataLabel="Description">{group.description}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </PageSection>
  );
};

GroupsScreen.displayName = "GroupsScreen";
