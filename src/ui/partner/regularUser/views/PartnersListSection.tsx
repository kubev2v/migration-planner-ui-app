import { css } from "@emotion/css";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Content,
  EmptyState,
  Gallery,
  PageSection,
  Title,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import React, { useState } from "react";

import type { Partner } from "../../../../models/PartnerModel";
import type { PartnerRequestValues } from "../../../../models/PartnerRequestModel";
import { LoadingSpinner } from "../../../core/components/LoadingSpinner";
import { ContactFormModal } from "../components/ContactFormModal";
import { usePartnersViewModel } from "../view-models/usePartnersViewModel";

const introStyle = css`
  padding-bottom: 1em;
`;

export const PartnersListSection: React.FC = () => {
  const vm = usePartnersViewModel();
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const handleSubmitRequest = async (values: PartnerRequestValues) => {
    try {
      await vm.createPartnerRequest(values);
      console.log("[PartnersListSection] Contact request submitted:", values);
      setSelectedPartner(null);
    } catch (error) {
      console.error("[PartnersListSection] Failed to submit request:", error);
    }
  };

  return (
    <PageSection>
      <Content className={introStyle}>
        <Title headingLevel="h1">Connect with a Partner</Title>
        <Content component="p">
          You currently don't have a partner assigned.
          <br />
          Once connected with a partner, you'll be able to share your migration
          assessments and collaborate on your infrastructure modernization
          journey.
          <br />
          Choose a partner below to get started:
        </Content>
      </Content>

      {vm.isLoading && <LoadingSpinner />}
      {vm.error && <div>Error loading partners: {vm.error.message}</div>}
      {!vm.isLoading && !vm.error && vm.partners.length === 0 && (
        <EmptyState
          headingLevel="h4"
          icon={SearchIcon}
          titleText="No partners available"
          variant="sm"
        />
      )}
      {!vm.isLoading && !vm.error && vm.partners.length > 0 && (
        <Gallery hasGutter minWidths={{ default: "300px" }}>
          {vm.partners.map((partner) => (
            <Card key={partner.id}>
              <CardHeader>
                <img
                  src={partner.icon}
                  alt={`${partner.name} icon`}
                  style={{
                    height: "60px",
                  }}
                />
              </CardHeader>
              <CardTitle>{partner.name}</CardTitle>
              <CardBody>{partner.description}</CardBody>
              <CardFooter>
                <Button
                  variant="primary"
                  isBlock
                  onClick={() => setSelectedPartner(partner)}
                >
                  Request Assignment
                </Button>
              </CardFooter>
            </Card>
          ))}
        </Gallery>
      )}

      {selectedPartner !== null && (
        <ContactFormModal
          isOpen
          partner={selectedPartner}
          onClose={() => setSelectedPartner(null)}
          onSubmit={(values) => void handleSubmitRequest(values)}
        />
      )}
    </PageSection>
  );
};

PartnersListSection.displayName = "PartnersListSection";
