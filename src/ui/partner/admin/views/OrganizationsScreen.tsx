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
import { useOrganizationsViewModel } from "../view-models/useOrganizationsViewModel";

const introStyle = css`
  padding-bottom: 1em;
`;

export const OrganizationsScreen: React.FC = () => {
  const vm = useOrganizationsViewModel();
  const navigate = useNavigate();

  return (
    <PageSection>
      <Content className={introStyle}>
        <Title headingLevel="h1">Orgs administration</Title>
      </Content>
      {vm.isLoading && <LoadingSpinner />}
      {vm.error && <div>Error loading organizations: {vm.error.message}</div>}
      {!vm.isLoading && !vm.error && vm.organizations.length === 0 && (
        <EmptyState
          headingLevel="h4"
          icon={SearchIcon}
          titleText="No organizations available"
          variant="sm"
        />
      )}
      {!vm.isLoading && !vm.error && vm.organizations.length > 0 && (
        <Table aria-label="Organizations table" variant="compact">
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
            {vm.organizations.map((organization) => (
              <Tr key={organization.id}>
                <Td dataLabel="Org icon" textCenter>
                  <img
                    src={organization.icon}
                    alt={`${organization.name} icon`}
                    style={{
                      height: "60px",
                    }}
                  />
                </Td>
                <Td dataLabel="ID">
                  <TableText>
                    <Truncate content={organization.id} />
                  </TableText>
                </Td>
                <Td dataLabel="Name">
                  <Button
                    variant="link"
                    onClick={(): void =>
                      navigate(routes.adminOrganizationById(organization.id))
                    }
                  >
                    {organization.name}
                  </Button>
                </Td>
                <Td dataLabel="Kind">{organization.kind}</Td>
                <Td dataLabel="Description">{organization.description}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </PageSection>
  );
};

OrganizationsScreen.displayName = "OrganizationsScreen";
