import { css } from "@emotion/css";
import type { PartnerRequestCreate } from "@openshift-migration-advisor/planner-sdk";
import {
  Alert,
  Content,
  EmptyState,
  PageSection,
  Title,
} from "@patternfly/react-core";
import { RhUiSearchIcon } from "@patternfly/react-icons";
import React from "react";

import { LoadingSpinner } from "../../../core/components/LoadingSpinner";
import { ContactFormModal } from "../components/ContactFormModal";
import { PartnersGallery } from "../components/PartnersGallery";
import { usePartnersViewModel } from "../view-models/usePartnersViewModel";

const introStyle = css`
  padding-bottom: 1em;
`;

export const PartnersListSection: React.FC = () => {
  const vm = usePartnersViewModel();

  return (
    <PageSection>
      <Content className={introStyle}>
        <Title headingLevel="h1">Connect with a partner</Title>
        <Content component="p">
          You currently don't have a partner assigned. Once connected with a
          partner, you'll be able to share your migration assessments and
          collaborate on your infrastructure modernization journey.
        </Content>
      </Content>

      {vm.isLoading && <LoadingSpinner />}

      {vm.error && (
        <div className={introStyle}>
          <Alert isInline variant="danger" title="Partners API error">
            {vm.error.message}
          </Alert>
        </div>
      )}

      {!vm.isLoading && !vm.error && vm.partners.length === 0 && (
        <EmptyState
          headingLevel="h4"
          icon={RhUiSearchIcon}
          titleText="No partners available"
          variant="sm"
        />
      )}
      {!vm.isLoading && !vm.error && vm.partners.length > 0 && (
        <PartnersGallery
          partners={vm.partners}
          onRequestAssignment={vm.openContactFormModal}
        />
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
    </PageSection>
  );
};

PartnersListSection.displayName = "PartnersListSection";
