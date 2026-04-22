import { css } from "@emotion/css";
import type { PartnerRequest } from "@openshift-migration-advisor/planner-sdk";
import {
  Alert,
  Button,
  Content,
  PageSection,
  Title,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React, { useState } from "react";

import { sortByNewestFirst } from "../../../../lib/common/Sort";
import { humanizeDate } from "../../../../lib/common/Time";
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

  const handleCancel = async (partnerRequest: PartnerRequest) => {
    await vm.cancelPartnerRequest(partnerRequest.id);
    setRequestToCancel(null);
  };

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
        <div className={introStyle}>
          <Alert isInline variant="danger" title="Partner Requests API error">
            {vm.error.message}
          </Alert>
        </div>
      )}

      {!vm.isLoading && !vm.error && vm.requests.length > 0 && (
        <Table aria-label="Partner request table" variant="compact">
          <Thead>
            <Tr>
              <Th>Partner</Th>
              <Th>Status</Th>
              <Th>Reason</Th>
              <Th>Created</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortByNewestFirst(vm.requests).map((request) => (
              <Tr key={request.id}>
                <Td dataLabel="Partner">{request.partner.name}</Td>
                <Td dataLabel="Status" hasAction>
                  <RequestStatus status={request.requestStatus} />
                  {request.requestStatus === "pending" && (
                    <Button
                      variant="link"
                      isDanger
                      onClick={() => setRequestToCancel(request)}
                    >
                      Cancel
                    </Button>
                  )}
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

      {requestToCancel && (
        <ConfirmationModal
          title="Cancel request"
          titleIconVariant="warning"
          isOpen={!!requestToCancel}
          onCancel={() => setRequestToCancel(null)}
          onConfirm={() => {
            void handleCancel(requestToCancel);
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
