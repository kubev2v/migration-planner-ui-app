import type {
  Infra,
  InventoryData,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";
import { useInjection } from "@y0n1/react-ioc";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useParams } from "react-router-dom";
import { useAsyncFn, useMount } from "react-use";

import { Symbols } from "../../../config/Dependencies";
import type { IAssessmentsStore } from "../../../data/stores/interfaces/IAssessmentsStore";
import type { ISourcesStore } from "../../../data/stores/interfaces/ISourcesStore";
import type { AssessmentModel } from "../../../models/AssessmentModel";
import type { SourceModel } from "../../../models/SourceModel";
import type { SnapshotLike } from "../../../services/html-export/types";
import {
  buildClusterViewModel,
  type ClusterViewModel,
  compareClustersByVmCount,
} from "../helpers/clusterViewModel";

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

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

  // Computed data from latest snapshot
  infra: Infra | undefined;
  vms: VMs | undefined;
  clusters: { [key: string]: InventoryData } | undefined;
  latestSnapshot: SnapshotLike;
  lastUpdatedText: string;
  clusterCount: number;

  // Scoped cluster view (typed with required fields for Dashboard rendering)
  scopedClusterView: ClusterScopedView | undefined;
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
// Hook implementation
// ---------------------------------------------------------------------------

export const useReportPageViewModel = (): ReportPageViewModel => {
  // ---- Route params --------------------------------------------------------
  const { id } = useParams<{ id: string }>();

  // ---- Stores --------------------------------------------------------------
  const assessmentsStore = useInjection<IAssessmentsStore>(
    Symbols.AssessmentsStore,
  );
  const sourcesStore = useInjection<ISourcesStore>(Symbols.SourcesStore);
  // ---- Reactive store data -------------------------------------------------
  const assessments = useSyncExternalStore(
    assessmentsStore.subscribe.bind(assessmentsStore),
    assessmentsStore.getSnapshot.bind(assessmentsStore),
  );

  useSyncExternalStore(
    sourcesStore.subscribe.bind(sourcesStore),
    sourcesStore.getSnapshot.bind(sourcesStore),
  );

  // ---- Initial data fetch (no polling — detail page) -----------------------
  const [fetchState, doFetchData] = useAsyncFn(async () => {
    await Promise.all([assessmentsStore.list(), sourcesStore.list()]);
  }, [assessmentsStore, sourcesStore]);

  useMount(() => {
    // Only fetch if data is not already loaded
    if (!assessments || assessments.length === 0) {
      void doFetchData();
    }
  });

  // ---- Assessment lookup ---------------------------------------------------
  const assessment = useMemo(
    () =>
      assessments?.find((a: AssessmentModel) => String(a.id) === String(id)) as
        | (AssessmentModel & AssessmentLike)
        | undefined,
    [assessments, id],
  );

  // ---- Source lookup -------------------------------------------------------
  const source = useMemo(
    () =>
      assessment?.sourceId
        ? sourcesStore.getById(assessment.sourceId)
        : undefined,
    [assessment, sourcesStore],
  );

  // ---- Local UI state ------------------------------------------------------
  const [userSelectedClusterId, setUserSelectedClusterId] = useState<
    string | null
  >(null);
  const [isClusterSelectOpen, setIsClusterSelectOpen] = useState(false);

  // ---- Snapshot data -------------------------------------------------------
  const latestSnapshot = useMemo((): SnapshotLike => {
    const snapshots = assessment?.snapshots || [];
    return snapshots.length > 0
      ? snapshots[snapshots.length - 1]
      : ({} as SnapshotLike);
  }, [assessment?.snapshots]);

  const infra = useMemo(
    () =>
      (latestSnapshot.infra ||
        latestSnapshot.inventory?.infra ||
        latestSnapshot.inventory?.vcenter?.infra) as Infra | undefined,
    [latestSnapshot],
  );

  const vms = useMemo(
    () =>
      (latestSnapshot.vms ||
        latestSnapshot.inventory?.vms ||
        latestSnapshot.inventory?.vcenter?.vms) as VMs | undefined,
    [latestSnapshot],
  );

  const clusters = useMemo(
    () =>
      latestSnapshot.inventory?.clusters as
        | { [key: string]: InventoryData }
        | undefined,
    [latestSnapshot],
  );

  // ---- Cluster selection ---------------------------------------------------
  const assessmentClusters = assessment?.snapshots?.length
    ? (
        assessment.snapshots[assessment.snapshots.length - 1] as {
          inventory?: { clusters?: { [key: string]: InventoryData } };
        }
      ).inventory?.clusters
    : undefined;

  const selectedClusterId = useMemo(() => {
    if (userSelectedClusterId !== null) {
      const isValidSelection =
        userSelectedClusterId === "all" ||
        Boolean(
          assessmentClusters &&
          Object.prototype.hasOwnProperty.call(
            assessmentClusters,
            userSelectedClusterId,
          ),
        );
      if (isValidSelection) {
        return userSelectedClusterId;
      }
    }

    const clusterKeys = assessmentClusters
      ? Object.keys(assessmentClusters)
      : [];

    if (clusterKeys.length === 0) {
      return "all";
    }

    const sortedKeys = [...clusterKeys].sort((a, b) =>
      compareClustersByVmCount(a, b, assessmentClusters),
    );

    return sortedKeys[0];
  }, [userSelectedClusterId, assessmentClusters]);

  const selectCluster = useCallback((clusterId: string) => {
    setUserSelectedClusterId(clusterId);
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

  const clusterSelectDisabled = clusterView.clusterOptions.length <= 1;

  // ---- Scoped cluster view -------------------------------------------------
  const isClusterScopedData = useCallback(
    (view: ClusterViewModel): view is ClusterScopedView =>
      Boolean(view.viewInfra && view.viewVms && view.cpuCores && view.ramGB),
    [],
  );

  const scopedClusterView = isClusterScopedData(clusterView)
    ? clusterView
    : undefined;

  // ---- Last updated text ---------------------------------------------------
  const lastUpdatedText = useMemo((): string => {
    // Delegate to the domain model's pre-computed latestSnapshot
    const model = assessment as AssessmentModel | undefined;
    return model?.latestSnapshot?.lastUpdated || "-";
  }, [assessment]);

  const clusterCount = clusters ? Object.keys(clusters).length : 0;

  // ---- Return --------------------------------------------------------------
  return {
    assessmentId: id,

    assessment,
    source,
    isLoadingData: fetchState.loading,

    clusterView,
    selectedClusterId,
    selectCluster,
    isClusterSelectOpen,
    setClusterSelectOpen: setIsClusterSelectOpen,
    clusterSelectDisabled,

    infra,
    vms,
    clusters,
    latestSnapshot,
    lastUpdatedText,
    clusterCount,

    scopedClusterView,
  };
};
