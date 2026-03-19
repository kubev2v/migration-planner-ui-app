/**
 * Normalizes an SSH public key by removing line breaks and extra whitespace.
 * SSH public keys should be on a single line.
 *
 * @param key - The SSH public key string to normalize
 * @returns The normalized SSH key (single line, trimmed)
 */
export const normalizeSshKey = (key: string): string => {
  if (!key) return "";

  // Remove all line breaks and carriage returns, then trim
  return key.replace(/[\r\n]+/g, " ").trim();
};

/**
 * Validates an SSH public key format.
 * Supports RSA, ED25519, and ECDSA key formats.
 *
 * @param key - The SSH public key string to validate
 * @returns null if valid or empty, error message string if invalid
 */
export const validateSshKey = (key: string): string | null => {
  const SSH_KEY_PATTERNS = {
    RSA: /^ssh-rsa\s+[A-Za-z0-9+/]+[=]{0,2}(\s+.*)?$/,
    ED25519: /^ssh-ed25519\s+[A-Za-z0-9+/]+[=]{0,2}(\s+.*)?$/,
    ECDSA:
      /^ssh-(ecdsa|sk-ecdsa)-sha2-nistp[0-9]+\s+[A-Za-z0-9+/]+[=]{0,2}(\s+.*)?$/,
  };

  if (!key) return null;

  const isValidKey = Object.values(SSH_KEY_PATTERNS).some((pattern) =>
    pattern.test(key.trim()),
  );
  return isValidKey
    ? null
    : "Invalid SSH key format. Please provide a valid SSH public key.";
};
