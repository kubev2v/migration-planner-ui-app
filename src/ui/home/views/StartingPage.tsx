import { css } from "@emotion/css";
import {
  Bullseye,
  Button,
  Card,
  CardBody,
  CardHeader,
  Content,
  Flex,
  FlexItem,
  Icon,
  Label,
  Tooltip,
} from "@patternfly/react-core";
import {
  ClusterIcon,
  MigrationIcon,
  QuestionCircleIcon,
} from "@patternfly/react-icons";
import { t_global_text_color_link_default as globalActiveColor300 } from "@patternfly/react-tokens/dist/js/t_global_text_color_link_default";
import React from "react";
import { useNavigate } from "react-router-dom";

import { routes } from "../../../routing/Routes";
import { CustomEnterpriseIcon } from "../../core/components/CustomEnterpriseIcon";

const centered = css`
  text-align: center;
`;

const titleStyle = css`
  min-height: 52px;
`;

const descriptionStyle = css`
  min-height: 70px;
`;

const actionStyle = css`
  margin-top: 16px;
  display: inline-block;
`;

const createCards = (
  navigate: ReturnType<typeof useNavigate>,
): React.ReactElement[] => [
  <Card isFullHeight isPlain key="card-1">
    <CardHeader>
      <Content className={centered}>
        <Icon size="xl">
          <CustomEnterpriseIcon color={globalActiveColor300.value} />
        </Icon>
        <Content component="h2" className={titleStyle}>
          Assess your VMware environment{" "}
          <Tooltip content="As part of the discovery process, we're collecting aggregated data about your VMware environment. This includes information such as the number of clusters, hosts, and VMs; VM counts per operating system type; total CPU cores and memory; network types and VLANs; and a list of datastores.">
            <Icon size="sm">
              <QuestionCircleIcon color={globalActiveColor300.value} />
            </Icon>
          </Tooltip>
        </Content>
      </Content>
    </CardHeader>
    <CardBody>
      <Content className={centered}>
        <Content className={descriptionStyle}>
          Run the discovery process or upload an inventory file to create a full
          migration assessment report.
        </Content>
        <Button
          size="sm"
          variant="link"
          onClick={() => navigate(routes.exampleReport)}
          className={actionStyle}
        >
          See an example report
        </Button>
      </Content>
    </CardBody>
  </Card>,

  <Card isFullHeight isPlain key="card-2">
    <CardHeader>
      <Content className={centered}>
        <Icon size="xl">
          <ClusterIcon color={globalActiveColor300.value} />
        </Icon>
        <Content component="h2" className={titleStyle}>
          Select a target cluster
        </Content>
      </Content>
    </CardHeader>
    <CardBody>
      <Content className={centered}>
        <Content className={descriptionStyle}>
          Select your target OpenShift Cluster to fit your migration data.
        </Content>
        <Label color="purple" className={actionStyle}>
          Coming soon
        </Label>
      </Content>
    </CardBody>
  </Card>,

  <Card isFullHeight isPlain key="card-3">
    <CardHeader>
      <Content className={centered}>
        <Icon size="xl">
          <MigrationIcon color={globalActiveColor300.value} />
        </Icon>
        <Content component="h2" className={titleStyle}>
          Create a migration plan
        </Content>
      </Content>
    </CardHeader>
    <CardBody>
      <Content className={centered}>
        <Content className={descriptionStyle}>
          Select your VMs, create a network and storage mapping and schedule
          your migration timeline.
        </Content>
        <Label color="purple" className={actionStyle}>
          Coming soon
        </Label>
      </Content>
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
          <FlexItem flex={{ default: "flex_1" }} key={card.key}>
            {card}
          </FlexItem>
        ))}
      </Flex>
    </Bullseye>
  );
};

StartingPage.displayName = "StartingPage";

export default StartingPage;
