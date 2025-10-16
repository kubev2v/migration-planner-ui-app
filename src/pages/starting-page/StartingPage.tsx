import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Bullseye,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FlexItem,
  Icon,
  Text,
  TextContent,
  Tooltip,
} from '@patternfly/react-core';
import {
  ClusterIcon,
  MigrationIcon,
  QuestionCircleIcon,
} from '@patternfly/react-icons';
import { global_active_color_300 as globalActiveColor300 } from '@patternfly/react-tokens/dist/js/global_active_color_300';

import { CustomEnterpriseIcon } from '../../components/CustomEnterpriseIcon';

const createCards = (
  navigate: ReturnType<typeof useNavigate>,
): React.ReactElement[] => [
  <Card isFullHeight isPlain key="card-1">
    <CardHeader>
      <TextContent style={{ textAlign: 'center' }}>
        <Icon size="xl" style={{ color: globalActiveColor300.var }}>
          <CustomEnterpriseIcon />
        </Icon>
        <Text component="h2">
          Assess your VMware environment{' '}
          <Tooltip content="As part of the discovery process, we're collecting aggregated data about your VMware environment. This includes information such as the number of clusters, hosts, and VMs; VM counts per operating system type; total CPU cores and memory; network types and VLANs; and a list of datastores.">
            <Icon style={{ color: globalActiveColor300.var }} size="sm">
              <QuestionCircleIcon />
            </Icon>
          </Tooltip>
        </Text>
      </TextContent>
    </CardHeader>
    <CardBody>
      <TextContent style={{ textAlign: 'center' }}>
        <Text style={{ minHeight: '60px' }}>
          Run the discovery process or upload an inventory file to create a full
          migration assessment report.
        </Text>
        <Button
          size="sm"
          variant="link"
          onClick={() =>
            navigate(
              '/openshift/migration-assessment/assessments/example-report',
            )
          }
        >
          See an example report
        </Button>
      </TextContent>
    </CardBody>
  </Card>,

  <Card isFullHeight isPlain key="card-2">
    <CardHeader style={{ height: '210px' }}>
      <TextContent style={{ textAlign: 'center' }}>
        <Icon size="xl" style={{ color: globalActiveColor300.var }}>
          <ClusterIcon />
        </Icon>
        <Text component="h2">
          Select a target cluster
          <br />
        </Text>
      </TextContent>
    </CardHeader>
    <CardBody>
      <TextContent style={{ textAlign: 'center' }}>
        <Text style={{ minHeight: '60px', height: '72px' }}>
          Select your target OpenShift Cluster to fit your migration data
        </Text>
        <span
          className="pf-v5-c-label pf-m-purple pf-m-compact"
          style={{ marginTop: '6px', display: 'inline-block' }}
        >
          Coming soon
        </span>
      </TextContent>
    </CardBody>
  </Card>,

  <Card isFullHeight isPlain key="card-3">
    <CardHeader style={{ height: '210px' }}>
      <TextContent style={{ textAlign: 'center' }}>
        <Icon size="xl" style={{ color: globalActiveColor300.var }}>
          <MigrationIcon />
        </Icon>
        <Text component="h2">
          Create a migration plan
          <br />
        </Text>
      </TextContent>
    </CardHeader>
    <CardBody>
      <TextContent style={{ textAlign: 'center' }}>
        <Text style={{ minHeight: '60px' }}>
          Select your VMs, create a network and storage mapping and schedule
          your migration timeline
        </Text>
        <span
          className="pf-v5-c-label pf-m-purple pf-m-compact"
          style={{ marginTop: '6px', display: 'inline-block' }}
        >
          Coming soon
        </span>
      </TextContent>
    </CardBody>
  </Card>,
];

const StartingPage: React.FC = () => {
  const navigate = useNavigate();
  const cards = createCards(navigate);

  return (
    <Bullseye>
      <Flex>
        {cards.map((card) => (
          <FlexItem flex={{ default: 'flex_1' }} key={card.key}>
            {card}
          </FlexItem>
        ))}
      </Flex>
    </Bullseye>
  );
};

StartingPage.displayName = 'StartingPage';

export default StartingPage;
