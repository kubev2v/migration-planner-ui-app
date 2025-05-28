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
import VirtualMachineIcon from '@patternfly/react-icons/dist/esm/icons/virtual-machine-icon';

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
      <CardTitle><VirtualMachineIcon/> VM Migration Status</CardTitle>
      <CardBody>
      <div style={{ height: '50%', width: '50%', marginLeft: '20%' }}>
        <ChartDonut
          ariaDesc="VM Migration Status"
          ariaTitle="VM Migration"
          data={chartData}
          labels={({ datum }) => `${datum.x}: ${datum.y}`}
          colorScale={['#28a745', '#dc3545']} // Verde y rojo personalizados
          innerRadius={100}
          constrainToVisibleArea
          title={`${data.migratable + data.nonMigratable}`}
          subTitle="VMs"
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
