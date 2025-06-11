import React from 'react';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartGroup,
  ChartLabel,
  ChartThemeColor,
} from '@patternfly/react-charts';

interface OSDistributionProps {
  osData: {
    [osName: string]: number;
  };
  isExportMode?: boolean;
}

export const OSDistribution: React.FC<OSDistributionProps> = ({ osData, isExportMode = false }) => {
  const tableHeight = isExportMode ? '100%' : '200px';

  return (
    <Card className={isExportMode ? "dashboard-card-print" : "dashboard-card"}>
      <CardTitle>Operating Systems</CardTitle>
      <CardBody>
        <div style={{ display: 'flex', gap: '1.5rem', float: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                width: 12,
                height: 12,
                backgroundColor: '#28a745',
                display: 'inline-block',
                marginRight: 6,
              }}
            />
            {'Supported'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                width: 12,
                height: 12,
                backgroundColor: '#d9534f',
                display: 'inline-block',
                marginRight: 6,
              }}
            />
            {'Unsupported'}
          </div>
        </div>
        <br/>
        <div
          style={{
            maxHeight: tableHeight,
            minWidth: '300px',
            overflowY: 'auto',
            overflowX: 'auto'
          }}
        >
          <OSBarChart osData={osData} isExportMode={isExportMode} />
        </div>
      </CardBody>
    </Card>
  );
};

interface OSBarChartProps {
  osData: { [osName: string]: number };
  isExportMode?: boolean;
}

export const OSBarChart: React.FC<OSBarChartProps> = ({ osData, isExportMode }) => {
  const dataEntries = Object.entries(osData).filter(([os]) => os.trim() !== '');

  const sorted = dataEntries.sort(([, a], [, b]) => a - b); 

  const chartHeight = sorted.length * 35 + 100;
  const chartWidth = 500;

  const chartData = sorted.map(([os, count]) => ({
    x: os,
    y: count,
    label: `${count} VMs`,
    fill: os.toLowerCase().includes('unsupported') ? '#d9534f' : '#28a745', 
  }));

  return (
    <Chart
      ariaTitle="OS Distribution"
      ariaDesc="Number of VMs per Operating System"
      themeColor={ChartThemeColor.multi}
      horizontal
      height={chartHeight}
      width={chartWidth}
      padding={{ top: 20, bottom: 60, left: 300, right: 50 }}
      domainPadding={{ x: [10, 10], y: 10 }}
    >
      <ChartAxis
        dependentAxis
        style={{
          axis: { stroke: 'none' },
          ticks: { stroke: 'none' },
          tickLabels: {
            fill: 'none'
          },
        }}
      />
      <ChartAxis
        showGrid={false}
        style={{
          axis: { stroke: 'none' },
          ticks: { stroke: 'none' },
          grid: { stroke: 'none' },
        }}
      />
      <ChartGroup horizontal>
        <ChartBar
          data={chartData}
          style={{
            data: {
              fill: ({ datum }) => datum.fill, // usa el color definido por cada dato
            },
          }}
          labels={({ datum }) => datum.label}
          labelComponent={
            <ChartLabel
              textAnchor="start"
              dx={10}
              style={{ fill: '#000', fontSize: 14 }}
            />
          }
        />
      </ChartGroup>
    </Chart>
  );
};
