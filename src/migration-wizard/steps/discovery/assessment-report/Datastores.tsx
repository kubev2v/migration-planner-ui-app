import React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Progress,
} from '@patternfly/react-core';
import { Datastore } from '@migration-planner-ui/api-client/models';
import { ReportTable } from '../ReportTable';


interface DatastoresProps {
    datastores: Datastore[];
  }
  
  export const Datastores: React.FC<DatastoresProps> = ({
    datastores,
  }) => {

  return (
        <Card>
          <CardTitle><i className="fas fa-database" />  Datastores</CardTitle>
          <CardBody>
          <ReportTable<
            Datastore & {
              usage: JSX.Element;
            }
          >
            data={datastores.map((ds) => ({
              ...ds,
              usage: (
                <div style={{ minWidth: "10rem", flexGrow: 1 }}>
                  <Progress
                    value={(ds.freeCapacityGB / ds.totalCapacityGB) * 100}
                    size="sm"
                  />
                </div>
              ),
            }))}
            columns={[ "Type", "Vendor", "Storage offload support", "Protocol type", "Model", "Total capacity", "Usage %"]}
            fields={["type", "vendor", "hardwareAcceleratedMove", "protocolType", "model", "totalCapacityGB", , "usage"]}
            style={{ width: "55rem" }}
          />
          </CardBody>
        </Card>
  );
};
