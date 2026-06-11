import type { ChromeAPI } from "@redhat-cloud-services/types";

import {
  type FeatureListType,
  STANDALONE_ENABLED_FEATURES,
} from "./featureGate";

export const getFeatureFlagsFromChrome = (
  chrome: ChromeAPI,
): FeatureListType => {
  const featureFlag = chrome.visibilityFunctions?.featureFlag;
  if (!featureFlag) {
    return STANDALONE_ENABLED_FEATURES;
  }

  return {
    "oma-chatbot": featureFlag("oma-chatbot", true),
  };
};
