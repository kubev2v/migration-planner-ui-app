import React from 'react';

import { MigrationIssue } from '@migration-planner-ui/api-client/models';
import { Card, CardBody, CardTitle, Icon } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as globalWarningColor100 } from '@patternfly/react-tokens/dist/js/global_warning_color_100';

import { ReportTable } from '../ReportTable';

interface WarningsTableProps {
  warnings: MigrationIssue[];
  isExportMode?: boolean;
}

export const WarningsTable: React.FC<WarningsTableProps> = ({
  warnings,
  isExportMode = false,
}) => {
  const tableHeight = isExportMode ? '100%' : '250px';
  return (
    <Card className={isExportMode ? 'dashboard-card-print' : 'dashboard-card'}>
      <CardTitle>
        <Icon style={{ color: globalWarningColor100.value }}>
          <ExclamationTriangleIcon />
        </Icon>{' '}
        Warnings
      </CardTitle>
      <CardBody style={{ padding: 0 }}>
        <div
          style={{
            maxHeight: tableHeight,
            overflowY: 'auto',
            overflowX: 'auto',
            padding: 2,
          }}
        >
          <ReportTable<MigrationIssue>
            data={warnings}
            columns={['Description', 'Total']}
            fields={['assessment', 'count']}
            withoutBorder
            caption="Virtual machine validations"
          />
        </div>
      </CardBody>
    </Card>
  );
};
