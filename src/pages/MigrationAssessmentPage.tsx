import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import {
  Bullseye,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FlexItem,
  Icon,
  PageSection,
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
import { Provider as DiscoverySourcesProvider } from '../migration-wizard/contexts/discovery-sources/Provider';

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

const AssessmentsList: React.FC = () => {
  const {
    assessments,
    isLoadingAssessments,
    errorLoadingAssessments,
    listAssessments,
  } = useDiscoverySources();

  useEffect(() => {
    listAssessments();
  }, [listAssessments]);

  if (isLoadingAssessments) {
    return (
      <Bullseye>
        <Spinner size="lg" />
      </Bullseye>
    );
  }

  if (errorLoadingAssessments) {
    return (
      <PageSection>
        <Text component="p">
          Error loading assessments: {errorLoadingAssessments.message}
        </Text>
      </PageSection>
    );
  }

  return (
    <PageSection>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2" size="xl">
            Your Migration Assessments
          </Title>
        </StackItem>
        <StackItem>
          {assessments.length > 0 ? (
            <Stack hasGutter>
              {assessments.map((assessment, index) => (
                <StackItem key={assessment.id || index}>
                  <Card>
                    <CardHeader>
                      <Text component="h3">Assessment {assessment.id}</Text>
                    </CardHeader>
                    <CardBody>
                      <TextContent>
                        <Text>Status: {assessment.status || 'Unknown'}</Text>
                        {assessment.createdAt && (
                          <Text>
                            Created:{' '}
                            {new Date(
                              assessment.createdAt,
                            ).toLocaleDateString()}
                          </Text>
                        )}
                      </TextContent>
                    </CardBody>
                  </Card>
                </StackItem>
              ))}
            </Stack>
          ) : (
            <Card>
              <CardBody>
                <TextContent style={{ textAlign: 'center' }}>
                  <Text>No assessments found.</Text>
                </TextContent>
              </CardBody>
            </Card>
          )}
        </StackItem>
        <StackItem style={{ alignSelf: 'center' }}>
          <Link to="migrate/wizard">
            <Button>Start new migration assessment</Button>
          </Link>
        </StackItem>
      </Stack>
    </PageSection>
  );
};

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

const MigrationAssessmentPageContent: React.FC = () => {
  const { assessments, isLoadingAssessments, listAssessments } =
    useDiscoverySources();

  useEffect(() => {
    listAssessments();
  }, [listAssessments]);

  // Show loading while assessments are being fetched
  if (isLoadingAssessments) {
    return (
      <Bullseye>
        <Spinner size="lg" />
      </Bullseye>
    );
  }

  // Show assessments list if any exist, otherwise show welcome page
  return assessments.length > 0 ? <AssessmentsList /> : <WelcomePage />;
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
    <DiscoverySourcesProvider>
      <MigrationAssessmentPageContent />
    </DiscoverySourcesProvider>
  </AppPage>
);

MigrationAssessmentPage.displayName = 'MigrationAssessmentPage';

export default MigrationAssessmentPage;
