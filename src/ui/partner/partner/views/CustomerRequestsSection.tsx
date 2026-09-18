import type { PartnerRequest } from "@openshift-migration-advisor/planner-sdk";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Content,
  ContentVariants,
  EmptyState,
  Flex,
  FlexItem,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { RhUiSearchIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React, { useState } from "react";

import { sortByNewestFirst } from "../../../../lib/common/Sort";
import { humanizeDate } from "../../../../lib/common/Time";
import { LoadingSpinner } from "../../../core/components/LoadingSpinner";
import { RequestStatus } from "../../regularUser/components/RequestStatus";
import { type DenyPartnerRequestFormValues } from "../components/DenyPartnerRequestForm";
import { DenyPartnerRequestModal } from "../components/DenyPartnerRequestModal";
import { useCustomerRequestsViewModel } from "../view-models/useCustomerRequestsViewModel";

export const CustomerRequestsSection: React.FC = () => {
  const vm = useCustomerRequestsViewModel();
  const [requestToDeny, setRequestToDeny] = useState<PartnerRequest | null>(
    null,
  );

  const handleAccept = async (request: PartnerRequest) => {
    await vm.acceptPartnerRequest(request.id);
  };

  const handleDeny = async (values: DenyPartnerRequestFormValues) => {
    if (requestToDeny) {
      await vm.denyPartnerRequest(requestToDeny.id, values.reason);
    }
  };

  return (
    <div>
      <Card>
        <CardBody>
          <Stack hasGutter>
            <StackItem>
              <Content component={ContentVariants.h2}>
                Customer assignment requests
              </Content>
              <Content component={ContentVariants.p}>
                Review pending requests to add customers to your list. Denied
                requests will remain here with an updated status.
              </Content>
            </StackItem>

            {vm.isLoading && (
              <StackItem>
                <LoadingSpinner />
              </StackItem>
            )}

            {vm.error && (
              <StackItem>
                <Alert
                  isInline
                  variant="danger"
                  title="Customer Requests API error"
                >
                  {vm.error.message}
                </Alert>
              </StackItem>
            )}

            {!vm.isLoading && !vm.error && vm.requests.length === 0 && (
              <StackItem>
                <EmptyState
                  headingLevel="h4"
                  icon={RhUiSearchIcon}
                  titleText="No customer requests yet"
                  variant="sm"
                />
              </StackItem>
            )}

            {!vm.isLoading && !vm.error && vm.requests.length > 0 && (
              <StackItem>
                <Table aria-label="Customer request table" variant="compact">
                  <Thead>
                    <Tr>
                      <Th>Customer name</Th>
                      <Th>Contact name</Th>
                      <Th>Email</Th>
                      <Th>Location</Th>
                      <Th>Request date</Th>
                      <Th>Status</Th>
                      <Th>Reason</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sortByNewestFirst(vm.requests).map((request) => (
                      <Tr key={request.id}>
                        <Td dataLabel="Customer name">{request.name}</Td>
                        <Td dataLabel="Contact name">{request.contactName}</Td>
                        <Td dataLabel="Email">{request.email}</Td>
                        <Td dataLabel="Location">
                          {request.location ? request.location : "N/A"}
                        </Td>
                        <Td dataLabel="Request date">
                          {humanizeDate(new Date(request.createdAt))}
                        </Td>
                        <Td dataLabel="Status">
                          {request.requestStatus === "pending" ? (
                            <Flex spaceItems={{ default: "spaceItemsXs" }}>
                              <FlexItem>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    void handleAccept(request);
                                  }}
                                >
                                  Accept
                                </Button>
                              </FlexItem>
                              <FlexItem>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  isDanger
                                  onClick={() => setRequestToDeny(request)}
                                >
                                  Deny
                                </Button>
                              </FlexItem>
                            </Flex>
                          ) : (
                            <RequestStatus status={request.requestStatus} />
                          )}
                        </Td>
                        <Td dataLabel="Reason">
                          {request.reason ? request.reason : "N/A"}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </StackItem>
            )}
          </Stack>
        </CardBody>
      </Card>
      <DenyPartnerRequestModal
        isOpen={requestToDeny !== null}
        onClose={() => setRequestToDeny(null)}
        onSubmit={(values) => {
          void handleDeny(values);
        }}
      />
    </div>
  );
};

CustomerRequestsSection.displayName = "CustomerRequestsSection";
