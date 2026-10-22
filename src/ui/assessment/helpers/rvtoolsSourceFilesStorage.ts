import type { AssessmentSubsetInventory } from "@openshift-migration-advisor/planner-sdk";

const STORAGE_KEY_PREFIX = "migration-planner:rvtools-source-files:";

export type StoredRvtoolsSourceFile = {
  fileName: string;
  uploadedAt: string;
};

const readSourceFiles = (assessmentId: string): StoredRvtoolsSourceFile[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${assessmentId}`);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as StoredRvtoolsSourceFile[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getRvtoolsSourceFiles = (
  assessmentId: string,
): StoredRvtoolsSourceFile[] => readSourceFiles(assessmentId);

export const recordRvtoolsSourceFiles = (
  assessmentId: string,
  fileNames: string[],
  uploadedAt: Date = new Date(),
): void => {
  if (fileNames.length === 0) {
    return;
  }
  const existing = readSourceFiles(assessmentId);
  const uploadedAtIso = uploadedAt.toISOString();
  const byName = new Map(existing.map((entry) => [entry.fileName, entry]));
  for (const fileName of fileNames) {
    byName.set(fileName, { fileName, uploadedAt: uploadedAtIso });
  }
  try {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${assessmentId}`,
      JSON.stringify(Array.from(byName.values())),
    );
  } catch {
    // localStorage may be unavailable
  }
};

/** Best-effort bootstrap when no client history exists (e.g. older assessments). */
export const bootstrapRvtoolsSourceFilesFromSubsets = (
  assessmentId: string,
  subsets: AssessmentSubsetInventory[],
): StoredRvtoolsSourceFile[] => {
  const stored = readSourceFiles(assessmentId);
  if (stored.length > 0) {
    return stored;
  }
  const fromSubsets = subsets
    .filter((subset) => /\.xlsx?$/i.test(subset.name))
    .map((subset) => ({
      fileName: subset.name,
      uploadedAt:
        subset.createdAt instanceof Date
          ? subset.createdAt.toISOString()
          : new Date(subset.createdAt).toISOString(),
    }));
  if (fromSubsets.length > 0) {
    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${assessmentId}`,
        JSON.stringify(fromSubsets),
      );
    } catch {
      // ignore
    }
  }
  return fromSubsets.length > 0 ? fromSubsets : stored;
};
