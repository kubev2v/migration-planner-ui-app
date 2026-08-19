import type { Customer } from "@openshift-migration-advisor/planner-sdk";
import {
  Alert,
  Content,
  Flex,
  PageSection,
  Title,
} from "@patternfly/react-core";
import React, { useState } from "react";

import { LoadingSpinner } from "../../../core/components/LoadingSpinner";
import { CustomersTable } from "../components/CustomersTable";
import { RemoveCustomerModal } from "../components/RemoveCustomerModal";
import { useCustomersViewModel } from "../view-models/useCustomersViewModel";
import { CustomerRequestsSection } from "./CustomerRequestsSection";

export const CustomersScreen: React.FC = () => {
  const vm = useCustomersViewModel();
  const [customerToRemove, setCustomerToRemove] = useState<Customer | null>(
    null,
  );

  const handleRemove = async () => {
    if (customerToRemove) {
      await vm.removeCustomer(customerToRemove.username);
    }
  };

  return (
    <Flex direction={{ default: "column" }} rowGap={{ default: "rowGapXl" }}>
      <CustomerRequestsSection />

      <PageSection>
        <Content>
          <Title headingLevel="h1">My customers</Title>
          <Content component="p">
            Customers you've approved and are partnered with.
          </Content>
        </Content>

        {vm.isLoading && <LoadingSpinner />}

        {vm.error && (
          <Alert isInline variant="danger" title="Customers API error">
            {vm.error.message}
          </Alert>
        )}

        {!vm.isLoading && !vm.error && (
          <CustomersTable
            customers={vm.customers}
            onRemoveCustomer={setCustomerToRemove}
          />
        )}
      </PageSection>

      <RemoveCustomerModal
        customer={customerToRemove}
        isOpen={customerToRemove !== null}
        onClose={() => setCustomerToRemove(null)}
        onConfirm={() => {
          void handleRemove();
        }}
      />
    </Flex>
  );
};

CustomersScreen.displayName = "CustomersScreen";
