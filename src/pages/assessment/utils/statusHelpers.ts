import React from 'react';

export type SnapshotStatus =
  | 'pending'
  | 'parsing'
  | 'validating'
  | 'ready'
  | 'failed'
  | '';

export const getStatusDisplayText = (status: SnapshotStatus): string => {
  switch (status) {
    case 'pending':
      return 'Uploading file...';
    case 'parsing':
      return 'Parsing data...';
    case 'validating':
      return 'Validating vms...';
    case 'ready':
      return 'Assessment ready';
    case 'failed':
      return 'Processing failed';
    default:
      return '';
  }
};

export const isLoadingStatus = (status: SnapshotStatus): boolean => {
  return ['pending', 'parsing', 'validating'].includes(status);
};

export const isTerminalStatus = (status: SnapshotStatus): boolean => {
  return status === 'ready' || status === 'failed';
};

export const getStatusStyle = (status: SnapshotStatus): React.CSSProperties => {
  if (!status) {
    return {
      color: '#6A6E73', // PatternFly gray
    };
  }

  if (isLoadingStatus(status)) {
    return {
      color: '#3E8635', // PatternFly green (success color)
    };
  }

  switch (status) {
    case 'ready':
      return {
        color: '#3E8635', // PatternFly green (success color)
      };
    case 'failed':
      return {
        color: '#C9190B', // PatternFly red (danger color)
      };
    default:
      return {
        color: '#6A6E73', // PatternFly gray
      };
  }
};
