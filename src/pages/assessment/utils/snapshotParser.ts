import { Snapshot as SnapshotModel } from '@migration-planner-ui/api-client/models';
interface SnapshotData {
  hosts: string | number;
  vms: string | number;
  networks: string | number;
  datastores: string | number;
  lastUpdated: string;
}

export const parseLatestSnapshot = (
  snapshots: SnapshotModel[],
): SnapshotData => {
  if (!snapshots || snapshots.length === 0) {
    return {
      hosts: '-',
      vms: '-',
      networks: '-',
      datastores: '-',
      lastUpdated: '-',
    };
  }

  // Sort snapshots by createdAt date (latest first)
  const sortedSnapshots = snapshots.sort(
    (a: SnapshotModel, b: SnapshotModel) => {
      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      return bDate - aDate; // Latest first
    },
  );

  const lastSnapshot = sortedSnapshots[0];

  // Extract hosts data from inventory.infra.totalHosts
  const hosts = lastSnapshot.inventory?.infra?.totalHosts ?? '-';

  // Extract VMs data from inventory.vms.total
  const vms = lastSnapshot.inventory?.vms?.total ?? '-';

  // Extract networks data from inventory.infra.networks array length
  const networks = Array.isArray(lastSnapshot.inventory?.infra?.networks)
    ? lastSnapshot.inventory.infra.networks.length
    : '-';

  // Extract datastores data from inventory.infra.datastores array length
  const datastores = Array.isArray(lastSnapshot.inventory?.infra?.datastores)
    ? lastSnapshot.inventory.infra.datastores.length
    : '-';

  // Format last updated date
  const lastUpdated = lastSnapshot.createdAt
    ? ((): string => {
        const date = new Date(lastSnapshot.createdAt);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          return 'Today';
        } else if (diffDays === 1) {
          return '1 day ago';
        } else if (diffDays < 7) {
          return `${diffDays} days ago`;
        } else {
          return (
            date.toLocaleDateString() +
            ' ' +
            date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          );
        }
      })()
    : '-';

  return {
    hosts,
    vms,
    networks,
    datastores,
    lastUpdated,
  };
};
