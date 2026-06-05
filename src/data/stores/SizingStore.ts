import type {
  CalculateClusterRequirementsRequest,
  InitOverrideFunction,
  SizingApiInterface,
  StandaloneClusterRequirementsResponse,
} from "@openshift-migration-advisor/planner-sdk";

import { ExternalStoreBase } from "../../lib/mvvm/ExternalStore";
import type { ISizingStore } from "./interfaces/ISizingStore";

type SizingStoreSnapshot = Record<string, never>;

const EMPTY_SNAPSHOT: SizingStoreSnapshot = Object.freeze({});

export class SizingStore
  extends ExternalStoreBase<SizingStoreSnapshot>
  implements ISizingStore
{
  private api: SizingApiInterface;

  constructor(api: SizingApiInterface) {
    super();
    this.api = api;
  }

  override getSnapshot(): SizingStoreSnapshot {
    return EMPTY_SNAPSHOT;
  }

  calculateClusterRequirements(
    requestParameters: CalculateClusterRequirementsRequest,
    initOverrides?: RequestInit | InitOverrideFunction,
  ): Promise<StandaloneClusterRequirementsResponse> {
    return this.api.calculateClusterRequirements(
      requestParameters,
      initOverrides,
    );
  }
}
