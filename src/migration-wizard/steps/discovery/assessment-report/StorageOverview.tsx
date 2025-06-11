import React from 'react';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartGroup,
  ChartLabel,
  ChartThemeColor,
  ChartTooltip,
} from '@patternfly/react-charts';

interface DiskHistogramProps {
  data: number[];
  minValue: number;
  step: number;
  isExportMode?: boolean;
}

export const StorageOverview: React.FC<DiskHistogramProps> = ({
  data,
  minValue,
  step,
  isExportMode=false
}) => {
  const tableHeight = isExportMode ? '100%': '210px';
  return (
    <Card className={isExportMode ? "dashboard-card-print":"dashboard-card"}>
      <CardTitle>
        <i className="fas fa-database" /> Disks
      </CardTitle>
      <CardBody>
          <div>Disk Size Distribution
          <div style={{ display: 'flex', gap: '1.5rem', float:'right' }}>
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
              {'Small'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: '#f0ad4e',
                  display: 'inline-block',
                  marginRight: 6,
                }}
              />
              {'Medium'}
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
              {'Large'}
            </div>
          </div>
          </div>

         
        <div
          style={{ maxHeight: tableHeight, minWidth: '60%', overflowY: 'auto', overflowX:'auto' }}
        >
        <DiskUsageHistogram data={data} minValue={minValue} step={step} />
        </div>
      </CardBody>
    </Card>
  );
};

export const DiskUsageHistogram: React.FC<DiskHistogramProps> = ({
  data,
  minValue,
  step,
}) => {
  const chartData = data
    .map((count, index) => {
      const rangeStart = minValue + step * index;
      const rangeEnd = rangeStart + step;
      return {
        x: `${rangeStart}–${rangeEnd} GB`,
        y: count,
        label: `${count} Disks`,
        rangeStart,
      };
    })
    .filter((entry) => entry.y > 0)
    .sort((a, b) => b.rangeStart - a.rangeStart)
    .map(({ rangeStart, ...rest }) => rest);

  const chartHeight = chartData.length * 35 + 100;

  return (
  
      <Chart
        horizontal
        themeColor={ChartThemeColor.multi}
        ariaTitle="Disk Size distribution"
        ariaDesc="Distribution of VMs by disk size"
        padding={{ top: 20, bottom: 60, left: 120, right: 50 }}
        domainPadding={{ x: [20, 20], y: 20 }}
        title="Disk Size distribution"
        height={chartHeight}
      >
        <ChartAxis
          dependentAxis
          style={{
            axis: { stroke: 'none' },
            ticks: { stroke: 'none' },
            tickLabels: { fill: 'none', fontSize: 10 },
          }}
        />
        <ChartAxis
          showGrid={false}
          style={{
            axis: { stroke: 'none' },
            ticks: { stroke: 'none' },
            grid: { stroke: 'none' },
            tickLabels: { fontSize: 12 },
          }}
        />
        <ChartGroup horizontal>
          <ChartBar
            data={chartData}
            labels={({ datum }) => datum.label}
            labelComponent={
              <ChartLabel
                textAnchor="start"
                dx={10} // distancia horizontal desde la barra
                style={{ fill: '#000', fontSize: 10 }}
              />
            }
            style={{
              data: {
                fill: ({ datum }) => {
                  const startRange = parseInt(datum.x.split('–')[0], 10);

                  if (startRange < 500) return '#28a745';
                  if (startRange <= 1000) return '#f0ad4e';
                  return '#d9534f';
                },
              },
              labels:{fontSize: 10}
            }}
          />
        </ChartGroup>
      </Chart>
  );
};
