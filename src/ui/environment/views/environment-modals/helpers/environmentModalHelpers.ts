import type { SourceModel } from "../../../../../models/SourceModel";
import type { NetworkConfig } from "../../../helpers/networkConfig";
import type { ProxyConfig } from "../../../helpers/proxyConfig";
import type { EnvironmentFormValues } from "../EnvironmentForm";

export type ModalMode = "create" | "edit";

export function getModalMode(sourceId?: string): ModalMode {
  return sourceId ? "edit" : "create";
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
    sshKey: editSource?.infra?.sshPublicKey || "",
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
