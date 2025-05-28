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
}

export const OSDistribution: React.FC<OSDistributionProps> = ({ osData }) => {
  console.log(osData);
  return (
    <Card>
      <CardTitle>Operating Systems</CardTitle>
      <CardBody>
        <OSBarChart osData={osData} />
      </CardBody>
    </Card>
  );
};

interface OSBarChartProps {
  osData: { [osName: string]: number };
}

export const OSBarChart: React.FC<OSBarChartProps> = ({ osData }) => {
  const dataEntries = Object.entries(osData).filter(([os]) => os.trim() !== '');

  const sorted = dataEntries.sort(([, a], [, b]) => a - b);

  const chartData = sorted.map(([os, count]) => ({
    x: os,
    y: count,
    label: `${count} VMs`,
  }));

  const chartHeight = sorted.length * 35 + 100;

  return (
    <div style={{ height: `${chartHeight}px` }}>
      <Chart
        ariaTitle="OS Distribution"
        ariaDesc="Number of VMs per Operating System"
        themeColor={ChartThemeColor.multi}
        horizontal
        height={chartHeight}
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
              data: { fill: '#28a745' }, // verde para todos
            }}
            labels={({ datum }) => datum.label}
            labelComponent={
              <ChartLabel
                textAnchor="start"
                dx={10} // distancia horizontal desde la barra
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
  );
};
