import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMount, useUnmount } from 'react-use';

import {
  Alert,
  AlertActionLink,
  Button,
  Checkbox,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  Text,
  TextContent,
  TextInput,
} from '@patternfly/react-core';

import { AppPage } from '../../components/AppPage';
import { useDiscoverySources } from '../../migration-wizard/contexts/discovery-sources/Context';
import { DEFAULT_POLLING_DELAY } from '../environment/sources-table/Constants';
import { DiscoverySourceSetupModal } from '../environment/sources-table/empty-state/DiscoverySourceSetupModal';
import { SourcesTable } from '../environment/sources-table/SourcesTable';

const CreateFromOva: React.FC = () => {
  const navigate = useNavigate();
  const discoverySourcesContext = useDiscoverySources();

  const [name, setName] = React.useState<string>('');
  const [useExisting, setUseExisting] = React.useState<boolean>(false);
  const [selectedEnvironmentId, setSelectedEnvironmentId] =
    React.useState<string>('');
  const [isSetupModalOpen, setIsSetupModalOpen] =
    React.useState<boolean>(false);

  const createdSourceId = discoverySourcesContext.sourceCreatedId || '';
  const createdSource = createdSourceId
    ? discoverySourcesContext.getSourceById?.(createdSourceId)
    : undefined;

  useMount(async () => {
    discoverySourcesContext.startPolling(DEFAULT_POLLING_DELAY);
    if (!discoverySourcesContext.isPolling) {
      await Promise.all([discoverySourcesContext.listSources()]);
    }
  });

  useUnmount(() => {
    discoverySourcesContext.stopPolling();
  });

  const availableEnvironments = React.useMemo(
    () =>
      (discoverySourcesContext.sources || [])
        .filter((source) => source.name !== 'Example')
        .slice()
        .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [discoverySourcesContext.sources],
  );

  const selectedEnv = React.useMemo(
    () =>
      (discoverySourcesContext.sources || []).find(
        (s) => s.id === selectedEnvironmentId,
      ),
    [discoverySourcesContext.sources, selectedEnvironmentId],
  );

  const isSelectedNotReady = Boolean(
    useExisting &&
      selectedEnv &&
      !(
        selectedEnv.agent?.status === 'up-to-date' ||
        (selectedEnv?.onPremises && selectedEnv.inventory !== undefined)
      ),
  );

  const handleSubmit = async (): Promise<void> => {
    const sourceIdToUse = useExisting ? selectedEnvironmentId : createdSourceId;

    if (!sourceIdToUse) return;

    const assessment = await discoverySourcesContext.createAssessment(
      name,
      'agent',
      undefined,
      sourceIdToUse,
    );

    await discoverySourcesContext.listAssessments();
    navigate(
      `/openshift/migration-assessment/migrate/assessments/${assessment.id}`,
    );
  };

  const isSubmitDisabled =
    !name || (useExisting ? !selectedEnvironmentId : !createdSourceId);

  return (
    <AppPage
      breadcrumbs={[
        {
          key: 1,
          to: '/openshift/migration-assessment/',
          children: 'Migration assessment',
        },
        {
          key: 2,
          to: '/openshift/migration-assessment/',
          children: 'assessments',
        },
        { key: 3, to: '#', isActive: true, children: 'create new assessment' },
      ]}
      title="Create new migration assessment"
    >
      <div style={{ maxWidth: '900px' }}>
        <Form isWidthLimited>
          <FormGroup
            label="Assessment Name"
            isRequired
            fieldId="assessment-name"
          >
            <InputGroup>
              <InputGroupItem isFill>
                <TextInput
                  id="assessment-name"
                  aria-label="Assessment name"
                  placeholder="Assessment 1"
                  value={name}
                  onChange={(_, v) => setName(v)}
                />
              </InputGroupItem>
            </InputGroup>
            <HelperText>
              <HelperTextItem>Name your migration assessment</HelperTextItem>
            </HelperText>
          </FormGroup>

          <TextContent style={{ marginTop: '16px' }}>
            <Text component="p" style={{ fontWeight: 600 }}>
              follow these steps to connect your environment and create the
              assessment report
            </Text>
            <ol style={{ paddingLeft: '1.2rem', lineHeight: 1.6 }}>
              <li>
                To create a migration assessment for an existing environment,
                select the already created environment from the list and click
                the “Create assessment report” button
              </li>
              <li>
                To connect to a new environment, click the “Add environment”
                button then download and import the Discovery OVA Image to your
                VMware environment
              </li>
              <li>
                When the VM is running, a link will appear below. Use this link
                to input credentials and connect to your environment
              </li>
              <li>
                After the connection is established, you’ll be able to proceed
                and view the discovery report
              </li>
            </ol>
          </TextContent>

          <div style={{ marginTop: '16px' }}>
            <Checkbox
              id="use-existing-env"
              label="For an existing environment"
              isChecked={useExisting}
              onChange={(_, checked) => setUseExisting(checked)}
            />
          </div>

          {useExisting && (
            <FormGroup
              label="Existing environments"
              isRequired
              fieldId="existing-environments"
            >
              <FormSelect
                id="existing-environments"
                value={selectedEnvironmentId}
                onChange={(_e, value) => setSelectedEnvironmentId(value)}
              >
                <FormSelectOption
                  value=""
                  label="Select an existing environment"
                />
                {availableEnvironments.map((env) => (
                  <FormSelectOption
                    key={env.id}
                    value={env.id}
                    label={env.name}
                  />
                ))}
              </FormSelect>
            </FormGroup>
          )}

          {useExisting && selectedEnvironmentId && (
            <div style={{ marginTop: '16px' }}>
              <SourcesTable
                onlySourceId={selectedEnvironmentId}
                onUploadSuccess={async () => {
                  await discoverySourcesContext.listSources();
                }}
              />
            </div>
          )}

          <div style={{ marginTop: '8px' }}>
            <Button
              variant="secondary"
              onClick={() => setIsSetupModalOpen(true)}
              isDisabled={useExisting}
            >
              Add environment
            </Button>
          </div>

          {createdSource?.agent?.status === 'waiting-for-credentials' && (
            <div style={{ marginTop: '16px' }}>
              <Alert
                isInline
                variant="custom"
                title="Discovery VM"
                actionLinks={
                  createdSource?.agent?.credentialUrl ? (
                    <AlertActionLink
                      component="a"
                      href={createdSource.agent.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {createdSource.agent.credentialUrl}
                    </AlertActionLink>
                  ) : undefined
                }
              >
                <TextContent>
                  <Text>
                    Click the link below to connect the Discovery Source to your
                    VMware environment.
                  </Text>
                </TextContent>
              </Alert>
            </div>
          )}

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <Button
              variant="primary"
              isDisabled={
                isSubmitDisabled ||
                discoverySourcesContext.isCreatingAssessment ||
                isSelectedNotReady
              }
              onClick={handleSubmit}
            >
              Create assessment report
            </Button>
            <Button variant="link" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </Form>

        {isSetupModalOpen && (
          <DiscoverySourceSetupModal
            isOpen={isSetupModalOpen}
            onClose={async () => {
              const newId = discoverySourcesContext.sourceCreatedId;
              await discoverySourcesContext.listSources();
              if (newId) {
                setUseExisting(true);
                setSelectedEnvironmentId(newId);
              }
              setIsSetupModalOpen(false);
            }}
            isDisabled={discoverySourcesContext.isDownloadingSource}
            onStartDownload={() => discoverySourcesContext.setDownloadUrl?.('')}
            onAfterDownload={async () => {
              const newId = discoverySourcesContext.sourceCreatedId;
              await discoverySourcesContext.listSources();
              if (newId) {
                setUseExisting(true);
                setSelectedEnvironmentId(newId);
              }
            }}
          />
        )}
      </div>
    </AppPage>
  );
};

CreateFromOva.displayName = 'CreateFromOva';

export default CreateFromOva;
