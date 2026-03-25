import { css } from "@emotion/css";
import {
  Alert,
  Button,
  Content,
  Flex,
  FlexItem,
  Icon,
  Tooltip,
} from "@patternfly/react-core";
import {
  ClusterIcon,
  MigrationIcon,
  OutlinedQuestionCircleIcon,
} from "@patternfly/react-icons";
import { t_global_color_nonstatus_gray_300 as globalNonStatusGrayColor } from "@patternfly/react-tokens/dist/js/t_global_color_nonstatus_gray_300";
import { t_global_text_color_link_default as globalActiveColor300 } from "@patternfly/react-tokens/dist/js/t_global_text_color_link_default";
import React from "react";
import { useNavigate } from "react-router-dom";

import { routes } from "../../../routing/Routes";
import { CustomEnterpriseIcon } from "../../core/components/CustomEnterpriseIcon";

const flexContainerStyle = css`
  padding-top: 2.5em;
  padding-bottom: 2.2em;
`;

const flexItemStyle = css`
  max-width: 400px;
`;

const headingStyle = css`
  margin-top: 0.5em !important;
`;

const questionIconStyle = css`
  margin-left: 0.3em;
`;

const descriptionStyle = css`
  font-size: 100%;
  margin-top: 1em;
`;

const linkButtonStyle = css`
  text-decoration: none;
`;

const alertStyle = css`
  & .pf-v6-c-alert__description {
    padding-right: var(--pf-t--global--spacer--lg);
  }
`;

export const HowDoesItWorkAlert: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Alert
      isExpandable
      variant="info"
      title="How does this work?"
      isInline
      className={alertStyle}
    >
      <Flex
        spaceItems={{ default: "spaceItems2xl" }}
        className={flexContainerStyle}
      >
        <FlexItem flex={{ default: "flex_1" }} className={flexItemStyle}>
          <Icon size="xl">
            <CustomEnterpriseIcon color={globalNonStatusGrayColor.value} />
          </Icon>
          <Content component="h3" className={headingStyle}>
            Assess VMware
            <Tooltip content="As part of the discovery process, we're collecting aggregated data about your VMware environment. This includes information such as the number of clusters, hosts, and VMs; VM counts per operating system type; total CPU cores and memory; network types and VLANs; and a list of datastores.">
              <Icon size="lg" className={questionIconStyle}>
                <OutlinedQuestionCircleIcon
                  color={globalActiveColor300.value}
                />
              </Icon>
            </Tooltip>
          </Content>
          <Content className={descriptionStyle}>
            Run discovery or upload an inventory file to generate a migration
            report.{" "}
            <Button
              isInline
              variant="link"
              onClick={() => navigate(routes.exampleReport)}
              className={linkButtonStyle}
            >
              See example report
            </Button>
          </Content>
        </FlexItem>
        <FlexItem flex={{ default: "flex_1" }} className={flexItemStyle}>
          <Icon size="xl">
            <ClusterIcon color={globalNonStatusGrayColor.value} />
          </Icon>
          <Content component="h3" className={headingStyle}>
            Select Target Cluster
          </Content>
          <Content className={descriptionStyle}>
            Select or create an OpenShift Cluster for Migration
          </Content>
        </FlexItem>
        <FlexItem flex={{ default: "flex_1" }} className={flexItemStyle}>
          <Icon size="xl">
            <MigrationIcon color={globalNonStatusGrayColor.value} />
          </Icon>
          <Content component="h3" className={headingStyle}>
            Plan Migration
          </Content>
          <Content className={descriptionStyle}>
            Select VMs, map network and storage, and schedule a migration
          </Content>
        </FlexItem>
      </Flex>
    </Alert>
  );
};

HowDoesItWorkAlert.displayName = "HowDoesItWorkAlert";

export default HowDoesItWorkAlert;
