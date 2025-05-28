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
}

export const StorageOverview: React.FC<DiskHistogramProps> = ({
  data,
  minValue,
  step,
}) => {
  return (
    <Card>
      <CardTitle><i className="fas fa-database" />  Disks</CardTitle>
      <CardBody>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap', // por si no cabe en pantallas pequeñas
          }}
        >
          <div >
            Disk Size Distribution
          </div>

          {/* Leyenda */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
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
              {'Easy'}
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
              {'Hard'}
            </div>
          </div>
        </div>
        <DiskUsageHistogram data={data} minValue={minValue} step={step} />
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
    <div style={{ height: `${chartHeight}px` }}>
      <Chart
        horizontal
        themeColor={ChartThemeColor.multi}
        height={chartHeight}
        ariaTitle="Disk Size distribution"
        ariaDesc="Distribution of VMs by disk size"
        padding={{ top: 20, bottom: 60, left: 120, right: 50 }}
        domainPadding={{ x: [10, 10], y: 10 }}
        title="Disk Size distribution"
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
            labels={({ datum }) => datum.label}
            labelComponent={
              <ChartLabel
                textAnchor="start"
                dx={10} // distancia horizontal desde la barra
                style={{ fill: '#000', fontSize: 14 }}
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
            }}
          />
        </ChartGroup>
      </Chart>
    </div>
  );
};
