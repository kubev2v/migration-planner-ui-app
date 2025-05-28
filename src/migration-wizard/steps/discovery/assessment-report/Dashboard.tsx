import React from 'react';
import {
  PageSection,
  PageSectionVariants,
  Grid,
  GridItem,
  Gallery,
  GalleryItem,
} from '@patternfly/react-core';
import { InfrastructureOverview } from './InfastructureOverview';
import {
  Infra,
  VMResourceBreakdown,
  VMs,
} from '@migration-planner-ui/api-client/models';
import { VMMigrationStatus } from './VMMigrationStatus';
import { NetworkTopology } from './NetworkTopology';
import { StorageOverview } from './StorageOverview';
import { OSDistribution } from './OSDistribution';
import { Datastores } from './Datastores';

interface Props {
  infra: Infra;
  cpuCores: VMResourceBreakdown;
  ramGB: VMResourceBreakdown;
  vms: VMs;
}

const cardContainerStyle: React.CSSProperties = {
  height: '400px',       // Altura fija (ajústala según lo necesario)
  overflow: 'auto',      // Scroll si hay overflow
};

export const Dashboard: React.FC<Props> = ({ infra, cpuCores, ramGB, vms }) => (
  <PageSection variant={PageSectionVariants.light}>
    <Grid hasGutter>
      <GridItem span={12}>
        <InfrastructureOverview
          infra={infra}
          cpuCores={cpuCores}
          ramGB={ramGB}
        />
      </GridItem>
      <GridItem span={12}>
        <Grid hasGutter>
          <GridItem span={6}>
          <div style={cardContainerStyle}>
            <VMMigrationStatus
              data={{
                migratable: vms.totalMigratableWithWarnings,
                nonMigratable: vms.total - vms.totalMigratableWithWarnings,
              }}
            />
            </div>
          </GridItem>
          <GridItem span={6}>
          <div style={cardContainerStyle}>
            <OSDistribution osData={vms.os} />
            </div>
          </GridItem>
        </Grid>
      </GridItem>
      <GridItem span={12}>
        <Grid hasGutter>
          <GridItem span={6}>
          <div style={cardContainerStyle}>
            <StorageOverview data={vms.diskGB.histogram.data} minValue={vms.diskGB.histogram.minValue} step={vms.diskGB.histogram.step}/>
            </div>
          </GridItem>
          <GridItem span={6}>
          <div style={cardContainerStyle}>
            <Datastores datastores={infra.datastores}/>
            </div>
          </GridItem>
        </Grid>
      </GridItem>
    </Grid>
      {/* <Grid hasGutter>
      <GridItem span={6}>
        <NetworkTopology />
      </GridItem>
    </Grid> */}
  </PageSection>
);
