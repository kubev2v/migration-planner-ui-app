import { css } from "@emotion/css";
import {
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import React from "react";

import type { ClusterViewModel } from "../../helpers/clusterViewModel";
import type { GroupViewModel } from "../../helpers/groupViewModel";
import type { ClusterOption } from "./ClusterView";

const filterToggleStyle = css`
  min-width: 422px;
`;

export interface ReportFilterBarProps {
  clusterView: ClusterViewModel;
  clusterSelectDisabled: boolean;
  isClusterSelectOpen: boolean;
  onClusterSelectOpenChange: (open: boolean) => void;
  onClusterSelect: (
    event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => void;
  groupView: GroupViewModel;
  isGroupSelectOpen: boolean;
  onGroupSelectOpenChange: (open: boolean) => void;
  onGroupSelect: (
    event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => void;
}

export const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  clusterView,
  clusterSelectDisabled,
  isClusterSelectOpen,
  onClusterSelectOpenChange,
  onClusterSelect,
  groupView,
  isGroupSelectOpen,
  onGroupSelectOpenChange,
  onGroupSelect,
}) => (
  <Split hasGutter>
    <SplitItem>
      <Select
        isScrollable
        isOpen={isClusterSelectOpen}
        selected={clusterView.selectionId}
        onSelect={onClusterSelect}
        onOpenChange={(isOpen: boolean) => {
          if (!clusterSelectDisabled) {
            onClusterSelectOpenChange(isOpen);
          }
        }}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            isExpanded={isClusterSelectOpen}
            onClick={() => {
              if (!clusterSelectDisabled) {
                onClusterSelectOpenChange(!isClusterSelectOpen);
              }
            }}
            isDisabled={clusterSelectDisabled}
            className={filterToggleStyle}
          >
            Filter by cluster: {clusterView.selectionLabel}
          </MenuToggle>
        )}
      >
        <SelectList>
          {clusterView.clusterOptions.map((option: ClusterOption) => (
            <SelectOption key={option.id} value={option.id}>
              {option.label}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </SplitItem>
    {groupView.showGroupFilter ? (
      <SplitItem>
        <Select
          isScrollable
          isOpen={isGroupSelectOpen}
          selected={groupView.selectionId}
          onSelect={onGroupSelect}
          onOpenChange={(isOpen: boolean) => {
            if (!groupView.groupSelectDisabled) {
              onGroupSelectOpenChange(isOpen);
            }
          }}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              isExpanded={isGroupSelectOpen}
              onClick={() => {
                if (!groupView.groupSelectDisabled) {
                  onGroupSelectOpenChange(!isGroupSelectOpen);
                }
              }}
              isDisabled={groupView.groupSelectDisabled}
              className={filterToggleStyle}
            >
              Filter by group: {groupView.selectionLabel}
            </MenuToggle>
          )}
        >
          <SelectList>
            {groupView.groupOptions.map((option) => (
              <SelectOption key={option.id} value={option.id}>
                {option.label}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
      </SplitItem>
    ) : null}
  </Split>
);

ReportFilterBar.displayName = "ReportFilterBar";
