import React from 'react';

import { Card, CardBody, CardTitle } from '@patternfly/react-core';

import MigrationChart from '../../../components/MigrationChart';

interface OSDistributionProps {
  osData: {
    [osName: string]: {
      count: number;
      supported: boolean;
    };
  };
  isExportMode?: boolean;
}

export const OSDistribution: React.FC<OSDistributionProps> = ({
  osData,
  isExportMode = false,
}) => {
  return (
    <Card className={isExportMode ? 'dashboard-card-print' : 'dashboard-card'}>
      <CardTitle>
        <i className="fas fa-database" /> Operating Systems
      </CardTitle>
      <CardBody>
        <OSBarChart osData={osData} isExportMode={isExportMode} />
      </CardBody>
    </Card>
  );
};

interface OSBarChartProps {
  osData: { [osName: string]: { count: number; supported: boolean } };
  isExportMode?: boolean;
}

export const OSBarChart: React.FC<OSBarChartProps> = ({
  osData,
  isExportMode,
}) => {
  const dataEntries = Object.entries(osData).filter(([os]) => os.trim() !== '');

  const sorted = dataEntries.sort(([, a], [, b]) => b.count - a.count);

  const chartData = sorted.map(([os, osInfo]) => ({
    name: os,
    count: osInfo.count,
    legendCategory: osInfo.supported ? 'Supported' : 'Not Supported',
  }));

  // Define custom colors: green for supported, red for not supported
  const customLegend = {
    Supported: '#28a745', // Green
    'Not Supported': '#d9534f', // Red
  };

  const tableHeight = isExportMode ? '100%' : '200px';
  return (
    <MigrationChart
      data={chartData}
      legend={customLegend}
      maxHeight={tableHeight}
    />
  );
};
