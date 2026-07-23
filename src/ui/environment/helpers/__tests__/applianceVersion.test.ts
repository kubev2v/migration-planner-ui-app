import { describe, expect, it } from "vitest";

import { getApplianceVersionDisplay } from "../applianceVersion";

describe("getApplianceVersionDisplay", () => {
  it("returns undefined for empty or unknown values", () => {
    expect(getApplianceVersionDisplay("")).toBeUndefined();
    expect(getApplianceVersionDisplay("unknown")).toBeUndefined();
  });

  it("returns the version name when present", () => {
    expect(getApplianceVersionDisplay("v0.13.6")).toBe("v0.13.6");
  });
});
