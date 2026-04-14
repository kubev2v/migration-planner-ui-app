import { yupResolver } from "@hookform/resolvers/yup";
import {
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
} from "@patternfly/react-core";
import React, { useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";

import {
  CheckboxFormGroup,
  RadioButtonFormGroup,
  TextAreaFormGroup,
  TextInputFormGroup,
} from "../../core/components/form";
import { normalizeSshKey, validateSshKey } from "../helpers/sshKey";

const validationSchema: yup.ObjectSchema<Environment> = yup
  .object()
  .shape({
    name: yup
      .string()
      .required("Name is required")
      .matches(
        /^[a-zA-Z][a-zA-Z0-9_\\-]*$/,
        "Name must start with a letter and contain only letters, numbers, underscores, and hyphens",
      )
      .min(1)
      .max(50),
    sshKey: yup
      .string()
      .default("")
      .test(
        "ssh-key",
        "Invalid SSH key format. Please provide a valid SSH public key.",
        (value) => {
          if (!value) return true;
          return validateSshKey(value) === null;
        },
      ),
    enableProxy: yup.boolean().required().default(false),
    httpProxy: yup
      .string()
      .default("")
      .when("enableProxy", {
        is: true,
        then: (schema) =>
          schema.test("http-url", "URL must start with http://", (value) => {
            if (!value || !value.trim()) return true;
            return /^http:\/\//i.test(value.trim());
          }),
      }),
    httpsProxy: yup
      .string()
      .default("")
      .when("enableProxy", {
        is: true,
        then: (schema) =>
          schema.test("https-url", "URL must start with https://", (value) => {
            if (!value || !value.trim()) return true;
            return /^https:\/\//i.test(value.trim());
          }),
      }),
    noProxy: yup.string().default(""),
    networkConfigType: yup
      .string<"dhcp" | "static">()
      .oneOf(["dhcp", "static"])
      .required()
      .default("dhcp"),
    ipAddress: yup
      .string()
      .default("")
      .when("networkConfigType", {
        is: "static",
        then: (schema) =>
          schema
            .required("IP address is required")
            .test(
              "ip-address",
              "Invalid IP address format. Please use format like 192.168.1.100",
              (value) => {
                if (!value) return false;
                const ipPattern = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
                if (!ipPattern.test(value.trim())) return false;
                const parts = value.trim().split(".");
                if (parts.length !== 4) return false;
                return parts.every((part) => {
                  const num = parseInt(part, 10);
                  return !isNaN(num) && num >= 0 && num <= 255;
                });
              },
            ),
      }),
    subnetMask: yup
      .string()
      .default("")
      .when("networkConfigType", {
        is: "static",
        then: (schema) =>
          schema
            .required("Subnet mask is required")
            .test(
              "subnet-mask",
              "Subnet mask must be between 1 and 32",
              (value) => {
                if (!value) return false;
                const maskNum = parseInt(value.trim(), 10);
                return !isNaN(maskNum) && maskNum >= 1 && maskNum <= 32;
              },
            ),
      }),
    defaultGateway: yup
      .string()
      .default("")
      .when("networkConfigType", {
        is: "static",
        then: (schema) =>
          schema
            .required("Default gateway is required")
            .test(
              "ip-address",
              "Invalid IP address format. Please use format like 192.168.1.100",
              (value) => {
                if (!value) return false;
                const ipPattern = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
                if (!ipPattern.test(value.trim())) return false;
                const parts = value.trim().split(".");
                if (parts.length !== 4) return false;
                return parts.every((part) => {
                  const num = parseInt(part, 10);
                  return !isNaN(num) && num >= 0 && num <= 255;
                });
              },
            ),
      }),
    dns: yup
      .string()
      .default("")
      .when("networkConfigType", {
        is: "static",
        then: (schema) =>
          schema
            .required("DNS is required")
            .test(
              "ip-address",
              "Invalid IP address format. Please use format like 192.168.1.100",
              (value) => {
                if (!value) return false;
                const ipPattern = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
                if (!ipPattern.test(value.trim())) return false;
                const parts = value.trim().split(".");
                if (parts.length !== 4) return false;
                return parts.every((part) => {
                  const num = parseInt(part, 10);
                  return !isNaN(num) && num >= 0 && num <= 255;
                });
              },
            ),
      }),
  })
  .test(
    "proxy-fields",
    "At least one proxy field is required when proxy is enabled",
    function (values) {
      if (values.enableProxy) {
        const hasAny = Boolean(
          values.httpProxy?.trim() ||
          values.httpsProxy?.trim() ||
          values.noProxy?.trim(),
        );
        if (!hasAny) {
          return this.createError({
            path: "enableProxy",
            message:
              "At least one proxy field is required when proxy is enabled",
          });
        }
      }
      return true;
    },
  );

export interface EnvironmentFormProps {
  id: string;
  onSubmit: (values: Environment) => void;
  setIsValid?: (isValid: boolean) => void;
  environment?: Environment;
}

export interface Environment {
  name: string;
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

export const EnvironmentForm: React.FC<EnvironmentFormProps> = ({
  id,
  onSubmit,
  environment,
  setIsValid,
}) => {
  const methods = useForm<Environment>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
    defaultValues: environment || {
      name: "",
      sshKey: "",
      enableProxy: false,
      httpProxy: "",
      httpsProxy: "",
      noProxy: "",
      networkConfigType: "dhcp",
      ipAddress: "",
      subnetMask: "",
      defaultGateway: "",
      dns: "",
    },
  });

  const enableProxy = useWatch({
    control: methods.control,
    name: "enableProxy",
  });
  const networkConfigType = useWatch({
    control: methods.control,
    name: "networkConfigType",
  });

  useEffect(() => {
    setIsValid?.(methods.formState.isValid);
  }, [methods.formState.isValid, setIsValid]);

  const handleFormSubmit = (data: Environment) => {
    onSubmit({
      ...data,
      sshKey: normalizeSshKey(data.sshKey),
    });
  };

  return (
    <FormProvider {...methods}>
      <Form
        noValidate={false}
        id={id}
        onSubmit={(e) => {
          void methods.handleSubmit(handleFormSubmit)(e);
        }}
      >
        <TextInputFormGroup
          label="Name"
          id="discovery-source-name-form-control"
          name="name"
          isRequired
          placeholder="Example: ams-vcenter-prod-1"
          isDisabled={!!environment?.name}
        />

        <TextAreaFormGroup
          label="SSH Key"
          id="discovery-source-sshkey-form-control"
          name="sshKey"
          placeholder="Example: ssh-rsa AAAAB3NzaC1yc2E..."
        />

        <CheckboxFormGroup
          id="enable-proxy"
          label="Enable proxy"
          name="enableProxy"
        />

        {enableProxy && (
          <>
            <TextInputFormGroup
              label="HTTP proxy URL"
              id="http-proxy-form-control"
              name="httpProxy"
              placeholder="http://proxy.example.com:8080"
            />

            <TextInputFormGroup
              label="HTTPS proxy URL"
              id="https-proxy-form-control"
              name="httpsProxy"
              placeholder="https://proxy.example.com:8443"
            />

            <TextInputFormGroup
              label="No proxy domains"
              id="no-proxy-form-control"
              name="noProxy"
              placeholder="one.domain.com,second.domain.com"
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                const formatted = e.currentTarget.value
                  .split(",")
                  .map((s: string) => s.trim())
                  .join(",");
                methods.setValue("noProxy", formatted);
              }}
              formHelperText={
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>
                      Use a comma to separate each listed domain. Preface a
                      domain with &ldquo;.&rdquo; to include its subdomains. Use
                      &ldquo;*&rdquo; to bypass the proxy for all destinations.
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              }
            />
          </>
        )}

        <RadioButtonFormGroup
          id="network-config"
          name="networkConfigType"
          options={[
            { value: "dhcp", label: "DHCP", id: "dhcp-radio" },
            {
              value: "static",
              label: "Static IP configuration",
              id: "static-ip-radio",
            },
          ]}
        />

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
                  type="text"
                  {...methods.register("ipAddress")}
                  placeholder="10.0.0.2"
                  isRequired
                  validated={
                    methods.formState.errors.ipAddress ? "error" : "default"
                  }
                  aria-describedby="ip-address-helper-text"
                  style={{ flex: 1 }}
                />
                <span>/</span>
                <TextInput
                  id="subnet-mask-form-control"
                  type="text"
                  {...methods.register("subnetMask")}
                  placeholder="24"
                  isRequired
                  validated={
                    methods.formState.errors.subnetMask ? "error" : "default"
                  }
                  style={{ width: "60px" }}
                  aria-describedby="ip-address-helper-text"
                />
              </div>

              {(methods.formState.errors.ipAddress ||
                methods.formState.errors.subnetMask) &&
                (methods.formState.isSubmitted ||
                  methods.formState.touchedFields.ipAddress ||
                  methods.formState.touchedFields.subnetMask) && (
                  <FormHelperText>
                    <HelperText>
                      {methods.formState.errors.ipAddress && (
                        <HelperTextItem variant="error">
                          {methods.formState.errors.ipAddress.message}
                        </HelperTextItem>
                      )}
                      {methods.formState.errors.subnetMask && (
                        <HelperTextItem variant="error">
                          {methods.formState.errors.subnetMask.message}
                        </HelperTextItem>
                      )}
                    </HelperText>
                  </FormHelperText>
                )}
            </FormGroup>

            <TextInputFormGroup
              label="Default gateway"
              id="default-gateway-form-control"
              name="defaultGateway"
              isRequired
              placeholder="10.0.0.1"
            />

            <TextInputFormGroup
              label="DNS"
              id="dns-form-control"
              name="dns"
              isRequired
              placeholder="10.0.0.1"
            />
          </>
        )}
      </Form>
    </FormProvider>
  );
};

EnvironmentForm.displayName = "EnvironmentForm";
