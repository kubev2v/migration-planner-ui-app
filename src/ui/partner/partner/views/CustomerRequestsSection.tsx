import { css } from "@emotion/css";
import type { PartnerRequest } from "@openshift-migration-advisor/planner-sdk";
import {
  Alert,
  Button,
  Content,
  Flex,
  FlexItem,
  InputGroup,
  InputGroupItem,
  PageSection,
  Title,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React, { useState } from "react";

import { sortByNewestFirst } from "../../../../lib/common/Sort";
import { humanizeDate } from "../../../../lib/common/Time";
import { LoadingSpinner } from "../../../core/components/LoadingSpinner";
import { RequestStatus } from "../../regularUser/components/RequestStatus";
import { type DenyPartnerRequestFormValues } from "../components/DenyPartnerRequestForm";
import { DenyPartnerRequestModal } from "../components/DenyPartnerRequestModal";
import { useCustomerRequestsViewModel } from "../view-models/useCustomerRequestsViewModel";

const introStyle = css`
  padding-bottom: 1em;
`;

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
    <PageSection>
      <Content className={introStyle}>
        <Title headingLevel="h1">Customer assignment requests</Title>
        <Content component="p">
          View and manage customer assignment requests. Approve or deny requests
          from customers who want to work with you.
        </Content>
      </Content>

      {vm.isLoading && <LoadingSpinner />}

      {vm.error && (
        <div className={introStyle}>
          <Alert isInline variant="danger" title="Customer Requests API error">
            {vm.error.message}
          </Alert>
        </div>
      )}

      {!vm.isLoading && !vm.error && vm.requests.length === 0 && (
        <Content>
          <Content component="p">No customer requests yet.</Content>
        </Content>
      )}

      {!vm.isLoading && !vm.error && vm.requests.length > 0 && (
        <Table aria-label="Customer request table" variant="compact">
          <Thead>
            <Tr>
              <Th>Customer</Th>
              <Th>Contact name</Th>
              <Th>Contact phone</Th>
              <Th>Status</Th>
              <Th>Reason</Th>
              <Th>Created</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortByNewestFirst(vm.requests).map((request) => (
              <Tr key={request.id}>
                <Td dataLabel="Customer">{request.partner.name}</Td>
                <Td dataLabel="Contact name">{request.contactName}</Td>
                <Td dataLabel="Contact phone">{request.contactPhone}</Td>
                <Td dataLabel="Status">
                  <Flex>
                    <FlexItem>
                      <RequestStatus status={request.requestStatus} />
                    </FlexItem>
                    <FlexItem>
                      {request.requestStatus === "pending" && (
                        <InputGroup>
                          <InputGroupItem>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => {
                                void handleAccept(request);
                              }}
                            >
                              Accept
                            </Button>
                          </InputGroupItem>
                          <InputGroupItem>
                            <Button
                              variant="link"
                              size="sm"
                              isDanger
                              onClick={() => setRequestToDeny(request)}
                            >
                              Deny
                            </Button>
                          </InputGroupItem>
                        </InputGroup>
                      )}
                    </FlexItem>
                  </Flex>
                </Td>
                <Td dataLabel="Status reason">{request.reason}</Td>
                <Td dataLabel="Created at">
                  {humanizeDate(new Date(request.createdAt))}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <DenyPartnerRequestModal
        isOpen={requestToDeny !== null}
        onClose={() => setRequestToDeny(null)}
        onSubmit={(values) => {
          void handleDeny(values);
        }}
      />
    </PageSection>
  );
};

CustomerRequestsSection.displayName = "CustomerRequestsSection";
