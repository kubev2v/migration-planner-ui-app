import React, { useCallback, useEffect, useState } from 'react';

import {
  Alert,
  Button,
  Checkbox,
  ClipboardCopy,
  clipboardCopyFunc,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextArea,
  TextContent,
  TextInput,
} from '@patternfly/react-core';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core/next';

import { useDiscoverySources } from '../../../../contexts/discovery-sources/Context';

export namespace DiscoverySourceSetupModal {
  export type Props = {
    isOpen?: boolean;
    isDisabled?: boolean;
    onClose?: (event?: KeyboardEvent | React.MouseEvent) => void;
    onStartDownload: () => void;
    onAfterDownload: () => Promise<void>;
  };
}

export const DiscoverySourceSetupModal: React.FC<
  DiscoverySourceSetupModal.Props
> = (props) => {
  const discoverySourcesContext = useDiscoverySources();
  const {
    isOpen = false,
    isDisabled = false,
    onClose,
    onStartDownload,
    onAfterDownload,
  } = props;
  const [sshKey, setSshKey] = useState('');
  const [sshKeyError, setSshKeyError] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [sourceName, setSourceName] = useState<string>('');
  const [environmentName, setEnvironmentName] = useState<string>('');
  const [httpProxy, setHttpProxy] = useState<string>('');
  const [httpsProxy, setHttpsProxy] = useState<string>('');
  const [noProxy, setNoProxy] = useState<string>('');
  const [enableProxy, setEnableProxy] = useState(false);
  const [isEditingConfiguration, setIsEditingConfiguration] = useState(false);

  const validateSshKey = useCallback((key: string): string | null => {
    const SSH_KEY_PATTERNS = {
      RSA: /^ssh-rsa\s+[A-Za-z0-9+/]+[=]{0,2}(\s+.*)?$/,
      ED25519: /^ssh-ed25519\s+[A-Za-z0-9+/]+[=]{0,2}(\s+.*)?$/,
      ECDSA:
        /^ssh-(ecdsa|sk-ecdsa)-sha2-nistp[0-9]+\s+[A-Za-z0-9+/]+[=]{0,2}(\s+.*)?$/,
    };

    if (!key) return null;

    const isValidKey = Object.values(SSH_KEY_PATTERNS).some((pattern) =>
      pattern.test(key.trim()),
    );
    return isValidKey
      ? null
      : 'Invalid SSH key format. Please provide a valid SSH public key.';
  }, []);

  const handleSshKeyChange = (value: string): void => {
    setSshKey(value);
    setSshKeyError(validateSshKey(value));
  };

  const resetForm = () => {
    setSshKey('');
    setSshKeyError(null);
    setShowUrl(false);
    setGeneratedUrl('');
    setSourceName('');
    setEnvironmentName('');
    setHttpProxy('');
    setHttpsProxy('');
    setNoProxy('');
    setEnableProxy(false);
    discoverySourcesContext.setDownloadUrl('');
    discoverySourcesContext.deleteSourceCreated();
    discoverySourcesContext.errorDownloadingSource = null;
  };

  const backToOvaConfiguration = () => {
    setShowUrl(false);
    discoverySourcesContext.setDownloadUrl('');
    setIsEditingConfiguration(true);
  };

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    async (event) => {
      event.preventDefault();

      if (!discoverySourcesContext.downloadSourceUrl) {
        if (isEditingConfiguration) {
          if (!discoverySourcesContext.sourceCreatedId) {
            console.error('No source ID available for editing');
            return;
          }
          await discoverySourcesContext.updateSource(
            discoverySourcesContext.sourceCreatedId,
            sshKey,
            httpProxy,
            httpsProxy,
            noProxy,
          );
        } else {
          const keyValidationError = validateSshKey(sshKey);
          if (keyValidationError) {
            setSshKeyError(keyValidationError);
            return;
          }

          if (environmentName === '') {
            return;
          }

          setSourceName(environmentName);

          await discoverySourcesContext.createDownloadSource(
            environmentName,
            sshKey,
            httpProxy,
            httpsProxy,
            noProxy,
          );
        }
      } else {
        onStartDownload();
        const anchor = document.createElement('a');
        anchor.download = sourceName + '.ova';
        anchor.href = discoverySourcesContext.downloadSourceUrl;
        anchor.click();
        anchor.remove();
        await onAfterDownload();
        resetForm();
        onClose?.();
      }
    },
    [
      sshKey,
      environmentName,
      httpProxy,
      httpsProxy,
      noProxy,
      validateSshKey,
      discoverySourcesContext,
      sourceName,
      onStartDownload,
      onAfterDownload,
      onClose,
    ],
  );

  useEffect(() => {
    if (discoverySourcesContext.downloadSourceUrl) {
      setGeneratedUrl(discoverySourcesContext.downloadSourceUrl);
      setShowUrl(true);
    }
  }, [discoverySourcesContext.downloadSourceUrl]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={onClose}
      ouiaId="DiscoverySourceSetupModal"
      aria-labelledby="discovery-source-setup-modal-title"
      aria-describedby="modal-box-body-discovery-source-setup"
    >
      <ModalHeader
        title="Add Environment"
        labelId="discovery-source-setup-modal-title"
        description={
          !showUrl
            ? 'To add a new environment create a discovery OVA image. Then download and import the OVA file into your VMWare environment'
            : ''
        }
      />
      <ModalBody id="modal-box-body-discovery-source-setup">
        <Form
          noValidate={false}
          id="discovery-source-setup-form"
          onSubmit={handleSubmit}
        >
          {!showUrl && (
            <>
              <FormGroup
                label="Name"
                isRequired
                fieldId="discovery-source-name-form-control"
              >
                <TextInput
                  id="discovery-source-name-form-control"
                  name="discoveryEnvironmentName"
                  type="text"
                  value={environmentName}
                  onChange={(_, value) => setEnvironmentName(value)}
                  placeholder="Example: ams-vcenter-prod-1"
                  pattern="^[a-zA-Z][a-zA-Z0-9_\-]*$"
                  maxLength={50}
                  minLength={1}
                  isRequired
                  isDisabled={isEditingConfiguration}
                  aria-describedby="name-helper-text"
                />
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem variant="default" id="name-helper-text">
                      Name your environment.
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>
              <FormGroup
                label="SSH Key"
                fieldId="discovery-source-sshkey-form-control"
              >
                <TextArea
                  id="discovery-source-sshkey-form-control"
                  name="discoverySourceSshKey"
                  value={sshKey}
                  onChange={(_, value) => handleSshKeyChange(value)}
                  type="text"
                  placeholder="Example: ssh-rsa AAAAB3NzaC1yc2E..."
                  aria-describedby="sshkey-helper-text"
                  validated={sshKeyError ? 'error' : 'default'}
                />
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem
                      variant={sshKeyError ? 'error' : 'default'}
                      id="sshkey-helper-text"
                    >
                      {sshKeyError ||
                        'Paste the content of a public ssh key you want to connect to your discovery VM.'}
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>
              <FormGroup label="Show proxy settings">
                <Checkbox
                  id="enable-proxy"
                  label="Enable proxy"
                  isChecked={enableProxy}
                  onChange={(_, checked) => setEnableProxy(checked)}
                />
              </FormGroup>
              {enableProxy && (
                <>
                  <FormGroup label="HTTP proxy URL">
                    <TextInput
                      name="httpProxy"
                      type="text"
                      value={httpProxy}
                      placeholder="http://proxy.example.com:8080"
                      onChange={(_, value) => setHttpProxy(value)}
                    />
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem>
                          URL must start with http.
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  </FormGroup>

                  <FormGroup label="HTTPS proxy URL">
                    <TextInput
                      name="httpsProxy"
                      type="text"
                      value={httpsProxy}
                      placeholder="https://proxy.example.com:8443"
                      onChange={(_, value) => setHttpsProxy(value)}
                    />
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem>
                          URL must start with https.
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  </FormGroup>

                  <FormGroup label="No proxy domains">
                    <TextInput
                      name="noProxy"
                      type="text"
                      value={noProxy}
                      placeholder="one.domain.com,second.domain.com"
                      onChange={(_, value) => setNoProxy(value)}
                      onBlur={() =>
                        setNoProxy(
                          noProxy
                            .split(',')
                            .map((s) => s.trim())
                            .join(','),
                        )
                      }
                    />
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem>
                          Use a comma to separate each listed domain. Preface a
                          domain with &quot;.&quot; to include its subdomains.
                          Use &quot;*&quot; to bypass the proxy for all
                          destinations.
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  </FormGroup>
                </>
              )}
            </>
          )}
          {showUrl && (
            <TextContent>
              <b>Ova Download URL</b>
              <ClipboardCopy
                isReadOnly
                onCopy={(event) => clipboardCopyFunc(event, generatedUrl)}
              >
                {generatedUrl}
              </ClipboardCopy>
            </TextContent>
          )}
        </Form>
        {discoverySourcesContext.errorDownloadingSource && (
          <Alert isInline variant="danger" title="Add Environment error">
            {discoverySourcesContext.errorDownloadingSource.message}
          </Alert>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          form="discovery-source-setup-form"
          type="submit"
          key="confirm"
          variant="primary"
          isDisabled={isDisabled || !!sshKeyError}
        >
          {!showUrl
            ? isEditingConfiguration
              ? 'Update OVA configuration'
              : 'Generate OVA'
            : 'Download OVA'}
        </Button>
        {showUrl && (
          <Button
            key="cancel"
            variant="link"
            onClick={() => {
              resetForm();
              onClose?.();
            }}
          >
            Close
          </Button>
        )}
        {showUrl && (
          <Button
            key="primary"
            variant="link"
            onClick={() => {
              backToOvaConfiguration();
            }}
          >
            Edit OVA configuration
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};
