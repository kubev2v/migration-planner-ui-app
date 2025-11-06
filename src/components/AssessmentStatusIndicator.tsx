import React from 'react';

import { Spinner } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';

import {
  getStatusDisplayText,
  getStatusStyle,
  isLoadingStatus,
  type SnapshotStatus,
} from '../pages/assessment/utils/statusHelpers';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AssessmentStatusIndicator {
  export type Props = {
    status: SnapshotStatus;
    error?: string;
    showIcon?: boolean;
  };
}

export const AssessmentStatusIndicator: React.FC<
  AssessmentStatusIndicator.Props
> = (props) => {
  const { status, error, showIcon = true } = props;

  if (!status) {
    return null;
  }

  const style = getStatusStyle(status);
  const displayText = error || getStatusDisplayText(status);
  const isLoading = isLoadingStatus(status);

  const renderIcon = (): React.ReactNode => {
    if (!showIcon) {
      return null;
    }

    if (isLoading) {
      return (
        <Spinner
          size="md"
          style={{ marginRight: '8px', verticalAlign: 'middle' }}
        />
      );
    }

    if (status === 'ready') {
      return (
        <CheckCircleIcon
          style={{ ...style, marginRight: '8px', verticalAlign: 'middle' }}
        />
      );
    }

    if (status === 'failed') {
      return (
        <ExclamationCircleIcon
          style={{ ...style, marginRight: '8px', verticalAlign: 'middle' }}
        />
      );
    }

    return null;
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        ...style,
      }}
    >
      {renderIcon()}
      <span>{displayText}</span>
    </span>
  );
};

AssessmentStatusIndicator.displayName = 'AssessmentStatusIndicator';
