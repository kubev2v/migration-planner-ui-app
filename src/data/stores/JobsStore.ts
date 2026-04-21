import type { JobApi } from "@openshift-migration-advisor/planner-sdk";
import type { Job } from "@openshift-migration-advisor/planner-sdk";
import { JobStatus } from "@openshift-migration-advisor/planner-sdk";

import { parseApiError } from "../../lib/common/ErrorParser";
import { PollableStoreBase } from "../../lib/mvvm/PollableStore";
import type { IJobsStore } from "./interfaces/IJobsStore";

/** Polling interval in milliseconds for active job status checks. */
export const JOB_POLLING_INTERVAL = 1000;

/** Job statuses that indicate the job has reached a final state. */
export const TERMINAL_JOB_STATUSES: JobStatus[] = [
  JobStatus.Completed,
  JobStatus.Failed,
  JobStatus.Cancelled,
];

export type JobsStoreState = {
  currentJob: Job | null;
  isCreating: boolean;
  createError?: Error;
};

export class JobsStore
  extends PollableStoreBase<JobsStoreState>
  implements IJobsStore
{
  private state: JobsStoreState = {
    currentJob: null,
    isCreating: false,
    createError: undefined,
  };
  private abortController: AbortController | null = null;
  private cancelInProgress = false;
  private api: JobApi;

  constructor(api: JobApi) {
    super();
    this.api = api;
  }

  override getSnapshot(): JobsStoreState {
    return this.state;
  }

  /**
   * Create a new RVTools assessment job.
   * The caller (view model) is responsible for starting polling after this.
   */
  async createRVToolsJob(name: string, file: File): Promise<Job | undefined> {
    this.cancelInProgress = false;

    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    // Capture in a local variable so this invocation always checks its OWN
    // controller, even if a subsequent call reassigns `this.abortController`.
    const controller = this.abortController;

    this.setState({ isCreating: true, createError: undefined });

    try {
      const job = await this.api.createRVToolsAssessment(
        { name, file },
        { signal: controller.signal },
      );

      if (controller.signal.aborted) {
        if (job?.id && !TERMINAL_JOB_STATUSES.includes(job.status)) {
          this.api.cancelJob({ id: job.id }).catch(() => undefined);
        }
        return undefined;
      }

      this.setState({ currentJob: job, isCreating: false });
      return job;
    } catch (err) {
      if (controller.signal.aborted) {
        return undefined;
      }

      const errorToStore = await parseApiError(
        err,
        "Failed to create RVTools job",
      );

      // A newer call may have started while parseApiError was resolving.
      // If so, this invocation is stale — don't overwrite the newer state.
      if (this.abortController !== controller) {
        return undefined;
      }

      this.setState({ createError: errorToStore, isCreating: false });
      return undefined;
    }
  }

  /**
   * Cancel the current job.
   *
   * - If the job is still running, cancels it on the server.
   * - Returns the **latest** job state so the caller (view model) can decide
   *   whether to perform cross-store cleanup (e.g. delete a completed assessment).
   */
  async cancelRVToolsJob(): Promise<Job | null> {
    if (this.cancelInProgress) {
      return null;
    }
    this.cancelInProgress = true;

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    // Capture job reference before resetting so we can still cancel it server-side.
    const currentJob = this.state.currentJob;

    // Reset store state immediately so the UI shows a clean, interactive form
    // the moment the user cancels — without waiting for the server round-trips below.
    this.reset();

    let latestJob: Job | null = null;

    if (currentJob) {
      try {
        latestJob = await this.api.getJob({ id: currentJob.id });
      } catch {
        latestJob = currentJob;
      }

      if (!TERMINAL_JOB_STATUSES.includes(latestJob.status)) {
        try {
          await this.api.cancelJob({ id: latestJob.id });
        } catch (err) {
          console.error("Failed to cancel job:", err);
        }
      }
    }

    this.cancelInProgress = false;
    return latestJob;
  }

  /**
   * Clear error state so the user can retry with a fresh form.
   * Clears `createError` and, if the current job reached a terminal state
   * (Failed / Cancelled / Completed), also clears `currentJob`.
   * Active (non-terminal) jobs are left untouched.
   */
  clearCreateError(): void {
    const updates: Partial<JobsStoreState> = {};

    if (this.state.createError !== undefined) {
      updates.createError = undefined;
    }

    if (
      this.state.currentJob &&
      TERMINAL_JOB_STATUSES.includes(this.state.currentJob.status)
    ) {
      updates.currentJob = null;
    }

    if (Object.keys(updates).length > 0) {
      this.setState(updates);
    }
  }

  /**
   * Clear all job state.
   * The caller (view model) is responsible for stopping polling beforehand.
   */
  reset(): void {
    this.setState({
      currentJob: null,
      isCreating: false,
      createError: undefined,
    });
  }

  protected override async poll(signal: AbortSignal): Promise<void> {
    if (this.cancelInProgress) {
      return;
    }

    const currentJob = this.state.currentJob;
    if (!currentJob || TERMINAL_JOB_STATUSES.includes(currentJob.status)) {
      return;
    }

    try {
      // Forward the poll signal so stopPolling() aborts the in-flight request.
      // Without this, a stale getJob response can arrive after reset() and
      // repopulate currentJob — causing the progress bar to reappear and
      // eventually triggering navigation even after the user cancelled.
      const updated = await this.api.getJob({ id: currentJob.id }, { signal });
      if (this.cancelInProgress) {
        return;
      }
      this.setState({ currentJob: updated });

      // State is kept with the terminal job — the view model reacts to
      // this change (e.g. stopping polling, navigating to the report).
    } catch (err) {
      if (signal.aborted) {
        return;
      }
      console.error("Failed to poll job status:", err);
    }
  }

  private setState(partial: Partial<JobsStoreState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }
}
