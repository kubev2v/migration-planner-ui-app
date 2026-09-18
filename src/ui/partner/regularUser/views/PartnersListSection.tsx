import type { PartnerRequestCreate } from "@openshift-migration-advisor/planner-sdk";
import {
  Alert,
  Content,
  ContentVariants,
  EmptyState,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { RhUiSearchIcon } from "@patternfly/react-icons";
import React from "react";

import { LoadingSpinner } from "../../../core/components/LoadingSpinner";
import { ContactFormModal } from "../components/ContactFormModal";
import { PartnersGallery } from "../components/PartnersGallery";
import { usePartnersViewModel } from "../view-models/usePartnersViewModel";

export const PartnersListSection: React.FC = () => {
  const vm = usePartnersViewModel();

  return (
    <Stack hasGutter>
      <StackItem>
        <Content component={ContentVariants.h2}>Connect with a partner</Content>
        <Content component={ContentVariants.p}>
          You currently don't have a partner assigned. Once connected with a
          partner, you'll be able to share your migration assessments and
          collaborate on your infrastructure modernization journey.
        </Content>
      </StackItem>

      {vm.isLoading && (
        <StackItem>
          <LoadingSpinner />
        </StackItem>
      )}

      {vm.error && (
        <StackItem>
          <Alert isInline variant="danger" title="Partners API error">
            {vm.error.message}
          </Alert>
        </StackItem>
      )}

      {!vm.isLoading && !vm.error && vm.partners.length === 0 && (
        <StackItem>
          <EmptyState
            headingLevel="h4"
            icon={RhUiSearchIcon}
            titleText="No partners available"
            variant="sm"
          />
        </StackItem>
      )}

      {!vm.isLoading && !vm.error && vm.partners.length > 0 && (
        <StackItem>
          <PartnersGallery
            partners={vm.partners}
            onRequestAssignment={vm.openContactFormModal}
          />
        </StackItem>
      )}

      {vm.isContactFormModalOpen && (
        <ContactFormModal
          isOpen
          onClose={vm.closeContactFormModal}
          onSubmit={(values: PartnerRequestCreate) =>
            void vm.createPartnerRequest(values)
          }
          error={vm.createError}
        />
      )}
    </Stack>
  );
};

PartnersListSection.displayName = "PartnersListSection";
