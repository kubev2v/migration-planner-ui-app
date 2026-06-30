import type { AssessmentSubsetInventory } from "@openshift-migration-advisor/planner-sdk";

export const ALL_VMS_GROUP_ID = "all";

export type GroupOption = { id: string; label: string };

export type GroupViewModel = {
  groupOptions: GroupOption[];
  selectionId: string;
  selectionLabel: string;
  showGroupFilter: boolean;
  groupSelectDisabled: boolean;
};

export const buildGroupViewModel = ({
  subsetInventories,
  selectedGroupId = ALL_VMS_GROUP_ID,
}: {
  subsetInventories?: AssessmentSubsetInventory[];
  selectedGroupId?: string;
}): GroupViewModel => {
  const subsets = subsetInventories ?? [];
  const showGroupFilter = subsets.length > 0;

  const groupOptions: GroupOption[] = [
    { id: ALL_VMS_GROUP_ID, label: "All VMs" },
    ...subsets.map((subset) => ({
      id: subset.id,
      label: `${subset.name} (${subset.vmsCount} VMs)`,
    })),
  ];

  const isValidSelection =
    selectedGroupId === ALL_VMS_GROUP_ID ||
    subsets.some((subset) => subset.id === selectedGroupId);
  const effectiveSelection = isValidSelection
    ? selectedGroupId
    : ALL_VMS_GROUP_ID;

  const selectedOption =
    groupOptions.find((option) => option.id === effectiveSelection) ??
    groupOptions[0];

  return {
    groupOptions,
    selectionId: effectiveSelection,
    selectionLabel: selectedOption.label,
    showGroupFilter,
    groupSelectDisabled: !showGroupFilter,
  };
};
