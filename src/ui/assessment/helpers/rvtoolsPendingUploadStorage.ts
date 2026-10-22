import type { RvtoolsFileUploadResult } from "../../../data/stores/JobsStore";

const STORAGE_KEY_PREFIX = "migration-planner:rvtools-pending-uploads:";

export type RvtoolsPendingUploadBatch = {
  includedCount: number;
  attemptedCount: number;
  failures: RvtoolsFileUploadResult[];
  /** `created` on first partial create; `updated` after append batches. */
  context: "created" | "updated";
};

const readBatch = (assessmentId: string): RvtoolsPendingUploadBatch | null => {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${assessmentId}`);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as RvtoolsPendingUploadBatch;
  } catch {
    return null;
  }
};

export const saveRvtoolsPendingUploadBatch = (
  assessmentId: string,
  batch: RvtoolsPendingUploadBatch,
): void => {
  try {
    sessionStorage.setItem(
      `${STORAGE_KEY_PREFIX}${assessmentId}`,
      JSON.stringify(batch),
    );
  } catch {
    // sessionStorage may be unavailable in some embed contexts
  }
};

export const getRvtoolsPendingUploadBatch = (
  assessmentId: string,
): RvtoolsPendingUploadBatch | null => readBatch(assessmentId);

export const mergeRvtoolsPendingFailures = (
  assessmentId: string,
  failures: RvtoolsFileUploadResult[],
  options: {
    includedCount: number;
    attemptedCount: number;
    context: "created" | "updated";
  },
): void => {
  if (failures.length === 0) {
    return;
  }
  const existing = readBatch(assessmentId);
  const mergedFailures = [...(existing?.failures ?? []), ...failures].filter(
    (entry, index, all) =>
      all.findIndex(
        (other) =>
          other.fileName === entry.fileName &&
          other.fileSize === entry.fileSize &&
          other.errorMessage === entry.errorMessage,
      ) === index,
  );
  saveRvtoolsPendingUploadBatch(assessmentId, {
    includedCount: options.includedCount,
    attemptedCount: options.attemptedCount,
    failures: mergedFailures,
    context: options.context,
  });
};

export const removeRvtoolsPendingFailure = (
  assessmentId: string,
  fileName: string,
  fileSize: number,
): void => {
  const existing = readBatch(assessmentId);
  if (!existing) {
    return;
  }
  const failures = existing.failures.filter(
    (entry) => !(entry.fileName === fileName && entry.fileSize === fileSize),
  );
  if (failures.length === 0) {
    clearRvtoolsPendingUploadBatch(assessmentId);
    return;
  }
  saveRvtoolsPendingUploadBatch(assessmentId, { ...existing, failures });
};

export const clearRvtoolsPendingUploadBatch = (assessmentId: string): void => {
  try {
    sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${assessmentId}`);
  } catch {
    // ignore
  }
};
