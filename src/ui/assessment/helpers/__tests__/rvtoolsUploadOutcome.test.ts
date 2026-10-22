import { afterEach, describe, expect, it } from "vitest";

import {
  applyRvtoolsUploadOutcome,
  buildAppendRvtoolsToastMessage,
} from "../rvtoolsUploadOutcome";
import { getRvtoolsPendingUploadBatch } from "../rvtoolsPendingUploadStorage";
import { getRvtoolsSourceFiles } from "../rvtoolsSourceFilesStorage";

const assessmentId = "test-assessment-id";

describe("rvtoolsUploadOutcome", () => {
  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("records included files and pending failures", () => {
    const summary = applyRvtoolsUploadOutcome(
      assessmentId,
      [
        { fileName: "a.xlsx", fileSize: 1, status: "valid" },
        {
          fileName: "b.xlsx",
          fileSize: 2,
          status: "invalid",
          errorMessage: "bad file",
        },
      ],
      "created",
    );

    expect(summary.includedCount).toBe(1);
    expect(getRvtoolsSourceFiles(assessmentId)).toHaveLength(1);
    expect(getRvtoolsPendingUploadBatch(assessmentId)?.failures).toHaveLength(
      1,
    );
  });

  it("builds an all-failed append toast", () => {
    const message = buildAppendRvtoolsToastMessage({
      validFileNames: [],
      invalidResults: [
        { fileName: "bad.xlsx", fileSize: 1, status: "invalid" },
      ],
      attemptedCount: 1,
      includedCount: 2,
    });
    expect(message?.variant).toBe("warning");
    expect(message?.message).toContain("No files added");
  });
});
