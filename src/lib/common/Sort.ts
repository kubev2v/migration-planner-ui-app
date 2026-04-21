export function sortByNewestFirst<T extends { createdAt: Date }>(
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
    const date1 = i1[key] as Date;
    const date2 = i2[key] as Date;
    if (date1 === undefined && date2 === undefined) {
      return 0;
    }
    if (date1 === undefined) {
      return 1;
    }
    if (date2 === undefined) {
      return -1;
    }
    return date2.getTime() - date1.getTime();
  });
}
