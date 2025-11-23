import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Time } from '../../../common/Time';
import { useDiscoverySources } from '../../../migration-wizard/contexts/discovery-sources/Context';
import { isTerminalStatus, type SnapshotStatus } from '../utils/statusHelpers';

const POLLING_INTERVAL_MS = 2 * Time.Second;

interface UseAssessmentStatusPollingReturn {
  status: SnapshotStatus;
  error: string | null;
  isPolling: boolean;
  startPolling: (assessmentId: string) => void;
  stopPolling: () => void;
  cancelJob: () => Promise<void>;
  reset: () => void;
}

export function useAssessmentStatusPolling(
  onCancel?: () => void,
): UseAssessmentStatusPollingReturn {
  const navigate = useNavigate();
  const discoverySourcesContext = useDiscoverySources();

  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [status, setStatus] = useState<SnapshotStatus>('');
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkSnapshotStatusRef = useRef<(() => Promise<void>) | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const reset = useCallback(() => {
    setStatus('');
    setError(null);
    setAssessmentId(null);
  }, []);

  const startPolling = useCallback((id: string) => {
    setAssessmentId(id);
    setStatus('');
    setError(null);
    setIsPolling(true);
  }, []);

  const cancelJob = useCallback(async () => {
    if (!assessmentId) {
      return;
    }

    try {
      stopPolling();
      await discoverySourcesContext.cancelAssessmentJob(assessmentId);

      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to cancel the assessment job';
      setError(errorMessage);
      throw err;
    }
  }, [assessmentId, discoverySourcesContext, onCancel, stopPolling]);

  const checkSnapshotStatus = useCallback(async () => {
    if (!assessmentId || !discoverySourcesContext.getAssessment) {
      return;
    }

    try {
      const assessment =
        await discoverySourcesContext.getAssessment(assessmentId);

      // Get the latest snapshot
      const latestSnapshot =
        assessment.snapshots[assessment.snapshots.length - 1];
      const currentStatus = latestSnapshot.status;

      // Update status
      setStatus(currentStatus);

      // Handle terminal states
      if (isTerminalStatus(currentStatus)) {
        stopPolling();

        if (currentStatus === 'ready') {
          // Navigate to report on success
          const reportPath = `/openshift/migration-assessment/assessments/${assessmentId}/report`;
          navigate(reportPath);
        } else if (currentStatus === 'failed') {
          // Set error message on failure
          const errorMsg =
            latestSnapshot.error || 'Assessment processing failed';
          setError(errorMsg);
        }
      }
    } catch (err) {
      console.error('Error checking snapshot status:', err);
      stopPolling();

      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to check assessment status';
      setError(errorMessage);
    }
  }, [assessmentId, discoverySourcesContext, navigate, stopPolling]);

  // Update ref when callback changes
  checkSnapshotStatusRef.current = checkSnapshotStatus;

  useEffect(() => {
    if (!isPolling || !assessmentId) {
      return;
    }

    // Check status immediately
    checkSnapshotStatusRef.current?.();

    // Then poll at intervals
    pollingIntervalRef.current = setInterval(() => {
      checkSnapshotStatusRef.current?.();
    }, POLLING_INTERVAL_MS);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isPolling, assessmentId]);

  return {
    status,
    error,
    isPolling,
    startPolling,
    stopPolling,
    cancelJob,
    reset,
  };
}
