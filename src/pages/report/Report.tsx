import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMount } from 'react-use';

import {
  Infra,
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

import { Dashboard } from './assessment-report/Dashboard';

type SnapshotLike = {
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
            to: '/openshift/migrate',
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
            <Link to="/">
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
        { key: 1, to: '/', children: 'Migration assessment' },
        {
          key: 2,
          to: '#',
          children: assessment.name || `Assessment ${id}`,
          isActive: true,
        },
      ]}
      title={assessment.name || `Assessment ${id}`}
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
