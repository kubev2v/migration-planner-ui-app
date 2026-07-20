import {
  Button,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Popover,
} from "@patternfly/react-core";
import { RhUiInformationFillIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, Tr } from "@patternfly/react-table";
import React from "react";

import {
  getFlyoutAppendTo,
  themePopoverFlyoutClassName,
} from "../../../../lib/patternfly/flyoutAppendTo";
import {
  barFill,
  barTrack,
  countCell,
  countText,
  dataRowNameCell,
  dataRowNameText,
  groupHeaderCountCell,
  groupHeaderLabelCell,
  groupHeaderLabelCellFirst,
  groupHeaderLabelCellSubsequent,
  groupHeaderText,
  infoButton,
  upgradeRecommendationPopoverCloseButton,
} from "./styles";
import type { DLength, OSData } from "./types";

const MIN_BAR_PX = 3;

interface MigrationChartTableProps {
  data: OSData[];
  dataLength: DLength;
  barHeight: number;
  sumOfAllCounts: number;
  getColor: (name: string) => string;
}

export const MigrationChartTable: React.FC<MigrationChartTableProps> = ({
  data,
  dataLength,
  barHeight,
  sumOfAllCounts,
  getColor,
}) => {
  return (
    <Table variant="compact" borders={false}>
      <Tbody>
        {data.map((item, index) =>
          item.isGroupHeader ? (
            <Tr key={`group-${item.legendCategory}`}>
              <Td
                colSpan={2}
                className={`${groupHeaderLabelCell} ${
                  index === 0
                    ? groupHeaderLabelCellFirst
                    : groupHeaderLabelCellSubsequent
                }`}
              >
                <Content
                  component={ContentVariants.p}
                  className={groupHeaderText}
                >
                  {item.name}
                </Content>
              </Td>
              <Td
                width={10}
                className={`${groupHeaderCountCell} ${
                  index === 0
                    ? groupHeaderLabelCellFirst
                    : groupHeaderLabelCellSubsequent
                }`}
              >
                <Content component="p" className={groupHeaderText}>
                  {item.count}
                </Content>
              </Td>
            </Tr>
          ) : (
            <Tr key={`${item.legendCategory}-${item.name}`}>
              <Td width={dataLength} className={dataRowNameCell}>
                <Flex
                  alignItems={{ default: "alignItemsCenter" }}
                  spaceItems={{ default: "spaceItemsXs" }}
                  flexWrap={{ default: "nowrap" }}
                >
                  <FlexItem>
                    <Content
                      component={ContentVariants.p}
                      className={dataRowNameText}
                    >
                      {item.name}
                    </Content>
                  </FlexItem>
                  {item.infoText ? (
                    <FlexItem shrink={{ default: "shrink" }}>
                      <Popover
                        appendTo={getFlyoutAppendTo}
                        className={`${themePopoverFlyoutClassName} ${upgradeRecommendationPopoverCloseButton}`}
                        position="bottom"
                        headerContent="Upgrade to get support"
                        bodyContent={<div>{item.infoText}</div>}
                      >
                        <Button
                          type="button"
                          aria-label="Open operating system upgrade information"
                          variant="plain"
                          className={infoButton}
                        >
                          <RhUiInformationFillIcon color="var(--pf-t--global--icon--color--status--info--default)" />
                        </Button>
                      </Popover>
                    </FlexItem>
                  ) : null}
                </Flex>
              </Td>
              <Td>
                <div>
                  <div
                    className={barTrack}
                    style={{ height: `${barHeight}px` }}
                  >
                    {(() => {
                      const barWidth =
                        sumOfAllCounts > 0
                          ? (item.count / sumOfAllCounts) * 100
                          : 0;
                      const hasValue = barWidth > 0;

                      return (
                        <div
                          className={barFill}
                          style={{
                            width: `${barWidth}%`,
                            minWidth: hasValue ? `${MIN_BAR_PX}px` : "0",
                            backgroundColor: getColor(item.legendCategory),
                          }}
                        />
                      );
                    })()}
                  </div>
                </div>
              </Td>
              <Td width={10} className={countCell}>
                <Content component="p" className={countText}>
                  {item.count}
                </Content>
              </Td>
            </Tr>
          ),
        )}
      </Tbody>
    </Table>
  );
};

MigrationChartTable.displayName = "MigrationChartTable";
