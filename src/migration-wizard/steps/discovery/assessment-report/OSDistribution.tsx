import React from 'react';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';

import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartGroup,
  ChartLabel,
  ChartLegend,
  ChartThemeColor,
  ChartTooltip,
} from '@patternfly/react-charts';

interface OSDistributionProps {
  osData: {
    [osName: string]: number;
  };
  isExportMode?: boolean;
}

export const OSDistribution: React.FC<OSDistributionProps> = ({ osData, isExportMode=false }) => {
  return (
    <Card className={isExportMode ? "dashboard-card-print":"dashboard-card"}>
      <CardTitle>Operating Systems</CardTitle>
      <CardBody>
        <OSBarChart osData={osData} isExportMode={isExportMode}/>
      </CardBody>
    </Card>
  );
};

interface OSBarChartProps {
  osData: { [osName: string]: number };
  isExportMode?: boolean;
}

export const OSBarChart: React.FC<OSBarChartProps> = ({ osData,isExportMode }) => {
  const dataEntries = Object.entries(osData).filter(([os]) => os.trim() !== '');

  const sorted = dataEntries.sort(([, a], [, b]) => a - b);

  const chartData = sorted.map(([os, count]) => ({
    x: os,
    y: count,
    label: `${count} VMs`,
  }));

  const chartHeight = sorted.length * 35 + 100;
  const chartWidth = 800; // puedes ajustar este valor según necesidad
  const tableHeight = isExportMode ? '100%': '250px';
  return (
    <div style={{ maxHeight:tableHeight, maxWidth: '100%', overflow: 'auto' }}>
      <div style={{ height: `${chartHeight}px`, width: `${chartWidth}px` }}>
        <Chart
          ariaTitle="OS Distribution"
          ariaDesc="Number of VMs per Operating System"
          themeColor={ChartThemeColor.multi}
          horizontal
          height={chartHeight}
          width={chartWidth}
          padding={{ top: 20, bottom: 60, left: 250, right: 50 }}
          domainPadding={{ x: [10, 10], y: 10 }}
        >
          <ChartAxis
            dependentAxis
            style={{
              axis: { stroke: 'none' },
              ticks: { stroke: 'none' },
              tickLabels: { fill: 'none' },
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
                data: { fill: '#28a745' },
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

        <ChartLegend
          orientation="horizontal"
          data={[{ name: 'Supported', symbol: { fill: '#28a745' } }]}
          style={{
            labels: { fontSize: 14 },
          }}
        />
      </div>
    </div>
  );
};
