import React, { useCallback } from 'react';

import { Button, Icon, Tooltip } from '@patternfly/react-core';
import { UploadIcon } from '@patternfly/react-icons';

import { DiscoverySources } from '../../../../migration-wizard/contexts/discovery-sources/@types/DiscoverySources';

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
        } else {
          onUploadResult?.(
            'Unsupported file format. Please upload a JSON file.',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discoverySourcesContext, sourceId]);

  return asLink ? (
    <Button
      variant="link"
      onClick={handleUploadSource}
      style={{ padding: 0, marginTop: '5px' }}
    >
      Upload discovery file (JSON)
    </Button>
  ) : (
    <Tooltip content="Upload JSON file">
      <Button variant="plain" onClick={handleUploadSource}>
        <Icon size="md" isInline>
          <UploadIcon />
        </Icon>
      </Button>
    </Tooltip>
  );
};
