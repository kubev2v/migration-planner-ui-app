import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMount, useUnmount } from 'react-use';

import { Assessment } from '@migration-planner-ui/api-client/models';
import {
  Bullseye,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FlexItem,
  Icon,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextContent,
  Tooltip,
  Title,
} from '@patternfly/react-core';
import {
  ClusterIcon,
  MigrationIcon,
  QuestionCircleIcon,
} from '@patternfly/react-icons';
import { global_active_color_300 as globalActiveColor300 } from '@patternfly/react-tokens/dist/js/global_active_color_300';

import { AppPage } from '../components/AppPage';
import { CustomEnterpriseIcon } from '../components/CustomEnterpriseIcon';
import { useDiscoverySources } from '../migration-wizard/contexts/discovery-sources/Context';
import { DEFAULT_POLLING_DELAY } from '../migration-wizard/steps/connect/sources-table/Constants';

import AssessmentPage from './assessment/Assessment';

const cards: React.ReactElement[] = [
  <Card isFullHeight isPlain key="card-1">
    <CardHeader>
      <TextContent style={{ textAlign: 'center' }}>
        <Icon size="xl" style={{ color: globalActiveColor300.var }}>
          <CustomEnterpriseIcon />
        </Icon>
        <Text component="h2">Discover your VMware environment</Text>
      </TextContent>
    </CardHeader>
    <CardBody>
      <TextContent style={{ textAlign: 'center' }}>
        <Text>
          Run the discovery process and create a full evaluation report
          including recommendations for your migration journey.
          <a href="/apps/assisted-migration-app/example_report.pdf" download>
            <Button size="sm" variant="link">
              See an example report.
            </Button>
          </a>
          <Tooltip
            content="As part of the discovery process,
            we're collecting aggregated data about your VMware environment.
            This includes information such as the number of clusters, hosts, and VMs;
            VM counts per operating system type; total CPU cores and memory;
            network types and VLANs; and a list of datastores."
            position="top-start"
          >
            <Icon style={{ color: globalActiveColor300.var }}>
              <QuestionCircleIcon />
            </Icon>
          </Tooltip>
        </Text>
      </TextContent>
    </CardBody>
  </Card>,

  <Card isFullHeight isPlain key="card-2">
    <CardHeader>
      <TextContent style={{ textAlign: 'center' }}>
        <Icon size="xl" style={{ color: globalActiveColor300.var }}>
          <ClusterIcon />
        </Icon>
        <Text component="h2">Select a target cluster</Text>
      </TextContent>
    </CardHeader>
    <CardBody>
      <TextContent style={{ textAlign: 'center' }}>
        <Text>
          Select your target OpenShift Cluster to fit your migration goals.
        </Text>
      </TextContent>
    </CardBody>
  </Card>,

  <Card isFullHeight isPlain key="card-3">
    <CardHeader>
      <TextContent style={{ textAlign: 'center' }}>
        <Icon size="xl" style={{ color: globalActiveColor300.var }}>
          <MigrationIcon />
        </Icon>
        <Text component="h2">Create a migration plan</Text>
      </TextContent>
    </CardHeader>
    <CardBody>
      <TextContent style={{ textAlign: 'center' }}>
        <Text>
          Select your VMs, create a network and storage mapping and schedule
          your migration timeline
        </Text>
      </TextContent>
    </CardBody>
  </Card>,
];

const WelcomePage: React.FC = () => (
  <Bullseye>
    <Stack hasGutter style={{ justifyContent: 'space-evenly' }}>
      <StackItem>
        <Flex>
          {cards.map((card) => (
            <FlexItem flex={{ default: 'flex_1' }} key={card.key}>
              {card}
            </FlexItem>
          ))}
        </Flex>
      </StackItem>
      <StackItem style={{ alignSelf: 'center' }}>
        <Link to="migrate/wizard">
          <Button>Start your migration journey</Button>
        </Link>
      </StackItem>
    </Stack>
  </Bullseye>
);

export const MigrationAssessmentPageContent: React.FC = () => {
  const discoverySourcesContext = useDiscoverySources();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Check if there are any up-to-date sources
  const hasUpToDateSources = React.useMemo(() => {
    return discoverySourcesContext.sources.some((source) => {
      const agent = source.agent;
      return agent && agent.status === 'up-to-date';
    });
  }, [discoverySourcesContext.sources]);

  const updateAssessments = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedAssessments =
        await discoverySourcesContext.listAssessments();
      // Use the returned data directly instead of relying on context state timing
      setAssessments(fetchedAssessments || []);

      if (!hasInitialLoad) {
        setHasInitialLoad(true);
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [discoverySourcesContext, hasInitialLoad]);

  useMount(async () => {
    await updateAssessments();
    await discoverySourcesContext.listSources(); // Load sources to check for up-to-date status
    discoverySourcesContext.startPolling(DEFAULT_POLLING_DELAY);
  });

  useUnmount(() => {
    discoverySourcesContext.stopPolling();
  });

  // Listen to context changes and update local state when needed (for polling updates)
  useEffect(() => {
    if (hasInitialLoad) {
      setAssessments(discoverySourcesContext.assessments);
    }
  }, [discoverySourcesContext.assessments, hasInitialLoad]);

  // Show loading only before the first successful assessments fetch
  if (isLoading && !hasInitialLoad) {
    return (
      <Bullseye>
        <Spinner size="lg" />
      </Bullseye>
    );
  }

  // Always show assessment component
  return (
    <AssessmentPage
      assessments={assessments}
      isLoading={isLoading}
      hasUpToDateSources={hasUpToDateSources}
    />
  );
};

const MigrationAssessmentPage: React.FC = () => (
  <AppPage
    breadcrumbs={[
      {
        key: 1,
        to: '#',
        children: 'Migration assessment',
        isActive: true,
      },
    ]}
    title="Welcome, let's start your migration journey from VMware to OpenShift."
  >
    <MigrationAssessmentPageContent />
  </AppPage>
);

MigrationAssessmentPage.displayName = 'MigrationAssessmentPage';

export default MigrationAssessmentPage;
