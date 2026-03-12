import { ExternalStoreBase } from "../../lib/mvvm/ExternalStore";
import type { IReportStore, ReportStoreState } from "./interfaces/IReportStore";

const IDLE_STATE: ReportStoreState = Object.freeze({
  loadingState: "idle",
  error: null,
});

export class ReportStore
  extends ExternalStoreBase<ReportStoreState>
  implements IReportStore
{
  override getSnapshot(): ReportStoreState {
    return IDLE_STATE;
  }
}
