export const Columns = {
  Name: "Name",
  CredentialsUrl: "Credentials URL",
  Status: "Discovery VM Status",
  VersionStatus: "Agent version",
  Hosts: "Hosts",
  VMs: "VMs",
  Networks: "Networks",
  Datastores: "Datastores",
  Actions: "Actions",
  LastSeen: "Last updated",
} as const;

export type ColumnKey = keyof typeof Columns;

export type SortableColumnKey = Exclude<
  ColumnKey,
  "Actions" | "CredentialsUrl"
>;

export const SORTABLE_COLUMNS: SortableColumnKey[] = [
  "Name",
  "Status",
  "VersionStatus",
  "Hosts",
  "VMs",
  "Networks",
  "Datastores",
  "LastSeen",
];

export type Columns = (typeof Columns)[keyof typeof Columns];
