import { useInjection } from "@openshift-migration-advisor/ioc";
import type {
  AssessmentSubsetInventory,
  ClusterRequirementsResponse,
  Infra,
  InventoryData,
  Job,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";
import { JobStatus } from "@openshift-migration-advisor/planner-sdk";
import type { PdfTextPage } from "@openshift-migration-advisor/shared-components";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAsyncFn, useMount } from "react-use";

import { Symbols } from "../../../config/Dependencies";
import type { IAssessmentsStore } from "../../../data/stores/interfaces/IAssessmentsStore";
import type { IJobsStore } from "../../../data/stores/interfaces/IJobsStore";
import type { ISourcesStore } from "../../../data/stores/interfaces/ISourcesStore";
import {
  JOB_POLLING_INTERVAL,
  type RvtoolsFileUploadResult,
  type RvtoolsUploadState,
  TERMINAL_JOB_STATUSES,
} from "../../../data/stores/JobsStore";
import { MAX_RVTOOLS_FILES } from "../../assessment/helpers/rvtoolsFileRules";
import {
  bootstrapRvtoolsSourceFilesFromSubsets,
  getRvtoolsSourceFiles,
  recordRvtoolsSourceFiles,
  type StoredRvtoolsSourceFile,
} from "../../assessment/helpers/rvtoolsSourceFilesStorage";
import type { RvtoolsSourceFileDraftRow } from "../views/rvtools/RvtoolsSourceFilesModal";
import {
  applyRvtoolsUploadOutcome,
  buildAppendRvtoolsToastMessage,
  getActiveRvtoolsPendingBatch,
  type RvtoolsPendingUploadBatch,
} from "../../assessment/helpers/rvtoolsUploadOutcome";
import { useIsPartner } from "../../../hooks/useIdentity";
import type { AssessmentModel } from "../../../models/AssessmentModel";
import type { SourceModel } from "../../../models/SourceModel";
import { routes } from "../../../routing/Routes";
import type { SnapshotLike } from "../../../services/html-export/types";
import { isUploadedFileSourceType } from "../../assessment/helpers/assessmentSource";
import {
  ALL_CLUSTERS_ID,
  buildClusterViewModel,
  type ClusterViewModel,
  resolveSelectedClusterId,
} from "../helpers/clusterViewModel";
import {
  extractScopedInventoryData,
  type ReportInventorySource,
} from "../helpers/groupInventoryFilter";
import {
  ALL_VMS_GROUP_ID,
  buildGroupViewModel,
  computeClusterSelectDisabled,
} from "../helpers/groupViewModel";
import {
  resolveRvtoolsEffectiveVcenterSubsetId,
  resolveRvtoolsScopedVcenterApiId,
  rvtoolsSubsetInventoriesFromSnapshot,
} from "../helpers/rvtoolsReportInventoryScope";
import {
  isControlPlaneOnlyClusterMode,
  type SizingFormValues,
} from "../views/cluster-sizer/types";
import {
  getOptimizationStatusMessage,
  hasUtilizationComparison,
} from "../views/cluster-sizer/UtilizationSizing";
import { isRecommendationToolAvailable } from "../views/migration-recommendations/constants";
import {
  type RecommendationToolId,
  type ReportContentTab,
  reportTabFromSearch,
} from "../views/migration-recommendations/types";
import {
  formatNumber,
  formatRatio,
  getCpuOvercommitLabel,
  getMemoryOvercommitLabel,
} from "./ClusterSizingHelpers";
import { useGroupInventoryFilter } from "./useGroupInventoryFilter";
import { useReportV2InventoryScope } from "./useReportV2InventoryScope";

// ---------------------------------------------------------------------------
// Sizing → PDF page builder
// ---------------------------------------------------------------------------

/**
 * Build the "Cluster sizing recommendations" PDF page for one calculated
 * cluster. Mirrors the fields shown in `SizingResult` so the exported PDF
 * matches what the user sees on screen (including the utilization-optimized
 * sizing when available).
 *
 * @see OMA-2414 - PDF export was dropping this section entirely after the
 * report moved to the shared chart-export component, because the chart
 * registry only captures registered chart/card elements, not the sizing
 * wizard's result panel.
 */
const buildClusterSizingPdfPage = (data: SizingPdfData): PdfTextPage => {
  const { result, formValues, clusterName } = data;
  const isSNO = isControlPlaneOnlyClusterMode(formValues.clusterMode);
  const isOptimized = hasUtilizationComparison(result);
  const displaySizing =
    isOptimized && result.optimizedSizing
      ? result.optimizedSizing
      : result.clusterSizing;
  const hasControlPlane = displaySizing.controlPlaneNodes > 0;

  const cpuOverCommitRatio =
    result.resourceConsumption.overCommitRatio?.cpu ?? 0;
  const memoryOverCommitRatio =
    result.resourceConsumption.overCommitRatio?.memory ?? 0;
  const cpuLimits = result.resourceConsumption.limits?.cpu ?? 0;
  const memoryLimits = result.resourceConsumption.limits?.memory ?? 0;

  const items: PdfTextPage["items"] = [
    { label: "Cluster name", value: clusterName },
    { label: "Target platform", value: "Bare metal" },
  ];

  if (isSNO) {
    items.push(
      {
        label: "Total nodes",
        value: String(displaySizing.totalNodes),
      },
      {
        label: "Node size",
        value: `${formValues.controlPlaneCpu} CPU, ${formValues.controlPlaneMemoryGb} GB memory`,
      },
      {
        label: "VMs to migrate",
        value: formatNumber(result.inventoryTotals.totalVMs),
      },
      {
        label: "VM resources (request)",
        value: `${formatNumber(result.inventoryTotals.totalCPU)} CPU, ${formatNumber(result.inventoryTotals.totalMemory)} GB memory`,
      },
    );
  } else {
    items.push(
      {
        label: "Total nodes",
        value: `${displaySizing.totalNodes} (${displaySizing.workerNodes} workers + ${displaySizing.controlPlaneNodes} control plane)`,
      },
      {
        label: "Failover capacity",
        value: `${displaySizing.failoverNodes} failover nodes`,
      },
    );

    if (hasControlPlane) {
      items.push(
        {
          label: "Worker node size",
          value: `${formValues.customCpu} CPU, ${formValues.customMemoryGb} GB memory`,
        },
        {
          label: "Control plane node size",
          value: `${formValues.controlPlaneCpu} CPU, ${formValues.controlPlaneMemoryGb} GB memory`,
        },
      );
    } else {
      items.push({
        label: "Node size",
        value: `${formValues.customCpu} CPU, ${formValues.customMemoryGb} GB memory`,
      });
    }

    items.push(
      {
        label: "Overcommitment",
        value: `CPU ${getCpuOvercommitLabel(formValues.cpuOvercommitRatio)}, Memory ${getMemoryOvercommitLabel(formValues.memoryOvercommitRatio)}`,
      },
      {
        label: "VMs to migrate",
        value: formatNumber(result.inventoryTotals.totalVMs),
      },
      {
        label: "CPU over-commit ratio",
        value: formatRatio(cpuOverCommitRatio),
      },
      {
        label: "Memory over-commit ratio",
        value: formatRatio(memoryOverCommitRatio),
      },
      {
        label: "VM resources (request)",
        value: `${formatNumber(result.inventoryTotals.totalCPU)} CPU, ${formatNumber(result.inventoryTotals.totalMemory)} GB memory`,
      },
      {
        label: "With over-commit (limits)",
        value: `${formatNumber(cpuLimits)} CPU, ${formatNumber(memoryLimits)} GB memory`,
      },
      {
        label: "Physical capacity",
        value: `${formatNumber(displaySizing.totalCPU)} CPU, ${formatNumber(displaySizing.totalMemory)} GB memory`,
      },
    );
  }

  if (isOptimized) {
    items.push({
      label: "Sizing basis",
      value: "Based on actual utilization (right-sized)",
    });
  } else {
    const optimizationNote = getOptimizationStatusMessage(result);
    if (optimizationNote) {
      items.push({ label: "Note", value: optimizationNote });
    }
  }

  return {
    title: `Cluster sizing recommendations — ${clusterName}`,
    items,
    footer:
      "Note: Resource requirements are estimates based on current workloads. Please verify this architecture with your SME team to ensure optimal performance.",
  };
};

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

/** Sizing result cached for inclusion in the PDF export. */
export interface SizingPdfData {
  result: ClusterRequirementsResponse;
  formValues: SizingFormValues;
  clusterName: string;
  clusterId: string;
}

export interface ReportPageViewModel {
  // Route param
  assessmentId: string | undefined;

  // Data (reactive from stores)
  assessment: AssessmentLike | undefined;
  source: SourceModel | undefined;
  isLoadingData: boolean;

  // Cluster view
  clusterView: ClusterViewModel;
  selectedClusterId: string;
  selectCluster: (clusterId: string) => void;
  isClusterSelectOpen: boolean;
  setClusterSelectOpen: (open: boolean) => void;
  clusterSelectDisabled: boolean;

  // Group view (subset inventories from GET assessment)
  groupView: ReturnType<typeof useGroupInventoryFilter>["groupView"];
  selectedGroupId: string;
  selectGroup: (groupId: string) => void;
  isGroupSelectOpen: boolean;
  setGroupSelectOpen: (open: boolean) => void;

  // Computed data from latest snapshot
  infra: Infra | undefined;
  vms: VMs | undefined;
  clusters: { [key: string]: InventoryData } | undefined;
  latestSnapshot: SnapshotLike;
  lastUpdatedText: string;
  clusterCount: number;
  reportSummaryVms: VMs | undefined;
  vcenterId: string | undefined;
  vcenterVersion: string | undefined;

  // Scoped cluster view (typed with required fields for Dashboard rendering)
  scopedClusterView: ClusterScopedView | undefined;
  canExportReport: boolean;
  canShowClusterRecommendations: boolean;
  canUseRecommendationTools: boolean;
  isPartner: boolean;

  // Missing metrics (old inventories lacking CPU/Memory data)
  missingMetrics: string[];
  hasMissingMetrics: boolean;

  // Export
  exportDocumentTitle: string;
  /**
   * Native-text PDF pages for calculated cluster sizing recommendations,
   * scoped to the active cluster/group selection. Passed through to
   * `useChartExport().downloadPdf` so the PDF export includes this data
   * even though it is not rendered as a chart/card.
   */
  pdfExtraPages: PdfTextPage[];

  // Report tabs + recommendation tools
  activeReportTab: ReportContentTab;
  setActiveReportTab: (tab: ReportContentTab) => void;
  selectedRecommendationTool: RecommendationToolId | null;
  openRecommendationTool: (toolId: RecommendationToolId) => void;
  closeRecommendationTool: () => void;
  /**
   * All sizing results calculated in this session, keyed by clusterId.
   */
  savedSizingDataMap: Record<string, SizingPdfData>;
  onSizingCalculated: (data: SizingPdfData) => void;

  // RVTools modals (create new assessment or append to this report)
  rvtoolsModalMode: "create" | "append";
  isRvtoolsModalOpen: boolean;
  openRvtoolsModal: () => void;
  openAppendRvtoolsModal: () => void;
  closeRvtoolsModal: () => void;
  createRVToolsJob: (name: string, files: File[]) => Promise<void>;
  appendRvtoolsFiles: (files: File[]) => Promise<void>;
  cancelRVToolsJob: () => Promise<void>;
  isCreatingJob: boolean;
  jobCreateError?: Error;
  isJobProcessing: boolean;
  jobProgressValue: number;
  jobProgressLabel: string;
  jobError: Error | null;
  rvtoolsUpload?: RvtoolsUploadState;
  isNavigatingToReport: boolean;
  rvtoolsAppendSuccessMessage: string | null;
  dismissRvtoolsAppendSuccess: () => void;
  rvtoolsAppendNotice: {
    variant: "success" | "warning";
    message: string;
  } | null;
  dismissRvtoolsAppendNotice: () => void;
  removeRvtoolsUploadResult: (fileName: string, fileSize: number) => void;
  canAppendRvtoolsFiles: boolean;
  rvtoolsPendingUploadBatch: RvtoolsPendingUploadBatch | null;
  isRvtoolsUploadWarningDismissed: boolean;
  dismissRvtoolsUploadWarning: () => void;
  isReviewRvtoolsFailuresOpen: boolean;
  setReviewRvtoolsFailuresOpen: (open: boolean) => void;
  openAppendRvtoolsFromErrorReview: () => void;
  isSourceFilesModalOpen: boolean;
  openSourceFilesModal: () => void;
  closeSourceFilesModal: () => void;
  sourceFileDraftRows: RvtoolsSourceFileDraftRow[];
  replaceSourceFileDraftRow: (rowId: string, file: File) => void;
  removeSourceFileDraftRow: (rowId: string) => void;
  submitNewAssessmentFromSourceDraft: () => void;
  isSourceDraftSubmitting: boolean;
  showSourceCreateFailedAlert: boolean;
  rvtoolsSourceFiles: StoredRvtoolsSourceFile[];
  rvtoolsRemainingFileSlots: number;
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

type AssessmentLike = {
  id: string | number;
  sourceId?: string;
  name?: string;
  sourceType?: string;
  snapshots?: SnapshotLike[];
};

type ClusterScopedView = ClusterViewModel &
  Required<
    Pick<ClusterViewModel, "viewInfra" | "viewVms" | "cpuCores" | "ramGB">
  >;

// ---------------------------------------------------------------------------
// Private helpers — job progress mappers
// ---------------------------------------------------------------------------

const getProgressValue = (status: JobStatus): number => {
  switch (status) {
    case JobStatus.Pending:
      return 20;
    case JobStatus.Validating:
      return 50;
    case JobStatus.Parsing:
      return 80;
    case JobStatus.Completed:
      return 100;
    default:
      return 0;
  }
};

const getProgressLabel = (status: JobStatus): string => {
  switch (status) {
    case JobStatus.Pending:
      return "Uploading file..";
    case JobStatus.Parsing:
      return "Parsing data..";
    case JobStatus.Validating:
      return "Validating vms..";
    case JobStatus.Completed:
      return "Complete!";
    case JobStatus.Failed:
      return "Failed";
    case JobStatus.Cancelled:
      return "Cancelled";
    default:
      return "";
  }
};

const extractJobErrorMessage = (message: string): string => {
  const lastColonIndex = message.lastIndexOf(":");
  return lastColonIndex !== -1
    ? message.slice(lastColonIndex + 1).trim()
    : message;
};

// ---------------------------------------------------------------------------
// Hook implementation
// ---------------------------------------------------------------------------

export const useReportPageViewModel = (): ReportPageViewModel => {
  // ---- Route params --------------------------------------------------------
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeReportTab = reportTabFromSearch(searchParams.get("tab"));
  const setActiveReportTab = useCallback(
    (tab: ReportContentTab) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (tab === "report") {
            next.delete("tab");
          } else {
            next.set("tab", tab);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // ---- Stores --------------------------------------------------------------
  const assessmentsStore = useInjection<IAssessmentsStore>(
    Symbols.AssessmentsStore,
  );
  const sourcesStore = useInjection<ISourcesStore>(Symbols.SourcesStore);
  const jobsStore = useInjection<IJobsStore>(Symbols.JobsStore);

  // ---- Reactive store data -------------------------------------------------
  const assessments = useSyncExternalStore(
    assessmentsStore.subscribe.bind(assessmentsStore),
    assessmentsStore.getSnapshot.bind(assessmentsStore),
  );

  const sources = useSyncExternalStore(
    sourcesStore.subscribe.bind(sourcesStore),
    sourcesStore.getSnapshot.bind(sourcesStore),
  );

  const jobState = useSyncExternalStore(
    jobsStore.subscribe.bind(jobsStore),
    jobsStore.getSnapshot.bind(jobsStore),
  );

  const isPartner = useIsPartner();

  // ---- Initial data fetch (always GET assessment for subset inventory data) --
  const [fetchState, doFetchData] = useAsyncFn(async () => {
    const sourcesPromise = sourcesStore.list();

    if (id) {
      // LIST responses omit subset inventories. The SDK also normalizes a missing
      // field to `subsetInventories: undefined`, so cache heuristics cannot tell
      // list data apart from a GET response with no groups — always fetch by ID.
      await Promise.all([assessmentsStore.get(id), sourcesPromise]);
      return;
    }

    await Promise.all([assessmentsStore.list(), sourcesPromise]);
  }, [assessmentsStore, sourcesStore, id]);

  useMount(() => {
    void doFetchData();
  });

  // ---- Assessment lookup ---------------------------------------------------
  const assessment = useMemo(
    () =>
      assessments?.find((a: AssessmentModel) => String(a.id) === String(id)),
    [assessments, id],
  );

  // ---- Source lookup -------------------------------------------------------
  const source = useMemo(
    () =>
      assessment?.sourceId
        ? sources.find((entry) => entry.id === assessment.sourceId)
        : undefined,
    [assessment, sources],
  );

  // ---- Local UI state ------------------------------------------------------
  const [userSelectedClusterId, setUserSelectedClusterId] = useState<
    string | null
  >(null);
  const [isClusterSelectOpen, setIsClusterSelectOpen] = useState(false);
  const [selectedRecommendationTool, setSelectedRecommendationTool] =
    useState<RecommendationToolId | null>(null);
  const [savedSizingDataMap, setSavedSizingDataMap] = useState<
    Record<string, SizingPdfData>
  >({});

  const onSizingCalculated = useCallback((data: SizingPdfData): void => {
    setSavedSizingDataMap((prev) => ({ ...prev, [data.clusterId]: data }));
  }, []);

  // ---- Snapshot data -------------------------------------------------------
  const latestSnapshot = useMemo((): SnapshotLike => {
    if (assessment?.snapshotsSorted?.length) {
      return assessment.snapshotsSorted[0];
    }

    const snapshots = assessment?.snapshots ?? [];
    return snapshots.length > 0 ? snapshots[snapshots.length - 1] : {};
  }, [assessment]);

  const subsetInventories = useMemo((): AssessmentSubsetInventory[] => {
    const fromSnapshot = latestSnapshot.subsetInventories ?? [];
    // VM group filter applies to discovery OVA assessments only (see isUploadedFileSourceType).
    if (
      !assessment?.sourceType ||
      isUploadedFileSourceType(String(assessment.sourceType))
    ) {
      return [];
    }
    return fromSnapshot;
  }, [assessment, latestSnapshot.subsetInventories]);

  const rvtoolsSubsetInventories = useMemo(
    (): AssessmentSubsetInventory[] =>
      rvtoolsSubsetInventoriesFromSnapshot(
        assessment?.sourceType,
        latestSnapshot.subsetInventories,
      ),
    [assessment?.sourceType, latestSnapshot.subsetInventories],
  );

  const [
    userSelectedRvtoolsVcenterSubsetId,
    setUserSelectedRvtoolsVcenterSubsetId,
  ] = useState<string | null>(null);

  useEffect(() => {
    setUserSelectedRvtoolsVcenterSubsetId(null);
  }, [id]);

  const rvtoolsEffectiveVcenterSubsetId = useMemo(
    () =>
      resolveRvtoolsEffectiveVcenterSubsetId(
        rvtoolsSubsetInventories,
        userSelectedRvtoolsVcenterSubsetId,
      ),
    [rvtoolsSubsetInventories, userSelectedRvtoolsVcenterSubsetId],
  );

  const scopedVcenterApiId = useMemo(
    () =>
      resolveRvtoolsScopedVcenterApiId(
        rvtoolsSubsetInventories,
        rvtoolsEffectiveVcenterSubsetId,
      ),
    [rvtoolsEffectiveVcenterSubsetId, rvtoolsSubsetInventories],
  );

  const fullInventory = useMemo(
    () => latestSnapshot.inventory as ReportInventorySource | undefined,
    [latestSnapshot.inventory],
  );

  const resetClusterSelection = useCallback(() => {
    setUserSelectedClusterId(null);
    setSelectedRecommendationTool(null);
  }, []);

  const {
    selectedGroupId,
    groupView,
    activeInventory: groupFilterInventory,
    isGroupSelectOpen,
    setIsGroupSelectOpen,
    selectGroup,
  } = useGroupInventoryFilter({
    subsetInventories,
    fullInventory,
    onGroupChange: resetClusterSelection,
  });

  const useV2ReportInventory = assessment?.sourceType === "rvtools";

  const { activeInventory: v2ScopedInventory, inventoryLoading } =
    useReportV2InventoryScope({
      enabled: useV2ReportInventory,
      assessmentId: id,
      userSelectedClusterId,
      scopedVcenterApiId,
      aggregateInventory: fullInventory,
      assessmentsStore,
    });

  const activeInventory = useV2ReportInventory
    ? v2ScopedInventory
    : groupFilterInventory;

  const { infra, vms, clusters, vcenterId, vcenterVersion } = useMemo(
    () => extractScopedInventoryData(activeInventory, latestSnapshot),
    [activeInventory, latestSnapshot],
  );

  const reportSummaryVms = useMemo(
    () =>
      (latestSnapshot.vms ||
        latestSnapshot.inventory?.vms ||
        latestSnapshot.inventory?.vcenter?.vms) as VMs | undefined,
    [latestSnapshot],
  );

  const reportSummaryClusterCount = useMemo(() => {
    const summaryClusters = latestSnapshot.inventory?.clusters as
      { [key: string]: InventoryData } | undefined;
    return summaryClusters ? Object.keys(summaryClusters).length : 0;
  }, [latestSnapshot.inventory?.clusters]);

  // ---- Cluster selection ---------------------------------------------------
  const selectedClusterId = useMemo(
    () => resolveSelectedClusterId(userSelectedClusterId, clusters),
    [userSelectedClusterId, clusters],
  );

  const hasClusterResources = useCallback(
    (viewInfra?: Infra, viewVms?: VMs): boolean => {
      const totalHosts = viewInfra?.totalHosts ?? 0;
      const hostsCount = viewInfra?.hosts?.length ?? 0;
      const hasHosts = totalHosts > 0 || hostsCount > 0;
      const hasVms = (viewVms?.total ?? 0) > 0;
      return hasHosts && hasVms;
    },
    [],
  );

  const selectCluster = useCallback(
    (clusterId: string) => {
      setUserSelectedClusterId(clusterId);
      setSelectedRecommendationTool((current) => {
        if (current == null) {
          return current;
        }
        const isAggregate = clusterId === ALL_CLUSTERS_ID;
        if (
          !isRecommendationToolAvailable(current, {
            isAggregateView: isAggregate,
            isPartner,
          })
        ) {
          return null;
        }
        if (current === "architecture") {
          const targetInfra = isAggregate
            ? infra
            : clusters?.[clusterId]?.infra;
          const targetVms = isAggregate ? vms : clusters?.[clusterId]?.vms;
          return hasClusterResources(targetInfra, targetVms) ? current : null;
        }
        return current;
      });
    },
    [clusters, hasClusterResources, infra, isPartner, vms],
  );

  const openRecommendationTool = useCallback((toolId: RecommendationToolId) => {
    setSelectedRecommendationTool(toolId);
  }, []);

  const closeRecommendationTool = useCallback(() => {
    setSelectedRecommendationTool(null);
  }, []);

  // ---- Cluster view model --------------------------------------------------
  const clusterView = useMemo(
    () =>
      buildClusterViewModel({
        infra,
        vms,
        clusters,
        selectedClusterId,
      }),
    [infra, vms, clusters, selectedClusterId],
  );

  const clusterSelectDisabled = computeClusterSelectDisabled(
    clusterView.clusterOptions.length,
    groupView.showGroupFilter ||
      (useV2ReportInventory && rvtoolsSubsetInventories.length > 1),
    groupView.showGroupFilter
      ? selectedGroupId
      : rvtoolsEffectiveVcenterSubsetId,
  );

  const rvtoolsVcenterFilterView = useMemo(
    () =>
      buildGroupViewModel({
        subsetInventories: rvtoolsSubsetInventories,
        selectedGroupId: rvtoolsEffectiveVcenterSubsetId,
      }),
    [rvtoolsEffectiveVcenterSubsetId, rvtoolsSubsetInventories],
  );

  const reportFilterGroupView = useMemo(() => {
    if (groupView.showGroupFilter) {
      return groupView;
    }
    if (useV2ReportInventory && rvtoolsSubsetInventories.length > 1) {
      return { ...rvtoolsVcenterFilterView, showGroupFilter: true };
    }
    return groupView;
  }, [
    groupView,
    rvtoolsSubsetInventories.length,
    rvtoolsVcenterFilterView,
    useV2ReportInventory,
  ]);

  const selectReportFilterGroup = useCallback(
    (groupId: string) => {
      if (groupView.showGroupFilter) {
        selectGroup(groupId);
        return;
      }
      if (useV2ReportInventory && rvtoolsSubsetInventories.length > 1) {
        setUserSelectedRvtoolsVcenterSubsetId(groupId);
        resetClusterSelection();
        setIsGroupSelectOpen(false);
      }
    },
    [
      groupView.showGroupFilter,
      resetClusterSelection,
      rvtoolsSubsetInventories.length,
      selectGroup,
      useV2ReportInventory,
    ],
  );

  // ---- Scoped cluster view -------------------------------------------------
  const isClusterScopedData = useCallback(
    (view: ClusterViewModel): view is ClusterScopedView =>
      Boolean(view.viewInfra && view.viewVms && view.cpuCores && view.ramGB),
    [],
  );

  const scopedClusterView = isClusterScopedData(clusterView)
    ? clusterView
    : undefined;

  // ---- Resource checks -----------------------------------------------------
  const canShowClusterRecommendations = hasClusterResources(
    clusterView.viewInfra,
    clusterView.viewVms,
  );

  const canUseRecommendationTools = (clusterView.viewVms?.total ?? 0) > 0;

  const canExportReport = useMemo((): boolean => {
    if (hasClusterResources(clusterView.viewInfra, clusterView.viewVms)) {
      return true;
    }
    if (!clusters) {
      return false;
    }
    return Object.values(clusters).some((cluster) =>
      hasClusterResources(cluster.infra, cluster.vms),
    );
  }, [
    clusterView.viewInfra,
    clusterView.viewVms,
    clusters,
    hasClusterResources,
  ]);

  // ---- Last updated text ---------------------------------------------------
  const lastUpdatedText = useMemo((): string => {
    // Delegate to the domain model's pre-computed latestSnapshot
    const model = assessment;
    return model?.latestSnapshot?.lastUpdated || "-";
  }, [assessment]);

  // ---- Missing metrics detection -------------------------------------------
  // Uses the scoped (cluster-level) data that the Dashboard actually renders,
  // falling back to the aggregate snapshot data when no scoped view exists.
  const missingMetrics = useMemo((): string[] => {
    const activeVms = scopedClusterView?.viewVms ?? vms;
    const activeInfra = scopedClusterView?.viewInfra ?? infra;
    if (!activeVms || activeVms.total === 0) return [];

    const missing: string[] = [];

    const isEmpty = (
      obj: Record<string, unknown> | undefined | null,
    ): boolean => !obj || Object.keys(obj).length === 0;

    const isCpuMissing =
      !activeVms.cpuCores ||
      activeVms.cpuCores.total === 0 ||
      isEmpty(activeVms.distributionByCpuTier);
    if (isCpuMissing) missing.push("CPU");

    const isMemoryMissing =
      !activeVms.ramGB ||
      activeVms.ramGB.total === 0 ||
      isEmpty(activeVms.distributionByMemoryTier);
    if (isMemoryMissing) missing.push("Memory");

    if (isEmpty(activeVms.osInfo) && isEmpty(activeVms.os))
      missing.push("Operating systems");
    if (isEmpty(activeVms.diskSizeTier)) missing.push("Disk size tiers");
    if (isEmpty(activeVms.diskTypes)) missing.push("Disk types");
    if (!activeInfra?.hosts || activeInfra.hosts.length === 0)
      missing.push("Hosts");
    if (!activeInfra?.networks || activeInfra.networks.length === 0)
      missing.push("Networks");
    if (
      isEmpty(activeVms.distributionByNicCount) &&
      (!activeVms.nicCount || !activeVms.nicCount.total)
    )
      missing.push("NIC count");

    return missing;
  }, [scopedClusterView, vms, infra]);

  // ---- Export title (live chart capture is owned by ChartExportProvider) ---
  const exportDocumentTitle = useMemo((): string => {
    const groupSuffix =
      selectedGroupId !== ALL_VMS_GROUP_ID
        ? ` - ${groupView.selectionLabel}`
        : "";
    return `${assessment?.name || `Assessment ${id}`} - vCenter report${groupSuffix}`;
  }, [assessment?.name, id, selectedGroupId, groupView.selectionLabel]);

  // Scope sizing results to what's currently in view:
  // - Single cluster view → only that cluster (if calculated)
  // - All-clusters view → every sized cluster within the active group inventory
  const pdfExtraPages = useMemo((): PdfTextPage[] => {
    const scopedClusterIds = new Set(clusters ? Object.keys(clusters) : []);
    const sizingEntries =
      selectedClusterId === ALL_CLUSTERS_ID
        ? Object.values(savedSizingDataMap).filter((entry) =>
            scopedClusterIds.has(entry.clusterId),
          )
        : savedSizingDataMap[selectedClusterId]
          ? [savedSizingDataMap[selectedClusterId]]
          : [];

    return sizingEntries.map(buildClusterSizingPdfPage);
  }, [clusters, savedSizingDataMap, selectedClusterId]);

  // ---- RVTools modal (create or append on report page) ---------------------
  const [isRvtoolsModalOpen, setIsRvtoolsModalOpen] = useState(false);
  const [rvtoolsModalMode, setRvtoolsModalMode] = useState<"create" | "append">(
    "create",
  );
  const [rvtoolsAppendSuccessMessage, setRvtoolsAppendSuccessMessage] =
    useState<string | null>(null);
  const [rvtoolsAppendNotice, setRvtoolsAppendNotice] = useState<{
    variant: "success" | "warning";
    message: string;
  } | null>(null);
  const [rvtoolsSourceFiles, setRvtoolsSourceFiles] = useState<
    StoredRvtoolsSourceFile[]
  >([]);
  const [activeRvtoolsJobIntent, setActiveRvtoolsJobIntent] = useState<
    "create" | "append" | null
  >(null);
  const activeRvtoolsJobIntentRef = useRef<"create" | "append" | null>(null);
  const sourceRecreateKeptNamesRef = useRef<string[]>([]);
  const isSourceRecreateFlowRef = useRef(false);

  const setRvtoolsJobIntent = useCallback(
    (intent: "create" | "append" | null): void => {
      activeRvtoolsJobIntentRef.current = intent;
      setActiveRvtoolsJobIntent(intent);
    },
    [],
  );

  const canAppendRvtoolsFiles = assessment?.sourceType === "rvtools";

  const openRvtoolsModal = useCallback((): void => {
    setRvtoolsModalMode("create");
    setIsRvtoolsModalOpen(true);
  }, []);

  const openAppendRvtoolsModal = useCallback((): void => {
    setRvtoolsModalMode("append");
    setIsRvtoolsModalOpen(true);
  }, []);

  const closeRvtoolsModal = useCallback((): void => {
    void jobsStore.cancelRVToolsJob();
    setIsRvtoolsModalOpen(false);
  }, [jobsStore]);

  const dismissRvtoolsAppendSuccess = useCallback((): void => {
    setRvtoolsAppendSuccessMessage(null);
  }, []);

  const dismissRvtoolsAppendNotice = useCallback((): void => {
    setRvtoolsAppendNotice(null);
  }, []);

  const removeRvtoolsUploadResult = useCallback(
    (fileName: string, fileSize: number): void => {
      jobsStore.removeRvtoolsUploadResult(fileName, fileSize);
    },
    [jobsStore],
  );

  const [rvtoolsPendingUploadBatch, setRvtoolsPendingUploadBatch] =
    useState<RvtoolsPendingUploadBatch | null>(null);
  const [isRvtoolsUploadWarningDismissed, setIsRvtoolsUploadWarningDismissed] =
    useState(false);
  const [isReviewRvtoolsFailuresOpen, setIsReviewRvtoolsFailuresOpen] =
    useState(false);
  const [isSourceFilesModalOpen, setIsSourceFilesModalOpen] = useState(false);
  const [sourceFileDraftRows, setSourceFileDraftRows] = useState<
    RvtoolsSourceFileDraftRow[]
  >([]);
  const [isSourceDraftSubmitting, setIsSourceDraftSubmitting] = useState(false);
  const [showSourceCreateFailedAlert, setShowSourceCreateFailedAlert] =
    useState(false);

  const refreshRvtoolsSourceFiles = useCallback((): void => {
    if (!id) {
      setRvtoolsSourceFiles([]);
      return;
    }
    setRvtoolsSourceFiles(getRvtoolsSourceFiles(id));
  }, [id]);

  const refreshRvtoolsPendingBatch = useCallback((): void => {
    if (!id) {
      setRvtoolsPendingUploadBatch(null);
      return;
    }
    setRvtoolsPendingUploadBatch(getActiveRvtoolsPendingBatch(id));
  }, [id]);

  useEffect(() => {
    if (!id || assessment?.sourceType !== "rvtools") {
      return;
    }
    bootstrapRvtoolsSourceFilesFromSubsets(id, subsetInventories);
    refreshRvtoolsSourceFiles();
    refreshRvtoolsPendingBatch();
  }, [
    assessment?.sourceType,
    id,
    refreshRvtoolsPendingBatch,
    refreshRvtoolsSourceFiles,
    subsetInventories,
  ]);

  useEffect(() => {
    setIsRvtoolsUploadWarningDismissed(false);
  }, [id]);

  const recordRvtoolsUploadOutcome = useCallback(
    (assessmentId: string, context: "created" | "updated") => {
      const upload = jobsStore.getSnapshot().rvtoolsUpload;
      if (!upload?.results.length) {
        return null;
      }
      const summary = applyRvtoolsUploadOutcome(
        assessmentId,
        upload.results,
        context,
      );
      if (assessmentId === id) {
        refreshRvtoolsSourceFiles();
        refreshRvtoolsPendingBatch();
      }
      return summary;
    },
    [id, jobsStore, refreshRvtoolsPendingBatch, refreshRvtoolsSourceFiles],
  );

  const dismissRvtoolsUploadWarning = useCallback((): void => {
    setIsRvtoolsUploadWarningDismissed(true);
  }, []);

  const setReviewRvtoolsFailuresOpen = useCallback((open: boolean): void => {
    setIsReviewRvtoolsFailuresOpen(open);
  }, []);

  const openAppendRvtoolsFromErrorReview = useCallback((): void => {
    setIsReviewRvtoolsFailuresOpen(false);
    openAppendRvtoolsModal();
  }, [openAppendRvtoolsModal]);

  const openSourceFilesModal = useCallback((): void => {
    setShowSourceCreateFailedAlert(false);
    setSourceFileDraftRows(
      rvtoolsSourceFiles.map((entry) => ({
        id: entry.fileName,
        fileName: entry.fileName,
        uploadedAt: entry.uploadedAt,
      })),
    );
    setIsSourceFilesModalOpen(true);
  }, [rvtoolsSourceFiles]);

  const closeSourceFilesModal = useCallback((): void => {
    if (isSourceDraftSubmitting) {
      return;
    }
    setIsSourceFilesModalOpen(false);
    setShowSourceCreateFailedAlert(false);
    setSourceFileDraftRows([]);
  }, [isSourceDraftSubmitting]);

  const replaceSourceFileDraftRow = useCallback(
    (rowId: string, file: File): void => {
      setSourceFileDraftRows((rows) =>
        rows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                replacementFile: file,
                errorMessage: undefined,
              }
            : row,
        ),
      );
      setShowSourceCreateFailedAlert(false);
    },
    [],
  );

  const removeSourceFileDraftRow = useCallback((rowId: string): void => {
    setSourceFileDraftRows((rows) => rows.filter((row) => row.id !== rowId));
    setShowSourceCreateFailedAlert(false);
  }, []);

  const submitNewAssessmentFromSourceDraft = useCallback((): void => {
    const assessmentName = assessment?.name?.trim();
    if (!assessmentName) {
      return;
    }

    const filesToUpload = sourceFileDraftRows
      .map((row) => row.replacementFile)
      .filter((file): file is File => file != null);

    if (filesToUpload.length === 0) {
      setShowSourceCreateFailedAlert(true);
      return;
    }

    sourceRecreateKeptNamesRef.current = sourceFileDraftRows
      .filter((row) => !row.replacementFile)
      .map((row) => row.fileName);

    isSourceRecreateFlowRef.current = true;
    setShowSourceCreateFailedAlert(false);
    setIsSourceDraftSubmitting(true);
    setRvtoolsJobIntent("create");
    void (async () => {
      try {
        const job = await jobsStore.createRVToolsJob(
          assessmentName,
          filesToUpload,
        );
        if (job && !TERMINAL_JOB_STATUSES.includes(job.status)) {
          jobsStore.startPolling(JOB_POLLING_INTERVAL);
          return;
        }
        const { rvtoolsUpload } = jobsStore.getSnapshot();
        const hasValid = rvtoolsUpload?.results.some(
          (entry) => entry.status === "valid",
        );
        if (!hasValid) {
          applySourceDraftUploadErrors(rvtoolsUpload?.results ?? []);
          setShowSourceCreateFailedAlert(true);
          setIsSourceDraftSubmitting(false);
          isSourceRecreateFlowRef.current = false;
          sourceRecreateKeptNamesRef.current = [];
        }
      } catch (err) {
        console.error("Failed to create assessment from source draft:", err);
        setShowSourceCreateFailedAlert(true);
        setIsSourceDraftSubmitting(false);
        isSourceRecreateFlowRef.current = false;
        sourceRecreateKeptNamesRef.current = [];
      }
    })();
  }, [assessment?.name, jobsStore, setRvtoolsJobIntent, sourceFileDraftRows]);

  const applySourceDraftUploadErrors = (
    results: RvtoolsFileUploadResult[],
  ): void => {
    setSourceFileDraftRows((rows) =>
      rows.map((row) => {
        const match = results.find(
          (entry) =>
            entry.fileName === (row.replacementFile?.name ?? row.fileName),
        );
        if (!match || match.status !== "invalid") {
          return { ...row, errorMessage: undefined };
        }
        return { ...row, errorMessage: match.errorMessage };
      }),
    );
  };

  const prevJobRef = useRef<Job | null>(null);
  const isNavigatingRef = useRef(false);

  const [, refreshAfterAppend] = useAsyncFn(async () => {
    if (!id) {
      return;
    }
    try {
      const uploadResults =
        jobsStore.getSnapshot().rvtoolsUpload?.results ?? [];

      const summary =
        uploadResults.length > 0
          ? applyRvtoolsUploadOutcome(id, uploadResults, "updated")
          : null;

      await assessmentsStore.get(id);
      setIsRvtoolsModalOpen(false);
      setRvtoolsAppendSuccessMessage(null);
      setRvtoolsAppendNotice(null);

      if (summary) {
        const toast = buildAppendRvtoolsToastMessage(summary);
        if (toast?.variant === "warning") {
          setRvtoolsAppendNotice(toast);
        } else if (toast?.variant === "success") {
          setRvtoolsAppendSuccessMessage(toast.message);
        }
      }
      refreshRvtoolsPendingBatch();
      refreshRvtoolsSourceFiles();
    } finally {
      isNavigatingRef.current = false;
      setRvtoolsJobIntent(null);
      jobsStore.reset();
    }
  }, [
    assessmentsStore,
    id,
    jobsStore,
    refreshRvtoolsPendingBatch,
    refreshRvtoolsSourceFiles,
    setRvtoolsJobIntent,
  ]);

  const beginReportRvtoolsUploadCompletion = useCallback((): void => {
    if (isNavigatingRef.current) {
      return;
    }
    const intent = activeRvtoolsJobIntentRef.current;
    if (intent !== "append") {
      return;
    }
    isNavigatingRef.current = true;
    jobsStore.stopPolling();
    void refreshAfterAppend();
  }, [jobsStore, refreshAfterAppend]);

  const createRVToolsJob = useCallback(
    async (name: string, files: File[]): Promise<void> => {
      setRvtoolsJobIntent("create");
      const job = await jobsStore.createRVToolsJob(name, files);
      if (job) {
        jobsStore.startPolling(JOB_POLLING_INTERVAL);
      }
    },
    [jobsStore, setRvtoolsJobIntent],
  );

  const uploadRvtoolsToAssessment = useCallback(
    async (files: File[]): Promise<void> => {
      if (!id) {
        return;
      }
      setRvtoolsJobIntent("append");
      const job = await jobsStore.appendRvtoolsToAssessment(id, files);
      const { currentJob } = jobsStore.getSnapshot();
      if (job && !TERMINAL_JOB_STATUSES.includes(job.status)) {
        jobsStore.startPolling(JOB_POLLING_INTERVAL);
        return;
      }
      if (currentJob && TERMINAL_JOB_STATUSES.includes(currentJob.status)) {
        beginReportRvtoolsUploadCompletion();
      }
    },
    [beginReportRvtoolsUploadCompletion, id, jobsStore, setRvtoolsJobIntent],
  );

  const appendRvtoolsFiles = useCallback(
    async (files: File[]): Promise<void> => {
      await uploadRvtoolsToAssessment(files);
    },
    [uploadRvtoolsToAssessment],
  );

  const cancelRVToolsJob = useCallback(async (): Promise<void> => {
    jobsStore.stopPolling();
    const latestJob = await jobsStore.cancelRVToolsJob();
    if (latestJob?.status === JobStatus.Completed && latestJob.assessmentId) {
      try {
        await assessmentsStore.remove(latestJob.assessmentId);
      } catch (err) {
        console.error("Failed to delete assessment after job cancel:", err);
      }
    }
  }, [jobsStore, assessmentsStore]);

  const [rvtoolsNavigationState, navigateToReport] = useAsyncFn(
    async (assessmentId: string) => {
      try {
        recordRvtoolsUploadOutcome(assessmentId, "created");
        if (sourceRecreateKeptNamesRef.current.length > 0) {
          recordRvtoolsSourceFiles(
            assessmentId,
            sourceRecreateKeptNamesRef.current,
          );
          sourceRecreateKeptNamesRef.current = [];
        }
        await assessmentsStore.list();
        setIsRvtoolsModalOpen(false);
        setIsSourceFilesModalOpen(false);
        setSourceFileDraftRows([]);
        setIsSourceDraftSubmitting(false);
        isSourceRecreateFlowRef.current = false;
        void navigate(routes.assessmentReport(assessmentId));
      } finally {
        isNavigatingRef.current = false;
        setRvtoolsJobIntent(null);
        jobsStore.reset();
      }
    },
    [
      assessmentsStore,
      navigate,
      jobsStore,
      recordRvtoolsUploadOutcome,
      setRvtoolsJobIntent,
    ],
  );

  useEffect(() => {
    const { currentJob } = jobState;
    const prevJob = prevJobRef.current;
    prevJobRef.current = currentJob;

    const prevTerminal =
      prevJob != null && TERMINAL_JOB_STATUSES.includes(prevJob.status);
    const nowTerminal =
      currentJob != null && TERMINAL_JOB_STATUSES.includes(currentJob.status);
    const intent = activeRvtoolsJobIntentRef.current;

    if (
      nowTerminal &&
      !prevTerminal &&
      !isNavigatingRef.current &&
      intent === "append"
    ) {
      isNavigatingRef.current = true;
      jobsStore.stopPolling();
      void refreshAfterAppend();
      return;
    }

    if (
      currentJob?.status === JobStatus.Completed &&
      currentJob.assessmentId &&
      prevJob?.status !== JobStatus.Completed &&
      !isNavigatingRef.current &&
      intent === "create"
    ) {
      const uploadResults =
        jobsStore.getSnapshot().rvtoolsUpload?.results ?? [];
      const validCount = uploadResults.filter(
        (entry) => entry.status === "valid",
      ).length;

      if (isSourceRecreateFlowRef.current && validCount === 0) {
        applySourceDraftUploadErrors(uploadResults);
        setShowSourceCreateFailedAlert(true);
        setIsSourceDraftSubmitting(false);
        isSourceRecreateFlowRef.current = false;
        sourceRecreateKeptNamesRef.current = [];
        jobsStore.stopPolling();
        setRvtoolsJobIntent(null);
        jobsStore.reset();
        return;
      }

      isNavigatingRef.current = true;
      jobsStore.stopPolling();
      void navigateToReport(currentJob.assessmentId);
    }
  }, [
    activeRvtoolsJobIntent,
    jobState,
    jobsStore,
    navigateToReport,
    refreshAfterAppend,
  ]);

  const { currentJob } = jobState;

  const isJobProcessing = Boolean(
    currentJob && !TERMINAL_JOB_STATUSES.includes(currentJob.status),
  );

  const jobProgressValue = currentJob ? getProgressValue(currentJob.status) : 0;

  const jobProgressLabel = currentJob
    ? getProgressLabel(currentJob.status)
    : "";

  const jobError = useMemo(() => {
    return currentJob?.status === JobStatus.Failed
      ? new Error(
          extractJobErrorMessage(currentJob.error || "Processing failed"),
        )
      : null;
  }, [currentJob]);

  const rvtoolsRemainingFileSlots = useMemo(
    () => Math.max(0, MAX_RVTOOLS_FILES - rvtoolsSourceFiles.length),
    [rvtoolsSourceFiles.length],
  );

  // ---- Return --------------------------------------------------------------
  return {
    assessmentId: id,

    assessment,
    source,
    isLoadingData: fetchState.loading || inventoryLoading,

    clusterView,
    selectedClusterId,
    selectCluster,
    isClusterSelectOpen,
    setClusterSelectOpen: setIsClusterSelectOpen,
    clusterSelectDisabled,

    groupView: reportFilterGroupView,
    selectedGroupId: groupView.showGroupFilter
      ? selectedGroupId
      : rvtoolsEffectiveVcenterSubsetId,
    selectGroup: selectReportFilterGroup,
    isGroupSelectOpen,
    setGroupSelectOpen: setIsGroupSelectOpen,

    infra,
    vms,
    clusters,
    latestSnapshot,
    lastUpdatedText,
    clusterCount: reportSummaryClusterCount,
    reportSummaryVms,
    vcenterId,
    vcenterVersion,

    scopedClusterView,
    canExportReport,
    canShowClusterRecommendations,
    canUseRecommendationTools,
    isPartner,

    missingMetrics,
    hasMissingMetrics: missingMetrics.length > 0,

    exportDocumentTitle,
    pdfExtraPages,

    activeReportTab,
    setActiveReportTab,
    selectedRecommendationTool,
    openRecommendationTool,
    closeRecommendationTool,
    savedSizingDataMap,
    onSizingCalculated,

    rvtoolsModalMode,
    isRvtoolsModalOpen,
    openRvtoolsModal,
    openAppendRvtoolsModal,
    closeRvtoolsModal,
    createRVToolsJob,
    appendRvtoolsFiles,
    cancelRVToolsJob,
    isCreatingJob: jobState.isCreating,
    jobCreateError: jobState.createError,
    isJobProcessing,
    jobProgressValue,
    jobProgressLabel,
    jobError,
    rvtoolsUpload: jobState.rvtoolsUpload,
    isNavigatingToReport:
      activeRvtoolsJobIntent === "create" &&
      (rvtoolsNavigationState.loading ||
        Boolean(
          currentJob?.status === JobStatus.Completed &&
          currentJob?.assessmentId,
        )),
    rvtoolsAppendSuccessMessage,
    dismissRvtoolsAppendSuccess,
    rvtoolsAppendNotice,
    dismissRvtoolsAppendNotice,
    removeRvtoolsUploadResult,
    canAppendRvtoolsFiles,
    rvtoolsPendingUploadBatch,
    isRvtoolsUploadWarningDismissed,
    dismissRvtoolsUploadWarning,
    isReviewRvtoolsFailuresOpen,
    setReviewRvtoolsFailuresOpen,
    openAppendRvtoolsFromErrorReview,
    isSourceFilesModalOpen,
    openSourceFilesModal,
    closeSourceFilesModal,
    sourceFileDraftRows,
    replaceSourceFileDraftRow,
    removeSourceFileDraftRow,
    submitNewAssessmentFromSourceDraft,
    isSourceDraftSubmitting,
    showSourceCreateFailedAlert,
    rvtoolsSourceFiles,
    rvtoolsRemainingFileSlots,
  };
};
