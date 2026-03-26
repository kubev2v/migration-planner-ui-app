import { Bullseye, Spinner } from "@patternfly/react-core";
import React from "react";

export const LoadingSpinner: React.FC = () => {
  return (
    <Bullseye>
      <Spinner size="xl" />
    </Bullseye>
  );
};

LoadingSpinner.displayName = "LoadingSpinner";
