import { css } from "@emotion/css";
import type { InventoryData } from "@openshift-migration-advisor/planner-sdk";
import { Content, Flex, FlexItem, Icon } from "@patternfly/react-core";
import { CheckCircleIcon, TimesCircleIcon } from "@patternfly/react-icons";
import React, { useMemo } from "react";

export type ClusterFeaturesLike = {
  drsEnabled?: boolean;
  drsMode?: string;
  storageDrsEnabled?: boolean;
};

export type ClusterFeaturesEntry = {
  clusterName: string;
  features: ClusterFeaturesLike;
};

const clusterBlockSpacing = css`
  &:not(:last-child) {
    margin-bottom: var(--pf-t--global--spacer--lg);
  }
`;

const itemLabel = css`
  font-weight: var(--pf-t--global--font--weight--body--bold);
  margin-bottom: var(--pf-t--global--spacer--xs);
`;

const DRS_MODE_LABELS: Record<string, string> = {
  fullyAutomated: "Fully Automated",
  partiallyAutomated: "Partially Automated",
  manual: "Manual",
  none: "None",
  "Fully Automated": "Fully Automated",
  "Partially Automated": "Partially Automated",
  Manual: "Manual",
  None: "None",
};

export const formatDrsMode = (mode?: string): string => {
  if (!mode || mode.trim().length === 0) return "-";
  return DRS_MODE_LABELS[mode] ?? mode;
};

export const extractClusterFeaturesEntries = (clusters?: {
  [key: string]: InventoryData;
}): ClusterFeaturesEntry[] => {
  if (!clusters) return [];

  return Object.entries(clusters)
    .map(([clusterName, data]) => {
      const features = (
        data as unknown as { clusterFeatures?: ClusterFeaturesLike }
      ).clusterFeatures;
      if (!features) return null;

      const hasData =
        typeof features.drsEnabled === "boolean" ||
        typeof features.storageDrsEnabled === "boolean" ||
        (typeof features.drsMode === "string" &&
          features.drsMode.trim().length > 0);

      return hasData ? { clusterName, features } : null;
    })
    .filter((entry): entry is ClusterFeaturesEntry => entry !== null)
    .sort((a, b) => a.clusterName.localeCompare(b.clusterName));
};

interface Props {
  clusters?: { [key: string]: InventoryData };
  selectedClusterId?: string;
  showClusterName?: boolean;
}

const EnabledStatus: React.FC<{ enabled?: boolean }> = ({ enabled }) => (
  <Flex gap={{ default: "gapSm" }} alignItems={{ default: "alignItemsCenter" }}>
    {enabled ? (
      <Icon status="success" isInline size="sm">
        <CheckCircleIcon />
      </Icon>
    ) : (
      <Icon status="danger" isInline size="sm">
        <TimesCircleIcon />
      </Icon>
    )}
    <span>{enabled ? "Enabled" : "Disabled"}</span>
  </Flex>
);

const ClusterDrsBlock: React.FC<{
  features: ClusterFeaturesLike;
  clusterName?: string;
}> = ({ features, clusterName }) => (
  <Content component="p" className={clusterBlockSpacing}>
    {clusterName ? (
      <strong style={{ display: "block", marginBottom: 4 }}>
        {clusterName}
      </strong>
    ) : null}
    <strong>Cluster DRS Configuration</strong>
    <Flex
      gap={{ default: "gapLg" }}
      wrap="wrap"
      style={{ marginTop: "var(--pf-t--global--spacer--sm)" }}
    >
      <FlexItem>
        <div className={itemLabel}>DRS Status</div>
        <EnabledStatus enabled={features.drsEnabled} />
      </FlexItem>
      <FlexItem>
        <div className={itemLabel}>DRS Mode</div>
        <span>{formatDrsMode(features.drsMode)}</span>
      </FlexItem>
      <FlexItem>
        <div className={itemLabel}>Storage DRS Status</div>
        <EnabledStatus enabled={features.storageDrsEnabled} />
      </FlexItem>
    </Flex>
  </Content>
);

export const ClusterDrsConfiguration: React.FC<Props> = ({
  clusters,
  selectedClusterId = "all",
  showClusterName = false,
}) => {
  const entries = useMemo(
    () => extractClusterFeaturesEntries(clusters),
    [clusters],
  );

  const visibleEntries = useMemo(() => {
    if (selectedClusterId === "all") return [];
    return entries.filter((e) => e.clusterName === selectedClusterId);
  }, [entries, selectedClusterId]);

  if (selectedClusterId === "all" || visibleEntries.length === 0) {
    return null;
  }

  const showNames = showClusterName || visibleEntries.length > 1;

  return (
    <section
      id="cluster-drs-configuration"
      aria-label="Cluster DRS configuration"
    >
      {visibleEntries.map((entry) => (
        <ClusterDrsBlock
          key={entry.clusterName}
          features={entry.features}
          clusterName={showNames ? entry.clusterName : undefined}
        />
      ))}
    </section>
  );
};

ClusterDrsConfiguration.displayName = "ClusterDrsConfiguration";
