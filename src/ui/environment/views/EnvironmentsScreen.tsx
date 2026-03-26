import React from "react";

import { EnvironmentPageProvider } from "../view-models/EnvironmentPageContext";
import EnvironmentPage from "./Environment";

export const EnvironmentsScreen: React.FC = () => {
  return (
    <EnvironmentPageProvider>
      <EnvironmentPage />
    </EnvironmentPageProvider>
  );
};
EnvironmentsScreen.displayName = "EnvironmentsScreen";
