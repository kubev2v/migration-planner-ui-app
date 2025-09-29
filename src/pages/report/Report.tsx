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
  Icon,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { global_success_color_100 as globalSuccessColor100 } from '@patternfly/react-tokens/dist/js/global_success_color_100';

import { AppPage } from '../../components/AppPage';
import { useDiscoverySources } from '../../migration-wizard/contexts/discovery-sources/Context';
import { Provider as DiscoverySourcesProvider } from '../../migration-wizard/contexts/discovery-sources/Provider';
import EnhancedDownloadButton from '../../migration-wizard/steps/discovery/EnhancedDownloadButton';
import { parseLatestSnapshot } from '../assessment/utils/snapshotParser';

import { Dashboard } from './assessment-report/Dashboard';

const openAssistedInstaller = (): void => {
  const currentHost = window.location.hostname;

  if (currentHost === 'console.stage.redhat.com') {
    window.open(
      'https://console.dev.redhat.com/openshift/assisted-installer/clusters/~new?source=assisted_migration',
      '_blank',
    );
  } else {
    window.open(
      '/openshift/assisted-installer/clusters/~new?source=assisted_migration',
      '_blank',
    );
  }
};

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

  // Derive last updated text from latest snapshot
  const lastUpdatedText: string = (() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = parseLatestSnapshot((assessment as any).snapshots);
      return result.lastUpdated || '-';
    } catch {
      return '-';
    }
  })();

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
          children: assessment.name || `Assessment ${id} report`,
          isActive: true,
        },
      ]}
      title={assessment.name || `Assessment ${id} report`}
      caption={
        <>
          Discovery VM status :{' '}
          <Icon size="md" isInline>
            <CheckCircleIcon color={globalSuccessColor100.value} />
          </Icon>{' '}
          Connected
          <br />
          Presenting the information we were able to fetch from the discovery
          process
          <br />
          {lastUpdatedText !== '-'
            ? `Last updated: ${lastUpdatedText}`
            : '[Last updated time stamp]'}
        </>
      }
      headerActions={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {infra && vms && cpuCores && ramGB ? (
            <>
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
              <Button variant="primary" onClick={openAssistedInstaller}>
                Create a target cluster
              </Button>
            </>
          ) : null}
        </div>
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
