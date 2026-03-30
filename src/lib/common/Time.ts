export const ONE_MILLISECOND = 1;
export const ONE_SECOND_IN_MILLISECOND = 1000 * ONE_MILLISECOND;
export const ONE_MINUTE_IN_MILLISECOND = 60 * ONE_SECOND_IN_MILLISECOND;
export const ONE_HOUR_IN_MILLISECOND = 60 * ONE_MINUTE_IN_MILLISECOND;
export const ONE_DAY_IN_MILLISECOND = 24 * ONE_HOUR_IN_MILLISECOND;
export const ONE_WEEK_IN_MILLISECOND = 7 * ONE_DAY_IN_MILLISECOND;
export const AVERAGE_DAYS_PER_MONTH = 30.44;
export const AVERAGE_DAYS_PER_YEAR = 365.25;

export const Time = {
  Millisecond: ONE_MILLISECOND,
  Second: ONE_SECOND_IN_MILLISECOND,
  Minute: ONE_MINUTE_IN_MILLISECOND,
  Hour: ONE_HOUR_IN_MILLISECOND,
  Day: ONE_DAY_IN_MILLISECOND,
  Week: ONE_WEEK_IN_MILLISECOND,
  Month: Math.floor(AVERAGE_DAYS_PER_MONTH * ONE_DAY_IN_MILLISECOND),
  Year: Math.floor(AVERAGE_DAYS_PER_YEAR * ONE_DAY_IN_MILLISECOND),
} as const;
export type Time = (typeof Time)[keyof typeof Time];

export const sleep = (delayMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

const TIME_UNITS: Array<[string, number]> = [
  ["year", Time.Year],
  ["month", Time.Month],
  ["week", Time.Week],
  ["day", Time.Day],
  ["hour", Time.Hour],
  ["minute", Time.Minute],
  ["second", Time.Second],
];

export function humanizeDate(when: Date): string {
  const diff = new Date().getTime() - when.getTime();
  for (const [unit, milliseconds] of TIME_UNITS) {
    const quotient = Math.floor(diff / milliseconds);
    if (quotient > 0) {
      return `${quotient} ${unit}${quotient > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}
