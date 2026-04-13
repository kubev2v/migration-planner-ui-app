export function sortByNewestFirst<T extends { createdAt: string }>(
  items: T[],
): T[];
export function sortByNewestFirst<T, K extends keyof T>(
  items: T[],
  key: K,
): T[];
export function sortByNewestFirst<T, K extends keyof T>(
  items: T[],
  key: K = "createdAt" as K,
): T[] {
  return [...items].sort((i1, i2) => {
    const iso1 = i1[key] as string;
    const iso2 = i2[key] as string;
    if (iso1 === undefined && iso2 === undefined) {
      return 0;
    }
    if (iso1 === undefined) {
      return 1;
    }
    if (iso2 === undefined) {
      return -1;
    }
    const date1 = new Date(iso1);
    const date2 = new Date(iso2);
    return date2.getTime() - date1.getTime();
  });
}
