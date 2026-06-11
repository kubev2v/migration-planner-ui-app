import type { ChromeAPI } from "@redhat-cloud-services/types";
import { describe, expect, it } from "vitest";

import { getFeatureFlagsFromChrome } from "../getFeatureFlags";

describe("getFeatureFlagsFromChrome", () => {
  it("enables oma-chatbot in standalone when chrome has no feature flags", () => {
    const chrome = {} as ChromeAPI;

    expect(getFeatureFlagsFromChrome(chrome)).toEqual({
      "oma-chatbot": true,
    });
  });

  it("reads oma-chatbot from chrome visibilityFunctions", () => {
    const chrome = {
      visibilityFunctions: {
        featureFlag: (flagName: string, expectedValue: boolean) =>
          flagName === "oma-chatbot" && expectedValue === true,
      },
    } as unknown as ChromeAPI;

    expect(getFeatureFlagsFromChrome(chrome)).toEqual({
      "oma-chatbot": true,
    });
  });

  it("returns false when chrome feature flag is disabled", () => {
    const chrome = {
      visibilityFunctions: {
        featureFlag: () => false,
      },
    } as unknown as ChromeAPI;

    expect(getFeatureFlagsFromChrome(chrome)).toEqual({
      "oma-chatbot": false,
    });
  });
});
