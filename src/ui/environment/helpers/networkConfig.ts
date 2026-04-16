import type { Source } from "@openshift-migration-advisor/planner-sdk";

/**
 * Type-safe helper to extract network configuration from a Source.
 * This ensures we always access the network via the correct path (src.infra.vmNetwork)
 * and provides compile-time safety if the SDK structure changes.
 */
export interface NetworkConfig {
  networkConfigType: "dhcp" | "static";
  ipAddress: string;
  subnetMask: string;
  defaultGateway: string;
  dns: string;
}

/**
 * Extracts network configuration from a Source object.
 * Returns normalized values (empty strings instead of null/undefined).
 * networkConfigType is "static" if vmNetwork.ipv4 exists, otherwise "dhcp".
 */
export const getNetworkConfig = (source: Source | undefined): NetworkConfig => {
  const network = source?.infra?.vmNetwork?.ipv4;

  const ipAddress = network?.ipAddress ?? "";
  const subnetMask = network?.subnetMask ?? "";
  const defaultGateway = network?.defaultGateway ?? "";
  const dns = network?.dns ?? "";

  const networkConfigType = network ? "static" : "dhcp";

  return {
    networkConfigType,
    ipAddress,
    subnetMask,
    defaultGateway,
    dns,
  };
};
