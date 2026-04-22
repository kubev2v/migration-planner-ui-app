import { Badge, Tab, TabTitleIcon, TabTitleText } from "@patternfly/react-core";
import React from "react";

interface PartnerTabProps {
  eventKey: number;
  label: string;
  pendingRequestsCount: number;
  shouldShowBadge: boolean;
  isLoading: boolean;
}

export const PartnerTab: React.FC<PartnerTabProps> = ({
  eventKey,
  label,
  pendingRequestsCount,
  shouldShowBadge,
  isLoading,
}) => {
  const pendingRequestText = `${pendingRequestsCount} pending partner request${
    pendingRequestsCount === 1 ? "" : "s"
  }`;

  return (
    <Tab
      eventKey={eventKey}
      title={
        <>
          <TabTitleText>{label}</TabTitleText>{" "}
          {shouldShowBadge && pendingRequestsCount > 0 && !isLoading && (
            <TabTitleIcon>
              <Badge screenReaderText={pendingRequestText}>
                {pendingRequestsCount}
              </Badge>
            </TabTitleIcon>
          )}
        </>
      }
      aria-label={`${label} tab`}
    />
  );
};

PartnerTab.displayName = "PartnerTab";
