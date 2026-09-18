import type { Customer } from "@openshift-migration-advisor/planner-sdk";
import {
  Alert,
  Card,
  CardBody,
  Content,
  ContentVariants,
  Flex,
  Stack,
  StackItem,
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
    <Flex direction={{ default: "column" }} rowGap={{ default: "rowGapLg" }}>
      <CustomerRequestsSection />

      <Card>
        <CardBody>
          <Stack hasGutter>
            <StackItem>
              <Content component={ContentVariants.h2}>My customers</Content>
              <Content component={ContentVariants.p}>
                Customers you've approved and are partnered with.
              </Content>
            </StackItem>

            {vm.isLoading && (
              <StackItem>
                <LoadingSpinner />
              </StackItem>
            )}

            {vm.error && (
              <StackItem>
                <Alert isInline variant="danger" title="Customers API error">
                  {vm.error.message}
                </Alert>
              </StackItem>
            )}

            {!vm.isLoading && !vm.error && (
              <StackItem>
                <CustomersTable
                  customers={vm.customers}
                  onRemoveCustomer={setCustomerToRemove}
                />
              </StackItem>
            )}
          </Stack>
        </CardBody>
      </Card>

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
