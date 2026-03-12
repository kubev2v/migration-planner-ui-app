import type { ExternalStore } from "../../../lib/mvvm/ExternalStore";

export interface ReportStoreState {
  loadingState: "idle";
  error: null;
}

export interface IReportStore extends ExternalStore<ReportStoreState> {}
