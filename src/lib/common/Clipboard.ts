export function canCopyToClipboard(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard?.writeText === "function" &&
    (typeof window === "undefined" || window.isSecureContext)
  );
}

export function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text).catch((err: unknown) => {
    console.error("Failed to copy to clipboard", err);
  });
}
