import { useCallback, useState } from 'react';
import { useInterval } from 'react-use';

import { JobApi } from '@migration-planner-ui/api-client/apis';
import { Job, JobStatus } from '@migration-planner-ui/api-client/models';

import { useAsyncFnResetError } from '../../../hooks/useAsyncFnResetError';
import {
  JOB_POLLING_INTERVAL,
  TERMINAL_JOB_STATUSES,
} from '../utils/rvToolsJobUtils';

interface UseRVToolsJobProps {
  jobApi: JobApi;
  onJobCompleted: () => void;
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
}: UseRVToolsJobProps): UseRVToolsJobReturn => {
  // RVTools Job State
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [jobPollingDelay, setJobPollingDelay] = useState<number | null>(null);

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

  // Create RVTools job
  const [createRVToolsJobState, createRVToolsJob] = useAsyncFnResetError(
    async (name: string, file: File) => {
      const job = await jobApi.createRVToolsAssessment({ name, file });
      setCurrentJob(job);
      setJobPollingDelay(JOB_POLLING_INTERVAL);
      return job;
    },
  );

  // Cancel job
  const cancelRVToolsJob = useCallback(async () => {
    if (currentJob && !TERMINAL_JOB_STATUSES.includes(currentJob.status)) {
      try {
        await jobApi.cancelJob({ id: currentJob.id });
      } catch (err) {
        console.error('Failed to cancel job:', err);
      }
    }
    setCurrentJob(null);
    setJobPollingDelay(null);
  }, [currentJob, jobApi]);

  // Clear job state
  const clearRVToolsJob = useCallback(() => {
    setCurrentJob(null);
    setJobPollingDelay(null);
  }, []);

  return {
    currentJob,
    isCreatingRVToolsJob: createRVToolsJobState.loading,
    errorCreatingRVToolsJob: createRVToolsJobState.error as Error | undefined,
    createRVToolsJob,
    cancelRVToolsJob,
    clearRVToolsJob,
  };
};
