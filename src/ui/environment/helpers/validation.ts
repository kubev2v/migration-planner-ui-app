export const validateIpAddress = (ip: string): string | null => {
  if (!ip.trim()) return null;

  const ipPattern = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
  if (!ipPattern.test(ip.trim())) {
    return "Invalid IP address format. Please use format like 192.168.1.100";
  }

  const parts = ip.trim().split(".");
  if (parts.length !== 4) {
    return "IP address must have 4 octets separated by dots";
  }

  for (const part of parts) {
    const num = parseInt(part, 10);
    if (isNaN(num) || num < 0 || num > 255) {
      return "Each octet must be between 0 and 255";
    }
  }

  return null;
};

export const validateSubnetMask = (mask: string): string | null => {
  if (!mask.trim()) return null;

  const trimmed = mask.trim();
  if (!/^\d+$/.test(trimmed)) {
    return "Subnet mask must be between 1 and 32";
  }

  const maskNum = parseInt(trimmed, 10);
  if (maskNum < 1 || maskNum > 32) {
    return "Subnet mask must be between 1 and 32";
  }

  return null;
};

export const validateHttpProxy = (proxy: string): string | null => {
  const trimmed = proxy.trim();
  if (!trimmed) return null;

  if (!/^http:\/\//i.test(trimmed)) {
    return "URL must start with http://";
  }

  return null;
};

export const validateHttpsProxy = (proxy: string): string | null => {
  const trimmed = proxy.trim();
  if (!trimmed) return null;

  if (!/^https:\/\//i.test(trimmed)) {
    return "URL must start with https://";
  }

  return null;
};

export const validateProxyGroup = (
  enableProxy: boolean,
  httpProxy: string,
  httpsProxy: string,
  noProxy: string,
): string | null => {
  if (!enableProxy) return null;

  const hasAnyProxyValue = Boolean(
    httpProxy.trim() || httpsProxy.trim() || noProxy.trim(),
  );

  if (!hasAnyProxyValue) {
    return "At least one proxy field is required when proxy is enabled";
  }

  return null;
};

export const validateStaticIpFields = (
  ipAddress: string,
  subnetMask: string,
  defaultGateway: string,
  dns: string,
): {
  ipAddressError: string | null;
  subnetMaskError: string | null;
  defaultGatewayError: string | null;
  dnsError: string | null;
} => {
  return {
    ipAddressError: validateIpAddress(ipAddress),
    subnetMaskError: validateSubnetMask(subnetMask),
    defaultGatewayError: validateIpAddress(defaultGateway),
    dnsError: validateIpAddress(dns),
  };
};

export const hasStaticIpErrors = (errors: {
  ipAddressError: string | null;
  subnetMaskError: string | null;
  defaultGatewayError: string | null;
  dnsError: string | null;
}): boolean => {
  return Boolean(
    errors.ipAddressError ||
    errors.subnetMaskError ||
    errors.defaultGatewayError ||
    errors.dnsError,
  );
};

export const areStaticIpFieldsEmpty = (
  ipAddress: string,
  subnetMask: string,
  defaultGateway: string,
  dns: string,
): boolean => {
  return (
    !ipAddress.trim() ||
    !subnetMask.trim() ||
    !defaultGateway.trim() ||
    !dns.trim()
  );
};
