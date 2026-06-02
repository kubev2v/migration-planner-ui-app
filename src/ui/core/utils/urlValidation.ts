/**
 * Parses a URL and returns it only if the protocol is http: or https:.
 * This prevents XSS attacks via javascript:, data:, vbscript:, and other malicious protocols.
 *
 * @param url - The URL string to validate
 * @returns The original URL string if safe (http/https), or undefined otherwise
 *
 * @example
 * safeExternalUrl('https://example.com') // 'https://example.com'
 * safeExternalUrl('http://example.com')  // 'http://example.com'
 * safeExternalUrl('javascript:alert(1)') // undefined
 * safeExternalUrl('data:text/html,<script>') // undefined
 * safeExternalUrl(null) // undefined
 */
export const safeExternalUrl = (
  url: string | undefined | null,
): string | undefined => {
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
};
