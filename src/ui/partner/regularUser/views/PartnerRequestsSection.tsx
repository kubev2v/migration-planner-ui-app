import { css } from "@emotion/css";
import { Button, Content, PageSection, Title } from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React, { useState } from "react";

import { sortByNewestFirst } from "../../../../lib/common/Sort";
import { humanizeDate } from "../../../../lib/common/Time";
import type { PartnerRequest } from "../../../../models/PartnerRequestModel";
import { ConfirmationModal } from "../../../core/components/ConfirmationModal";
import { LoadingSpinner } from "../../../core/components/LoadingSpinner";
import { RequestStatus } from "../components/RequestStatus";
import type { usePartnerRequestsViewModel } from "../view-models/usePartnerRequestsViewModel";

const introStyle = css`
  padding-bottom: 1em;
`;

interface PartnerRequestsSectionProps {
  vm: ReturnType<typeof usePartnerRequestsViewModel>;
}

export const PartnerRequestsSection: React.FC<PartnerRequestsSectionProps> = ({
  vm,
}) => {
  const [requestToCancel, setRequestToCancel] = useState<PartnerRequest | null>(
    null,
  );

  if (!vm.isLoading && !vm.error && vm.requests.length === 0) {
    return null;
  }

  return (
    <PageSection>
      <Content className={introStyle}>
        <Title headingLevel="h1">Partner assignment requests</Title>
        <Content component="p">
          View the status of your partner assignment requests. Once a partner
          approves your request, you will be able to collaborate with them on
          your migration projects.
        </Content>
      </Content>

      {vm.isLoading && <LoadingSpinner />}
      {vm.error && (
        <div>Error loading partner requests: {vm.error.message}</div>
      )}
      {!vm.isLoading && !vm.error && vm.requests.length > 0 && (
        <Table aria-label="Partner request table" variant="compact">
          <Thead>
            <Tr>
              <Th>Partner</Th>
              <Th>Status</Th>
              <Th>Reason</Th>
              <Th>Created at</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortByNewestFirst(vm.requests).map((request) => (
              <Tr key={request.id}>
                <Td dataLabel="Partner">{request.group.name}</Td>
                <Td dataLabel="Status" hasAction>
                  <RequestStatus status={request.status} />
                  {request.status === "pending" && (
                    <Button
                      variant="link"
                      isDanger
                      onClick={() => setRequestToCancel(request)}
                    >
                      cancel
                    </Button>
                  )}
                </Td>
                <Td dataLabel="Status reason">{request.statusReason}</Td>
                <Td dataLabel="Created at">
                  {humanizeDate(new Date(request.createdAt))}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {requestToCancel && (
        <ConfirmationModal
          title="Cancel request"
          titleIconVariant="warning"
          isOpen={!!requestToCancel}
          onCancel={() => setRequestToCancel(null)}
          onConfirm={() => {
            void vm.cancelRequest(requestToCancel).then(() => {
              setRequestToCancel(null);
            });
          }}
          onClose={() => setRequestToCancel(null)}
          confirmButtonText="Cancel request"
          cancelButtonText="Close"
        >
          <Content>
            <Content component="p" id="confirmation-modal-description">
              Are you sure you want to cancel this request?
            </Content>
          </Content>
        </ConfirmationModal>
      )}
    </PageSection>
  );
};

PartnerRequestsSection.displayName = "PartnerRequestsSection";
