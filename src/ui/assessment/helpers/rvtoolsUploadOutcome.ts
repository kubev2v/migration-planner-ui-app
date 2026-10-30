import type { RvtoolsFileUploadResult } from "../../../data/stores/JobsStore";

import {
  getRvtoolsPendingUploadBatch,
  mergeRvtoolsPendingFailures,
} from "./rvtoolsPendingUploadStorage";
import type { RvtoolsPendingUploadBatch } from "./rvtoolsPendingUploadStorage";

export type { RvtoolsPendingUploadBatch };
import {
  getRvtoolsSourceFiles,
  recordRvtoolsSourceFiles,
} from "./rvtoolsSourceFilesStorage";

export type RvtoolsUploadOutcomeContext = "created" | "updated";

export type RvtoolsUploadOutcomeSummary = {
  validFileNames: string[];
  invalidResults: RvtoolsFileUploadResult[];
  attemptedCount: number;
  includedCount: number;
};

export const summarizeRvtoolsUploadResults = (
  results: RvtoolsFileUploadResult[],
): Pick<
  RvtoolsUploadOutcomeSummary,
  "validFileNames" | "invalidResults" | "attemptedCount"
> => {
  const validFileNames = results
    .filter((entry) => entry.status === "valid")
    .map((entry) => entry.fileName);
  const invalidResults = results.filter((entry) => entry.status === "invalid");
  return {
    validFileNames,
    invalidResults,
    attemptedCount: results.length,
  };
};

export const applyRvtoolsUploadOutcome = (
  assessmentId: string,
  results: RvtoolsFileUploadResult[],
  context: RvtoolsUploadOutcomeContext,
): RvtoolsUploadOutcomeSummary => {
  const { validFileNames, invalidResults, attemptedCount } =
    summarizeRvtoolsUploadResults(results);

  if (validFileNames.length > 0) {
    recordRvtoolsSourceFiles(assessmentId, validFileNames);
  }

  const includedCount = getRvtoolsSourceFiles(assessmentId).length;

  if (invalidResults.length > 0) {
    mergeRvtoolsPendingFailures(assessmentId, invalidResults, {
      includedCount,
      attemptedCount,
      context,
    });
  }

  return {
    validFileNames,
    invalidResults,
    attemptedCount,
    includedCount,
  };
};

export const buildAppendRvtoolsToastMessage = (
  summary: RvtoolsUploadOutcomeSummary,
): { variant: "success" | "warning"; message: string } | null => {
  const { validFileNames, invalidResults, attemptedCount } = summary;
  if (attemptedCount === 0) {
    return null;
  }
  if (validFileNames.length === 0 && invalidResults.length > 0) {
    return {
      variant: "warning",
      message:
        "No files added. The selected files couldn't be processed. Your assessment results have not changed.",
    };
  }
  if (invalidResults.length > 0) {
    const added = validFileNames.length;
    const failed = invalidResults.length;
    return {
      variant: "success",
      message:
        added === 1
          ? `1 file added to this assessment. Results updated. ${failed} file couldn't be processed.`
          : `${added} files added to this assessment. Results updated. ${failed} files couldn't be processed.`,
    };
  }
  if (validFileNames.length > 0) {
    return {
      variant: "success",
      message:
        validFileNames.length === 1
          ? "1 file added to this assessment. Results updated."
          : `${validFileNames.length} files added to this assessment. Results updated.`,
    };
  }
  return null;
};

export const buildReplaceSuccessToastMessage = (): string =>
  "File replaced. Assessment results updated.";

export const getActiveRvtoolsPendingBatch = (
  assessmentId: string,
): RvtoolsPendingUploadBatch | null => {
  const batch = getRvtoolsPendingUploadBatch(assessmentId);
  if (!batch || batch.failures.length === 0) {
    return null;
  }
  return {
    ...batch,
    includedCount: getRvtoolsSourceFiles(assessmentId).length,
  };
};
