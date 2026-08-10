import type {
  Configuration,
  Middleware,
} from "@openshift-migration-advisor/planner-sdk";
import { ResponseError } from "@openshift-migration-advisor/planner-sdk";

import { parseApiError } from "../../lib/common/ErrorParser";
import { ExternalStoreBase } from "../../lib/mvvm/ExternalStore";
import type {
  StandaloneCostEstimateRequest,
  StandaloneCostEstimateResponse,
} from "../../models/StandaloneCostEstimationModel";
import type { IStandaloneCostEstimationStore } from "./interfaces/IStandaloneCostEstimationStore";

type StandaloneCostEstimationSnapshot = Record<string, never>;

const EMPTY_SNAPSHOT: StandaloneCostEstimationSnapshot = Object.freeze({});

export class StandaloneCostEstimationStore
  extends ExternalStoreBase<StandaloneCostEstimationSnapshot>
  implements IStandaloneCostEstimationStore
{
  private config: Configuration;

  constructor(config: Configuration) {
    super();
    this.config = config;
  }

  override getSnapshot(): StandaloneCostEstimationSnapshot {
    return EMPTY_SNAPSHOT;
  }

  async calculateStandaloneCostEstimation(
    requestParameters: StandaloneCostEstimateRequest,
    initOverrides?: RequestInit,
  ): Promise<StandaloneCostEstimateResponse> {
    try {
      const middleware: Middleware[] = this.config.middleware || [];
      const fetchApi = this.config.fetchApi || fetch;

      const basePath =
        process.env.MIGRATION_PLANNER_COST_ESTIMATION_API_BASE_URL;
      const url = `${basePath}/v1/cost-estimation-standalone`;

      let init: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestParameters),
      };

      if (initOverrides && typeof initOverrides !== "function") {
        init = { ...init, ...initOverrides };
      }

      let requestContext = {
        fetch: (u: string, i?: RequestInit) => fetchApi(u, i),
        url,
        init,
      };
      for (const mw of middleware) {
        if (mw.pre) {
          const result = await mw.pre(requestContext);
          if (result) {
            requestContext = { ...requestContext, ...result };
          }
        }
      }

      const response = await requestContext.fetch(
        requestContext.url,
        requestContext.init,
      );

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new ResponseError(response, errorData.message);
      }

      return (await response.json()) as StandaloneCostEstimateResponse;
    } catch (err) {
      throw await parseApiError(err, "Failed to calculate cost estimation");
    }
  }
}
