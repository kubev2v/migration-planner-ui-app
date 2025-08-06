import React, { useCallback } from 'react';

import { Button, Icon, Tooltip } from '@patternfly/react-core';
import { UploadIcon } from '@patternfly/react-icons';

interface UploadInventoryProps {
  discoverySourcesContext: DiscoverySources.Context;
  sourceId: string;
  asLink?: boolean;
  onUploadResult?: (message?: string, isError?: boolean) => void;
  onUploadSuccess?: () => void;
}

export const UploadInventoryAction: React.FC<UploadInventoryProps> = ({
  discoverySourcesContext,
  sourceId,
  asLink,
  onUploadResult,
  onUploadSuccess,
}) => {
  const handleUploadSource = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.xlsx';
    input.style.visibility = 'hidden';

    input.onchange = async (event: Event) => {
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
          // Handle JSON file
          const content = await file.text();
          try {
            await discoverySourcesContext.updateInventory(
              sourceId,
              JSON.parse(content),
            );
            onUploadResult?.('Discovery file uploaded successfully', false);
          } catch (error) {
            onUploadResult?.(
              error?.message || 'Failed to update inventory',
              true,
            );
          }
        } else if (fileExtension === 'xlsx') {
          // Handle Excel file
          try {
            // Convert File to Blob for the upload
            // Use a generic content type that the API accepts
            const blob = new Blob([file], {
              type: 'application/octet-stream',
            });
            await discoverySourcesContext.uploadRvtoolsFile(sourceId, blob);
            onUploadResult?.('RVTools file uploaded successfully', false);
          } catch (error) {
            onUploadResult?.(
              error?.message || 'Failed to upload RVTools file',
              true,
            );
          }
        } else {
          onUploadResult?.(
            'Unsupported file format. Please upload a JSON or Excel (.xlsx) file.',
            true,
          );
        }
      } catch (err) {
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
  }, [discoverySourcesContext, sourceId]);

  return asLink ? (
    <Button
      variant="link"
      onClick={handleUploadSource}
      style={{ padding: 0, marginTop: '5px' }}
    >
      Upload discovery file (JSON/Excel)
    </Button>
  ) : (
    <Tooltip content="Upload JSON or Excel file">
      <Button variant="plain" onClick={handleUploadSource}>
        <Icon size="md" isInline>
          <UploadIcon />
        </Icon>
      </Button>
    </Tooltip>
  );
};
