import { PageSection, Title } from "@patternfly/react-core";
import type React from "react";

export const CustomersScreen: React.FC = () => {
  return (
    <PageSection>
      <Title headingLevel="h1" size="2xl">
        Customers
      </Title>
    </PageSection>
  );
};

CustomersScreen.displayName = "CustomersScreen";
