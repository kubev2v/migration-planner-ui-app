import React, { useCallback, useEffect, useState } from 'react';
import {
  Stack,
  StackItem,
  TextContent,
  Text,
  Panel,
  PanelMain,
  PanelHeader,
  List,
  OrderType,
  ListItem,
  Icon,
  Alert,
  Button,
  AlertActionLink,
} from '@patternfly/react-core';
import { chart_color_blue_300 as blueColor } from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import { ClusterIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { DiscoverySourceSetupModal } from './sources-table/empty-state/DiscoverySourceSetupModal';
import { Source } from '@migration-planner-ui/api-client/models';
import { UploadInventoryAction } from './sources-table/actions/UploadInventoryAction';
import { useDiscoverySources } from '../../contexts/discovery-sources/Context';
import { SourcesTable } from './sources-table/SourcesTable';

export const ConnectStep: React.FC = () => {
  const discoverySourcesContext = useDiscoverySources();
  const [
    shouldShowDiscoverySourceSetupModal,
    setShouldShowDiscoverySetupModal,
  ] = useState(false);

  const toggleDiscoverySourceSetupModal = useCallback((): void => {
    setShouldShowDiscoverySetupModal((lastState) => !lastState);
  }, []);
  const hasSources =
    discoverySourcesContext.sources &&
    discoverySourcesContext.sources.length > 0;
  const [firstSource, ..._otherSources] = discoverySourcesContext.sources ?? [];
  const [sourceSelected, setSourceSelected] = React.useState<Source>();
  const [isOvaDownloading, setIsOvaDownloading] = useState(false);

  useEffect(() => {
    if (discoverySourcesContext.sourceSelected) {
      const foundSource = discoverySourcesContext.sources.find(
        (source) => source.id === discoverySourcesContext.sourceSelected?.id,
      );
      if (foundSource) {
        setSourceSelected(foundSource);
      } else {
        if (firstSource) {
          setSourceSelected(firstSource);
        } else {
          setSourceSelected(undefined);
        }
      }
    }
  }, [
    discoverySourcesContext.sourceSelected,
    discoverySourcesContext.sources,
    firstSource,
  ]);

  return (
    <Stack hasGutter>
      <StackItem>
        <TextContent>
          <Text component="h2">Connect your VMware environment</Text>
        </TextContent>
      </StackItem>
      <StackItem>
        <TextContent style={{ paddingBlock: '1rem' }}>
          <Text component="h4">
            Follow these steps to connect your environment and start the
            discovery process
          </Text>
          <List
            component="ol"
            type={OrderType.number}
            style={{ marginInlineStart: 0 }}
          >
            <ListItem>
              To add a new environment download and import a discovery OVA file
              to your VMware environment.
            </ListItem>
            <ListItem>
              A link will appear below once the VM is running. Use this link to
              enter credentials and connect your environment.
            </ListItem>
            <ListItem>
              When the connection is established, you will be able to proceed
              and see the discovery report.
            </ListItem>
          </List>
        </TextContent>
      </StackItem>
      <StackItem>
        <Panel variant="bordered">
          <PanelMain>
            <PanelHeader style={{ paddingBlockEnd: 0 }}>
              <TextContent>
                <Text component="h3">
                  <Icon isInline style={{ marginRight: '1rem' }}>
                    <ClusterIcon />
                  </Icon>
                  Environment
                </Text>
              </TextContent>
            </PanelHeader>
            <SourcesTable />
          </PanelMain>
        </Panel>
      </StackItem>
      <StackItem>
        {hasSources && (
          <Button
            variant="secondary"
            onClick={toggleDiscoverySourceSetupModal}
            style={{ marginTop: '1rem' }}
            icon={<PlusCircleIcon color={blueColor.value} />}
          >
            Add environment
          </Button>
        )}
        {shouldShowDiscoverySourceSetupModal && (
          <DiscoverySourceSetupModal
            isOpen={shouldShowDiscoverySourceSetupModal}
            onClose={toggleDiscoverySourceSetupModal}
            isDisabled={discoverySourcesContext.isDownloadingSource}
            onSubmit={async (event) => {
              const form = event.currentTarget;
              const environmentName = form['discoveryEnvironmentName']
                .value as string;
              const sshKey = form['discoverySourceSshKey'].value as string;
              setIsOvaDownloading(true); // Start showing the alert
              await discoverySourcesContext.downloadSource(
                environmentName,
                sshKey,
              );
              toggleDiscoverySourceSetupModal();
              await discoverySourcesContext.listSources();
              setIsOvaDownloading(false); // Hide alert after everything is done
            }}
          />
        )}
      </StackItem>
      <StackItem>
        {isOvaDownloading && (
          <Alert isInline variant="info" title="Download OVA image">
            The OVA image is downloading
          </Alert>
        )}
      </StackItem>
      <StackItem>
        {discoverySourcesContext.errorDownloadingSource && (
          <Alert isInline variant="danger" title="Download Environment error">
            {discoverySourcesContext.errorDownloadingSource.message}
          </Alert>
        )}
      </StackItem>
      <StackItem>
        {sourceSelected?.agent &&
          sourceSelected?.agent.status === 'waiting-for-credentials' && (
            <Alert
              isInline
              variant="custom"
              title="Discovery VM"
              actionLinks={
                <AlertActionLink
                  component="a"
                  href={sourceSelected?.agent.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {sourceSelected?.agent.credentialUrl}
                </AlertActionLink>
              }
            >
              <TextContent>
                <Text>
                  Click the link below to connect the Discovery Source to your
                  VMware environment.
                </Text>
              </TextContent>
            </Alert>
          )}
      </StackItem>
      <StackItem>
        {hasSources && !sourceSelected?.agent && sourceSelected?.name !== 'Example' && (
          <Alert isInline variant="custom" title="Environment not connected">
            <TextContent>
              <Text>
                The selected environment is not connected, if you have a
                discovery file click the link below to upload it.
              </Text>
            </TextContent>
            <UploadInventoryAction
              discoverySourcesContext={discoverySourcesContext}
              sourceId={sourceSelected?.id ?? ''}
              asLink
            />
          </Alert>
        )}
      </StackItem>
    </Stack>
  );
};

ConnectStep.displayName = 'ConnectStep';
