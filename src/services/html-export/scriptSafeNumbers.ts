/**
 * Coerce untrusted values to finite numbers for HTML export.
 * SDK responses are not runtime-validated; string payloads in numeric
 * fields must not be embedded verbatim inside inline <script> blocks.
 */
export function coerceFiniteNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** JSON array of numbers safe for interpolation into inline script tags. */
export function stringifyScriptNumbers(values: readonly unknown[]): string {
  return JSON.stringify(values.map(coerceFiniteNumber));
}
