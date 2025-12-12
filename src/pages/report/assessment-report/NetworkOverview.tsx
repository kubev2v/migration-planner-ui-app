import React, { useMemo, useState } from 'react';

import { Infra } from '@migration-planner-ui/api-client/models';
import {
  Card,
  CardBody,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';

import MigrationDonutChart from '../../../components/MigrationDonutChart';

// Reuse an extended palette similar to ClustersOverview to provide stable colors
const colorPalette = [
  '#0066cc',
  '#5e40be',
  '#b6a6e9',
  '#73c5c5',
  '#b98412',
  '#28a745',
  '#f0ad4e',
  '#d9534f',
  '#009596',
  '#6a6e73',
];

interface NetworkOverviewProps {
  infra: Infra;
  isExportMode?: boolean;
}

type ViewMode = 'networkDistribution' | 'nicCount';

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  networkDistribution: 'VM distribution by network',
  nicCount: 'VM distribution by NIC count',
};

export const NetworkOverview: React.FC<NetworkOverviewProps> = ({
  infra,
  isExportMode = false,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('networkDistribution');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { chartData, legend, title, subTitle, legendVlanMap } = useMemo(() => {
    const networks = Array.isArray(infra?.networks) ? infra.networks : [];
    // Keep only entries with a numeric vmsCount
    const items = networks
      .map((n: unknown) => {
        const obj = n as {
          name?: string;
          vmsCount?: unknown;
          vlanId?: unknown;
        };
        const countNum = Number((obj?.vmsCount as unknown) ?? NaN);
        return {
          rawName: obj?.name ?? '',
          vmsCount: Number.isFinite(countNum) ? countNum : NaN,
          vlanId:
            typeof obj?.vlanId === 'string' || typeof obj?.vlanId === 'number'
              ? String(obj?.vlanId)
              : '',
        };
      })
      .filter((n) => Number.isFinite(n.vmsCount) && n.vmsCount >= 0)
      .sort((a, b) => b.vmsCount - a.vmsCount);

    const totalVMs = items.reduce((acc, n) => acc + n.vmsCount, 0);

    const TOP_N = 4;
    const top = items.slice(0, TOP_N);
    const rest = items.slice(TOP_N);
    const restSum = rest.reduce((acc, r) => acc + r.vmsCount, 0);

    // Build slices with generic names like "Network 1", mirroring clusters view
    const legendVlanMap: Record<string, string> = {};
    const slices = top.map((item, i) => {
      const name = `Network ${i + 1}`;
      legendVlanMap[name] =
        item.vlanId && item.vlanId.trim() !== '' ? item.vlanId : '-';
      return {
        name,
        count: item.vmsCount,
        countDisplay: `${item.vmsCount} VMs`,
        legendCategory: name,
      };
    });
    if (restSum > 0) {
      slices.push({
        name: 'Rest of networks',
        count: restSum,
        countDisplay: `${restSum} VMs`,
        legendCategory: 'Rest of networks',
      });
      legendVlanMap['Rest of networks'] = '-';
    }

    const categories = slices.map((s) => s.legendCategory);
    const legendMap: Record<string, string> = {};
    categories.forEach((cat, idx) => {
      legendMap[cat] = colorPalette[idx % colorPalette.length];
    });

    return {
      chartData: slices,
      legend: legendMap,
      title: `${totalVMs}`,
      subTitle: 'VMs',
      legendVlanMap,
    };
  }, [infra]);

  const onDropdownToggle = (): void => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ): void => {
    if (value === 'networkDistribution' || value === 'nicCount') {
      setViewMode(value);
    }
    setIsDropdownOpen(false);
  };

  return (
    <Card
      className={isExportMode ? 'dashboard-card-print' : 'dashboard-card'}
      id="network-overview"
      style={{ overflow: 'hidden' }}
    >
      <CardTitle>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
          style={{ width: '100%' }}
        >
          <FlexItem>
            <div>
              <div>
                <i className="fas fa-network-wired" /> Networks
              </div>
              {!isExportMode && (
                <div style={{ color: '#6a6e73', fontSize: '0.85rem' }}>
                  Top 5 networks
                </div>
              )}
            </div>
          </FlexItem>
          {!isExportMode && (
            <FlexItem>
              <Dropdown
                isOpen={isDropdownOpen}
                onSelect={onSelect}
                onOpenChange={(isOpen: boolean) => setIsDropdownOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={onDropdownToggle}
                    isExpanded={isDropdownOpen}
                    style={{ minWidth: '250px' }}
                  >
                    {VIEW_MODE_LABELS[viewMode]}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem
                    key="networkDistribution"
                    value="networkDistribution"
                  >
                    VM distribution by network
                  </DropdownItem>
                  <DropdownItem key="nicCount" value="nicCount" isDisabled>
                    VM distribution by NIC count
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </FlexItem>
          )}
        </Flex>
      </CardTitle>
      <CardBody>
        {viewMode === 'networkDistribution' && (
          <MigrationDonutChart
            data={chartData}
            height={300}
            width={420}
            donutThickness={9}
            titleFontSize={34}
            legend={legend}
            title={title}
            subTitle={subTitle}
            subTitleColor="#9a9da0"
            itemsPerRow={Math.ceil(chartData.length / 2)}
            labelFontSize={18}
            marginLeft="12%"
            tooltipLabelFormatter={({ datum, percent }) =>
              `${datum.countDisplay}\n${percent.toFixed(1)}%\nVLAN: ${legendVlanMap[datum.legendCategory] ?? '-'}`
            }
          />
        )}
      </CardBody>
    </Card>
  );
};
