import type { Assessment } from "@openshift-migration-advisor/planner-sdk";

import { type AssessmentModel, createAssessmentModel } from "./AssessmentModel";
import { sortSnapshotsDesc } from "./SnapshotParser";

/**
 * LIST responses often omit `subsetInventories` on snapshots while GET includes
 * them. When background polling refreshes the list, preserve subset data that
 * was already fetched by ID so group filter options stay complete on SaaS.
 */
export const mergeListedAssessmentPreservingSubsetInventories = (
  incoming: AssessmentModel,
  existing: AssessmentModel,
): AssessmentModel => {
  const incomingSnapshots = incoming.snapshots;
  if (!incomingSnapshots?.length) {
    return incoming;
  }

  const latestIncoming = sortSnapshotsDesc(incomingSnapshots)[0];
  if (
    Object.prototype.hasOwnProperty.call(latestIncoming, "subsetInventories")
  ) {
    return incoming;
  }

  const existingSorted = existing.snapshotsSorted;
  if (!existingSorted.length) {
    return incoming;
  }

  const latestExisting = existingSorted[0];
  if (
    !Object.prototype.hasOwnProperty.call(latestExisting, "subsetInventories")
  ) {
    return incoming;
  }

  const latestIncomingTime = new Date(latestIncoming.createdAt).getTime();
  const mergedSnapshots = incomingSnapshots.map((snapshot) => {
    if (new Date(snapshot.createdAt).getTime() !== latestIncomingTime) {
      return snapshot;
    }
    return {
      ...snapshot,
      subsetInventories: latestExisting.subsetInventories,
    };
  });

  return createAssessmentModel({
    ...(incoming as Assessment),
    snapshots: mergedSnapshots,
  });
};
