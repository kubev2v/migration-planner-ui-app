export const getApplianceVersionDisplay = (
  versionName: string,
): string | undefined => {
  if (!versionName || versionName === "unknown") {
    return undefined;
  }
  return versionName;
};
