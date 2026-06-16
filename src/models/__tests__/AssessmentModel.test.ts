import type { Assessment } from "@openshift-migration-advisor/planner-sdk";
import { describe, expect, it } from "vitest";

import { createAssessmentModel } from "../AssessmentModel";

const makeAssessment = (overrides: Partial<Assessment> = {}): Assessment => ({
  id: "a-1",
  name: "Test Assessment",
  sourceType: "inventory",
  createdAt: new Date("2026-01-01"),
  snapshots: [],
  ...overrides,
});

describe("createAssessmentModel", () => {
  it("defaults owner permissions when API omits them", () => {
    const model = createAssessmentModel(makeAssessment());

    expect(model.permissions).toEqual(["read", "share", "delete"]);
  });

  it("preserves permissions returned by auth-enabled API", () => {
    const model = createAssessmentModel(
      makeAssessment({ permissions: ["read"] }),
    );

    expect(model.permissions).toEqual(["read"]);
  });
});
