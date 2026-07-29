/** Inventory came from an uploaded RVTools or inventory file. */
export const ASSESSMENT_SOURCE_UPLOADED_FILE = "Uploaded file";

/** Inventory came from a connected Discovery OVA appliance. */
export const ASSESSMENT_SOURCE_CONNECTED_APPLIANCE =
  "Connected discovery appliance";

export const ASSESSMENT_SOURCE_FILTER_UPLOADED_FILE = "uploaded-file" as const;
export const ASSESSMENT_SOURCE_FILTER_CONNECTED_APPLIANCE =
  "connected-appliance" as const;

export type AssessmentSourceFilterKey =
  | typeof ASSESSMENT_SOURCE_FILTER_UPLOADED_FILE
  | typeof ASSESSMENT_SOURCE_FILTER_CONNECTED_APPLIANCE;

/** Checkbox filter options for the assessments Source column. */
export const ASSESSMENT_SOURCE_FILTER_OPTIONS: {
  key: AssessmentSourceFilterKey;
  label: string;
}[] = [
  {
    key: ASSESSMENT_SOURCE_FILTER_UPLOADED_FILE,
    label: ASSESSMENT_SOURCE_UPLOADED_FILE,
  },
  {
    key: ASSESSMENT_SOURCE_FILTER_CONNECTED_APPLIANCE,
    label: ASSESSMENT_SOURCE_CONNECTED_APPLIANCE,
  },
];

/**
 * User-visible Source column label for an assessment.
 *
 * - `rvtools` / `inventory` → Uploaded file
 * - anything else (e.g. `source`) → Connected discovery appliance
 */
export const getAssessmentSourceLabel = (sourceType: string): string => {
  const normalized = sourceType.toLowerCase();
  if (normalized === "rvtools" || normalized === "inventory") {
    return ASSESSMENT_SOURCE_UPLOADED_FILE;
  }
  return ASSESSMENT_SOURCE_CONNECTED_APPLIANCE;
};

export const isUploadedFileSourceType = (sourceType: string): boolean =>
  getAssessmentSourceLabel(sourceType) === ASSESSMENT_SOURCE_UPLOADED_FILE;

export const getAssessmentSourceFilterKey = (
  sourceType: string,
): AssessmentSourceFilterKey =>
  isUploadedFileSourceType(sourceType)
    ? ASSESSMENT_SOURCE_FILTER_UPLOADED_FILE
    : ASSESSMENT_SOURCE_FILTER_CONNECTED_APPLIANCE;

export const sourceMatchesAssessmentSourceFilter = (
  sourceType: string,
  filterKey: AssessmentSourceFilterKey,
): boolean => getAssessmentSourceFilterKey(sourceType) === filterKey;
