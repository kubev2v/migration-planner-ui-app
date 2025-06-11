import React from 'react';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import MigrationChart from '../../../../components/MigrationChart';

interface OSDistributionProps {
  osData: {
    [osName: string]: number;
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
  osData: { [osName: string]: number };
  isExportMode?: boolean;
}

export const OSBarChart: React.FC<OSBarChartProps> = ({
  osData,
  isExportMode,
}) => {
  const dataEntries = Object.entries(osData).filter(([os]) => os.trim() !== '');

  const sorted = dataEntries.sort(([, a], [, b]) => b - a);

  const chartData = sorted.map(([os, count]) => ({
    name: os,
    count: count,
    legendCategory: `Supported`, // You may want to add logic to determine if an OS is supported
  }));

  return <MigrationChart data={chartData} />;
};
