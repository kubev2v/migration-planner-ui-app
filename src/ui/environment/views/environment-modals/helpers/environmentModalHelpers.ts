import type React from "react";

import type { SourceModel } from "../../../../../models/SourceModel";
import { normalizeSshKey, validateSshKey } from "../../../helpers/sshKey";
import {
  areStaticIpFieldsEmpty,
  hasStaticIpErrors,
  validateHttpProxy,
  validateHttpsProxy,
  validateIpAddress,
  validateProxyGroup,
  validateStaticIpFields,
  validateSubnetMask,
} from "../../../helpers/validation";
import type {
  EnvironmentFormErrors,
  EnvironmentFormValues,
} from "../EnvironmentForm";

export type ModalMode = "create" | "edit";

export interface ProxyConfig {
  enableProxy: boolean;
  httpProxy: string;
  httpsProxy: string;
  noProxy: string;
}

export interface NetworkConfig {
  networkConfigType: "dhcp" | "static";
  ipAddress: string;
  subnetMask: string;
  defaultGateway: string;
  dns: string;
}

export function getModalMode(sourceId?: string): ModalMode {
  return sourceId ? "edit" : "create";
}

export function validateField(
  field: string,
  formValues: EnvironmentFormValues,
  setErrors: React.Dispatch<React.SetStateAction<EnvironmentFormErrors>>,
): void {
  switch (field) {
    case "sshKey":
      setErrors((prev) => ({
        ...prev,
        sshKeyError: validateSshKey(formValues.sshKey),
      }));
      break;
    case "ipAddress":
      setErrors((prev) => ({
        ...prev,
        ipAddressError: validateIpAddress(formValues.ipAddress),
      }));
      break;
    case "subnetMask":
      setErrors((prev) => ({
        ...prev,
        subnetMaskError: validateSubnetMask(formValues.subnetMask),
      }));
      break;
    case "defaultGateway":
      setErrors((prev) => ({
        ...prev,
        defaultGatewayError: validateIpAddress(formValues.defaultGateway),
      }));
      break;
    case "dns":
      setErrors((prev) => ({
        ...prev,
        dnsError: validateIpAddress(formValues.dns),
      }));
      break;
    case "httpProxy":
      setErrors((prev) => ({
        ...prev,
        httpProxyError: validateHttpProxy(formValues.httpProxy),
      }));
      break;
    case "httpsProxy":
      setErrors((prev) => ({
        ...prev,
        httpsProxyError: validateHttpsProxy(formValues.httpsProxy),
      }));
      break;
    case "proxy":
    case "noProxy":
      setErrors((prev) => ({
        ...prev,
        proxyGroupError: validateProxyGroup(
          formValues.enableProxy,
          formValues.httpProxy,
          formValues.httpsProxy,
          formValues.noProxy,
        ),
      }));
      break;
  }
}

export function handleFieldChangeHelper(
  field: keyof EnvironmentFormValues,
  value: string | boolean,
  setFormValues: React.Dispatch<React.SetStateAction<EnvironmentFormValues>>,
  setErrors: React.Dispatch<React.SetStateAction<EnvironmentFormErrors>>,
): void {
  setFormValues((prev) => ({
    ...prev,
    [field]: value,
  }));

  if (field === "enableProxy" && value === false) {
    setErrors((prev) => ({
      ...prev,
      httpProxyError: null,
      httpsProxyError: null,
      proxyGroupError: null,
    }));
  }
  if (field === "networkConfigType" && value !== "static") {
    setErrors((prev) => ({
      ...prev,
      ipAddressError: null,
      subnetMaskError: null,
      defaultGatewayError: null,
      dnsError: null,
    }));
  }
}

export function validateProxyFields(
  formValues: EnvironmentFormValues,
  setErrors: React.Dispatch<React.SetStateAction<EnvironmentFormErrors>>,
): boolean {
  if (!formValues.enableProxy) {
    return true;
  }

  const httpErr = validateHttpProxy(formValues.httpProxy);
  const httpsErr = validateHttpsProxy(formValues.httpsProxy);
  const proxyErr = validateProxyGroup(
    formValues.enableProxy,
    formValues.httpProxy,
    formValues.httpsProxy,
    formValues.noProxy,
  );

  setErrors((prev) => ({
    ...prev,
    httpProxyError: httpErr,
    httpsProxyError: httpsErr,
    proxyGroupError: proxyErr,
  }));

  return !httpErr && !httpsErr && !proxyErr;
}

export function validateStaticIpSubmit(
  formValues: EnvironmentFormValues,
  setErrors: React.Dispatch<React.SetStateAction<EnvironmentFormErrors>>,
): boolean {
  if (formValues.networkConfigType !== "static") {
    return true;
  }

  if (
    areStaticIpFieldsEmpty(
      formValues.ipAddress,
      formValues.subnetMask,
      formValues.defaultGateway,
      formValues.dns,
    )
  ) {
    return false;
  }

  const staticIpErrors = validateStaticIpFields(
    formValues.ipAddress,
    formValues.subnetMask,
    formValues.defaultGateway,
    formValues.dns,
  );

  setErrors((prev) => ({
    ...prev,
    ...staticIpErrors,
  }));

  return !hasStaticIpErrors(staticIpErrors);
}

export function getInitialFormValues(
  mode: ModalMode,
  editSource?: SourceModel,
  editProxyConfig?: ProxyConfig | null,
  editNetworkConfig?: NetworkConfig | null,
): EnvironmentFormValues {
  if (mode === "create") {
    return {
      environmentName: "",
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
    };
  }

  return {
    environmentName: editSource?.name || "",
    sshKey: "",
    enableProxy: editProxyConfig?.enableProxy || false,
    httpProxy: editProxyConfig?.httpProxy || "",
    httpsProxy: editProxyConfig?.httpsProxy || "",
    noProxy: editProxyConfig?.noProxy || "",
    networkConfigType: editNetworkConfig?.networkConfigType || "dhcp",
    ipAddress: editNetworkConfig?.ipAddress || "",
    subnetMask: editNetworkConfig?.subnetMask || "",
    defaultGateway: editNetworkConfig?.defaultGateway || "",
    dns: editNetworkConfig?.dns || "",
  };
}

export function calculateFormChanges(
  formValues: EnvironmentFormValues,
  initialValues: EnvironmentFormValues,
): boolean {
  return (
    formValues.sshKey !== initialValues.sshKey ||
    formValues.httpProxy !== initialValues.httpProxy ||
    formValues.httpsProxy !== initialValues.httpsProxy ||
    formValues.noProxy !== initialValues.noProxy ||
    formValues.enableProxy !== initialValues.enableProxy ||
    formValues.networkConfigType !== initialValues.networkConfigType ||
    formValues.dns !== initialValues.dns ||
    formValues.subnetMask !== initialValues.subnetMask ||
    formValues.defaultGateway !== initialValues.defaultGateway ||
    formValues.ipAddress !== initialValues.ipAddress
  );
}

export function isSubmitDisabledHelper(
  formValues: EnvironmentFormValues,
  errors: EnvironmentFormErrors,
  mode: ModalMode,
  hasFormChanges: boolean,
): boolean {
  const baseDisabled =
    !!errors.sshKeyError ||
    (formValues.networkConfigType === "static" &&
      (!!errors.ipAddressError ||
        !!errors.subnetMaskError ||
        !!errors.defaultGatewayError ||
        !!errors.dnsError)) ||
    (formValues.enableProxy &&
      (!!errors.httpProxyError ||
        !!errors.httpsProxyError ||
        !!errors.proxyGroupError)) ||
    (formValues.enableProxy &&
      !(
        formValues.httpProxy.trim() ||
        formValues.httpsProxy.trim() ||
        formValues.noProxy.trim()
      )) ||
    (formValues.networkConfigType === "static" &&
      (!formValues.dns.trim() ||
        !formValues.subnetMask.trim() ||
        !formValues.defaultGateway.trim() ||
        !formValues.ipAddress.trim()));

  if (mode === "create") {
    return baseDisabled || !formValues.environmentName.trim();
  }

  return baseDisabled || !hasFormChanges;
}

export function getInitialErrors(): EnvironmentFormErrors {
  return {
    sshKeyError: null,
    ipAddressError: null,
    subnetMaskError: null,
    defaultGatewayError: null,
    dnsError: null,
    httpProxyError: null,
    httpsProxyError: null,
    proxyGroupError: null,
  };
}

export function validateSshKeyForMode(
  mode: ModalMode,
  sshKey: string,
  setErrors: React.Dispatch<React.SetStateAction<EnvironmentFormErrors>>,
): boolean {
  if (mode === "edit" && !sshKey) {
    return true;
  }

  const keyValidationError = validateSshKey(sshKey);
  if (keyValidationError) {
    setErrors((prev) => ({ ...prev, sshKeyError: keyValidationError }));
    return false;
  }

  return true;
}

export { normalizeSshKey };
