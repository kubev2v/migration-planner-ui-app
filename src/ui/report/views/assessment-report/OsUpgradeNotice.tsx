import { css } from "@emotion/css";
import {
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Icon,
} from "@patternfly/react-core";
import { RhUiInformationFillIcon } from "@patternfly/react-icons";
import React from "react";

const noticeStyle = css`
  margin-bottom: var(--pf-t--global--spacer--200);
`;

export const OsUpgradeNotice: React.FC = () => (
  <Flex
    alignItems={{ default: "alignItemsCenter" }}
    spaceItems={{ default: "spaceItemsSm" }}
    className={noticeStyle}
  >
    <FlexItem>
      <Icon>
        <RhUiInformationFillIcon color="var(--pf-t--global--icon--color--status--info--default)" />
      </Icon>
    </FlexItem>
    <FlexItem>
      <Content component={ContentVariants.p} style={{ fontWeight: 500 }}>
        Some operating systems may need upgrades before migration
      </Content>
    </FlexItem>
  </Flex>
);

OsUpgradeNotice.displayName = "OsUpgradeNotice";

export default OsUpgradeNotice;
