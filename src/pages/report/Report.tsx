import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMount } from 'react-use';

import {
  Infra,
  Source,
  VMResourceBreakdown,
  VMs,
} from '@migration-planner-ui/api-client/models';
import {
  Bullseye,
  Button,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextContent,
} from '@patternfly/react-core';

import { AppPage } from '../../components/AppPage';
import { useDiscoverySources } from '../../migration-wizard/contexts/discovery-sources/Context';
import { Provider as DiscoverySourcesProvider } from '../../migration-wizard/contexts/discovery-sources/Provider';
import EnhancedDownloadButton from '../../migration-wizard/steps/discovery/EnhancedDownloadButton';

import { Dashboard } from './assessment-report/Dashboard';

export type SnapshotLike = {
  infra?: Infra;
  vms?: VMs;
  inventory?: { infra?: Infra; vms?: VMs };
};

type AssessmentLike = {
  id: string | number;
  name?: string;
  snapshots?: SnapshotLike[];
};

const Inner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const discoverySourcesContext = useDiscoverySources();

  useMount(async () => {
    if (
      !discoverySourcesContext.assessments ||
      discoverySourcesContext.assessments.length === 0
    ) {
      await discoverySourcesContext.listAssessments();
    }
  });

  const assessment = discoverySourcesContext.assessments.find(
    (a) => String((a as AssessmentLike).id) === String(id),
  ) as AssessmentLike | undefined;

  if (discoverySourcesContext.isLoadingAssessments && !assessment) {
    return (
      <Bullseye>
        <Spinner size="lg" />
      </Bullseye>
    );
  }

  if (!assessment) {
    return (
      <AppPage
        breadcrumbs={[
          {
            key: 1,
            to: '/openshift/migration-assessment',
            children: 'Migration assessment',
          },
          { key: 2, to: '#', children: 'Assessment not found', isActive: true },
        ]}
        title="Assessment details"
      >
        <Stack hasGutter>
          <StackItem>
            <TextContent>
              <Text component="p">The requested assessment was not found.</Text>
            </TextContent>
          </StackItem>
          <StackItem>
            <Link to="/openshift/migration-assessment">
              <Button variant="primary">Back to assessments</Button>
            </Link>
          </StackItem>
        </Stack>
      </AppPage>
    );
  }

  const snapshots = assessment.snapshots || [];
  const last =
    snapshots.length > 0
      ? (snapshots[snapshots.length - 1] as SnapshotLike)
      : ({} as SnapshotLike);
  const infra = last.infra || last.inventory?.infra;
  const vms = last.vms || last.inventory?.vms;
  const cpuCores = (vms as VMs | undefined)?.cpuCores as
    | VMResourceBreakdown
    | undefined;
  const ramGB = (vms as VMs | undefined)?.ramGB as
    | VMResourceBreakdown
    | undefined;

  return (
    <AppPage
      breadcrumbs={[
        {
          key: 1,
          to: '/openshift/migration-assessment',
          children: 'Migration assessment',
        },
        {
          key: 2,
          to: '#',
          children: assessment.name || `Assessment ${id}`,
          isActive: true,
        },
      ]}
      title={assessment.name || `Assessment ${id}`}
      headerActions={
        infra && vms && cpuCores && ramGB ? (
          <EnhancedDownloadButton
            elementId="discovery-report"
            componentToRender={
              <Dashboard
                infra={infra}
                cpuCores={cpuCores}
                ramGB={ramGB}
                vms={vms}
                isExportMode={true}
              />
            }
            sourceData={discoverySourcesContext.sourceSelected as Source}
            snapshot={last}
          />
        ) : null
      }
    >
      {infra && vms && cpuCores && ramGB ? (
        <Dashboard infra={infra} cpuCores={cpuCores} ramGB={ramGB} vms={vms} />
      ) : (
        <Bullseye>
          <TextContent>
            <Text component="p">
              This assessment does not have report data yet.
            </Text>
          </TextContent>
        </Bullseye>
      )}
    </AppPage>
  );
};

const Report: React.FC = () => (
  <DiscoverySourcesProvider>
    <Inner />
  </DiscoverySourcesProvider>
);

Report.displayName = 'Report';

export default Report;
