import type {
  CalculateClusterRequirementsRequest,
  InitOverrideFunction,
  StandaloneClusterRequirementsResponse,
} from "@openshift-migration-advisor/planner-sdk";

export interface ISizingStore {
  calculateClusterRequirements(
    requestParameters: CalculateClusterRequirementsRequest,
    initOverrides?: RequestInit | InitOverrideFunction,
  ): Promise<StandaloneClusterRequirementsResponse>;
}
