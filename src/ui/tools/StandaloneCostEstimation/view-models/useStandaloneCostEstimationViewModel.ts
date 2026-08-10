import { useInjection } from "@y0n1/react-ioc";
import { useState } from "react";
import { useAsyncFn } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IStandaloneCostEstimationStore } from "../../../../data/stores/interfaces/IStandaloneCostEstimationStore";
import { parseApiError } from "../../../../lib/common/ErrorParser";
import type {
  StandaloneCostEstimateRequest,
  StandaloneCostEstimateResponse,
  StandaloneCostEstimationFormValues,
  StandaloneVMwarePlan,
} from "../../../../models/StandaloneCostEstimationModel";

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
  };

  if (!form.includeSwingHardware) {
    request.swingHardwareCost = 0;
  }
  if (!form.includeAdditionalStorage) {
    request.additionalStorageCost = 0;
  }
  if (!form.includeISV) {
    request.thirdPartyISVCost = 0;
  }
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

    return {
      isCalculating: asyncState.loading,
      calculateError: manualError ?? asyncState.error,
      result,
      onSubmit: (formValues: StandaloneCostEstimationFormValues) => {
        void doCalculate(formValues);
      },
    };
  };
