import type { Customer } from "@openshift-migration-advisor/planner-sdk";
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  MenuToggle,
  type MenuToggleElement,
} from "@patternfly/react-core";
import {
  RhUiEllipsisVerticalIcon,
  RhUiProfileIcon,
} from "@patternfly/react-icons";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React, { useMemo, useState } from "react";

interface CustomersTableProps {
  customers: Customer[];
  onRemoveCustomer: (customer: Customer) => void;
}

export const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  onRemoveCustomer,
}) => {
  const [openRowId, setOpenRowId] = useState<string | null>(null);

  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => a.name.localeCompare(b.name));
  }, [customers]);

  if (customers.length === 0) {
    return (
      <EmptyState
        headingLevel="h4"
        icon={RhUiProfileIcon}
        titleText="No customers yet"
        variant="sm"
      >
        <EmptyStateBody>
          No customers yet. To get started, accept a pending request.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <Table aria-label="Customers table" variant="compact">
      <Thead>
        <Tr>
          <Th>Customer</Th>
          <Th>Contact name</Th>
          <Th>Username</Th>
          <Th>Email</Th>
          <Th>Location</Th>
          <Th screenReaderText="Actions" />
        </Tr>
      </Thead>
      <Tbody>
        {sortedCustomers.map((customer) => (
          <Tr key={customer.username}>
            <Td dataLabel="Customer name">{customer.name}</Td>
            <Td dataLabel="Contact name">{customer.contactName}</Td>
            <Td dataLabel="Username">{customer.username}</Td>
            <Td dataLabel="Email">{customer.email}</Td>
            <Td dataLabel="Location">
              {customer.location ? customer.location : "N/A"}
            </Td>
            <Td dataLabel="Actions" isActionCell>
              <Dropdown
                isOpen={openRowId === customer.username}
                popperProps={{
                  appendTo: () => document.body,
                  position: "end",
                }}
                onOpenChange={(isOpen) =>
                  setOpenRowId(isOpen ? customer.username : null)
                }
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    aria-label="Actions"
                    variant="plain"
                    onClick={() =>
                      setOpenRowId((prev) =>
                        prev === customer.username ? null : customer.username,
                      )
                    }
                  >
                    <RhUiEllipsisVerticalIcon />
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem
                    onClick={() => {
                      onRemoveCustomer(customer);
                      setOpenRowId(null);
                    }}
                  >
                    Remove customer
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

CustomersTable.displayName = "CustomersTable";
