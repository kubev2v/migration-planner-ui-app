import type {
  MigrationComplexityResponse,
  MigrationEstimationByComplexityResponse,
} from "@openshift-migration-advisor/planner-sdk";

import type {
  ClusterRequirementsResponse,
  MigrationEstimationResponse,
  SizingFormValues,
} from "../views/cluster-sizer/types";

/**
 * Options for pre-populating recommendation tools with existing data.
 *
 * **Capture-once contract**: each tool view-model freezes these options on the
 * first render. Any changes after mount are ignored. Remount the tool (change
 * its React `key`) to apply new initial values.
 */
export interface UseArchitectureToolOptions {
  initialSizerOutput?: ClusterRequirementsResponse;
  initialFormValues?: SizingFormValues;
}

export interface UseTimeEstimationToolOptions {
  initialMigrationEstimation?: MigrationEstimationResponse;
}

export interface UseComplexityToolOptions {
  initialComplexityEstimation?: MigrationComplexityResponse;
  initialEstimationByComplexity?: MigrationEstimationByComplexityResponse;
  /**
   * Fetch complexity results on mount. Used by the complexity tool, which has
   * no form — results should appear without a Calculate click.
   */
  autoLoad?: boolean;
}

export type UseClusterSizingWizardOptions = UseArchitectureToolOptions &
  UseTimeEstimationToolOptions &
  Omit<UseComplexityToolOptions, "autoLoad">;
