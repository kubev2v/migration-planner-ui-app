import type {
  StandaloneCostEstimateRequest,
  StandaloneCostEstimateResponse,
} from "../../../models/StandaloneCostEstimationModel";

export interface IStandaloneCostEstimationStore {
  calculateStandaloneCostEstimation(
    requestParameters: StandaloneCostEstimateRequest,
    initOverrides?: RequestInit,
  ): Promise<StandaloneCostEstimateResponse>;
}
