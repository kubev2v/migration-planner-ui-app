import { DiscoverySources } from '../migration-wizard/contexts/discovery-sources/@types/DiscoverySources';

export const uploadInventoryFile = async (
  sourceId: string,
  discoverySourcesContext: DiscoverySources.Context,
  onUploadResult?: (message: string, isError?: boolean) => void,
  onUploadSuccess?: () => void,
): Promise<void> => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.style.visibility = 'hidden';

  input.onchange = async (event: Event): Promise<void> => {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    const maxSize = 12582912; // 12 MiB
    if (file.size > maxSize) {
      onUploadResult?.(
        'The file is too big. Upload a file up to 12 MiB.',
        true,
      );
      return;
    }

    const fileExtension = file.name.toLowerCase().split('.').pop();

    try {
      if (fileExtension === 'json') {
        const content = await file.text();
        try {
          await discoverySourcesContext.updateInventory(
            sourceId,
            JSON.parse(content),
          );
          onUploadResult?.('Discovery file uploaded successfully', false);
        } catch (error: unknown) {
          const message =
            (error as { message?: string })?.message ||
            'Failed to update inventory';
          onUploadResult?.(message, true);
        }
      } else {
        onUploadResult?.(
          'Unsupported file format. Please upload a JSON file.',
          true,
        );
      }
    } catch {
      onUploadResult?.(
        'Failed to import file. Please check the file format.',
        true,
      );
    } finally {
      input.remove();
      await discoverySourcesContext.listSources();
      onUploadSuccess?.();
    }
  };

  document.body.appendChild(input);
  input.click();
};
