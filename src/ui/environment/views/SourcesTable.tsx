import { css } from "@emotion/css";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  InputGroup,
  InputGroupItem,
  MenuToggle,
  type MenuToggleElement,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
} from "@patternfly/react-core";
import {
  RhUiAddCircleIcon,
  RhUiArrowLeftIcon,
  RhUiCloseIcon,
  RhUiEllipsisVerticalIcon,
  RhUiFilterIcon,
} from "@patternfly/react-icons";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { SourceModel } from "../../../models/SourceModel";
import { themeTooltipFlyoutProps } from "../../../lib/patternfly/flyoutAppendTo";
import { routes } from "../../../routing/Routes";
import { ConfirmationModal } from "../../core/components/ConfirmationModal";
import { EmptySearchResults } from "../../core/components/EmptySearchResults";
import FilterPill from "../../core/components/FilterPill";
import {
  DISCOVERY_VM_STATUS_FILTER_OPTIONS,
  type DiscoveryVmStatusFilterKey,
  getSourceDiscoveryVmStatusLabel,
  isInventoryUploadedManually,
  isSourceUploadedManually,
  sourceMatchesDiscoveryVmStatusFilter,
} from "../helpers/discoveryVmStatus";
import { useEnvironmentPage } from "../view-models/EnvironmentPageContext";
import { AgentStatusView } from "./AgentStatusView";
import { Columns, SORTABLE_COLUMNS, type SortableColumnKey } from "./Columns";
import { EnvironmentEmptyState } from "./EnvironmentEmptyState";
import { UploadInventoryAction } from "./UploadInventoryAction";
import { getAgentVersionDisplayLabel, VersionStatus } from "./VersionStatus";

const VALUE_NOT_AVAILABLE = "-";

const getHostsCount = (source: SourceModel): number =>
  source.inventory?.vcenter?.infra.totalHosts ?? 0;

const getVmsCount = (source: SourceModel): number =>
  source.inventory?.vcenter?.vms.total ?? 0;

const getNetworksCount = (source: SourceModel): number =>
  source.inventory?.vcenter?.infra.networks?.length ?? 0;

const getDatastoresCount = (source: SourceModel): number =>
  source.inventory?.vcenter?.infra.datastores?.length ?? 0;

const getUpdatedAtMs = (source: SourceModel): number => {
  if (!source.updatedAt) return 0;
  const ms = new Date(source.updatedAt).getTime();
  return Number.isNaN(ms) ? 0 : ms;
};

const getSourceAgentVersionLabel = (source: SourceModel): string =>
  getAgentVersionDisplayLabel({
    displayStatus: source.displayStatus,
    isUploadedManually: isSourceUploadedManually(source),
    agentVersion: source.agentVersion,
    agentVersionWarning: source.agentVersionWarning,
  });

const tableContainerStyle = css`
  margin-top: 1em;
  max-width: 100%;
  overflow: auto;
`;

const backButtonWrapper = css`
  margin-bottom: 16px;
`;

const checkboxInput = css`
  margin-right: 8px;
`;

const searchInputStyle = css`
  min-width: 300px;
  width: 300px;
`;

const filterChipsContainer = css`
  margin-top: 8px;
`;

const filterChipsWrapper = css`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  background: var(--pf-t--global--background--color--secondary--default);
  padding: 6px 8px;
  border-radius: 6px;
`;

const filterBadge = css`
  background: var(--pf-t--global--background--color--secondary--hover);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
`;

const tableHeaderNormal = css`
  white-space: normal;
`;

const tableHeaderWide = css`
  white-space: normal;
  min-width: 120px;
  max-width: 200px;
`;

const tableCellTop = css`
  vertical-align: top;
`;

type SourceTableProps = {
  onlySourceId?: string;
  uploadOnly?: boolean;
  onEditEnvironment?: (sourceId: string) => void;
  onAddEnvironment?: () => void;
  onDownloadOva?: (sourceId: string) => void;
};

export const SourcesTable: React.FC<SourceTableProps> = ({
  onlySourceId,
  uploadOnly = false,
  onEditEnvironment,
  onAddEnvironment,
  onDownloadOva,
}) => {
  const formatRelativeTime = (updatedAt?: string | number | Date): string => {
    if (!updatedAt) return "-";
    const date = new Date(updatedAt);
    if (isNaN(date.getTime())) return "-";

    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const absMs = Math.abs(diffMs);

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    const year = 365 * day;

    let unit: Intl.RelativeTimeFormatUnit = "second";
    let value = 0;

    if (absMs < minute) {
      unit = "second";
      value = Math.round(diffMs / 1000);
    } else if (absMs < hour) {
      unit = "minute";
      value = Math.round(diffMs / minute);
    } else if (absMs < day) {
      unit = "hour";
      value = Math.round(diffMs / hour);
    } else if (absMs < week) {
      unit = "day";
      value = Math.round(diffMs / day);
    } else if (absMs < month) {
      unit = "week";
      value = Math.round(diffMs / week);
    } else if (absMs < year) {
      unit = "month";
      value = Math.round(diffMs / month);
    } else {
      unit = "year";
      value = Math.round(diffMs / year);
    }

    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      value,
      unit,
    );
  };
  const vm = useEnvironmentPage();
  const navigate = useNavigate();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {},
  );
  const [deleteTarget, setDeleteTarget] = useState<SourceModel | null>(null);
  const [search, setSearch] = useState("");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<
    DiscoveryVmStatusFilterKey[]
  >([]);
  const [sortBy, setSortBy] = useState<{
    columnKey: SortableColumnKey;
    direction: "asc" | "desc";
  }>({
    columnKey: "Name",
    direction: "asc",
  });

  const toggleStatus = (statusKey: DiscoveryVmStatusFilterKey): void => {
    setSelectedStatuses((prev) =>
      prev.includes(statusKey)
        ? prev.filter((s) => s !== statusKey)
        : [...prev, statusKey],
    );
  };

  const clearStatuses = (): void => setSelectedStatuses([]);

  const statusOptions = DISCOVERY_VM_STATUS_FILTER_OPTIONS;

  const sourcesList = useMemo(
    () => (vm.sources ? [...vm.sources] : []),
    [vm.sources],
  );

  const hasSources = sourcesList.length > 0;

  const filteredSources = useMemo(() => {
    if (sourcesList.length === 0) return [];
    let filtered = sourcesList;

    // Filter by specific source id if provided
    if (onlySourceId) {
      filtered = filtered.filter((s) => s.id === onlySourceId);
    }

    // Name-only search
    if (search && search.trim() !== "") {
      const query = search.toLowerCase();
      filtered = filtered.filter((source) =>
        (source.name || "").toLowerCase().includes(query),
      );
    }

    // Multi-select statuses with label mapping
    if (selectedStatuses && selectedStatuses.length > 0) {
      filtered = filtered.filter((source) =>
        selectedStatuses.some((key) =>
          sourceMatchesDiscoveryVmStatusFilter(source, key),
        ),
      );
    }

    const copy = [...filtered];
    switch (sortBy.columnKey) {
      case "Name":
        copy.sort((a, b) =>
          sortBy.direction === "asc"
            ? (a.name || "").localeCompare(b.name || "")
            : (b.name || "").localeCompare(a.name || ""),
        );
        break;
      case "Status":
        copy.sort((a, b) => {
          const aLabel = getSourceDiscoveryVmStatusLabel(a);
          const bLabel = getSourceDiscoveryVmStatusLabel(b);
          return sortBy.direction === "asc"
            ? aLabel.localeCompare(bLabel)
            : bLabel.localeCompare(aLabel);
        });
        break;
      case "VersionStatus":
        copy.sort((a, b) => {
          const aLabel = getSourceAgentVersionLabel(a);
          const bLabel = getSourceAgentVersionLabel(b);
          return sortBy.direction === "asc"
            ? aLabel.localeCompare(bLabel)
            : bLabel.localeCompare(aLabel);
        });
        break;
      case "Hosts":
        copy.sort((a, b) => {
          const aHosts = getHostsCount(a);
          const bHosts = getHostsCount(b);
          return sortBy.direction === "asc" ? aHosts - bHosts : bHosts - aHosts;
        });
        break;
      case "VMs":
        copy.sort((a, b) => {
          const aVms = getVmsCount(a);
          const bVms = getVmsCount(b);
          return sortBy.direction === "asc" ? aVms - bVms : bVms - aVms;
        });
        break;
      case "Networks":
        copy.sort((a, b) => {
          const aNetworks = getNetworksCount(a);
          const bNetworks = getNetworksCount(b);
          return sortBy.direction === "asc"
            ? aNetworks - bNetworks
            : bNetworks - aNetworks;
        });
        break;
      case "Datastores":
        copy.sort((a, b) => {
          const aDatastores = getDatastoresCount(a);
          const bDatastores = getDatastoresCount(b);
          return sortBy.direction === "asc"
            ? aDatastores - bDatastores
            : bDatastores - aDatastores;
        });
        break;
      case "LastSeen":
        copy.sort((a, b) => {
          const aMs = getUpdatedAtMs(a);
          const bMs = getUpdatedAtMs(b);
          return sortBy.direction === "asc" ? aMs - bMs : bMs - aMs;
        });
        break;
    }

    return copy;
  }, [sourcesList, search, selectedStatuses, onlySourceId, sortBy]);

  const getSortParams = (columnKey: SortableColumnKey) => {
    const columnIndex = SORTABLE_COLUMNS.indexOf(columnKey);
    const activeSortColumnIndex = SORTABLE_COLUMNS.indexOf(sortBy.columnKey);
    return {
      sortBy: {
        index: activeSortColumnIndex,
        direction: sortBy.direction,
      },
      onSort: (_event: unknown, _index: number, direction: "asc" | "desc") => {
        setSortBy({ columnKey, direction });
      },
      columnIndex,
    };
  };

  // Polling lifecycle is handled by the EnvironmentPageViewModel.
  // We only need to refresh on tab/window focus.

  // Refresh immediately when returning to the tab/window (no manual reload needed)
  useEffect(() => {
    const onFocus = (): void => {
      void vm.refreshOnFocus();
    };

    const onVisibilityChange = (): void => {
      if (document.visibilityState === "visible") {
        void vm.refreshOnFocus();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vm.refreshOnFocus]);

  useEffect(
    () => {
      const firstVisibleSource = filteredSources[0];
      if (!vm.sourceSelected && firstVisibleSource) {
        vm.selectSource(firstVisibleSource);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredSources, vm.sources],
  );

  // Build map of sourceId -> assessmentId to enable report action
  const sourceToAssessmentId = useMemo(() => {
    const map: Record<string, string> = {};
    try {
      const list = (vm.assessments || []) as unknown[];
      list.forEach((a: unknown) => {
        const obj = (a || {}) as Record<string, unknown>;
        const id = obj.id as string | number | undefined;
        const sourceId = obj.sourceId as string | number | undefined;
        if (id !== undefined && sourceId !== undefined) {
          map[String(sourceId)] = String(id);
        }
      });
    } catch {
      // ignore
    }
    return map;
  }, [vm.assessments]);

  const handleUploadFile = (sourceId: string): void => {
    vm.uploadInventoryFromFile(sourceId);
  };

  const handleDelete = (source: SourceModel): void => {
    setDeleteTarget(null);
    void vm.deleteAndRefresh(source.id).then((sources) => {
      if (sources?.length) {
        vm.selectSource(sources[0]);
      }
    });
  };

  const handleShowReport = (sourceId: string): void => {
    const assessmentId = sourceToAssessmentId[sourceId];
    if (assessmentId) {
      navigate(routes.assessmentReport(assessmentId));
    }
  };

  const handleCreateAssessment = (sourceId: string): void => {
    vm.setAssessmentFromAgent?.(true);
    vm.selectSourceById?.(sourceId);
    navigate(routes.assessmentCreate, {
      state: { preselectedSourceId: sourceId },
    });
  };

  // Show empty state if no sources
  if (!hasSources && onAddEnvironment) {
    return (
      <EnvironmentEmptyState
        onAddEnvironment={onAddEnvironment}
        isOvaDownloading={false}
      />
    );
  }

  const showNoResultFound = hasSources && filteredSources.length === 0;

  return (
    <div>
      {vm.assessmentFromAgentState && (
        <div className={backButtonWrapper}>
          <Button
            variant="link"
            icon={<RhUiArrowLeftIcon />}
            onClick={() => {
              vm.setAssessmentFromAgent?.(false);
              navigate(routes.assessments);
            }}
          >
            Back to Assessments
          </Button>
        </div>
      )}

      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <InputGroup>
              <InputGroupItem>
                <Dropdown
                  isOpen={isFilterDropdownOpen}
                  onOpenChange={(open) => setIsFilterDropdownOpen(open)}
                  onSelect={() => setIsFilterDropdownOpen(false)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() =>
                        setIsFilterDropdownOpen(!isFilterDropdownOpen)
                      }
                      isExpanded={isFilterDropdownOpen}
                      icon={<RhUiFilterIcon />}
                    >
                      Filters
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem isDisabled key="heading-status">
                      Discovery VM Status
                    </DropdownItem>
                    <DropdownItem
                      key="status-all"
                      onClick={(
                        event: React.MouseEvent | React.KeyboardEvent,
                      ) => {
                        event.preventDefault();
                        event.stopPropagation();
                        clearStatuses();
                      }}
                    >
                      All statuses
                    </DropdownItem>
                    {statusOptions.map((opt) => (
                      <DropdownItem
                        key={`status-${opt.key}`}
                        onClick={(
                          event: React.MouseEvent | React.KeyboardEvent,
                        ) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleStatus(opt.key);
                        }}
                      >
                        <input
                          type="checkbox"
                          readOnly
                          checked={selectedStatuses.includes(opt.key)}
                          className={checkboxInput}
                        />
                        {opt.label}
                      </DropdownItem>
                    ))}
                  </DropdownList>
                </Dropdown>
              </InputGroupItem>
              <InputGroupItem isFill>
                <SearchInput
                  id="environment-search"
                  aria-label="Search by name"
                  placeholder="Search by name"
                  value={search}
                  onChange={(_event, value) => setSearch(value)}
                  onClear={() => setSearch("")}
                  className={searchInputStyle}
                />
              </InputGroupItem>
            </InputGroup>
          </ToolbarItem>
          <ToolbarItem>
            {hasSources && onAddEnvironment ? (
              <Button
                variant="primary"
                onClick={onAddEnvironment}
                icon={<RhUiAddCircleIcon />}
              >
                Add environment
              </Button>
            ) : null}
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      {selectedStatuses.length > 0 && (
        <div className={filterChipsContainer}>
          <div className={filterChipsWrapper}>
            <span className={filterBadge}>Filters</span>

            {((): JSX.Element => {
              const MAX_STATUS_CHIPS = 6;
              const visible = selectedStatuses.slice(0, MAX_STATUS_CHIPS);
              const overflow = selectedStatuses.length - visible.length;
              const hidden = selectedStatuses.slice(MAX_STATUS_CHIPS);
              const labelMap = new Map(
                statusOptions.map((s) => [s.key, s.label]),
              );
              return (
                <>
                  {visible.map((key) => (
                    <FilterPill
                      key={`chip-status-${key}`}
                      label={`status=${labelMap.get(key) ?? key}`}
                      ariaLabel={`Remove status ${labelMap.get(key) ?? key}`}
                      onClear={() => toggleStatus(key)}
                    />
                  ))}
                  {overflow > 0 && (
                    <FilterPill
                      key="status-overflow"
                      label={`${overflow} more`}
                      ariaLabel="Remove hidden statuses"
                      onClear={() => {
                        hidden.forEach((k) => toggleStatus(k));
                      }}
                    />
                  )}
                </>
              );
            })()}

            <Button
              icon={<RhUiCloseIcon />}
              variant="plain"
              aria-label="Clear all filters"
              onClick={() => clearStatuses()}
            />
          </div>
        </div>
      )}
      <div className={tableContainerStyle}>
        <Table
          aria-label="Sources table"
          variant="compact"
          borders={false}
          isStickyHeader
          gridBreakPoint="grid-md"
        >
          <Thead>
            <Tr>
              <Th
                className={tableHeaderNormal}
                sort={getSortParams("Name")}
                modifier="nowrap"
              >
                {Columns.Name}
              </Th>
              <Th
                className={tableHeaderNormal}
                sort={getSortParams("Status")}
                modifier="nowrap"
              >
                {Columns.Status}
              </Th>
              <Th
                className={tableHeaderNormal}
                sort={getSortParams("VersionStatus")}
                modifier="nowrap"
              >
                {Columns.VersionStatus}
              </Th>
              <Th
                className={tableHeaderNormal}
                sort={getSortParams("Hosts")}
                modifier="nowrap"
              >
                {Columns.Hosts}
              </Th>
              <Th
                className={tableHeaderNormal}
                sort={getSortParams("VMs")}
                modifier="nowrap"
              >
                {Columns.VMs}
              </Th>
              <Th
                className={tableHeaderWide}
                sort={getSortParams("Networks")}
                modifier="nowrap"
              >
                {Columns.Networks}
              </Th>
              <Th
                className={tableHeaderWide}
                sort={getSortParams("Datastores")}
                modifier="nowrap"
              >
                {Columns.Datastores}
              </Th>
              <Th
                className={tableHeaderNormal}
                sort={getSortParams("LastSeen")}
                modifier="nowrap"
              >
                {Columns.LastSeen}
              </Th>
              <Th modifier="fitContent" screenReaderText="Actions">
                {Columns.Actions}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {showNoResultFound && (
              <Tr>
                <Td colSpan={9}>
                  <EmptySearchResults title="No matching environment found" />
                </Td>
              </Tr>
            )}
            {filteredSources.map((source) => {
              // Get the agent related to this source
              const agent = source.agent;
              const isReportAvailable = Boolean(
                sourceToAssessmentId[source.id],
              );
              const isUploadAllowed = !source.agent || source.onPremises;
              return (
                <Tr key={source.id}>
                  <Td dataLabel={Columns.Name} className={tableCellTop}>
                    {source.name}
                  </Td>
                  <Td dataLabel={Columns.Status} className={tableCellTop}>
                    <AgentStatusView
                      status={source.displayStatus}
                      statusInfo={
                        source.isReady
                          ? undefined
                          : agent
                            ? agent.statusInfo
                            : "Not connected"
                      }
                      credentialUrl={agent ? agent.credentialUrl : ""}
                      uploadedManually={isInventoryUploadedManually(source)}
                      updatedAt={source?.updatedAt}
                    />
                  </Td>
                  <Td
                    dataLabel={Columns.VersionStatus}
                    className={tableCellTop}
                  >
                    <VersionStatus
                      displayStatus={source.displayStatus}
                      isUploadedManually={isSourceUploadedManually(source)}
                      agentVersion={source.agentVersion}
                      agentVersionWarning={source.agentVersionWarning}
                    />
                  </Td>
                  <Td dataLabel={Columns.Hosts} className={tableCellTop}>
                    {source?.inventory?.vcenter?.infra.totalHosts ??
                      VALUE_NOT_AVAILABLE}
                  </Td>
                  <Td dataLabel={Columns.VMs} className={tableCellTop}>
                    {source?.inventory?.vcenter?.vms.total ??
                      VALUE_NOT_AVAILABLE}
                  </Td>
                  <Td dataLabel={Columns.Networks} className={tableCellTop}>
                    {source?.inventory?.vcenter?.infra.networks?.length ??
                      VALUE_NOT_AVAILABLE}
                  </Td>
                  <Td dataLabel={Columns.Datastores} className={tableCellTop}>
                    {source?.inventory?.vcenter?.infra.datastores?.length ??
                      VALUE_NOT_AVAILABLE}
                  </Td>
                  <Td dataLabel={Columns.LastSeen} className={tableCellTop}>
                    {source?.updatedAt ? (
                      <Tooltip
                        {...themeTooltipFlyoutProps}
                        content={new Date(source.updatedAt).toLocaleString()}
                      >
                        <span>{formatRelativeTime(source.updatedAt)}</span>
                      </Tooltip>
                    ) : (
                      "-"
                    )}
                  </Td>
                  <Td dataLabel={Columns.Actions} modifier="fitContent">
                    {uploadOnly ? (
                      <>
                        {isUploadAllowed && source.name !== "Example" && (
                          <UploadInventoryAction sourceId={source.id} />
                        )}
                      </>
                    ) : (
                      <Dropdown
                        isOpen={openDropdowns[source.id] || false}
                        popperProps={{
                          appendTo: () => document.body,
                          position: "end",
                        }}
                        onOpenChange={(isOpen) =>
                          setOpenDropdowns((prev) => ({
                            ...prev,
                            [source.id]: isOpen,
                          }))
                        }
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            aria-label="Actions"
                            variant="plain"
                            onClick={() =>
                              setOpenDropdowns((prev) => ({
                                ...prev,
                                [source.id]: !prev[source.id],
                              }))
                            }
                            icon={<RhUiEllipsisVerticalIcon />}
                            style={{ padding: 0, width: "fit-content" }}
                          ></MenuToggle>
                        )}
                      >
                        <DropdownList>
                          <DropdownItem
                            isDisabled={!isReportAvailable}
                            onClick={() => handleShowReport(source.id)}
                          >
                            Show assessment report
                          </DropdownItem>
                          <DropdownItem
                            description="Based on this environment"
                            onClick={() => handleCreateAssessment(source.id)}
                          >
                            Create new assessment
                          </DropdownItem>
                          <DropdownItem
                            isDisabled={
                              !isUploadAllowed || source.name === "Example"
                            }
                            onClick={() => handleUploadFile(source.id)}
                          >
                            Upload file
                          </DropdownItem>
                          <DropdownItem
                            isDisabled={!onDownloadOva}
                            onClick={() => {
                              setOpenDropdowns((prev) => ({
                                ...prev,
                                [source.id]: false,
                              }));
                              onDownloadOva?.(source.id);
                            }}
                          >
                            Download OVA
                          </DropdownItem>
                          <DropdownItem
                            isDisabled={!onEditEnvironment}
                            onClick={() => {
                              setOpenDropdowns((prev) => ({
                                ...prev,
                                [source.id]: false,
                              }));
                              onEditEnvironment?.(source.id);
                            }}
                          >
                            Edit environment
                          </DropdownItem>
                          <DropdownItem
                            isDisabled={
                              vm.isDeletingSource || source.name === "Example"
                            }
                            onClick={() => setDeleteTarget(source)}
                          >
                            Delete environment
                          </DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </div>
      {deleteTarget && (
        <ConfirmationModal
          title="Delete Environment"
          titleIconVariant="warning"
          isOpen={Boolean(deleteTarget)}
          isDisabled={vm.isDeletingAndRefreshing}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget) {
              handleDelete(deleteTarget);
            }
          }}
          onClose={() => setDeleteTarget(null)}
        >
          Are you sure you want to delete{" "}
          <b>{deleteTarget.name || "this environment"}</b>?
          <br />
          To use it again, create a new discovery image and redeploy it.
        </ConfirmationModal>
      )}
    </div>
  );
};
