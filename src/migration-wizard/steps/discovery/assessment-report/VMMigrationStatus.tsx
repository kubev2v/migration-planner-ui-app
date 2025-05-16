import React from 'react';
import {
  ChartDonut,
  ChartLegend,
} from '@patternfly/react-charts';
import {
  Card,
  CardBody,
  CardTitle,
} from '@patternfly/react-core';

interface VmMigrationStatusProps {
  data: {
    migratable: number;
    nonMigratable: number;
  };
}

export const VMMigrationStatus: React.FC<VmMigrationStatusProps> = ({
  data,
}) => {
  const chartData = [
    { x: 'Migratable', y: data.migratable },
    { x: 'Non-Migratable', y: data.nonMigratable },
  ];

  return (
    <Card>
      <CardTitle>VM Migration Status</CardTitle>
      <CardBody>
      <div style={{ height: '60%', width: '60%', marginLeft: '20%' }}>
        <ChartDonut
          ariaDesc="VM Migration Status"
          ariaTitle="VM Migration"
          data={chartData}
          labels={({ datum }) => `${datum.x}: ${datum.y}`}
          colorScale={['#28a745', '#dc3545']} // Verde y rojo personalizados
          innerRadius={80}
          constrainToVisibleArea
        />
        <ChartLegend
          data={[
            { name: 'Migratable', symbol: { fill: '#28a745' } },
            { name: 'Non-Migratable', symbol: { fill: '#dc3545' } },
          ]}
          orientation="horizontal"
          style={{
            labels: { fontSize: 24 },
            parent: { marginBottom: '-150px'}
          }}
        />
        </div>
      </CardBody>
    </Card>
  );
};
