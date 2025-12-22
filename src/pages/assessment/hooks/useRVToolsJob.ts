import { useCallback, useRef, useState } from 'react';
import { useInterval } from 'react-use';

import { JobApi } from '@migration-planner-ui/api-client/apis';
import { Job, JobStatus } from '@migration-planner-ui/api-client/models';

import {
  JOB_POLLING_INTERVAL,
  TERMINAL_JOB_STATUSES,
} from '../utils/rvToolsJobUtils';

interface UseRVToolsJobProps {
  jobApi: JobApi;
  onJobCompleted: () => void;
  onDeleteAssessment?: (assessmentId: string) => Promise<void>;
}

interface UseRVToolsJobReturn {
  currentJob: Job | null;
  isCreatingRVToolsJob: boolean;
  errorCreatingRVToolsJob: Error | undefined;
  createRVToolsJob: (
    name: string,
    file: File,
  ) => Promise<Job | undefined | unknown>;
  cancelRVToolsJob: () => Promise<void>;
  clearRVToolsJob: () => void;
}

export const useRVToolsJob = ({
  jobApi,
  onJobCompleted,
  onDeleteAssessment,
}: UseRVToolsJobProps): UseRVToolsJobReturn => {
  // RVTools Job State
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [jobPollingDelay, setJobPollingDelay] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<Error | undefined>(undefined);
  // AbortController ref to cancel in-flight API requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Job polling (separate from existing sources/assessments polling)
  useInterval(() => {
    if (currentJob && !TERMINAL_JOB_STATUSES.includes(currentJob.status)) {
      jobApi
        .getJob({ id: currentJob.id })
        .then((updated) => {
          setCurrentJob(updated);
          if (TERMINAL_JOB_STATUSES.includes(updated.status)) {
            setJobPollingDelay(null);
            // Refresh assessments list on completion
            if (updated.status === JobStatus.Completed) {
              onJobCompleted();
            }
          }
        })
        .catch((err) => {
          console.error('Failed to poll job status:', err);
        });
    }
  }, jobPollingDelay);

  // Create RVTools job with AbortController support
  const createRVToolsJob = useCallback(
    async (name: string, file: File): Promise<Job | undefined> => {
      // Abort any previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsCreating(true);
      setCreateError(undefined);

      try {
        const job = await jobApi.createRVToolsAssessment(
          { name, file },
          { signal: abortController.signal },
        );

        // Check if aborted before setting state - cancel the backend job if needed
        if (abortController.signal.aborted) {
          // Job was created on backend but user cancelled - cancel it
          if (job?.id && !TERMINAL_JOB_STATUSES.includes(job.status)) {
            jobApi.cancelJob({ id: job.id }).catch(() => {});
          }
          return undefined;
        }

        setCurrentJob(job);
        setJobPollingDelay(JOB_POLLING_INTERVAL);
        setIsCreating(false);
        return job;
      } catch (err) {
        // Don't set error state if the request was aborted
        if (abortController.signal.aborted) {
          return undefined;
        }
        setCreateError(err as Error);
        setIsCreating(false);
        throw err;
      }
    },
    [jobApi],
  );

  // Cancel job and abort any in-flight requests
  const cancelRVToolsJob = useCallback(async () => {
    // Abort any in-flight API request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (currentJob) {
      // Fetch latest job status from server (local state may be stale)
      let latestJob: Job | null = null;
      try {
        latestJob = await jobApi.getJob({ id: currentJob.id });
      } catch (err) {
        // If we can't fetch, use local state
        latestJob = currentJob;
      }

      if (!TERMINAL_JOB_STATUSES.includes(latestJob.status)) {
        // Job is still running - cancel it
        try {
          await jobApi.cancelJob({ id: latestJob.id });
        } catch (err) {
          console.error('Failed to cancel job:', err);
        }
      } else if (
        latestJob.status === JobStatus.Completed &&
        latestJob.assessmentId &&
        onDeleteAssessment
      ) {
        // Job already completed - delete the created assessment
        try {
          await onDeleteAssessment(latestJob.assessmentId);
        } catch (err) {
          console.error('Failed to delete assessment:', err);
        }
      }
    }
    setCurrentJob(null);
    setJobPollingDelay(null);
    setIsCreating(false);
    setCreateError(undefined);
  }, [currentJob, jobApi, onDeleteAssessment]);

  // Clear job state and abort any in-flight requests
  const clearRVToolsJob = useCallback(() => {
    // Abort any in-flight API request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setCurrentJob(null);
    setJobPollingDelay(null);
    setIsCreating(false);
    setCreateError(undefined);
  }, []);

  return {
    currentJob,
    isCreatingRVToolsJob: isCreating,
    errorCreatingRVToolsJob: createError,
    createRVToolsJob,
    cancelRVToolsJob,
    clearRVToolsJob,
  };
};
