import React from "react";

// Must conform to Unleash / Frontend Operator feature flag names.
export type MigrationAdvisorFeatureType = "oma-chatbot";

export type FeatureListType = {
  [key in MigrationAdvisorFeatureType]?: boolean;
};

export type FeatureGateContextType = {
  isFeatureEnabled: (feature: MigrationAdvisorFeatureType) => boolean;
};

export const FeatureGateContext = React.createContext<FeatureGateContextType>({
  isFeatureEnabled: () => false,
});

export const STANDALONE_ENABLED_FEATURES: FeatureListType = {
  "oma-chatbot": true,
};

export const FeatureGateContextProvider: React.FC<
  React.PropsWithChildren<{
    features: FeatureListType;
  }>
> = ({ features, children }) => {
  const isFeatureEnabled = (feature: MigrationAdvisorFeatureType) =>
    !!features[feature];

  return (
    <FeatureGateContext.Provider value={{ isFeatureEnabled }}>
      {children}
    </FeatureGateContext.Provider>
  );
};

export const useFeature = (feature: MigrationAdvisorFeatureType): boolean => {
  const { isFeatureEnabled } = React.useContext(FeatureGateContext);
  return isFeatureEnabled(feature);
};
