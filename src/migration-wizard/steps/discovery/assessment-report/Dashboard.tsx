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

interface Props {
  infra: Infra;
  cpuCores: VMResourceBreakdown;
  ramGB: VMResourceBreakdown;
  vms: VMs;
}

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
            <VMMigrationStatus
              data={{
                migratable: vms.totalMigratableWithWarnings,
                nonMigratable: vms.total - vms.totalMigratableWithWarnings,
              }}
            />
          </GridItem>
          <GridItem span={6}>
            <NetworkTopology />
          </GridItem>
        </Grid>
      </GridItem>
      <GridItem span={12}>
      <Grid hasGutter>
          <GridItem span={6}>
           <StorageOverview/>
          </GridItem>
          <GridItem span={6}>
            <OSDistribution />
          </GridItem>
        </Grid>
      </GridItem>
    </Grid>
  </PageSection>
);
