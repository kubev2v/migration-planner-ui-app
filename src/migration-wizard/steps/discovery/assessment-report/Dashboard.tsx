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

import './Dashboard.css';

interface Props {
  infra: Infra;
  cpuCores: VMResourceBreakdown;
  ramGB: VMResourceBreakdown;
  vms: VMs;
  isExportMode?: boolean;
}

export const Dashboard: React.FC<Props> = ({
  infra,
  cpuCores,
  ramGB,
  vms,
  isExportMode,
}) => {
  return (
    <PageSection variant={PageSectionVariants.light}>
      <Grid hasGutter>
        <GridItem span={12} id="infrastructure-overview">
          <InfrastructureOverview
            infra={infra}
            cpuCores={cpuCores}
            ramGB={ramGB}
          />
        </GridItem>
        <GridItem span={12}>
          <Gallery hasGutter minWidths={{ default: '40%' }}>
            <GalleryItem>
              <VMMigrationStatus
                data={{
                  migratable: vms.totalMigratableWithWarnings,
                  nonMigratable: vms.total - vms.totalMigratableWithWarnings,
                }}
                isExportMode={isExportMode}
              />
            </GalleryItem>
            <GalleryItem>
              <OSDistribution osData={vms.os}  isExportMode={isExportMode}/>
            </GalleryItem>
          </Gallery>
        </GridItem>
        <GridItem span={12}>
          <Gallery hasGutter minWidths={{ default: '40%' }}>
            <GalleryItem>
              <StorageOverview
                data={vms.diskGB.histogram.data}
                minValue={vms.diskGB.histogram.minValue}
                step={vms.diskGB.histogram.step}
                isExportMode={isExportMode}
              />
            </GalleryItem>
            <GalleryItem>
            <NetworkTopology networks={infra.networks}  isExportMode={isExportMode}/>
                
            </GalleryItem>
          </Gallery>
        </GridItem>
        <GridItem span={12}>
          <Gallery hasGutter minWidths={{ default: '80%' }}>
            <GalleryItem>
            <Datastores
                  datastores={infra.datastores}
                  isExportMode={isExportMode}
                />
            </GalleryItem>
          </Gallery>
        </GridItem>
      </Grid>
    </PageSection>
  );
};
