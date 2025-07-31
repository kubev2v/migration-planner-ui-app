import React, { useCallback, useEffect, useState } from "react";
import { Tooltip, Button, Icon, Modal } from "@patternfly/react-core";
import { UploadIcon } from "@patternfly/react-icons";

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
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.visibility = "hidden";

    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement)?.files?.[0];
      if (!file) return;

      const maxSize = 12582912; // 12 MiB
      if (file.size > maxSize) {
        onUploadResult?.("The file is too big. Upload a file up to 12 MiB.", true);
        return;
      }

      try {
        const content = await file.text();
        await discoverySourcesContext.updateSource(sourceId, JSON.parse(content));
        if (discoverySourcesContext.errorUpdatingSource){
          onUploadResult?.(discoverySourcesContext.errorUpdatingSource.message, true);
        }
        else {
          onUploadResult?.("Discovery file uploaded successfully", false);
        }
      } catch (err) {
        onUploadResult?.("Failed to import inventory. Please check the file format.", true);
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
    <Button variant="link" onClick={handleUploadSource} style={{ padding: 0, marginTop: '5px' }}>
      Upload discovery file
    </Button>
  ) : (
    <Tooltip content="Upload">
      <Button variant="plain" onClick={handleUploadSource}>
        <Icon size="md" isInline>
          <UploadIcon />
        </Icon>
      </Button>
    </Tooltip>
  );
};
