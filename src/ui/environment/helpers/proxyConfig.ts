import type { Source } from "@openshift-migration-advisor/planner-sdk";

/**
 * Type-safe helper to extract proxy configuration from a Source.
 * This ensures we always access the proxy via the correct path (src.infra.proxy)
 * and provides compile-time safety if the SDK structure changes.
 */
export interface ProxyConfig {
  httpProxy: string;
  httpsProxy: string;
  noProxy: string;
  enableProxy: boolean;
}

/**
 * Extracts proxy configuration from a Source object.
 * Returns normalized values (empty strings instead of null/undefined).
 */
export const getProxyConfig = (source: Source | undefined): ProxyConfig => {
  const proxy = source?.infra?.proxy;

  const httpProxy = proxy?.httpUrl ?? "";
  const httpsProxy = proxy?.httpsUrl ?? "";
  const noProxy = proxy?.noProxy ?? "";

  return {
    httpProxy,
    httpsProxy,
    noProxy,
    enableProxy: Boolean(
      httpProxy.trim() || httpsProxy.trim() || noProxy.trim(),
    ),
  };
};
