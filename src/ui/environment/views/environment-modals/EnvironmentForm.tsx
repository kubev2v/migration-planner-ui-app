import {
  Checkbox,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Radio,
  TextArea,
  TextInput,
} from "@patternfly/react-core";
import React from "react";

export interface EnvironmentFormValues {
  environmentName: string;
  sshKey: string;
  enableProxy: boolean;
  httpProxy: string;
  httpsProxy: string;
  noProxy: string;
  networkConfigType: "dhcp" | "static";
  ipAddress: string;
  subnetMask: string;
  defaultGateway: string;
  dns: string;
}

export interface EnvironmentFormErrors {
  sshKeyError: string | null;
  ipAddressError: string | null;
  subnetMaskError: string | null;
  defaultGatewayError: string | null;
  dnsError: string | null;
  httpProxyError: string | null;
  httpsProxyError: string | null;
  proxyGroupError: string | null;
}

export interface EnvironmentFormProps {
  mode: "create" | "edit";
  formValues: EnvironmentFormValues;
  errors: EnvironmentFormErrors;
  onFieldChange: (
    field: keyof EnvironmentFormValues,
    value: string | boolean,
  ) => void;
  onValidate: (field: string) => void;
}

export const EnvironmentForm: React.FC<EnvironmentFormProps> = ({
  mode,
  formValues,
  errors,
  onFieldChange,
  onValidate,
}) => {
  const {
    environmentName,
    sshKey,
    enableProxy,
    httpProxy,
    httpsProxy,
    noProxy,
    networkConfigType,
    ipAddress,
    subnetMask,
    defaultGateway,
    dns,
  } = formValues;

  const {
    sshKeyError,
    ipAddressError,
    subnetMaskError,
    defaultGatewayError,
    dnsError,
    httpProxyError,
    httpsProxyError,
  } = errors;

  return (
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
          onChange={(_, value) => onFieldChange("environmentName", value)}
          placeholder="Example: ams-vcenter-prod-1"
          pattern="^[a-zA-Z][a-zA-Z0-9_\-]*$"
          maxLength={50}
          minLength={1}
          isRequired
          isDisabled={mode === "edit"}
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

      <FormGroup label="SSH Key" fieldId="discovery-source-sshkey-form-control">
        <TextArea
          id="discovery-source-sshkey-form-control"
          name="discoverySourceSshKey"
          value={sshKey}
          onChange={(_, value) => {
            onFieldChange("sshKey", value);
            onValidate("sshKey");
          }}
          type="text"
          placeholder="Example: ssh-rsa AAAAB3NzaC1yc2E..."
          aria-describedby="sshkey-helper-text"
          validated={sshKeyError ? "error" : "default"}
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              variant={sshKeyError ? "error" : "default"}
              id="sshkey-helper-text"
            >
              {sshKeyError ||
                "Paste the content of a public ssh key you want to connect to your discovery VM."}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>

      <FormGroup>
        <Checkbox
          id="enable-proxy"
          label="Enable proxy"
          isChecked={enableProxy}
          onChange={(_, checked) => {
            onFieldChange("enableProxy", checked);
            onValidate("proxy");
          }}
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
              onChange={(_, value) => {
                onFieldChange("httpProxy", value);
                onValidate("httpProxy");
              }}
              validated={httpProxyError ? "error" : "default"}
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant={httpProxyError ? "error" : "default"}>
                  {httpProxyError || "URL must start with http."}
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
              onChange={(_, value) => {
                onFieldChange("httpsProxy", value);
                onValidate("httpsProxy");
              }}
              validated={httpsProxyError ? "error" : "default"}
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant={httpsProxyError ? "error" : "default"}>
                  {httpsProxyError || "URL must start with https."}
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
              onChange={(_, value) => {
                onFieldChange("noProxy", value);
                onValidate("noProxy");
              }}
              onBlur={() => {
                const trimmed = noProxy
                  .split(",")
                  .map((s) => s.trim())
                  .join(",");
                onFieldChange("noProxy", trimmed);
              }}
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  Use a comma to separate each listed domain. Preface a domain
                  with &ldquo;.&rdquo; to include its subdomains. Use
                  &ldquo;*&rdquo; to bypass the proxy for all destinations.
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>
        </>
      )}

      <FormGroup>
        <div style={{ display: "flex", gap: "16px" }}>
          <Radio
            id="dhcp-radio"
            name="network-config"
            label="DHCP"
            isChecked={networkConfigType === "dhcp"}
            onChange={() => onFieldChange("networkConfigType", "dhcp")}
          />
          <Radio
            id="static-ip-radio"
            name="network-config"
            label="Static IP configuration"
            isChecked={networkConfigType === "static"}
            onChange={() => onFieldChange("networkConfigType", "static")}
          />
        </div>
      </FormGroup>

      {networkConfigType === "static" && (
        <>
          <FormGroup
            label="IP address / subnet mask"
            isRequired
            fieldId="ip-address-form-control"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <TextInput
                id="ip-address-form-control"
                name="ipAddress"
                type="text"
                value={ipAddress}
                onChange={(_, value) => {
                  onFieldChange("ipAddress", value);
                  onValidate("ipAddress");
                }}
                placeholder="10.0.0.2"
                isRequired
                validated={ipAddressError ? "error" : "default"}
                aria-describedby="ip-address-helper-text"
                style={{ flex: 1 }}
              />
              <span>/</span>
              <TextInput
                id="subnet-mask-form-control"
                name="subnetMask"
                type="text"
                value={subnetMask}
                onChange={(_, value) => {
                  onFieldChange("subnetMask", value);
                  onValidate("subnetMask");
                }}
                placeholder="24"
                isRequired
                validated={subnetMaskError ? "error" : "default"}
                style={{ width: "60px" }}
                aria-describedby="ip-address-helper-text"
              />
            </div>
            {(ipAddressError || subnetMaskError) && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant="error">
                    {ipAddressError || subnetMaskError}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>

          <FormGroup
            label="Default gateway"
            isRequired
            fieldId="default-gateway-form-control"
          >
            <TextInput
              id="default-gateway-form-control"
              name="defaultGateway"
              type="text"
              value={defaultGateway}
              onChange={(_, value) => {
                onFieldChange("defaultGateway", value);
                onValidate("defaultGateway");
              }}
              placeholder="10.0.0.1"
              isRequired
              validated={defaultGatewayError ? "error" : "default"}
              style={{ flex: 1 }}
              aria-describedby="default-gateway-helper-text"
            />
            {defaultGatewayError && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant="error">
                    {defaultGatewayError}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>

          <FormGroup label="DNS" isRequired fieldId="dns-form-control">
            <TextInput
              id="dns-form-control"
              name="dns"
              type="text"
              value={dns}
              onChange={(_, value) => {
                onFieldChange("dns", value);
                onValidate("dns");
              }}
              placeholder="10.0.0.1"
              isRequired
              validated={dnsError ? "error" : "default"}
              style={{ flex: 1 }}
              aria-describedby="dns-helper-text"
            />
            {dnsError && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant="error">{dnsError}</HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
        </>
      )}
    </>
  );
};
