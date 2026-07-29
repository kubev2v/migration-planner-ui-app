import { describe, expect, it } from "vitest";

import {
  ASSESSMENT_SOURCE_CONNECTED_APPLIANCE,
  ASSESSMENT_SOURCE_FILTER_CONNECTED_APPLIANCE,
  ASSESSMENT_SOURCE_FILTER_UPLOADED_FILE,
  ASSESSMENT_SOURCE_UPLOADED_FILE,
  getAssessmentSourceFilterKey,
  getAssessmentSourceLabel,
  isUploadedFileSourceType,
  sourceMatchesAssessmentSourceFilter,
} from "../assessmentSource";

describe("assessmentSource", () => {
  it("maps rvtools and inventory to Uploaded file", () => {
    expect(getAssessmentSourceLabel("rvtools")).toBe(
      ASSESSMENT_SOURCE_UPLOADED_FILE,
    );
    expect(getAssessmentSourceLabel("inventory")).toBe(
      ASSESSMENT_SOURCE_UPLOADED_FILE,
    );
    expect(isUploadedFileSourceType("rvtools")).toBe(true);
    expect(isUploadedFileSourceType("inventory")).toBe(true);
  });

  it("maps source (and other types) to Connected discovery appliance", () => {
    expect(getAssessmentSourceLabel("source")).toBe(
      ASSESSMENT_SOURCE_CONNECTED_APPLIANCE,
    );
    expect(getAssessmentSourceLabel("agent")).toBe(
      ASSESSMENT_SOURCE_CONNECTED_APPLIANCE,
    );
    expect(isUploadedFileSourceType("source")).toBe(false);
  });

  it("maps source types to filter keys", () => {
    expect(getAssessmentSourceFilterKey("rvtools")).toBe(
      ASSESSMENT_SOURCE_FILTER_UPLOADED_FILE,
    );
    expect(getAssessmentSourceFilterKey("source")).toBe(
      ASSESSMENT_SOURCE_FILTER_CONNECTED_APPLIANCE,
    );
    expect(
      sourceMatchesAssessmentSourceFilter(
        "inventory",
        ASSESSMENT_SOURCE_FILTER_UPLOADED_FILE,
      ),
    ).toBe(true);
    expect(
      sourceMatchesAssessmentSourceFilter(
        "inventory",
        ASSESSMENT_SOURCE_FILTER_CONNECTED_APPLIANCE,
      ),
    ).toBe(false);
  });
});
