import { useInjection } from "@openshift-migration-advisor/ioc";
import { useCallback, useState } from "react";
import { useAsyncFn } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IStandaloneCostEstimationStore } from "../../../../data/stores/interfaces/IStandaloneCostEstimationStore";
import { copyToClipboard } from "../../../../lib/common/Clipboard";
import { downloadFile } from "../../../../lib/common/Download";
import { parseApiError } from "../../../../lib/common/ErrorParser";
import type {
  StandaloneCostEstimateRequest,
  StandaloneCostEstimateResponse,
  StandaloneCostEstimationFormValues,
  StandaloneVMwarePlan,
} from "../../../../models/StandaloneCostEstimationModel";
import { GenerateStandaloneCostEstimationPlainTextOutput } from "./GenerateStandaloneCostEstimationPlainTextOutput";

function buildRequest(
  form: StandaloneCostEstimationFormValues,
): StandaloneCostEstimateRequest {
  const vmwarePlans: StandaloneVMwarePlan[] = [];
  if (form.showVcf) {
    vmwarePlans.push({
      name: "vmwareVcf",
      discount: form.discountVcf,
      unitPriceOverride: form.priceVcf,
    });
  }
  if (form.showVvf) {
    vmwarePlans.push({
      name: "vmwareVvf",
      discount: form.discountVvf,
      unitPriceOverride: form.priceVvf,
    });
  }
  if (form.showVvs) {
    vmwarePlans.push({
      name: "vmwareVvs",
      discount: form.discountVvs,
      unitPriceOverride: form.priceVvs,
    });
  }

  const request: StandaloneCostEstimateRequest = {
    customerName: form.customerName,
    hosts: form.hosts,
    socketsPerHost: form.socketsPerHost,
    coresPerSocket: form.coresPerSocket,
    vms: form.vms,
    consolidationPct: form.consolidationPct,
    vmwarePlans,
    rhEdition: {
      name: form.rhEdition,
      includeACM: form.includeACM,
      openshiftDiscount: form.discountRh,
    },
    withAap: form.withAap,
    serverCost: form.serverCost,
    unitPricingOverrides: {
      rhOvePerNode: form.priceOve,
      rhOkePerNode: form.priceOke,
      rhOcpPerNode: form.priceOcp,
      rhOppPerNode: form.priceOpp,
      rhAcmVirtPerNode: form.priceAcmVirt,
      rhAcmK8sPerNode: form.priceAcmK8s,
    },
    swingHardwareCost: form.swingHardwareCost,
    additionalStorageCost: form.additionalStorageCost,
    thirdPartyISVCost: form.thirdPartyISVCost,
  };

  if (form.overrideMigrationCost) {
    request.migrationCostOverride = form.migrationCostOverride;
  }

  return request;
}

export interface StandaloneCostEstimationViewModel {
  isCalculating: boolean;
  calculateError: Error | undefined;
  result: StandaloneCostEstimateResponse | null;
  onSubmit: (formValues: StandaloneCostEstimationFormValues) => void;
  canExport: boolean;
  handleCopyAsPlainText: () => void;
  handleDownloadJson: () => void;
  handleDownloadTxt: () => void;
}

export const useStandaloneCostEstimationViewModel =
  (): StandaloneCostEstimationViewModel => {
    const store = useInjection<IStandaloneCostEstimationStore>(
      Symbols.StandaloneCostEstimationStore,
    );

    const [result, setResult] = useState<StandaloneCostEstimateResponse | null>(
      null,
    );
    const [manualError, setManualError] = useState<Error | undefined>(
      undefined,
    );

    const [asyncState, doCalculate] = useAsyncFn(
      async (formValues: StandaloneCostEstimationFormValues) => {
        setManualError(undefined);
        setResult(null);

        try {
          const request = buildRequest(formValues);
          const response =
            await store.calculateStandaloneCostEstimation(request);
          setResult(response);
        } catch (error) {
          const parsedError = await parseApiError(
            error,
            "Failed to calculate standalone cost estimation",
          );
          setManualError(parsedError);
        }
      },
      [store],
    );

    const handleCopyAsPlainText = useCallback(() => {
      if (!result) return;
      copyToClipboard(GenerateStandaloneCostEstimationPlainTextOutput(result));
    }, [result]);

    const handleDownloadJson = useCallback(() => {
      if (!result) return;
      const filename = result.customerName
        ? `cost-estimation-${result.customerName.replace(/\s+/g, "-").toLowerCase()}.json`
        : "cost-estimation.json";
      downloadFile(
        filename,
        JSON.stringify(result, null, 2),
        "application/json",
      );
    }, [result]);

    const handleDownloadTxt = useCallback(() => {
      if (!result) return;
      const text = GenerateStandaloneCostEstimationPlainTextOutput(result);
      const filename = result.customerName
        ? `cost-estimation-${result.customerName.replace(/\s+/g, "-").toLowerCase()}.txt`
        : "cost-estimation.txt";
      downloadFile(filename, text, "text/plain");
    }, [result]);

    return {
      isCalculating: asyncState.loading,
      calculateError: manualError ?? asyncState.error,
      result,
      onSubmit: (formValues: StandaloneCostEstimationFormValues) => {
        void doCalculate(formValues);
      },
      canExport: result !== null,
      handleCopyAsPlainText,
      handleDownloadJson,
      handleDownloadTxt,
    };
  };
