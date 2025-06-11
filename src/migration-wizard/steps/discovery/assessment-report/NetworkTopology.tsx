import React from 'react';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { InfraNetworksInner } from '@migration-planner-ui/api-client/models';
import { ReportTable } from '../ReportTable';
import NetworkIcon from '@patternfly/react-icons/dist/esm/icons/network-icon';

interface NetworkTopologyProps {
  networks: InfraNetworksInner[];
  isExportMode?: boolean;
}

export const NetworkTopology: React.FC<NetworkTopologyProps> = ({
  networks,
  isExportMode=false
}) => {
  const tableHeight = isExportMode ? '100%': '250px';
  return (
    <Card className={isExportMode ? "dashboard-card-print":"dashboard-card"}>
      <CardTitle>
        <NetworkIcon /> Network Topology
      </CardTitle>
      <CardBody>
      <div style={{ maxHeight: tableHeight, overflowY: 'auto', overflowX:'auto',padding: 16 }}>
          <ReportTable<InfraNetworksInner>
            data={networks}
            columns={['Name', 'Type', 'VlanId']}
            fields={['name', 'type', 'vlanId']}
            withoutBorder          
            />
        </div>
      </CardBody>
    </Card>
  );
};
