import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Assessment } from '@migration-planner-ui/api-client/models';
import {
  Badge,
  Button,
  InputGroup,
  Spinner,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { VALUE_NOT_AVAILABLE } from '../migration-wizard/steps/connect/sources-table/Constants';

type Props = {
  assessments: Assessment[];
  isLoading?: boolean;
};

const enum Columns {
  Name = 'Name',
  ReportStatus = 'Report Status',
  Environment = 'Environment',
  Hosts = 'Hosts',
  VMs = 'VMs',
  Networks = 'Networks',
  Datastores = 'Datastores',
  Actions = 'Actions',
}

function get(obj: unknown, path: string): unknown {
  const a = obj as Record<string, unknown> | undefined;
  if (!a) return undefined;
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, a);
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '' && !isNaN(+value)) {
    return Number(value);
  }
  return undefined;
}

function readinessFromAssessment(assessment: Assessment): {
  label: string;
  isReady: boolean;
} {
  const anyObj = assessment as unknown as Record<string, unknown>;
  const snapshots = anyObj?.snapshots as unknown[] | undefined;
  const lastSnapshot =
    Array.isArray(snapshots) && snapshots.length > 0
      ? (snapshots[snapshots.length - 1] as Record<string, unknown>)
      : undefined;

  const explicit =
    (lastSnapshot?.status as string | undefined) ||
    (lastSnapshot?.phase as string | undefined) ||
    (anyObj?.status as string | undefined) ||
    (anyObj?.reportStatus as string | undefined) ||
    (anyObj?.phase as string | undefined);
  if (typeof explicit === 'string') {
    const normalized = explicit.toLowerCase();
    const isReady = ['ready', 'completed', 'done', 'ok', 'success'].some((w) =>
      normalized.includes(w),
    );
    return { label: isReady ? 'Ready' : 'Not Ready', isReady };
  }

  // Derive from presence of summary-like fields in the last snapshot
  const hasInfra = !!(
    lastSnapshot &&
    ((lastSnapshot as unknown as Record<string, unknown>)['infra'] ||
      (lastSnapshot as unknown as Record<string, unknown>)['inventory'])
  );
  const hasVMs = !!(
    lastSnapshot &&
    (get(lastSnapshot, 'vms.total') || get(lastSnapshot, 'inventory.vms.total'))
  );
  const isReady = Boolean(hasInfra && hasVMs);
  return { label: isReady ? 'Ready' : 'Not Ready', isReady };
}

export const AssessmentsTable: React.FC<Props> = ({
  assessments,
  isLoading,
}) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<
    { index: number; direction: 'asc' | 'desc' } | undefined
  >({
    index: 0,
    direction: 'asc',
  });

  const rows = useMemo(() => {
    const items = (assessments || []).map((assessment) => {
      const anyObj = assessment as unknown as Record<string, unknown>;

      const name = (anyObj?.name as string) || `Assessment ${anyObj?.id ?? ''}`;
      const id = String((anyObj?.id as string) ?? '');

      const snapshots = anyObj?.snapshots as unknown[] | undefined;
      const last =
        Array.isArray(snapshots) && snapshots.length > 0
          ? (snapshots[snapshots.length - 1] as Record<string, unknown>)
          : undefined;

      const hosts =
        asNumber(get(last, 'infra.totalHosts')) ??
        asNumber(get(last, 'inventory.infra.totalHosts')) ??
        undefined;

      const vms =
        asNumber(get(last, 'vms.total')) ??
        asNumber(get(last, 'inventory.vms.total')) ??
        undefined;

      const networksCount =
        asNumber(
          (get(last, 'infra.networks.length') as unknown) ?? undefined,
        ) ??
        (Array.isArray(get(last, 'infra.networks'))
          ? (get(last, 'infra.networks') as unknown[]).length
          : undefined) ??
        (Array.isArray(get(last, 'inventory.infra.networks'))
          ? (get(last, 'inventory.infra.networks') as unknown[]).length
          : undefined);

      const datastoresCount =
        (Array.isArray(get(last, 'infra.datastores'))
          ? (get(last, 'infra.datastores') as unknown[]).length
          : undefined) ??
        (Array.isArray(get(last, 'inventory.infra.datastores'))
          ? (get(last, 'inventory.infra.datastores') as unknown[]).length
          : undefined);

      const readiness = readinessFromAssessment(assessment);

      return {
        key: id || name,
        id,
        name,
        status: readiness,
        environment: 'VMware',
        hosts,
        vms,
        networks: networksCount,
        datastores: datastoresCount,
      };
    });

    const filtered = search
      ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
      : items;

    if (!sortBy) return filtered;

    const copy = [...filtered];
    if (sortBy.index === 0) {
      copy.sort((a, b) =>
        sortBy.direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name),
      );
    }
    return copy;
  }, [assessments, search, sortBy]);

  const onSort = (
    _event: unknown,
    index: number,
    direction: 'asc' | 'desc',
  ): void => {
    setSortBy({ index, direction });
  };

  const nameSortParams = {
    sortBy,
    onSort,
    columnIndex: 0,
  } as const;

  return (
    <div style={{ overflowX: 'auto' }}>
      <Toolbar inset={{ default: 'insetNone' }}>
        <ToolbarContent>
          <ToolbarItem>
            <InputGroup>
              <TextInput
                name="assessment-search"
                id="assessment-search"
                type="search"
                placeholder="Search by name"
                value={search}
                onChange={(_event, value) => setSearch(value)}
              />
            </InputGroup>
          </ToolbarItem>
          <ToolbarItem>
            <div style={{ marginLeft: 'auto' }}>
              <Link to="migrate/wizard">
                <Button variant="primary">New migration assessment</Button>
              </Link>
            </div>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      {isLoading && (!assessments || assessments.length === 0) ? (
        <Table
          aria-label="Loading assessments"
          variant="compact"
          borders={false}
        >
          <Tbody>
            <Tr>
              <Td colSpan={8}>
                <Spinner size="xl" />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      ) : (
        <Table aria-label="Assessments table" variant="compact" borders={false}>
          {rows && rows.length > 0 && (
            <Thead>
              <Tr>
                <Th sort={nameSortParams} style={{ whiteSpace: 'normal' }}>
                  {Columns.Name}
                </Th>
                <Th style={{ whiteSpace: 'normal' }}>{Columns.ReportStatus}</Th>
                <Th style={{ whiteSpace: 'normal' }}>{Columns.Environment}</Th>
                <Th style={{ whiteSpace: 'normal' }}>{Columns.Hosts}</Th>
                <Th style={{ whiteSpace: 'normal' }}>{Columns.VMs}</Th>
                <Th style={{ whiteSpace: 'normal' }}>{Columns.Networks}</Th>
                <Th style={{ whiteSpace: 'normal' }}>{Columns.Datastores}</Th>
                <Th style={{ whiteSpace: 'normal' }}>{Columns.Actions}</Th>
              </Tr>
            </Thead>
          )}
          <Tbody>
            {rows && rows.length > 0 ? (
              rows.map((row) => (
                <Tr key={row.key}>
                  <Td dataLabel={Columns.Name}>
                    <Link to={`migrate/assessments/${row.id}`}>{row.name}</Link>
                  </Td>
                  <Td dataLabel={Columns.ReportStatus}>
                    {row.status.isReady ? (
                      <Badge isRead>Ready</Badge>
                    ) : (
                      <Badge>Not Ready</Badge>
                    )}
                  </Td>
                  <Td dataLabel={Columns.Environment}>{row.environment}</Td>
                  <Td dataLabel={Columns.Hosts}>
                    {row.hosts ?? VALUE_NOT_AVAILABLE}
                  </Td>
                  <Td dataLabel={Columns.VMs}>
                    {row.vms ?? VALUE_NOT_AVAILABLE}
                  </Td>
                  <Td dataLabel={Columns.Networks}>
                    {row.networks ?? VALUE_NOT_AVAILABLE}
                  </Td>
                  <Td dataLabel={Columns.Datastores}>
                    {row.datastores ?? VALUE_NOT_AVAILABLE}
                  </Td>
                  <Td dataLabel={Columns.Actions}>⋮</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={12}>
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    No assessments found.
                  </div>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      )}
    </div>
  );
};

AssessmentsTable.displayName = 'AssessmentsTable';

export default AssessmentsTable;
