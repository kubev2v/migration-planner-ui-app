import React from 'react';
import Humanize from "humanize-plus";
import { Card, CardTitle, CardBody, Gallery, GalleryItem} from '@patternfly/react-core';
import { Infra, VMResourceBreakdown } from '@migration-planner-ui/api-client/models';

interface Props {
  infra: Infra;
  cpuCores: VMResourceBreakdown;
  ramGB: VMResourceBreakdown;
}

export const InfrastructureOverview: React.FC<Props> = ({ infra, cpuCores, ramGB}) => (
  <Gallery hasGutter >
    <GalleryItem>
      <Card>
        <CardTitle>Clusters</CardTitle>
        <CardBody>{infra.totalClusters}</CardBody>
      </Card>
      </GalleryItem>
      <GalleryItem>
      <Card>
        <CardTitle>Hosts</CardTitle>
        <CardBody>{infra.totalHosts}</CardBody>
      </Card>
      </GalleryItem>
      <GalleryItem>
      <Card>
        <CardTitle>Total CPU Cores</CardTitle>
        <CardBody>{cpuCores.total}</CardBody>
      </Card>
      </GalleryItem>
      <GalleryItem>
      <Card>
        <CardTitle>Total Memory</CardTitle>
        <CardBody>{Humanize.fileSize(ramGB.total * 1024 ** 3, 0)}</CardBody>
      </Card>     
      </GalleryItem> 
  </Gallery>
);
